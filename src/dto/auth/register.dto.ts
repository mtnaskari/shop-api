import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class RegisterDTO {
  @IsNotEmpty()
  fullName: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}
