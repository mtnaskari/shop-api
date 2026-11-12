import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsMongoId, Max, Min, ValidateNested } from 'class-validator'

export class OrderItemDto {
  @IsMongoId({ message: 'product must be a valid id' })
  product: string

  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}
