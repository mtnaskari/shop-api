import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

/**
 * Register DTO for the register endpoint
 */
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
