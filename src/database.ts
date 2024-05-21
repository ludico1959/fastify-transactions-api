import { knex as knexSetup, Knex } from 'knex'
import { env } from './env'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env variable was not set')
}

export const config: Knex.Config = {
  client: 'sqlite3', // or 'better-sqlite3'
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = knexSetup(config)
