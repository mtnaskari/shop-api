import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { injectable } from 'tsyringe'

import { isDatabaseConnected } from '../database/connection'
import { Controller } from './controller'

/** Liveness and readiness probe, mounted at the root as `/health`. */
@injectable()
export class HealthController extends Controller {
  readonly path = '/health'

  constructor() {
    super()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    this.router.get(this.path, this.check)
  }

  private check = (_req: Request, res: Response) => {
    const database = isDatabaseConnected() ? 'up' : 'down'
    const healthy = database === 'up'

    res.status(healthy ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json({
      success: healthy,
      data: {
        status: healthy ? 'ok' : 'error',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: { database },
      },
    })
  }
}
