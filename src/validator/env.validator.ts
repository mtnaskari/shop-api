import { config } from 'dotenv'
import { readFileSync } from 'fs'

config()

function setEnvKeys(): boolean {
  const envPath = '.env'
  const examplePath = '.env.example'

  const envContent = readFileContent(envPath)
  const exampleContent = readFileContent(examplePath)

  const envKeys = parseEnvKeys(envContent)
  const exampleKeys = parseEnvKeys(exampleContent)

  const missingKeys = exampleKeys.filter((key) => !envKeys.includes(key))
  const extraKeys = envKeys.filter((key) => !exampleKeys.includes(key))

  if (missingKeys.length > 0 || extraKeys.length > 0) {
    console.log('Keys do not match:')
    if (missingKeys.length > 0) {
      console.log('Missing keys:', missingKeys)
    }
    if (extraKeys.length > 0) {
      console.log('Extra keys:', extraKeys)
    }
    return false
  }

  console.log('Keys match.')
  return true
}

function setEnvExampleKeys(): void {
  const examplePath = '.env.example'

  const exampleContent = readFileSync(examplePath, 'utf-8')

  const exampleKeys = parseEnvKeys(exampleContent)

  const missingKeys = exampleKeys.filter((key) => !(key in process.env))

  if (missingKeys.length > 0) {
    throw new Error(`Missing keys in process.env: ${missingKeys.join(', ')}`)
  }

  console.log('All keys from .env.example exist in the environment variables.')
}

function readFileContent(path: string): string {
  return readFileSync(path, 'utf-8')
}

function parseEnvKeys(content: string): string[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#'))

  return lines.map((line) => {
    const keyValuePair = line.split('=')
    return keyValuePair[0].trim()
  })
}

setEnvKeys()
setEnvExampleKeys()
