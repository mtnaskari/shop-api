import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { UserRole } from '../src/database/models/user.model'
import { API, bearer, buildApp, createCategory, createProduct, signUp } from './helpers'

describe('categories', () => {
  const app = buildApp()

  it('lists categories sorted by name without authentication', async () => {
    await createCategory('Tea')
    await createCategory('Coffee')

    const res = await request(app).get(`${API}/categories`).expect(200)
    expect(res.body.data.map((c: { name: string }) => c.name)).toEqual(['Coffee', 'Tea'])
  })

  it('lets admins create, update and delete categories', async () => {
    const { token } = await signUp(app, UserRole.Admin)

    const created = await request(app)
      .post(`${API}/categories`)
      .set(bearer(token))
      .send({ name: '  Pastries ', description: 'Baked daily' })
      .expect(201)
    expect(created.body.data).toMatchObject({ name: 'Pastries', description: 'Baked daily' })

    const { id } = created.body.data
    const updated = await request(app)
      .patch(`${API}/categories/${id}`)
      .set(bearer(token))
      .send({ name: 'Bakery' })
      .expect(200)
    expect(updated.body.data.name).toBe('Bakery')

    await request(app).delete(`${API}/categories/${id}`).set(bearer(token)).expect(204)
    await request(app).get(`${API}/categories/${id}`).expect(404)
  })

  it('forbids customers from writing and rejects anonymous writes', async () => {
    const { token } = await signUp(app)
    await request(app).post(`${API}/categories`).set(bearer(token)).send({ name: 'Nope' }).expect(403)
    await request(app).post(`${API}/categories`).send({ name: 'Nope' }).expect(401)
  })

  it('rejects duplicate names, empty updates and deleting a category that has products', async () => {
    const { token } = await signUp(app, UserRole.Admin)
    const category = await createCategory('Coffee')
    await createProduct(category._id)

    const duplicate = await request(app)
      .post(`${API}/categories`)
      .set(bearer(token))
      .send({ name: 'Coffee' })
      .expect(409)
    expect(duplicate.body.error.message).toBe('A record with this name already exists')

    await request(app).patch(`${API}/categories/${category.id}`).set(bearer(token)).send({}).expect(400)
    await request(app).delete(`${API}/categories/${category.id}`).set(bearer(token)).expect(409)
  })

  it('validates the id parameter', async () => {
    const res = await request(app).get(`${API}/categories/not-an-id`).expect(400)
    expect(res.body.error.details).toEqual(['id must be a valid id'])
  })
})
