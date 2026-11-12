import { Router } from 'express'

/**
 * Base class for HTTP controllers. A controller owns a router whose routes are mounted under
 * the API prefix, e.g. `/api/v1` + `/products`.
 */
export abstract class Controller {
  readonly router: Router = Router()
  abstract readonly path: string
  protected abstract initializeRoutes(): void
}
