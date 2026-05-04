import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, ilike } from 'drizzle-orm'
import { db } from '../db/index.js'
import { problems, problemTags, tags, userProgress } from '../db/schema.js'
import { optionalAuth, authMiddleware } from '../middleware/auth.js'
import { judgeService } from '../services/judge.js'

export const problemsRouter = new Hono()

const querySchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

problemsRouter.get('/', optionalAuth, zValidator('query', querySchema), async (c) => {
  const { difficulty, search, page, limit } = c.req.valid('query')
  const user = c.get('user' as never) as { id: string } | undefined

  const conditions = [eq(problems.isPublished, true)]
  if (difficulty) conditions.push(eq(problems.difficulty, difficulty))
  if (search) conditions.push(ilike(problems.title, `%${search}%`))

  const rows = await db
    .select({
      id: problems.id,
      slug: problems.slug,
      title: problems.title,
      difficulty: problems.difficulty,
      acceptanceRate: problems.acceptanceRate,
      orderIndex: problems.orderIndex,
    })
    .from(problems)
    .where(and(...conditions))
    .orderBy(problems.orderIndex)
    .limit(limit)
    .offset((page - 1) * limit)

  if (user) {
    const progressRows = await db
      .select({ problemId: userProgress.problemId, isSolved: userProgress.isSolved })
      .from(userProgress)
      .where(eq(userProgress.userId, user.id))

    const progressMap = new Map(progressRows.map((p) => [p.problemId, p.isSolved]))
    return c.json(rows.map((r) => ({ ...r, is_solved: progressMap.get(r.id) ?? false })))
  }

  return c.json(rows)
})

problemsRouter.get('/:slug', optionalAuth, async (c) => {
  const slug = c.req.param('slug')
  const user = c.get('user' as never) as { id: string } | undefined

  const [problem] = await db
    .select()
    .from(problems)
    .where(and(eq(problems.slug, slug), eq(problems.isPublished, true)))
    .limit(1)

  if (!problem) return c.json({ error: 'Not found' }, 404)

  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(tags)
    .innerJoin(problemTags, eq(problemTags.tagId, tags.id))
    .where(eq(problemTags.problemId, problem.id))

  let progress = null
  if (user) {
    const [p] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.problemId, problem.id)))
      .limit(1)
    progress = p ?? null
  }

  return c.json({ ...problem, tags: tagRows, progress })
})

const submitSchema = z.object({
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'go']),
  code: z.string().min(1).max(50000),
})

problemsRouter.post('/:slug/submit', authMiddleware, zValidator('json', submitSchema), async (c) => {
  const slug = c.req.param('slug')
  const { language, code } = c.req.valid('json')
  const user = c.get('user' as never) as { id: string }

  const [problem] = await db
    .select({ id: problems.id })
    .from(problems)
    .where(and(eq(problems.slug, slug), eq(problems.isPublished, true)))
    .limit(1)

  if (!problem) return c.json({ error: 'Not found' }, 404)

  const result = await judgeService.run({ language, code, problemId: problem.id })

  await db
    .insert(userProgress)
    .values({
      userId: user.id,
      problemId: problem.id,
      isSolved: result.status === 'accepted',
      attempts: 1,
      lastLanguage: language,
      lastCode: code,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.problemId],
      set: {
        isSolved: result.status === 'accepted',
        attempts: db.$count(userProgress),
        lastLanguage: language,
        lastCode: code,
        updatedAt: new Date(),
      },
    })

  return c.json(result)
})
