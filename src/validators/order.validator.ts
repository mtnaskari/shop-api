import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { CreateOrderDTO } from '../dto/order/create-order.dto'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class OrderValidator {
  constructor() {}

  /**
   * Validate the request body for the create order endpoint
   * @param req the request
   * @param res the response
   * @param next the next function
   * @returns void
   */
  public createOrderValidator = async (req: Request, res: Response, next: NextFunction) => {
    const errors = await validate(plainToInstance(CreateOrderDTO, req.body))
    if (errors.length > 0) {
      if (errors[0].children && errors[0].children.length > 0) {
        const errorMessages = errors[0].children.flatMap((item: ValidationError) =>
          item.children
            ? item.children.flatMap((item: ValidationError) =>
                item.constraints ? Object.values(item.constraints) : [],
              )
            : [],
        )
        return HttpResponse.badRequest(res, [...new Set(errorMessages)])
      } else {
        const errorMessages = errors.flatMap((item: ValidationError) =>
          item.constraints ? Object.values(item.constraints) : [],
        )
        return HttpResponse.badRequest(res, errorMessages)
      }
    }
    next()
  }
}
