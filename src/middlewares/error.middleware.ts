import { NextFunction, Request, Response } from 'express'

import { HttpException } from '../utils/http-exception'
import { HttpResponse } from '../utils/http-response'

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof SyntaxError && 'body' in error) {
    return HttpResponse.badRequest(res, ['Invalid json body'])
  }

  if (error instanceof HttpException) HttpResponse.error(res, error.statusCode, [error.message])

  HttpResponse.internalServerError(res)

  next(error)
}
