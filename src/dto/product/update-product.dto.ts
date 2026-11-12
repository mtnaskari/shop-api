import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, IsUrl, Length, MaxLength, Min } from 'class-validator'

import { Trim } from '../common/transforms'

export class UpdateProductDto {
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 120)
  name?: string

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number

  @IsOptional()
  @IsMongoId({ message: 'category must be a valid id' })
  category?: string

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  image?: string

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean
}
