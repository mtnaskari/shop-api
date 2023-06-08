import { Request, Response, Router } from 'express'

import { AuthService } from '../services/auth.service'
import { createUser } from '../services/user.service'
import { HttpResponse } from '../utils/http-response'
import { AuthValidator } from '../validators/auth.validator'
import { Controller } from './controller.interface'

export class AuthController extends Controller {
  readonly router: Router
  readonly path: string
  constructor(private readonly authService: AuthService, private readonly authValidator: AuthValidator) {
    super()
    this.path = '/auth'
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    this.router.post(`${this.path}/register`, this.authValidator.registerValidator, this.register)
    this.router.post(`${this.path}/login`, this.authValidator.loginValidator, this.login)
  }

  private async register(req: Request, res: Response) {
    const { fullName, email, password } = req.body

    const userId = await createUser(fullName, email, password)

    const token = this.authService.generateToken(userId)

    return HttpResponse.created(res, { fullName, email, token })
  }

  private login(_req: Request, res: Response) {
    const { email, _id } = res.locals.user

    const token = this.authService.generateToken(_id)

    return HttpResponse.ok(res, { fullName: res.locals.user.fullName, email, token })
  }
}
