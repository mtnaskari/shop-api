import { Router } from 'express'

/**
 * The base controller class
 */
export abstract class Controller {
  abstract path: string
  abstract router: Router
}
