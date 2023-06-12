import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'

export class CreateOrderDTO {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductItem)
  orders: ProductItem[]
}

export class ProductItem {
  @IsNotEmpty()
  @IsString()
  product: string

  @IsNotEmpty()
  @IsNumber()
  amount: number
}
