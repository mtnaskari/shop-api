import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

class HttpResponse {
  public ok(res: Response, data: any) {
    return res.status(StatusCodes.OK).send({
      success: true,
      data,
    })
  }

  static created(res: Response, data: any) {
    return res.status(StatusCodes.CREATED).send({
      success: true,
      data,
    })
  }

  static badRequest(res: Response, message: string[] = [ReasonPhrases.BAD_REQUEST]) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      message,
    })
  }

  static unauthorized(res: Response, message: string[] = [ReasonPhrases.UNAUTHORIZED]) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      success: false,
      message,
    })
  }

    return res.status(StatusCodes.NOT_FOUND).send({
      success: false,
      message,
    })
  }

 public internalServerError(res: Response, message = ReasonPhrases.INTERNAL_SERVER_ERROR) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message,
    })
  }
}

export const httpResponse = new HttpResponse()
