import mongoose from 'mongoose'

import { createLogger } from '../utils/logger'

const logger = createLogger('database')

mongoose.set('strictQuery', true)

/**
 * Open the shared Mongoose connection.
 * @param uri A MongoDB connection string, e.g. `mongodb://user:pass@localhost:27017/shop?authSource=admin`
 */
export async function connectToDatabase(uri: string): Promise<typeof mongoose> {
  const connection = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 })
  logger.info(`Connected to MongoDB database "${connection.connection.name}"`)
  return connection
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect()
  logger.info('Disconnected from MongoDB')
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected
}
