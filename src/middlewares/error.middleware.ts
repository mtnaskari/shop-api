import { NextFunction, Request, Response } from 'express'

import { httpResponse } from '../utils/http-response'

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  httpResponse.internalServerError(res)

  next(error)
}
