import { model, Schema } from 'mongoose'

import { IUser, UserRole } from '../../interfaces/user.interface'

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    details: { type: String, default: null },
    role: {
      type: String,
      enum: [UserRole.customer, UserRole.admin],
      default: UserRole.customer,
    },
  },
  {
    timestamps: true,
  },
)

export const UserModel = model<IUser>('User', UserSchema)
