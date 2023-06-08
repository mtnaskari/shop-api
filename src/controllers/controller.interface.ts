import { Router } from 'express'

export abstract class Controller {
  abstract path: string
  abstract router: Router
}
