import { ErrorRequestHandler, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import mongoose from 'mongoose'

import { HttpException } from '../utils/http-exception'
import { createLogger } from '../utils/logger'

const logger = createLogger('http')

/** Map known library errors to an `HttpException`; anything else becomes a 500. */
export function toHttpException(error: unknown): HttpException {
  if (error instanceof HttpException) return error

  if (error instanceof JsonWebTokenError) {
    return HttpException.unauthorized('Invalid or expired token')
  }

  if (error instanceof mongoose.Error.CastError) {
    return HttpException.badRequest(`Invalid value for ${error.path}`)
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return HttpException.badRequest(
      'Validation failed',
      Object.values(error.errors).map((item) => item.message),
    )
  }

  if (isDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? 'value'
    return HttpException.conflict(`A record with this ${field} already exists`)
  }

  // Errors raised by body-parser carry an HTTP status and a type, e.g. `entity.parse.failed`.
  if (isBodyParserError(error)) {
    const message = error.type === 'entity.parse.failed' ? 'Malformed JSON body' : error.message
    return new HttpException(error.status, message)
  }

  return new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error')
}

function isDuplicateKeyError(error: unknown): error is { code: 11000; keyValue?: Record<string, unknown> } {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000
}

function isBodyParserError(error: unknown): error is { status: number; type: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { status?: unknown }).status === 'number' &&
    typeof (error as { type?: unknown }).type === 'string'
  )
}

export const notFoundMiddleware: RequestHandler = (req) => {
  throw HttpException.notFound(`Route ${req.method} ${req.path} not found`)
}

/** Write every error as `{ success: false, error: { statusCode, message, details? } }`. */
export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)

  const exception = toHttpException(error)
  if (exception.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed`, error)
  }

  res.status(exception.statusCode).json({
    success: false,
    error: {
      statusCode: exception.statusCode,
      message: exception.message,
      ...(exception.details && { details: exception.details }),
    },
  })
}
