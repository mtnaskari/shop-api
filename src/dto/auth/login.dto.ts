import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

import { Normalize } from '../common/transforms'

export class LoginDto {
  @Normalize()
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
