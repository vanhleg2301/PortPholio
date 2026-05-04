import { Hono } from 'hono'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { submissions } from '../db/schema.js'
import { authMiddleware } from '../middleware/auth.js'

export const submissionsRouter = new Hono()

submissionsRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user' as never) as { id: string }
  const problemId = c.req.query('problem_id')

  const conditions = [eq(submissions.userId, user.id)]
  if (problemId) conditions.push(eq(submissions.problemId, problemId))

  const rows = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt))
    .limit(20)

  return c.json(rows)
})
