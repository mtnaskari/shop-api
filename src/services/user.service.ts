import { hash } from 'bcryptjs'

import { UserModel } from '../database/models/user.model'

export class UserService {
  public createUser = async (fullName: string, email: string, password: string) => {
    const hashedPassword = await hash(password, 10)

    return (await UserModel.create({ fullName, email, password: hashedPassword }))._id
  }
}
