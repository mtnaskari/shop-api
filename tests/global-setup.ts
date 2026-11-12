import { MongoMemoryServer } from 'mongodb-memory-server'
import type { TestProject } from 'vitest/node'

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string
  }
}

/**
 * Start one in-memory MongoDB for the whole run, on a random free port so local MongoDB
 * instances are never touched. Each test file then works in its own database.
 */
export default async function setup(project: TestProject) {
  const mongod = await MongoMemoryServer.create()
  project.provide('mongoUri', mongod.getUri())

  return async () => {
    await mongod.stop()
  }
}
