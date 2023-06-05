import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

class HttpResponse {
  public ok(res: Response, data: any) {
    return res.status(StatusCodes.OK).send({
      success: true,
      data,
    })
  }

  public notFound(res: Response, message = ReasonPhrases.NOT_FOUND) { 
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
