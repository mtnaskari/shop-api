import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export class HttpResponse {
  static ok = (res: Response, data: any) => {
    return res.status(StatusCodes.OK).send({
      success: true,
      data,
    })
  }

  static created = (res: Response, data: any) => {
    return res.status(StatusCodes.CREATED).send({
      success: true,
      data,
    })
  }

  static badRequest = (res: Response, message: string[] = [ReasonPhrases.BAD_REQUEST]) => {
    return res.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      message,
    })
  }

  static unauthorized = (res: Response, message: string[] = [ReasonPhrases.UNAUTHORIZED]) => {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      success: false,
      message,
    })
  }

  static notFound = (res: Response, message: string[] = [ReasonPhrases.NOT_FOUND]) => {
    return res.status(StatusCodes.NOT_FOUND).send({
      success: false,
      message,
    })
  }

  static conflict = (res: Response, message: string[] = [ReasonPhrases.CONFLICT]) => {
    return res.status(StatusCodes.CONFLICT).send({
      success: false,
      message,
    })
  }

  static internalServerError = (res: Response, message: string[] = [ReasonPhrases.INTERNAL_SERVER_ERROR]) => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message,
    })
  }
}
