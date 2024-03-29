import { Request, Response, Router } from 'express'
import { injectable } from 'tsyringe'

import { ProductService } from '../services/product.service'
import { HttpResponse } from '../utils/http-response'
import { ProductValidator } from '../validators/product.validator'
import { Controller } from './controller.interface'

@injectable()
export class ProductController extends Controller {
  readonly router: Router
  readonly path: string
  constructor(private readonly productService: ProductService, private readonly productValidator: ProductValidator) {
    super()
    this.path = '/products'
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes = (): void => {
    this.router.get(`${this.path}/:productId?`, this.productValidator.getProductValidator, this.readProduct)
  }

  private readProduct = async (req: Request, res: Response) => {
    const { name, category, price, sortBy, sortOrder } = <
      { name: string; category: string; price: string; sortBy: string; sortOrder: string }
    >req.query
    const { productId } = req.params

    const products = await this.productService.readProduct(productId, name, category, price, sortBy, sortOrder)

    HttpResponse.ok(res, products)
  }
}
