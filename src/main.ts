import 'dotenv/config'

import { createApp } from './app'
import { loadConfig } from './config/env'
import { connectToDatabase, disconnectFromDatabase } from './database/connection'
import { createLogger } from './utils/logger'

const logger = createLogger('server')
const SHUTDOWN_TIMEOUT_MS = 10_000

async function bootstrap(): Promise<void> {
  const config = loadConfig()
  await connectToDatabase(config.mongoUri)

  const app = createApp(config)
  const server = app.listen(config.port, config.host, () => {
    logger.info(`Listening on http://${config.host}:${config.port} (API docs at /docs)`)
  })

  let shuttingDown = false
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.info(`${signal} received, shutting down`)

    // Stop accepting connections, let in-flight requests finish, then close the database.
    const timer = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit')
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)
    timer.unref()

    server.close(async (error) => {
      if (error) logger.error('Error while closing the HTTP server', error)
      await disconnectFromDatabase()
      process.exit(error ? 1 : 0)
    })
    server.closeIdleConnections()
  }

  process.once('SIGTERM', shutdown)
  process.once('SIGINT', shutdown)
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start', error instanceof Error ? error.message : error)
  process.exit(1)
})
