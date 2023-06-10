import 'reflect-metadata'
import 'express-async-errors'

import { container } from 'tsyringe'

import { AuthController } from './controllers/auth.controller'
import { ProductController } from './controllers/product.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'

/**
 * The main function of the application
 */
async function main(): Promise<void> {
  const authController = container.resolve(AuthController)

  const productController = container.resolve(ProductController)

  const server = new Server([authController, productController])

  await connectToDatabase()

  server.listen()
}

main().catch((error) => {
  throw new Error(error)
})
