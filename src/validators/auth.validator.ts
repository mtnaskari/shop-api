import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { UserModel } from '../database/models/user.model'
import { LoginDTO } from '../dto/auth/login.dto'
import { RegisterDTO } from '../dto/auth/register.dto'
import { AuthService } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class AuthValidator {
  constructor(private readonly authService: AuthService) {}

  public registerValidator = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body

    const errors = await validate(plainToInstance(RegisterDTO, req.body))
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

  public loginValidator = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    const errors = await validate(plainToInstance(LoginDTO, req.body), {
      forbidUnknownValues: true,
    })
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
