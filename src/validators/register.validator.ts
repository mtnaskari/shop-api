import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'

import { UserModel } from '../database/models/user.model'
import { RegisterDTO } from '../dto/auth/register.dto'
import { HttpResponse } from '../utils/http-response'

export async function registerValidator(req: Request, res: Response, next: NextFunction) {
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
