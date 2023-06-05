import mongoose from 'mongoose'

import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from '../config/env.config'

export async function connectToDatabase() {
  try {
    await mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/?authMechanism=DEFAULT`, {
      dbName: DB_NAME,
    })
    console.log('[DB]: Connected to MongoDB successfully 🎉')
  } catch (error) {
    console.error('[error]: Connecting to MongoDB:', error)
    process.exit(1)
  }
}
