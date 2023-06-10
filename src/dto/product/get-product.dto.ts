import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator'

/**
 * Sort order enum
 */
enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Sort by enum
 */
enum SortBy {
  Price = 'price',
  Name = 'name',
}

/**
 * Get product dto for the get product endpoint
 */
export class GetProductDto {
  @IsOptional()
  @IsString()
  name?: any

  @IsOptional()
  @IsString()
  category?: any

  @IsOptional()
  @IsNumberString()
  price?: any

  @IsOptional()
  @IsString()
  @IsEnum(SortOrder)
  sortOrder?: any

  @IsOptional()
  @IsString()
  @IsEnum(SortBy)
  sortBy?: any
}
