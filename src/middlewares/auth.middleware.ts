// import { NextFunction, Request, Response } from 'express'

// import { JWT_SECRET } from '../config/env.config'
// import { UserModel } from '../database/models/user.model'
// import { jwtVerifyPromisified } from '../services/auth.service'
// import { HttpResponse } from '../utils/http-response'

// export async function protect(req: Request, res: Response, next: NextFunction) {
//   if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
//     return HttpResponse.unauthorized(res, ['You are not logged in'])
//   }

//   const token = req.headers.authorization.split(' ')[1]

//   const decoded = await jwtVerifyPromisified(token, JWT_SECRET)

//   const user = await UserModel.findById(decoded.id)

//   res.locals.user = user

//   next()
// }
