import { IsOptional, IsString, Length, MaxLength } from 'class-validator'

import { Trim } from '../common/transforms'

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @Length(2, 60)
  name: string

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  description?: string
}
