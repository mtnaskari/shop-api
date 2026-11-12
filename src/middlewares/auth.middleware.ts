import '../types/express'

import { RequestHandler } from 'express'
import { injectable } from 'tsyringe'

import { UserRole } from '../database/models/user.model'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'
import { HttpException } from '../utils/http-exception'

@injectable()
export class AuthMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /** Require a valid `Authorization: Bearer <token>` header and load the user into `res.locals.user`. */
  public authenticate: RequestHandler = async (req, res, next) => {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? []
    if (scheme !== 'Bearer' || !token) {
      throw HttpException.unauthorized('Missing or malformed bearer token')
    }

    const { sub } = this.authService.verifyToken(token)
    const user = await this.userService.findById(sub)
    if (!user) throw HttpException.unauthorized('The user for this token no longer exists')

    res.locals.user = user
    next()
  }

  /** Allow only the given roles. Must run after `authenticate`. */
  public authorize =
    (...roles: UserRole[]): RequestHandler =>
    (_req, res, next) => {
      const { user } = res.locals
      if (!user) throw HttpException.unauthorized()
      if (!roles.includes(user.role)) throw HttpException.forbidden()
      next()
    }
}
