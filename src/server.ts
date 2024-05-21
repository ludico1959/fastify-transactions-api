import { app } from '../src/app'
import { env } from './env'

const port: number = env.PORT

app.listen({ port }).then(() => {
  console.log(`Server running on port ${port}`)
})
