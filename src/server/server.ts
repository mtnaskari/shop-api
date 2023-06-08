import express, { Application } from 'express'
import morgan from 'morgan'

import { SERVICE_HOST, SERVICE_PORT } from '../config/env.config'
import { Controller } from '../controllers/controller.interface'
import { errorMiddleware } from '../middlewares/error.middleware'
import { HttpResponse } from '../utils/http-response'

export class Server {
  public app: Application

  constructor(controllers: Controller[]) {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeControllers(controllers)
    this.notFoundHandler()
    this.errorHandler()
  }

  private initializeMiddlewares() {
    this.app.use(morgan('dev'))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router)
    })
  }

  private notFoundHandler() {
    this.app.use((_req, res) => {
      return HttpResponse.notFound(res)
    })
  }

  private errorHandler() {
    this.app.use(errorMiddleware)
  }

  public listen() {
    this.app.listen(SERVICE_PORT, SERVICE_HOST, () => {
      console.log(`[i]: Server is running at ${SERVICE_HOST}:${SERVICE_PORT}/api 🚀`)
    })
  }
}
