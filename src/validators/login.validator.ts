import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'

import { LoginDTO } from '../dto/auth/login.dto'
import { authenticateUser } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'

export async function loginValidator(req: Request, res: Response, next: NextFunction) {
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

  const user = await authenticateUser(email, password)

  user ? (res.locals.user = user) : HttpResponse.badRequest(res, ['Invalid email or password'])

  next()
}
