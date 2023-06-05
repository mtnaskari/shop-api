import { AuthController } from './controllers/auth.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'

async function main(): Promise<void> {
  const server = new Server([new AuthController()])
  server.listen()
  await connectToDatabase()
}

main().catch((error) => {
  throw new Error(error)
})
