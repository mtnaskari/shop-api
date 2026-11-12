import 'reflect-metadata'
import 'express-async-errors'

import cors from 'cors'
import express, { Application } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { container as rootContainer } from 'tsyringe'

import { APP_CONFIG, AppConfig, NodeEnv } from './config/env'
import { AuthController } from './controllers/auth.controller'
import { CategoryController } from './controllers/category.controller'
import { Controller } from './controllers/controller'
import { HealthController } from './controllers/health.controller'
import { OrderController } from './controllers/order.controller'
import { ProductController } from './controllers/product.controller'
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware'
import { createRateLimiter } from './middlewares/rate-limit.middleware'

export const API_PREFIX = '/api/v1'

/**
 * Build the Express application. Each call gets its own DI container, so tests can create
 * isolated apps with different config.
 */
export function createApp(config: AppConfig): Application {
  const container = rootContainer.createChildContainer()
  container.register(APP_CONFIG, { useValue: config })

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)

  app.use(helmet())
  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '100kb' }))
  if (config.nodeEnv !== NodeEnv.Test) {
    app.use(morgan(config.nodeEnv === NodeEnv.Production ? 'combined' : 'dev'))
  }

  app.use(container.resolve(HealthController).router)

  const { windowMs, max, authMax } = config.rateLimit
  app.use(API_PREFIX, createRateLimiter(windowMs, max))
  app.use(`${API_PREFIX}/auth/login`, createRateLimiter(windowMs, authMax))
  app.use(`${API_PREFIX}/auth/register`, createRateLimiter(windowMs, authMax))

  const controllers: Controller[] = [
    container.resolve(AuthController),
    container.resolve(CategoryController),
    container.resolve(ProductController),
    container.resolve(OrderController),
  ]
  controllers.forEach((controller) => app.use(API_PREFIX, controller.router))

  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
