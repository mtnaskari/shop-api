import { Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { UserRole } from '../database/models/user.model'
import { IdParamDto } from '../dto/common/id-param.dto'
import { CreateProductDto } from '../dto/product/create-product.dto'
import { ProductQueryDto } from '../dto/product/product-query.dto'
import { UpdateProductDto } from '../dto/product/update-product.dto'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { validateRequest } from '../middlewares/validate.middleware'
import { ProductService } from '../services/product.service'
import { HttpResponse } from '../utils/http-response'
import { Controller } from './controller'

@injectable()
export class ProductController extends Controller {
  readonly path = '/products'

  constructor(
    private readonly productService: ProductService,
    private readonly auth: AuthMiddleware,
  ) {
    super()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    const adminOnly = [this.auth.authenticate, this.auth.authorize(UserRole.Admin)]
    const byId = `${this.path}/:id`

    this.router.get(this.path, validateRequest(ProductQueryDto, 'query'), this.list)
    this.router.get(byId, validateRequest(IdParamDto, 'params'), this.get)
    this.router.post(this.path, ...adminOnly, validateRequest(CreateProductDto), this.create)
    this.router.patch(
      byId,
      ...adminOnly,
      validateRequest(IdParamDto, 'params'),
      validateRequest(UpdateProductDto),
      this.update,
    )
    this.router.delete(byId, ...adminOnly, validateRequest(IdParamDto, 'params'), this.remove)
  }

  private list = async (req: Request, res: Response) => {
    const { items, meta } = await this.productService.list(req.query as unknown as ProductQueryDto)
    return HttpResponse.ok(res, items, meta)
  }

  private get = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.productService.getById(req.params.id))
  }

  private create = async (req: Request, res: Response) => {
    return HttpResponse.created(res, await this.productService.create(req.body as CreateProductDto))
  }

  private update = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.productService.update(req.params.id, req.body as UpdateProductDto))
  }

  private remove = async (req: Request, res: Response) => {
    await this.productService.delete(req.params.id)
    return HttpResponse.noContent(res)
  }
}
