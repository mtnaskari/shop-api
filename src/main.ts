import 'reflect-metadata'

import { container } from 'tsyringe'

import { AuthController } from './controllers/auth.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'

async function main(): Promise<void> {
  const authController = container.resolve(AuthController)

  const server = new Server([authController])

  await connectToDatabase()
  server.listen()
}

main().catch((error) => {
  throw new Error(error)
})
