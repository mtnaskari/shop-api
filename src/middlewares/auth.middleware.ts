import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { JWT_SECRET } from '../config/env.config'
import { UserModel } from '../database/models/user.model'
import { AuthService } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}
  public protect = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return HttpResponse.unauthorized(res, ['You are not logged in'])
    }
    const token = req.headers.authorization.split(' ')[1]

    const decoded = await this.authService.jwtVerifyPromisified(token, JWT_SECRET)

    const user = await UserModel.findById(decoded.id)

    res.locals.user = user

    next()
  }
}
