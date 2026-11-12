import { OrderStatus } from '../database/models/order.model'
import { UserRole } from '../database/models/user.model'
import { ProductSort } from '../dto/product/product-query.dto'

type Schema = Record<string, unknown>

const ref = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` })

/** Wrap a data schema in the standard success envelope. */
const success = (data: Schema, paginated = false): Schema => ({
  type: 'object',
  required: ['success', 'data', ...(paginated ? ['meta'] : [])],
  properties: {
    success: { type: 'boolean', example: true },
    data,
    ...(paginated && { meta: ref('PaginationMeta') }),
  },
})

const json = (schema: Schema) => ({ 'application/json': { schema } })

const ok = (description: string, data: Schema, paginated = false) => ({
  description,
  content: json(success(data, paginated)),
})

const errorResponse = (name: string) => ({ $ref: `#/components/responses/${name}` })

const idParam = (description: string) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', pattern: '^[a-f\\d]{24}$', example: '665f1c2b9a1e4b0012345678' },
})

const pageParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
]

const bearer = [{ bearerAuth: [] }]

const objectId = { type: 'string', example: '665f1c2b9a1e4b0012345678' }
const timestamps = {
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
}

/**
 * OpenAPI 3.0 description of the API, served as JSON at `/docs.json` and rendered by Swagger UI
 * at `/docs`. A test checks that every route registered in Express appears here.
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Shop API',
    version: '2.0.0',
    description:
      'REST API for a small coffee shop: customers browse the menu and place orders, admins manage ' +
      'categories, products and order status.\n\n' +
      'Every response uses the same envelope. Successful responses look like ' +
      '`{ "success": true, "data": ..., "meta"?: ... }` and errors look like ' +
      '`{ "success": false, "error": { "statusCode", "message", "details"? } }`.\n\n' +
      'Sign in with `POST /auth/login`, then click **Authorize** and paste the returned token.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: '/api/v1', description: 'Current server' }],
  tags: [
    { name: 'Auth', description: 'Registration, login and the current user' },
    { name: 'Categories', description: 'Menu categories. Writes require the admin role.' },
    { name: 'Products', description: 'Menu items. Writes require the admin role.' },
    { name: 'Orders', description: 'Orders of the signed-in user. Admins can see and update all orders.' },
    { name: 'Health', description: 'Service health' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create a customer account',
        requestBody: { required: true, content: json(ref('RegisterRequest')) },
        responses: {
          201: ok('Account created', ref('AuthResult')),
          400: errorResponse('BadRequest'),
          409: errorResponse('Conflict'),
          429: errorResponse('TooManyRequests'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in and receive a JWT',
        requestBody: { required: true, content: json(ref('LoginRequest')) },
        responses: {
          200: ok('Signed in', ref('AuthResult')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          429: errorResponse('TooManyRequests'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the signed-in user',
        security: bearer,
        responses: { 200: ok('The current user', ref('User')), 401: errorResponse('Unauthorized') },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        responses: { 200: ok('Categories sorted by name', { type: 'array', items: ref('Category') }) },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category',
        security: bearer,
        requestBody: { required: true, content: json(ref('CreateCategoryRequest')) },
        responses: {
          201: ok('Category created', ref('Category')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          409: errorResponse('Conflict'),
        },
      },
    },
    '/categories/{id}': {
      parameters: [idParam('Category id')],
      get: {
        tags: ['Categories'],
        summary: 'Get a category',
        responses: {
          200: ok('The category', ref('Category')),
          400: errorResponse('BadRequest'),
          404: errorResponse('NotFound'),
        },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update a category',
        security: bearer,
        requestBody: { required: true, content: json(ref('UpdateCategoryRequest')) },
        responses: {
          200: ok('Category updated', ref('Category')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          404: errorResponse('NotFound'),
          409: errorResponse('Conflict'),
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete an empty category',
        security: bearer,
        responses: {
          204: { description: 'Category deleted' },
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          404: errorResponse('NotFound'),
          409: errorResponse('Conflict'),
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        description: 'Search, filter, sort and paginate the menu.',
        parameters: [
          ...pageParams,
          {
            name: 'search',
            in: 'query',
            description: 'Case-insensitive match on name or description',
            schema: { type: 'string', maxLength: 100 },
          },
          { name: 'category', in: 'query', description: 'Category id', schema: objectId },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'available', in: 'query', schema: { type: 'boolean' } },
          {
            name: 'sort',
            in: 'query',
            description: 'Field to sort by; a leading `-` sorts descending',
            schema: { type: 'string', enum: Object.values(ProductSort), default: ProductSort.Newest },
          },
        ],
        responses: {
          200: ok('A page of products', { type: 'array', items: ref('Product') }, true),
          400: errorResponse('BadRequest'),
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: bearer,
        requestBody: { required: true, content: json(ref('CreateProductRequest')) },
        responses: {
          201: ok('Product created', ref('Product')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
        },
      },
    },
    '/products/{id}': {
      parameters: [idParam('Product id')],
      get: {
        tags: ['Products'],
        summary: 'Get a product',
        responses: {
          200: ok('The product', ref('Product')),
          400: errorResponse('BadRequest'),
          404: errorResponse('NotFound'),
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update a product',
        security: bearer,
        requestBody: { required: true, content: json(ref('UpdateProductRequest')) },
        responses: {
          200: ok('Product updated', ref('Product')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          404: errorResponse('NotFound'),
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        description: 'Existing orders keep their copy of the product name and price.',
        security: bearer,
        responses: {
          204: { description: 'Product deleted' },
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          404: errorResponse('NotFound'),
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        description: 'Customers get their own orders; admins get every order. Newest first.',
        security: bearer,
        parameters: [
          ...pageParams,
          { name: 'status', in: 'query', schema: { type: 'string', enum: Object.values(OrderStatus) } },
        ],
        responses: {
          200: ok('A page of orders', { type: 'array', items: ref('Order') }, true),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Place an order',
        description:
          'Prices come from the current menu, not from the request. Repeated products are merged and ' +
          'every product must exist and be available.',
        security: bearer,
        requestBody: { required: true, content: json(ref('CreateOrderRequest')) },
        responses: {
          201: ok('Order placed', ref('Order')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
        },
      },
    },
    '/orders/{id}': {
      parameters: [idParam('Order id')],
      get: {
        tags: ['Orders'],
        summary: 'Get an order',
        description: "Other customers' orders are reported as not found.",
        security: bearer,
        responses: {
          200: ok('The order', ref('Order')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          404: errorResponse('NotFound'),
        },
      },
    },
    '/orders/{id}/cancel': {
      parameters: [idParam('Order id')],
      post: {
        tags: ['Orders'],
        summary: 'Cancel a pending order',
        security: bearer,
        responses: {
          200: ok('Order cancelled', ref('Order')),
          401: errorResponse('Unauthorized'),
          404: errorResponse('NotFound'),
          409: errorResponse('Conflict'),
        },
      },
    },
    '/orders/{id}/status': {
      parameters: [idParam('Order id')],
      patch: {
        tags: ['Orders'],
        summary: 'Change the status of an order',
        description: 'Admin only. A pending order can become paid or cancelled; paid and cancelled are final.',
        security: bearer,
        requestBody: { required: true, content: json(ref('UpdateOrderStatusRequest')) },
        responses: {
          200: ok('Order updated', ref('Order')),
          400: errorResponse('BadRequest'),
          401: errorResponse('Unauthorized'),
          403: errorResponse('Forbidden'),
          404: errorResponse('NotFound'),
          409: errorResponse('Conflict'),
        },
      },
    },
    '/health': {
      servers: [{ url: '/', description: 'Server root' }],
      get: {
        tags: ['Health'],
        summary: 'Check service health',
        responses: {
          200: { description: 'The service and its database are up', content: json(ref('Health')) },
          503: { description: 'The database is unreachable', content: json(ref('Health')) },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      PaginationMeta: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      Error: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            required: ['statusCode', 'message'],
            properties: {
              statusCode: { type: 'integer', example: 400 },
              message: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: { type: 'string' },
                example: ['email must be an email'],
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: objectId,
          fullName: { type: 'string', example: 'Ada Lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          role: { type: 'string', enum: Object.values(UserRole), example: UserRole.Customer },
          ...timestamps,
        },
      },
      AuthResult: {
        type: 'object',
        properties: {
          user: ref('User'),
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          expiresIn: { type: 'string', example: '1d' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        additionalProperties: false,
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 100, example: 'Ada Lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 72, example: 'correct-horse' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@shop.local' },
          password: { type: 'string', format: 'password', example: 'admin12345' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: objectId,
          name: { type: 'string', example: 'Coffee' },
          description: { type: 'string', nullable: true, example: 'Espresso based drinks' },
          ...timestamps,
        },
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 60, example: 'Coffee' },
          description: { type: 'string', maxLength: 500, example: 'Espresso based drinks' },
        },
      },
      UpdateCategoryRequest: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 60 },
          description: { type: 'string', maxLength: 500 },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: objectId,
          name: { type: 'string', example: 'Flat White' },
          description: { type: 'string', nullable: true, example: 'Double ristretto with velvety milk' },
          price: { type: 'number', example: 4.2 },
          category: ref('CategorySummary'),
          image: { type: 'string', format: 'uri', nullable: true },
          isAvailable: { type: 'boolean', example: true },
          ...timestamps,
        },
      },
      CategorySummary: {
        type: 'object',
        properties: {
          id: objectId,
          name: { type: 'string', example: 'Coffee' },
          description: { type: 'string', nullable: true },
        },
      },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'price', 'category'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120, example: 'Flat White' },
          description: { type: 'string', maxLength: 1000 },
          price: { type: 'number', minimum: 0, multipleOf: 0.01, example: 4.2 },
          category: objectId,
          image: { type: 'string', format: 'uri' },
          isAvailable: { type: 'boolean', default: true },
        },
      },
      UpdateProductRequest: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          description: { type: 'string', maxLength: 1000 },
          price: { type: 'number', minimum: 0, multipleOf: 0.01 },
          category: objectId,
          image: { type: 'string', format: 'uri' },
          isAvailable: { type: 'boolean' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: objectId,
          name: { type: 'string', example: 'Flat White' },
          unitPrice: { type: 'number', example: 4.2 },
          quantity: { type: 'integer', example: 2 },
          subtotal: { type: 'number', example: 8.4 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: objectId,
          user: objectId,
          items: { type: 'array', items: ref('OrderItem') },
          totalPrice: { type: 'number', example: 8.4 },
          status: { type: 'string', enum: Object.values(OrderStatus), example: OrderStatus.Pending },
          ...timestamps,
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['items'],
        additionalProperties: false,
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: {
              type: 'object',
              required: ['product', 'quantity'],
              additionalProperties: false,
              properties: {
                product: objectId,
                quantity: { type: 'integer', minimum: 1, maximum: 100, example: 2 },
              },
            },
          },
        },
      },
      UpdateOrderStatusRequest: {
        type: 'object',
        required: ['status'],
        additionalProperties: false,
        properties: { status: { type: 'string', enum: Object.values(OrderStatus), example: OrderStatus.Paid } },
      },
      Health: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok', 'error'] },
              uptime: { type: 'integer', description: 'Seconds since the process started', example: 42 },
              timestamp: { type: 'string', format: 'date-time' },
              checks: {
                type: 'object',
                properties: { database: { type: 'string', enum: ['up', 'down'] } },
              },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: { description: 'The request is invalid', content: json(ref('Error')) },
      Unauthorized: { description: 'Missing, invalid or expired credentials', content: json(ref('Error')) },
      Forbidden: { description: 'The user lacks the required role', content: json(ref('Error')) },
      NotFound: { description: 'The resource does not exist', content: json(ref('Error')) },
      Conflict: { description: 'The request conflicts with the current state', content: json(ref('Error')) },
      TooManyRequests: { description: 'Rate limit exceeded', content: json(ref('Error')) },
    },
  },
}
