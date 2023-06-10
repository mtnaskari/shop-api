import { NextFunction, Request, Response } from 'express'

import { HttpException } from '../utils/http-exception'
import { HttpResponse } from '../utils/http-response'

/**
 * Error middleware that handles all errors
 * @param error The error object
 * @param req The request 
 * @param res The response
 * @param next The next function
 * @returns void
 */
export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof SyntaxError && 'body' in error) {
    return HttpResponse.badRequest(res, ['Invalid json body'])
  }

  if (error instanceof HttpException) HttpResponse.error(res, error.statusCode, [error.message])

  HttpResponse.internalServerError(res)

  next(error)
}
