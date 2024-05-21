import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions.routes'

export const app = fastify()
const port: number = env.PORT

// add plugins
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})
