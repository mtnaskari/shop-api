import { IsEnum, IsOptional } from 'class-validator'

import { OrderStatus } from '../../database/models/order.model'
import { PaginationQueryDto } from '../common/pagination-query.dto'

export class OrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus
}
