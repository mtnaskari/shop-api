import { IsEnum } from 'class-validator'

import { OrderStatus } from '../../database/models/order.model'

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus
}
