import { NextFunction, Request, Response } from 'express'

import { HttpResponse } from '../utils/http-response'

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof SyntaxError && 'body' in error) {
    return HttpResponse.badRequest(res, ['Invalid json body'])
  }

  HttpResponse.internalServerError(res)

  next(error)
}
