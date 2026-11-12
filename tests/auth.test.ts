import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { API, bearer, buildApp, signUp } from './helpers'

describe('auth', () => {
  const app = buildApp()
  const valid = { fullName: 'Ada Lovelace', email: 'Ada@Example.com ', password: 'correct-horse' }

  it('registers a user, normalises the email and never returns the password', async () => {
    const res = await request(app).post(`${API}/auth/register`).send(valid).expect(201)

    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toEqual(expect.any(String))
    expect(res.body.data.user).toMatchObject({ fullName: 'Ada Lovelace', email: 'ada@example.com', role: 'customer' })
    expect(res.body.data.user.id).toEqual(expect.any(String))
    expect(res.body.data.user).not.toHaveProperty('password')
    expect(res.body.data.user).not.toHaveProperty('_id')
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app).post(`${API}/auth/register`).send(valid).expect(201)
    const res = await request(app).post(`${API}/auth/register`).send(valid).expect(409)

    expect(res.body).toEqual({
      success: false,
      error: { statusCode: 409, message: 'An account with this email already exists' },
    })
  })

  it('returns every validation error at once', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'not-an-email', password: 'short', extra: true })
      .expect(400)

    expect(res.body.error.message).toBe('Validation failed')
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        'property extra should not exist',
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        expect.stringContaining('fullName'),
      ]),
    )
  })

  it('logs in with valid credentials and rejects a wrong password', async () => {
    await request(app).post(`${API}/auth/register`).send(valid).expect(201)

    const ok = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'ada@example.com', password: valid.password })
      .expect(200)
    expect(ok.body.data.token).toEqual(expect.any(String))

    const wrong = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'ada@example.com', password: 'wrong-password' })
      .expect(401)
    expect(wrong.body.error.message).toBe('Invalid email or password')

    await request(app).post(`${API}/auth/login`).send({ email: 'nobody@example.com', password: 'whatever' }).expect(401)
  })

  it('returns the current user for a valid token', async () => {
    const { token, user } = await signUp(app)
    const res = await request(app).get(`${API}/auth/me`).set(bearer(token)).expect(200)
    expect(res.body.data).toMatchObject({ id: user.id, email: user.email })
  })

  it.each([
    ['no header', {}],
    ['a malformed header', { Authorization: 'Token abc' }],
    ['an invalid token', { Authorization: 'Bearer not.a.jwt' }],
  ])('rejects %s with 401', async (_name, headers) => {
    const res = await request(app).get(`${API}/auth/me`).set(headers).expect(401)
    expect(res.body.success).toBe(false)
  })

  it('rejects a token signed with another secret', async () => {
    const other = buildApp({ jwt: { secret: 'a-completely-different-secret', expiresIn: '1h' } })
    const { token } = await signUp(other)
    await request(app).get(`${API}/auth/me`).set(bearer(token)).expect(401)
  })

  it('rate limits the login endpoint', async () => {
    const limited = buildApp({ rateLimit: { windowMs: 60_000, max: 100, authMax: 2 } })
    const body = { email: 'nobody@example.com', password: 'whatever' }

    await request(limited).post(`${API}/auth/login`).send(body).expect(401)
    await request(limited).post(`${API}/auth/login`).send(body).expect(401)
    const res = await request(limited).post(`${API}/auth/login`).send(body).expect(429)
    expect(res.body.error.statusCode).toBe(429)
    expect(res.headers).toHaveProperty('ratelimit-policy')
  })
})
