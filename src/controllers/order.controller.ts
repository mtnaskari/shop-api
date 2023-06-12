import { Request, Response, Router } from 'express'
import { injectable } from 'tsyringe'

import { HttpResponse } from '../utils/http-response'
import { OrderValidator } from '../validators/order.validator'
import { Controller } from './controller.interface'

@injectable()
export class OrderController extends Controller {
  readonly router: Router
  readonly path: string
  constructor(private readonly orderValidator: OrderValidator) {
    super()
    this.path = '/orders'
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes = (): void => {
    this.router.post(this.path, this.orderValidator.createOrderValidator, this.createOrder)
  }

  private createOrder = async (req: Request, res: Response) => {
    HttpResponse.ok(res, {})
  }
}
