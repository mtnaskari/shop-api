import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { PaginationMeta } from './pagination'

/**
 * Helpers that write the standard success envelope: `{ success: true, data, meta? }`.
 * Errors are written by the error middleware: `{ success: false, error: { statusCode, message, details? } }`.
 */
export class HttpResponse {
  static ok<T>(res: Response, data: T, meta?: PaginationMeta) {
    return res.status(StatusCodes.OK).json({ success: true, data, ...(meta && { meta }) })
  }

  static created<T>(res: Response, data: T) {
    return res.status(StatusCodes.CREATED).json({ success: true, data })
  }

  static noContent(res: Response) {
    return res.status(StatusCodes.NO_CONTENT).send()
  }
}
