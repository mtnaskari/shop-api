import { Application } from 'express'
import mongoose from 'mongoose'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { loadConfig } from '../src/config/env'
import { openApiDocument } from '../src/docs/openapi'
import { API, buildApp } from './helpers'

interface Layer {
  route?: { path: string; methods: Record<string, boolean> }
  handle: { stack?: Layer[] }
}

/** Collect `METHOD /path` for every route registered on the API routers. */
function registeredRoutes(app: Application): string[] {
  const stack: Layer[] = (app as unknown as { _router: { stack: Layer[] } })._router.stack
  return stack
    .flatMap((layer) => layer.handle.stack ?? [])
    .filter((layer) => layer.route)
    .flatMap(({ route }) =>
      Object.keys(route!.methods).map((method) => `${method.toUpperCase()} ${route!.path.replace(/:(\w+)/g, '{$1}')}`),
    )
}

describe('application', () => {
  const app = buildApp()

  it('reports health, including the database', async () => {
    const res = await request(app).get('/health').expect(200)
    expect(res.body.data).toMatchObject({ status: 'ok', checks: { database: 'up' } })
  })

  it('reports 503 when the database is down', async () => {
    const state = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState')
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true })
    try {
      const res = await request(app).get('/health').expect(503)
      expect(res.body.data.checks.database).toBe('down')
    } finally {
      if (state) Object.defineProperty(mongoose.connection, 'readyState', state)
      else delete (mongoose.connection as unknown as Record<string, unknown>).readyState
    }
  })

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get(`${API}/nope`).expect(404)
    expect(res.body).toEqual({
      success: false,
      error: { statusCode: 404, message: 'Route GET /api/v1/nope not found' },
    })
  })

  it('returns 400 for malformed JSON and non-object bodies', async () => {
    const malformed = await request(app)
      .post(`${API}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400)
    expect(malformed.body.error.message).toBe('Malformed JSON body')

    const array = await request(app).post(`${API}/auth/login`).send([1, 2]).expect(400)
    expect(array.body.error.message).toBe('Request body must be a JSON object')
  })

  it('sets security headers', async () => {
    const res = await request(app).get('/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers).not.toHaveProperty('x-powered-by')
  })

  it('serves Swagger UI and the OpenAPI document', async () => {
    const ui = await request(app).get('/docs/').expect(200)
    expect(ui.text).toContain('swagger-ui')

    const spec = await request(app).get('/docs.json').expect(200)
    expect(spec.body.openapi).toBe('3.0.3')
  })

  it('documents every registered route', () => {
    const documented = Object.entries(openApiDocument.paths).flatMap(([path, item]) =>
      Object.keys(item)
        .filter((key) => ['get', 'post', 'patch', 'put', 'delete'].includes(key))
        .map((method) => `${method.toUpperCase()} ${path}`),
    )

    const routes = registeredRoutes(app)
    expect(routes).toHaveLength(19)
    expect(routes.sort()).toEqual(documented.sort())
  })
})

describe('loadConfig', () => {
  const base = { MONGODB_URI: 'mongodb://localhost/shop', JWT_SECRET: 'x'.repeat(32) }

  it('applies defaults and parses numbers', () => {
    const config = loadConfig({ ...base, PORT: '8080', CORS_ORIGIN: 'https://a.test, https://b.test' })
    expect(config).toMatchObject({
      port: 8080,
      host: '0.0.0.0',
      jwt: { expiresIn: '1d' },
      corsOrigin: ['https://a.test', 'https://b.test'],
      trustProxy: false,
    })
  })

  it('lists every invalid variable', () => {
    expect(() => loadConfig({ JWT_SECRET: 'short', PORT: 'abc' })).toThrow(
      /MONGODB_URI should not be empty[\s\S]*JWT_SECRET must be at least 16 characters long/,
    )
  })
})
