/* eslint-disable no-console */

type Level = 'debug' | 'info' | 'warn' | 'error'

const silent = process.env.NODE_ENV === 'test'

function write(level: Level, scope: string, message: string, ...meta: unknown[]): void {
  if (silent && level !== 'error') return
  const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${scope}] ${message}`
  console[level](line, ...meta)
}

/**
 * Minimal scoped logger. Swap for pino or winston if structured logs are needed.
 */
export function createLogger(scope: string) {
  return {
    debug: (message: string, ...meta: unknown[]) => write('debug', scope, message, ...meta),
    info: (message: string, ...meta: unknown[]) => write('info', scope, message, ...meta),
    warn: (message: string, ...meta: unknown[]) => write('warn', scope, message, ...meta),
    error: (message: string, ...meta: unknown[]) => write('error', scope, message, ...meta),
  }
}
