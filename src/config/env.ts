import { plainToInstance, Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, validateSync } from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Shape of the environment variables the service reads. It is validated once at start-up, so a
 * misconfigured deployment fails fast with a readable message instead of at the first request.
 */
class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development

  @IsString()
  HOST = '0.0.0.0'

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string

  @IsString()
  @MinLength(16, { message: 'JWT_SECRET must be at least 16 characters long' })
  JWT_SECRET: string

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN = '1d'

  @IsString()
  CORS_ORIGIN = '*'

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

  @Type(() => Number)
  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX = 300

  @Type(() => Number)
  @IsInt()
  @Min(1)
  AUTH_RATE_LIMIT_MAX = 20

  @IsOptional()
  @IsString()
  TRUST_PROXY?: string
}

export interface AppConfig {
  nodeEnv: NodeEnv
  host: string
  port: number
  mongoUri: string
  jwt: { secret: string; expiresIn: string }
  corsOrigin: string | string[]
  rateLimit: { windowMs: number; max: number; authMax: number }
  trustProxy: boolean | number | string
}

/** Injection token for the application config. */
export const APP_CONFIG = Symbol('APP_CONFIG')

function parseTrustProxy(value?: string): AppConfig['trustProxy'] {
  if (value === undefined || value === 'false') return false
  if (value === 'true') return true
  const hops = Number(value)
  return Number.isInteger(hops) ? hops : value
}

/**
 * Validate the given environment and map it to the typed application config.
 * @throws Error listing every invalid or missing variable
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const defined = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== undefined && value !== ''))
  const vars = plainToInstance(EnvironmentVariables, defined)
  const errors = validateSync(vars)

  if (errors.length > 0) {
    const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}))
    throw new Error(`Invalid environment configuration:\n  - ${messages.join('\n  - ')}`)
  }

  return {
    nodeEnv: vars.NODE_ENV,
    host: vars.HOST,
    port: vars.PORT,
    mongoUri: vars.MONGODB_URI,
    jwt: { secret: vars.JWT_SECRET, expiresIn: vars.JWT_EXPIRES_IN },
    corsOrigin: vars.CORS_ORIGIN.includes(',')
      ? vars.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : vars.CORS_ORIGIN,
    rateLimit: {
      windowMs: vars.RATE_LIMIT_WINDOW_MS,
      max: vars.RATE_LIMIT_MAX,
      authMax: vars.AUTH_RATE_LIMIT_MAX,
    },
    trustProxy: parseTrustProxy(vars.TRUST_PROXY),
  }
}
