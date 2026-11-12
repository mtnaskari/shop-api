import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'

import { PaginationQueryDto } from '../common/pagination-query.dto'
import { ToBoolean, Trim } from '../common/transforms'

export enum ProductSort {
  NameAsc = 'name',
  NameDesc = '-name',
  PriceAsc = 'price',
  PriceDesc = '-price',
  Oldest = 'createdAt',
  Newest = '-createdAt',
}

export class ProductQueryDto extends PaginationQueryDto {
  /** Case-insensitive match on the product name or description. */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string

  @IsOptional()
  @IsMongoId({ message: 'category must be a valid id' })
  category?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  available?: boolean

  @IsOptional()
  @IsEnum(ProductSort)
  sort: ProductSort = ProductSort.Newest
}
