import { app } from '../src/app'
import { env } from './env'

const port: number = env.PORT
const host: string = env.HOST_ADDRESS

app.listen({ port, host }).then(() => {
  console.log(`Server running on port ${port}`)
})
