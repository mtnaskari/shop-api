import { hash } from 'bcryptjs'
import { injectable } from 'tsyringe'

import { UserModel } from '../database/models/user.model'

@injectable()
export class UserService {
  /**
   * Create a new user
   * @param fullName full name
   * @param email email address
   * @param password password
   * @returns the id of the created user
   */
  public createUser = async (fullName: string, email: string, password: string) => {
    const hashedPassword = await hash(password, 10)

    return (await UserModel.create({ fullName, email, password: hashedPassword }))._id
  }
}
