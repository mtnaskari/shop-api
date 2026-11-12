import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { RequestHandler } from 'express'

import { HttpException } from '../utils/http-exception'

type Source = 'body' | 'query' | 'params'

/** Flatten nested class-validator errors into readable messages such as `items.0.quantity must be an integer`. */
export function formatValidationErrors(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property
    const own = Object.values(error.constraints ?? {}).map((message) =>
      parent && message.startsWith(error.property) ? `${parent}.${message}` : message,
    )
    return [...own, ...formatValidationErrors(error.children ?? [], path)]
  })
}

/**
 * Validate and transform part of the request against a DTO class. On success the request part is
 * replaced by the DTO instance (trimmed, typed and with defaults applied); unknown fields are rejected.
 */
export function validateRequest(dto: ClassConstructor<object>, source: Source = 'body'): RequestHandler {
  return async (req, _res, next) => {
    const raw: unknown = req[source]
    if (source === 'body' && (typeof raw !== 'object' || raw === null || Array.isArray(raw))) {
      throw HttpException.badRequest('Request body must be a JSON object')
    }

    const instance = plainToInstance(dto, raw ?? {})
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true })
    if (errors.length > 0) {
      throw HttpException.badRequest('Validation failed', formatValidationErrors(errors))
    }

    // Express 4 exposes body, query and params as plain writable properties.
    ;(req as unknown as Record<Source, unknown>)[source] = instance
    next()
  }
}
