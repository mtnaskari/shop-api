import { Application } from 'express'
import request from 'supertest'

import { createApp } from '../src/app'
import { AppConfig, NodeEnv } from '../src/config/env'
import { CategoryModel } from '../src/database/models/category.model'
import { ProductModel } from '../src/database/models/product.model'
import { UserModel, UserRole } from '../src/database/models/user.model'

export const API = '/api/v1'

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    nodeEnv: NodeEnv.Test,
    host: '127.0.0.1',
    port: 0,
    mongoUri: 'unused-in-tests',
    jwt: { secret: 'test-secret-that-is-long-enough', expiresIn: '1h' },
    corsOrigin: '*',
    rateLimit: { windowMs: 60_000, max: 10_000, authMax: 10_000 },
    trustProxy: false,
    ...overrides,
  }
}

export function buildApp(overrides: Partial<AppConfig> = {}): Application {
  return createApp(testConfig(overrides))
}

let counter = 0

/** Register a user through the API and return its token. Admins are promoted directly in the database. */
export async function signUp(app: Application, role: UserRole = UserRole.Customer) {
  counter += 1
  const credentials = { fullName: `User ${counter}`, email: `user${counter}@example.com`, password: 'password123' }
  const res = await request(app).post(`${API}/auth/register`).send(credentials).expect(201)

  if (role === UserRole.Admin) {
    await UserModel.updateOne({ email: credentials.email }, { role: UserRole.Admin })
  }
  return { token: res.body.data.token as string, user: res.body.data.user, credentials }
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function createCategory(name = 'Coffee') {
  return CategoryModel.create({ name, description: `${name} description` })
}

export async function createProduct(categoryId: unknown, overrides: Record<string, unknown> = {}) {
  counter += 1
  return ProductModel.create({ name: `Product ${counter}`, price: 3.5, category: categoryId, ...overrides })
}
