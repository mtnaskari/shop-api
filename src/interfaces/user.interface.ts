import { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: Schema.Types.ObjectId
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
