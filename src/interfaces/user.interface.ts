import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  fullName: string
  email: string
  password: string
  details: string
}
