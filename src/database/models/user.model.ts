import { HydratedDocument, model, Schema } from 'mongoose'

import { baseSchemaOptions } from '../schema-options'

export enum UserRole {
  Admin = 'admin',
  Customer = 'customer',
}

export interface User {
  fullName: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<User>

const UserSchema = new Schema<User>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.Customer },
  },
  {
    ...baseSchemaOptions,
    toJSON: {
      ...baseSchemaOptions.toJSON,
      transform: (doc: unknown, ret: Record<string, unknown>) => {
        delete ret.password
        return baseSchemaOptions.toJSON.transform(doc, ret)
      },
    },
  },
)

export const UserModel = model<User>('User', UserSchema)
