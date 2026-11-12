import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { CategoryDocument } from '../src/database/models/category.model'
import { UserRole } from '../src/database/models/user.model'
import { API, bearer, buildApp, createCategory, createProduct, signUp } from './helpers'

describe('products', () => {
  const app = buildApp()
  let coffee: CategoryDocument
  let tea: CategoryDocument

  beforeEach(async () => {
    coffee = await createCategory('Coffee')
    tea = await createCategory('Tea')
    await createProduct(coffee._id, { name: 'Espresso', price: 2.5, description: 'Short and strong' })
    await createProduct(coffee._id, { name: 'Flat White', price: 4.2 })
    await createProduct(coffee._id, { name: 'Mocha', price: 4.5, isAvailable: false })
    await createProduct(tea._id, { name: 'Chai Latte', price: 4.0, description: 'Spiced tea with milk' })
  })

  const names = (body: { data: { name: string }[] }) => body.data.map((product) => product.name)

  it('paginates and reports metadata', async () => {
    const res = await request(app).get(`${API}/products?limit=3&page=2&sort=name`).expect(200)
    expect(names(res.body)).toEqual(['Mocha'])
    expect(res.body.meta).toEqual({ page: 2, limit: 3, total: 4, totalPages: 2 })
  })

  it('populates the category', async () => {
    const res = await request(app).get(`${API}/products?search=chai`).expect(200)
    expect(res.body.data[0].category).toMatchObject({ id: tea.id, name: 'Tea' })
  })

  it('searches name and description case-insensitively and treats input literally', async () => {
    expect(names((await request(app).get(`${API}/products?search=STRONG`)).body)).toEqual(['Espresso'])
    expect((await request(app).get(`${API}/products?search=.*`)).body.data).toHaveLength(0)
  })

  it('filters by category, price range and availability', async () => {
    const byCategory = await request(app).get(`${API}/products?category=${tea.id}`)
    expect(names(byCategory.body)).toEqual(['Chai Latte'])

    const byPrice = await request(app).get(`${API}/products?minPrice=4&maxPrice=4.4&sort=price`)
    expect(names(byPrice.body)).toEqual(['Chai Latte', 'Flat White'])

    const available = await request(app).get(`${API}/products?available=false`)
    expect(names(available.body)).toEqual(['Mocha'])
  })

  it('sorts by price descending', async () => {
    const res = await request(app).get(`${API}/products?sort=-price`)
    expect(names(res.body)).toEqual(['Mocha', 'Flat White', 'Chai Latte', 'Espresso'])
  })

  it.each([
    ['limit=0', 'limit must not be less than 1'],
    ['limit=500', 'limit must not be greater than 100'],
    ['sort=popularity', 'sort must be one of the following values: name, -name, price, -price, createdAt, -createdAt'],
    ['category=abc', 'category must be a valid id'],
    ['unknown=1', 'property unknown should not exist'],
  ])('rejects invalid query %s', async (query, message) => {
    const res = await request(app).get(`${API}/products?${query}`).expect(400)
    expect(res.body.error.details).toContain(message)
  })

  it('rejects an inverted price range', async () => {
    const res = await request(app).get(`${API}/products?minPrice=10&maxPrice=1`).expect(400)
    expect(res.body.error.message).toBe('minPrice must not be greater than maxPrice')
  })

  it('returns 404 for an unknown product', async () => {
    await request(app).get(`${API}/products/665f1c2b9a1e4b0012345678`).expect(404)
  })

  describe('admin writes', () => {
    it('creates, updates and deletes a product', async () => {
      const { token } = await signUp(app, UserRole.Admin)

      const created = await request(app)
        .post(`${API}/products`)
        .set(bearer(token))
        .send({ name: 'Cortado', price: 3.4, category: coffee.id })
        .expect(201)
      expect(created.body.data).toMatchObject({ name: 'Cortado', price: 3.4, isAvailable: true })
      expect(created.body.data.category.name).toBe('Coffee')

      const { id } = created.body.data
      const updated = await request(app)
        .patch(`${API}/products/${id}`)
        .set(bearer(token))
        .send({ price: 3.6, category: tea.id })
        .expect(200)
      expect(updated.body.data).toMatchObject({ price: 3.6, category: { name: 'Tea' } })

      await request(app).delete(`${API}/products/${id}`).set(bearer(token)).expect(204)
      await request(app).delete(`${API}/products/${id}`).set(bearer(token)).expect(404)
    })

    it('rejects an unknown category and invalid prices', async () => {
      const { token } = await signUp(app, UserRole.Admin)

      const unknown = await request(app)
        .post(`${API}/products`)
        .set(bearer(token))
        .send({ name: 'Cortado', price: 3.4, category: '665f1c2b9a1e4b0012345678' })
        .expect(400)
      expect(unknown.body.error.details).toEqual(['category does not exist'])

      const invalid = await request(app)
        .post(`${API}/products`)
        .set(bearer(token))
        .send({ name: 'Cortado', price: -1, category: coffee.id })
        .expect(400)
      expect(invalid.body.error.details).toContain('price must not be less than 0')
    })

    it('is forbidden for customers', async () => {
      const { token } = await signUp(app)
      await request(app)
        .post(`${API}/products`)
        .set(bearer(token))
        .send({ name: 'Cortado', price: 3.4, category: coffee.id })
        .expect(403)
    })
  })
})
