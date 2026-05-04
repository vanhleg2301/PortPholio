import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { problemsRouter } from './routes/problems.js'
import { authRouter } from './routes/auth.js'
import { submissionsRouter } from './routes/submissions.js'

const app = new Hono()

app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '/api/*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })
)

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

app.route('/api/auth', authRouter)
app.route('/api/problems', problemsRouter)
app.route('/api/submissions', submissionsRouter)

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: err.message }, 500)
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

const port = parseInt(process.env.PORT ?? '3000')
console.log(`Server running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
