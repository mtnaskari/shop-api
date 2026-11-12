import { hash } from 'bcryptjs'
import { isValidObjectId } from 'mongoose'
import { injectable } from 'tsyringe'

import { User, UserDocument, UserModel, UserRole } from '../database/models/user.model'

const SALT_ROUNDS = 10

export interface CreateUserInput {
  fullName: string
  email: string
  password: string
  role?: UserRole
}

@injectable()
export class UserService {
  public findById = async (id: string): Promise<UserDocument | null> => {
    if (!isValidObjectId(id)) return null
    return UserModel.findById(id)
  }

  /** Find a user by email, including the password hash for credential checks. */
  public findByEmailWithPassword = async (email: string): Promise<UserDocument | null> => {
    return UserModel.findOne({ email }).select<User>('+password')
  }

  public existsByEmail = async (email: string): Promise<boolean> => {
    return (await UserModel.exists({ email })) !== null
  }

  public create = async ({ password, ...input }: CreateUserInput): Promise<UserDocument> => {
    return UserModel.create({ ...input, password: await hash(password, SALT_ROUNDS) })
  }
}
