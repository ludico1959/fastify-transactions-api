import { execSync } from 'node:child_process'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// tests e2e

describe('Transctions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'test transaction',
        amount: 1000.5,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'test transaction',
        amount: 1000.5,
        type: 'credit',
      })

    let cookies: string[] | undefined =
      createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      cookies = []
    }

    const listAllTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listAllTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'test transaction',
        amount: 1000.5,
      }),
    ])
  })

  it('should be able to get a specific transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'test transaction',
        amount: 1000.5,
        type: 'credit',
      })

    let cookies: string[] | undefined =
      createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      cookies = []
    }

    const listAllTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listAllTransactionResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'test transaction',
        amount: 1000.5,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'test transaction',
        amount: 5000,
        type: 'credit',
      })

    let cookies: string[] | undefined =
      createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      cookies = []
    }

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'test transaction',
        amount: 2000,
        type: 'debit',
      })

    const getSummaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(getSummaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
