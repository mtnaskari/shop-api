import { compare } from 'bcryptjs'
import { Secret, sign, verify } from 'jsonwebtoken'

import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.config'
import { UserModel } from '../database/models/user.model'
import { IUser } from '../interfaces/user.interface'

export function jwtVerifyPromisified(token: string, secret: Secret): Promise<any> {
  return new Promise((resolve, reject) => {
    verify(token, secret, {}, (err, payload) => {
      err ? reject(err) : resolve(payload)
    })
  })
}

export async function authenticateUser(email: string, password: string): Promise<IUser | null> {
  const user = await UserModel.findOne({ email })
  if (!user) return null

  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) return null

  return user
}

export function generateToken(id: string): string {
  return sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

