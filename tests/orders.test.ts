import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { ProductDocument, ProductModel } from '../src/database/models/product.model'
import { UserRole } from '../src/database/models/user.model'
import { API, bearer, buildApp, createCategory, createProduct, signUp } from './helpers'

describe('orders', () => {
  const app = buildApp()
  let latte: ProductDocument
  let croissant: ProductDocument

  beforeEach(async () => {
    const category = await createCategory('Menu')
    latte = await createProduct(category._id, { name: 'Latte', price: 4.1 })
    croissant = await createProduct(category._id, { name: 'Croissant', price: 2.9 })
  })

  const place = (token: string, items: unknown) => request(app).post(`${API}/orders`).set(bearer(token)).send({ items })

  it('requires authentication', async () => {
    await request(app).get(`${API}/orders`).expect(401)
    await request(app).post(`${API}/orders`).send({ items: [] }).expect(401)
  })

  it('prices the order from the database and merges repeated products', async () => {
    const { token, user } = await signUp(app)

    const res = await place(token, [
      { product: latte.id, quantity: 2 },
      { product: croissant.id, quantity: 1 },
      { product: latte.id, quantity: 1 },
    ]).expect(201)

    expect(res.body.data).toMatchObject({
      user: user.id,
      status: 'pending',
      totalPrice: 15.2,
      items: [
        { product: latte.id, name: 'Latte', unitPrice: 4.1, quantity: 3, subtotal: 12.3 },
        { product: croissant.id, name: 'Croissant', unitPrice: 2.9, quantity: 1, subtotal: 2.9 },
      ],
    })
  })

  it('keeps the price it was placed at when the product changes later', async () => {
    const { token } = await signUp(app)
    const { body } = await place(token, [{ product: latte.id, quantity: 1 }]).expect(201)

    await ProductModel.updateOne({ _id: latte._id }, { price: 9.99 })
    await ProductModel.deleteOne({ _id: croissant._id })

    const res = await request(app).get(`${API}/orders/${body.data.id}`).set(bearer(token)).expect(200)
    expect(res.body.data.totalPrice).toBe(4.1)
  })

  it('rejects unknown and unavailable products', async () => {
    const { token } = await signUp(app)
    const missing = '665f1c2b9a1e4b0012345678'

    const unknown = await place(token, [{ product: missing, quantity: 1 }]).expect(400)
    expect(unknown.body.error).toMatchObject({ message: 'Some products do not exist', details: [missing] })

    await ProductModel.updateOne({ _id: croissant._id }, { isAvailable: false })
    const unavailable = await place(token, [{ product: croissant.id, quantity: 1 }]).expect(400)
    expect(unavailable.body.error.details).toEqual(['Croissant'])
  })

  it('reports nested validation errors with their path', async () => {
    const { token } = await signUp(app)

    const res = await place(token, [{ product: latte.id, quantity: 0 }, { product: 'x' }]).expect(400)
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        'items.0.quantity must not be less than 1',
        'items.1.product must be a valid id',
        'items.1.quantity must be an integer number',
      ]),
    )

    await place(token, []).expect(400)
  })

  it('shows customers only their own orders and hides other orders', async () => {
    const alice = await signUp(app)
    const bob = await signUp(app)
    const { body } = await place(alice.token, [{ product: latte.id, quantity: 1 }]).expect(201)
    await place(bob.token, [{ product: croissant.id, quantity: 1 }]).expect(201)

    const list = await request(app).get(`${API}/orders`).set(bearer(alice.token)).expect(200)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.meta).toMatchObject({ total: 1, page: 1 })

    await request(app).get(`${API}/orders/${body.data.id}`).set(bearer(bob.token)).expect(404)
    await request(app).post(`${API}/orders/${body.data.id}/cancel`).set(bearer(bob.token)).expect(404)
  })

  it('lets the owner cancel a pending order once', async () => {
    const { token } = await signUp(app)
    const { body } = await place(token, [{ product: latte.id, quantity: 1 }]).expect(201)

    const cancelled = await request(app).post(`${API}/orders/${body.data.id}/cancel`).set(bearer(token)).expect(200)
    expect(cancelled.body.data.status).toBe('cancelled')

    const again = await request(app).post(`${API}/orders/${body.data.id}/cancel`).set(bearer(token)).expect(409)
    expect(again.body.error.message).toBe('Cannot change order status from cancelled to cancelled')
  })

  it('lets admins see all orders, filter by status and mark orders as paid', async () => {
    const customer = await signUp(app)
    const admin = await signUp(app, UserRole.Admin)
    const first = await place(customer.token, [{ product: latte.id, quantity: 1 }]).expect(201)
    await place(customer.token, [{ product: croissant.id, quantity: 1 }]).expect(201)

    const all = await request(app).get(`${API}/orders`).set(bearer(admin.token)).expect(200)
    expect(all.body.meta.total).toBe(2)

    await request(app)
      .patch(`${API}/orders/${first.body.data.id}/status`)
      .set(bearer(customer.token))
      .send({ status: 'paid' })
      .expect(403)

    const paid = await request(app)
      .patch(`${API}/orders/${first.body.data.id}/status`)
      .set(bearer(admin.token))
      .send({ status: 'paid' })
      .expect(200)
    expect(paid.body.data.status).toBe('paid')

    const filtered = await request(app).get(`${API}/orders?status=paid`).set(bearer(admin.token)).expect(200)
    expect(filtered.body.data.map((order: { id: string }) => order.id)).toEqual([first.body.data.id])

    await request(app)
      .patch(`${API}/orders/${first.body.data.id}/status`)
      .set(bearer(admin.token))
      .send({ status: 'cancelled' })
      .expect(409)
  })
})
