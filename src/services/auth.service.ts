import { compare } from 'bcryptjs'
import { Secret, sign, verify } from 'jsonwebtoken'
import { ObjectId } from 'mongoose'
import { injectable } from 'tsyringe'

import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.config'
import { UserModel } from '../database/models/user.model'
import { IUser } from '../interfaces/user.interface'

@injectable()
export class AuthService {

  /**
   * Verify a jwt token
   * @param token The jwt token
   * @param secret The secret to use to verify the token  
   * @returns The payload of the token 
   */
  public jwtVerifyPromisified = (token: string, secret: Secret): Promise<any> => {
    return new Promise((resolve, reject) => {
      verify(token, secret, {}, (err, payload) => {
        err ? reject(err) : resolve(payload)
      })
    })
  }


  /**
   * Authenticate a user 
   * @param email The email address
   * @param password The password
   * @returns The user or null 
   */
  public authenticateUser = async (email: string, password: string): Promise<IUser | null> => {
    const user = await UserModel.findOne({ email })
    if (!user) return null

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) return null

    return user
  }

  /**
   * Generate a jwt token based on the user id 
   * @param id The user id 
   * @returns The jwt token 
   */
  public generateToken = (id: ObjectId): string => {
    return sign({ id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
  }
}
