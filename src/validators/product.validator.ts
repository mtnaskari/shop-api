import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { GetProductDto } from '../dto/product/get-product.dto'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class ProductValidator {
  constructor() {}

  /**
   * Validate the request query for the get product endpoint
   * @param req the request
   * @param res the response
   * @param next the next function
   * @returns void
   */
  public getProductValidator = async (req: Request, res: Response, next: NextFunction) => {
    const errors = await validate(plainToInstance(GetProductDto, req.query))
    if (errors.length > 0) {
      return HttpResponse.badRequest(
        res,
        errors.flatMap((item: ValidationError) => (item.constraints ? Object.values(item.constraints) : [])),
      )
    }
    next()
  }
}
