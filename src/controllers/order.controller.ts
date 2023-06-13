import { Request, Response, Router } from 'express'
import { injectable } from 'tsyringe'

import { AuthMiddleware } from '../middlewares/auth.middleware'
import { OrderService } from '../services/order.service'
import { HttpResponse } from '../utils/http-response'
import { OrderValidator } from '../validators/order.validator'
import { Controller } from './controller.interface'

@injectable()
export class OrderController extends Controller {
  readonly router: Router
  readonly path: string
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly orderValidator: OrderValidator,
    private readonly orderService: OrderService,
  ) {
    super()
    this.path = '/orders'
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes = (): void => {
    this.router.post(this.path, this.authMiddleware.protect, this.orderValidator.createOrderValidator, this.createOrder)
    this.router.get(this.path, this.authMiddleware.protect, this.readOrder)

  }

  private createOrder = async (req: Request, res: Response) => {
    const { user } = res.locals

    const orderId = await this.orderService.createOrder(req.body.orders, user._id)

    HttpResponse.created(res, { orderId })
  }

  private readOrder = async (req: Request, res: Response) => {
    const { user } = res.locals

    const orders = await this.orderService.readOrder( user._id)

    HttpResponse.ok(res, { orders })
  }
}
