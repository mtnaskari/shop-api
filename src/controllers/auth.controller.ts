import { Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { LoginDto } from '../dto/auth/login.dto'
import { RegisterDto } from '../dto/auth/register.dto'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { validateRequest } from '../middlewares/validate.middleware'
import { AuthService } from '../services/auth.service'
import { HttpResponse } from '../utils/http-response'
import { Controller } from './controller'

@injectable()
export class AuthController extends Controller {
  readonly path = '/auth'

  constructor(
    private readonly authService: AuthService,
    private readonly auth: AuthMiddleware,
  ) {
    super()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    this.router.post(`${this.path}/register`, validateRequest(RegisterDto), this.register)
    this.router.post(`${this.path}/login`, validateRequest(LoginDto), this.login)
    this.router.get(`${this.path}/me`, this.auth.authenticate, this.me)
  }

  private register = async (req: Request, res: Response) => {
    return HttpResponse.created(res, await this.authService.register(req.body as RegisterDto))
  }

  private login = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.authService.login(req.body as LoginDto))
  }

  private me = (_req: Request, res: Response) => {
    return HttpResponse.ok(res, res.locals.user)
  }
}
