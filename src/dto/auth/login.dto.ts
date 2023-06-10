import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

/**
 * Login DTO for the login endpoint 
 */
export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}
