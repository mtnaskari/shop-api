import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { GetProductDto } from '../dto/product/get-product.dto'
import { HttpResponse } from '../utils/http-response'

@injectable()
export class ProductValidator {
  constructor() {}

  public getProductValidator = async (req: Request, res: Response, next: NextFunction) => {
    const { name, category, price, sortBy, sortOrder } = req.query

    const getProductDto = new GetProductDto()
    getProductDto.sortOrder = name
    getProductDto.category = category
    getProductDto.price = price
    getProductDto.sortBy = sortBy
    getProductDto.sortOrder = sortOrder

    const errors = await validate(getProductDto)
    if (errors.length > 0) {
      return HttpResponse.badRequest(
        res,
        errors.flatMap((item: ValidationError) => (item.constraints ? Object.values(item.constraints) : [])),
      )
    }
    next()
  }
}
