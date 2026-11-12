import 'reflect-metadata'

import { randomUUID } from 'node:crypto'

import mongoose from 'mongoose'
import { afterAll, afterEach, beforeAll, inject } from 'vitest'

import { connectToDatabase, disconnectFromDatabase } from '../src/database/connection'

beforeAll(async () => {
  const uri = new URL(inject('mongoUri'))
  uri.pathname = `/shop-test-${randomUUID()}`
  await connectToDatabase(uri.toString())
  // Build unique indexes before the tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()))
})

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await disconnectFromDatabase()
})
