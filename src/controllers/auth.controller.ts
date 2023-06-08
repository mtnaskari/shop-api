import { Request, Response, Router } from 'express'
import { injectable } from 'tsyringe'

import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'
import { HttpResponse } from '../utils/http-response'
import { AuthValidator } from '../validators/auth.validator'
import { Controller } from './controller.interface'

@injectable()
export class AuthController extends Controller {
  readonly router: Router
  readonly path: string
  constructor(
    private readonly authService: AuthService,
    private readonly authValidator: AuthValidator,
    private readonly userService: UserService,
  ) {
    super()
    this.path = '/auth'
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes = (): void => {
    this.router.post(`${this.path}/register`, this.authValidator.registerValidator, this.register)
    this.router.post(`${this.path}/login`, this.authValidator.loginValidator, this.login)
  }

  private register = async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body

    const userId = await this.userService.createUser(fullName, email, password)

    const token = this.authService.generateToken(userId)

    return HttpResponse.created(res, { fullName, email, token })
  }

  private login = (_req: Request, res: Response) => {
    const { email, _id, fullName } = res.locals.user

    const token = this.authService.generateToken(_id)

    return HttpResponse.ok(res, { fullName, email, token })
  }
}
