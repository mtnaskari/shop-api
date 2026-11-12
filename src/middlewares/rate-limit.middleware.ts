import { rateLimit } from 'express-rate-limit'

import { HttpException } from '../utils/http-exception'

export function createRateLimiter(windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(HttpException.tooManyRequests()),
  })
}
