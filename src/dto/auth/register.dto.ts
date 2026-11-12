import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator'

import { Normalize, Trim } from '../common/transforms'

export class RegisterDto {
  @Trim()
  @IsString()
  @Length(2, 100)
  fullName: string

  @Normalize()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  // bcrypt only uses the first 72 bytes of a password.
  @MaxLength(72)
  password: string
}
