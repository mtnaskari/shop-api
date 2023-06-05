import { model, Schema } from 'mongoose'

import { IUser } from '../../interfaces/user.interface'

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    details: { type: String, default: null },
  },
  {
    timestamps: true,
  },
)

export const UserModel = model<IUser>('User', UserSchema)
