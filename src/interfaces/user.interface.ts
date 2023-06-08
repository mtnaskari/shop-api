import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  fullName: string
  email: string
  password: string
  role: UserRole
  details: string
}

export enum UserRole {
  admin = 'admin',
  customer = 'customer',
}
