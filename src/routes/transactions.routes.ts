import crypto, { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkIfIDSessionCookieExists } from '../middleware/check-if-id-session-cookie-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkIfIDSessionCookieExists],
    },
    async (request, replay) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')

      return replay.status(200).send({
        transactions,
      })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkIfIDSessionCookieExists],
    },
    async (request, replay) => {
      const { sessionId } = request.cookies

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .where('id', id)
        .andWhere('session_id', sessionId)
        .first()

      return replay.status(200).send({
        transaction,
      })
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkIfIDSessionCookieExists],
    },
    async (request, replay) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return replay.status(200).send({
        summary,
      })
    },
  )
}
