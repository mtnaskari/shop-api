import { getReasonPhrase, StatusCodes } from 'http-status-codes'

/**
 * An error that maps directly to an HTTP response. Throw it anywhere in a request handler;
 * the error middleware turns it into the standard error envelope.
 */
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string = getReasonPhrase(statusCode),
    public readonly details?: string[],
  ) {
    super(message)
    this.name = 'HttpException'
  }

  static badRequest(message = 'Bad request', details?: string[]) {
    return new HttpException(StatusCodes.BAD_REQUEST, message, details)
  }

  static unauthorized(message = 'Authentication required') {
    return new HttpException(StatusCodes.UNAUTHORIZED, message)
  }

  static forbidden(message = 'You are not allowed to perform this action') {
    return new HttpException(StatusCodes.FORBIDDEN, message)
  }

  static notFound(message = 'Resource not found') {
    return new HttpException(StatusCodes.NOT_FOUND, message)
  }

  static conflict(message = 'Resource already exists') {
    return new HttpException(StatusCodes.CONFLICT, message)
  }

  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new HttpException(StatusCodes.TOO_MANY_REQUESTS, message)
  }
}
