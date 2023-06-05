import { Router } from 'express'

export class Controller {
  path: string
  router: Router

  constructor(path: string) {
    this.path = path
    this.router = Router()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {}
}
