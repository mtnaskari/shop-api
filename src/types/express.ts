import type { UserDocument } from '../database/models/user.model'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      /** The authenticated user, set by `AuthMiddleware.authenticate`. */
      user?: UserDocument
    }
  }
}

export {}
