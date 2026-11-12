# Shop API

[![CI](https://github.com/mtnaskari/shop-api/actions/workflows/ci.yml/badge.svg)](https://github.com/mtnaskari/shop-api/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

A REST API for a small coffee shop, written in TypeScript with Express and MongoDB. Customers browse the
menu and place orders; admins manage categories, products and order status. It ships with interactive
OpenAPI documentation, an integration test suite and a one-command Docker setup.

## Features

- **Authentication**: registration and login with bcrypt-hashed passwords and JWT bearer tokens.
- **Roles**: `customer` and `admin`, enforced per route.
- **Menu management**: categories and products with full CRUD for admins.
- **Product search**: pagination, text search, filters for category, price range and availability, and sorting.
- **Orders**: prices come from the database, never from the client. Each order keeps a snapshot of the
  product name and unit price, so later menu changes do not rewrite order history. Customers can cancel a
  pending order; admins can mark it as paid or cancelled.
- **Validation**: every body, query and path parameter is validated with `class-validator` DTOs. Unknown
  fields are rejected and all errors are reported at once.
- **Consistent responses**: one success envelope and one error envelope across the whole API.
- **Security**: `helmet` headers, CORS, rate limiting (stricter on login and register), a request body size
  limit and timing-safe login checks.
- **Operations**: a `/health` readiness endpoint, environment config that is validated at start-up, graceful
  shutdown on `SIGTERM` and `SIGINT`, and a multi-stage Docker image that runs as a non-root user.
- **Documentation**: an OpenAPI 3 document with Swagger UI at `/docs`. A test fails if a route is added
  without being documented.

## Tech stack

| Area       | Choice                                               |
| ---------- | ---------------------------------------------------- |
| Runtime    | Node.js 22+, TypeScript 5                            |
| Web        | Express 4, helmet, cors, express-rate-limit          |
| Database   | MongoDB 7, Mongoose 7                                |
| DI         | tsyringe                                             |
| Validation | class-validator, class-transformer                   |
| Auth       | jsonwebtoken, bcryptjs                               |
| Docs       | OpenAPI 3.0, swagger-ui-express                      |
| Tests      | Vitest, Supertest, mongodb-memory-server             |
| Tooling    | ESLint (typescript-eslint), Prettier, GitHub Actions |

## Quick start

### With Docker

```bash
git clone https://github.com/mtnaskari/shop-api.git
cd shop-api
docker compose up -d --build
docker compose exec api npm run seed
```

Open <http://localhost:3000/docs> and sign in with `admin@shop.local` / `admin12345`.

Compose publishes the API on port `3000` and MongoDB on `27018`, so it does not clash with a local MongoDB.
Override them with `API_PORT` and `MONGO_PORT`, and set `JWT_SECRET` before running it anywhere public.

### Locally

Requires Node.js 22 or newer and a MongoDB instance. To run only the database in Docker, use
`docker compose up -d mongo`.

```bash
npm ci
cp .env.example .env   # then adjust MONGODB_URI and JWT_SECRET
npm run seed:dev       # sample menu and an admin account
npm run dev            # http://localhost:3000, reloads on change
```

For a production build, run `npm run build && npm start`.

## Configuration

Variables are validated at start-up; if any are invalid, the process exits with a list of the problems.

| Variable               | Default            | Description                                          |
| ---------------------- | ------------------ | ---------------------------------------------------- |
| `MONGODB_URI`          | required           | MongoDB connection string                            |
| `JWT_SECRET`           | required           | Secret used to sign tokens, at least 16 characters   |
| `JWT_EXPIRES_IN`       | `1d`               | Token lifetime, e.g. `15m`, `12h` or `7d`            |
| `NODE_ENV`             | `development`      | `development`, `production` or `test`                |
| `HOST`                 | `0.0.0.0`          | Interface to bind to                                 |
| `PORT`                 | `3000`             | HTTP port                                            |
| `CORS_ORIGIN`          | `*`                | Allowed origin, or a comma-separated list            |
| `RATE_LIMIT_WINDOW_MS` | `900000`           | Rate limit window in milliseconds                    |
| `RATE_LIMIT_MAX`       | `300`              | Requests per window per client across the API        |
| `AUTH_RATE_LIMIT_MAX`  | `20`               | Requests per window per client on login and register |
| `TRUST_PROXY`          | unset              | Express `trust proxy` value behind a reverse proxy   |
| `ADMIN_EMAIL`          | `admin@shop.local` | Admin account created by the seed script             |
| `ADMIN_PASSWORD`       | `admin12345`       | Password for that account                            |

## API

Interactive documentation is served at **`/docs`**, and the raw OpenAPI document at `/docs.json`.
API routes live under `/api/v1`.

| Method   | Path                  | Access | Description                                |
| -------- | --------------------- | ------ | ------------------------------------------ |
| `POST`   | `/auth/register`      | public | Create a customer account                  |
| `POST`   | `/auth/login`         | public | Sign in and receive a JWT                  |
| `GET`    | `/auth/me`            | user   | Get the signed-in user                     |
| `GET`    | `/categories`         | public | List categories                            |
| `GET`    | `/categories/{id}`    | public | Get a category                             |
| `POST`   | `/categories`         | admin  | Create a category                          |
| `PATCH`  | `/categories/{id}`    | admin  | Update a category                          |
| `DELETE` | `/categories/{id}`    | admin  | Delete an empty category                   |
| `GET`    | `/products`           | public | Search, filter, sort and paginate products |
| `GET`    | `/products/{id}`      | public | Get a product                              |
| `POST`   | `/products`           | admin  | Create a product                           |
| `PATCH`  | `/products/{id}`      | admin  | Update a product                           |
| `DELETE` | `/products/{id}`      | admin  | Delete a product                           |
| `POST`   | `/orders`             | user   | Place an order                             |
| `GET`    | `/orders`             | user   | List own orders (all orders for admins)    |
| `GET`    | `/orders/{id}`        | user   | Get an order                               |
| `POST`   | `/orders/{id}/cancel` | user   | Cancel a pending order                     |
| `PATCH`  | `/orders/{id}/status` | admin  | Mark an order as paid or cancelled         |
| `GET`    | `/health` (root path) | public | Service and database health                |

Example session:

```bash
TOKEN=$(curl -s localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shop.local","password":"admin12345"}' | jq -r .data.token)

curl -s 'localhost:3000/api/v1/products?search=latte&maxPrice=5&sort=price&limit=5' | jq

curl -s localhost:3000/api/v1/orders -H "Authorization: Bearer $TOKEN" | jq
```

Every response uses the same envelope:

```jsonc
// Success
{ "success": true, "data": [], "meta": { "page": 1, "limit": 20, "total": 21, "totalPages": 2 } }

// Error
{ "success": false, "error": { "statusCode": 400, "message": "Validation failed", "details": ["email must be an email"] } }
```

## Scripts

| Script                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start with auto-reload (ts-node and nodemon)    |
| `npm run build`         | Compile to `dist/`                              |
| `npm start`             | Run the compiled server                         |
| `npm run seed`          | Seed the menu and admin account (compiled code) |
| `npm run seed:dev`      | Seed from the TypeScript sources                |
| `npm test`              | Run the test suite                              |
| `npm run test:coverage` | Run the tests with a coverage report            |
| `npm run lint`          | Run ESLint and the Prettier check               |
| `npm run format`        | Fix formatting and lint issues                  |
| `npm run typecheck`     | Type-check the sources and tests                |

## Testing

The integration tests drive the real Express app through Supertest against an in-memory MongoDB started by
`mongodb-memory-server`, so no database needs to be running. The first run downloads a MongoDB binary.

```bash
npm test
```

## Project structure

```text
src/
├── app.ts               # Express app factory: middleware, docs, routes and error handling
├── main.ts              # Entry point: config, database, HTTP server and graceful shutdown
├── config/env.ts        # Validated, typed environment config
├── controllers/         # Route definitions, one class per resource
├── services/            # Business logic
├── database/
│   ├── connection.ts
│   ├── models/          # Mongoose schemas and types
│   └── seed.ts          # Sample menu and admin account
├── dto/                 # Request DTOs with validation rules
├── middlewares/         # Authentication, validation, rate limiting and errors
├── docs/openapi.ts      # OpenAPI document served at /docs
└── utils/               # HTTP helpers, pagination and logger
tests/                   # Vitest and Supertest integration tests
```

Controllers, services and middleware are wired together with `tsyringe`. `createApp(config)` builds its own
child container, so tests can run apps with different settings side by side.

## License

[MIT](LICENSE)
