import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator'

enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

enum SortBy {
  Price = 'price',
  Name = 'name',
}

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
