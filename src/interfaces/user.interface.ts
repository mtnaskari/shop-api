import { Document, ObjectId } from 'mongoose'

/**
 * User interface for the user model
 */
export interface IUser extends Document {
  _id: ObjectId
  fullName: string
  email: string
  password: string
  role: UserRole
  details: string
}


/**
 * User role enum
 */
export enum UserRole {
  admin = 'admin',
  customer = 'customer',
}
