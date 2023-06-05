import { ProductController } from './controllers/product.controller'
import { connectToDatabase } from './database/db.connection'
import { Server } from './server/server'

async function main(): Promise<void> {
  const server = new Server([new ProductController()])
  server.listen()
  await connectToDatabase()
}

main().catch((error) => {
  throw new Error(error)
})
