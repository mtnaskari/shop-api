import { Request, Response, Router } from 'express'

import { generateToken } from '../services/auth.service'
import { createUser } from '../services/user.service'
import { HttpResponse } from '../utils/http-response'
import { loginValidator } from '../validators/login.validator'
import { registerValidator } from '../validators/register.validator'
import { Controller } from './controller.interface'

export class AuthController extends Controller {
  readonly router: Router

  constructor() {
    super('/auth')
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    this.router.post(`${this.path}/register`, registerValidator, this.register)
    this.router.post(`${this.path}/login`, loginValidator, this.login)
  }

  private async register(req: Request, res: Response) {
    const { fullName, email, password } = req.body

    const userId = await createUser(fullName, email, password)

    const token = generateToken(userId)

    return HttpResponse.created(res, { fullName, email, token })
  }

  private login(req: Request, res: Response) {
    const { email, password } = req.body

    const userId = res.locals.user._id

    const token = generateToken(userId)

    return HttpResponse.ok(res, { fullName: res.locals.user.fullName, email, password, token })
  }
}
