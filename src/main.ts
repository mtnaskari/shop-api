import { AuthController } from './controllers/auth.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'
import { AuthService } from './services/auth.service'
import { UserService } from './services/user.service'
import { AuthValidator } from './validators/auth.validator'

async function main(): Promise<void> {

  const authController = new AuthController(new AuthService(), new AuthValidator(new AuthService()),new UserService())

  const server = new Server([authController])

  await connectToDatabase()
  server.listen()
}

main().catch((error) => {
  throw new Error(error)
})
