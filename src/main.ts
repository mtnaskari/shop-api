import { AuthController } from './controllers/auth.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'
import { AuthService } from './services/auth.service'
import { AuthValidator } from './validators/auth.validator'

async function main(): Promise<void> {
  const authService = new AuthService()
  const authValidator = new AuthValidator(authService)
  const authController = new AuthController(authService, authValidator)

  const server = new Server([authController])

  await connectToDatabase()
  server.listen()
}

main().catch((error) => {
  throw new Error(error)
})
