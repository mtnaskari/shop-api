import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { JWT_SECRET } from '../config/env.config'
import { UserModel } from '../database/models/user.model'
import { UserRole } from '../interfaces/user.interface'
import { AuthService } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class AuthMiddleware {
  constructor(private readonly authService: AuthService) {}

  /**
   * Protect a route from being accessed by unauthenticated users
   * @param req The request
   * @param res The response
   * @param next The next function
   * @returns void
   */
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

  /**
   * Restrict access to the specified user roles
   * @param roles The user roles allowed to access the route
   * @returns Middleware function
   */
  public restrictTo = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user

      return !user || !roles.includes(user.role)
        ? HttpResponse.forbidden(res, ['You are not authorized to perform this action'])
        : next()
    }
  }
}
