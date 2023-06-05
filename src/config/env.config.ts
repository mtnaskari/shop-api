import { config } from 'dotenv'

config()

export function setEnv(envVar: string, defaultValue?: string) {
  if (process.env[envVar]) {
    return process.env[envVar] as string
  }
  if (defaultValue) {
    return defaultValue
  }
  throw new Error(`Please define the Environment variable"${envVar}"`)
}

export const SERVICE_PORT = +setEnv('SERVICE_PORT')
export const SERVICE_HOST = setEnv('SERVICE_HOST')
export const DB_HOST = setEnv('DB_HOST')
export const DB_PORT = +setEnv('DB_PORT')
export const DB_USER = setEnv('DB_USER')
export const DB_PASS = setEnv('DB_PASS')
export const DB_NAME = setEnv('DB_NAME')
