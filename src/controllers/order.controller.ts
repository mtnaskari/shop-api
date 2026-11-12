import { Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { UserRole } from '../database/models/user.model'
import { IdParamDto } from '../dto/common/id-param.dto'
import { CreateOrderDto } from '../dto/order/create-order.dto'
import { OrderQueryDto } from '../dto/order/order-query.dto'
import { UpdateOrderStatusDto } from '../dto/order/update-order-status.dto'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { validateRequest } from '../middlewares/validate.middleware'
import { OrderService } from '../services/order.service'
import { HttpResponse } from '../utils/http-response'
import { Controller } from './controller'

@injectable()
export class OrderController extends Controller {
  readonly path = '/orders'

  constructor(
    private readonly orderService: OrderService,
    private readonly auth: AuthMiddleware,
  ) {
    super()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    const byId = `${this.path}/:id`
    const idParam = validateRequest(IdParamDto, 'params')

    // Every order route needs a signed-in user.
    this.router.use(this.path, this.auth.authenticate)

    this.router.post(this.path, validateRequest(CreateOrderDto), this.create)
    this.router.get(this.path, validateRequest(OrderQueryDto, 'query'), this.list)
    this.router.get(byId, idParam, this.get)
    this.router.post(`${byId}/cancel`, idParam, this.cancel)
    this.router.patch(
      `${byId}/status`,
      this.auth.authorize(UserRole.Admin),
      idParam,
      validateRequest(UpdateOrderStatusDto),
      this.updateStatus,
    )
  }

  private create = async (req: Request, res: Response) => {
    return HttpResponse.created(res, await this.orderService.create(res.locals.user!, req.body as CreateOrderDto))
  }

  private list = async (req: Request, res: Response) => {
    const query = req.query as unknown as OrderQueryDto
    const { items, meta } = await this.orderService.list(res.locals.user!, query)
    return HttpResponse.ok(res, items, meta)
  }

  private get = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.orderService.getById(res.locals.user!, req.params.id))
  }

  private cancel = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.orderService.cancel(res.locals.user!, req.params.id))
  }

  private updateStatus = async (req: Request, res: Response) => {
    const { status } = req.body as UpdateOrderStatusDto
    return HttpResponse.ok(res, await this.orderService.updateStatus(req.params.id, status))
  }
}
