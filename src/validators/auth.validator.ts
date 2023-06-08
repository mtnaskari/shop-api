import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'

import { UserModel } from '../database/models/user.model'
import { LoginDTO } from '../dto/auth/login.dto'
import { RegisterDTO } from '../dto/auth/register.dto'
import { AuthService } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'

export class AuthValidator {
  constructor(private readonly authService = new AuthService()) {}

  public async registerValidator(req: Request, res: Response, next: NextFunction) {
    const { fullName, email, password } = req.body

    const createUserDto = new RegisterDTO()
    createUserDto.fullName = fullName
    createUserDto.email = email
    createUserDto.password = password

    const errors = await validate(createUserDto)
    if (errors.length > 0) {
      return HttpResponse.badRequest(
        res,
        errors.flatMap((item: ValidationError) => (item.constraints ? Object.values(item.constraints) : [])),
      )
    }

    const existingUser = await UserModel.exists({ email })

    if (existingUser) return HttpResponse.conflict(res, ['Email already exists'])

    next()
  }

  public async loginValidator(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body

    const loginUserDto = new LoginDTO()

    loginUserDto.email = email
    loginUserDto.password = password

    const errors = await validate(loginUserDto)
    if (errors.length > 0) {
      return HttpResponse.badRequest(
        res,
        errors.flatMap((item: ValidationError) => (item.constraints ? Object.values(item.constraints) : [])),
      )
    }

    const user = await this.authService.authenticateUser(email, password)

    user ? (res.locals.user = user) : HttpResponse.badRequest(res, ['Invalid email or password'])

    next()
  }
}
