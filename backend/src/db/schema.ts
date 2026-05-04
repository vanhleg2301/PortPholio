import {
  pgTable, uuid, varchar, text, integer, boolean,
  timestamp, jsonb, pgEnum, real, index, primaryKey
} from 'drizzle-orm/pg-core'

export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard'])
export const languageEnum = pgEnum('language', ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'])
export const submissionStatusEnum = pgEnum('submission_status', [
  'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error'
])

export const problems = pgTable('problems', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  constraints: text('constraints').notNull().default(''),
  examples: jsonb('examples').notNull().default([]),
  starterCode: jsonb('starter_code').notNull().default({}),
  solutionCode: jsonb('solution_code'),
  timeComplexity: varchar('time_complexity', { length: 50 }),
  spaceComplexity: varchar('space_complexity', { length: 50 }),
  acceptanceRate: real('acceptance_rate').notNull().default(0),
  submissionCount: integer('submission_count').notNull().default(0),
  orderIndex: integer('order_index').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  slugIdx: index('problems_slug_idx').on(t.slug),
  difficultyIdx: index('problems_difficulty_idx').on(t.difficulty),
  orderIdx: index('problems_order_idx').on(t.orderIndex),
}))

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
})

export const problemTags = pgTable('problem_tags', {
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.problemId, t.tagId] }),
}))

export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  language: languageEnum('language').notNull(),
  code: text('code').notNull(),
  status: submissionStatusEnum('status').notNull(),
  runtimeMs: integer('runtime_ms'),
  memoryKb: integer('memory_kb'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('submissions_user_idx').on(t.userId),
  problemIdx: index('submissions_problem_idx').on(t.problemId),
}))

export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  isSolved: boolean('is_solved').notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  lastLanguage: languageEnum('last_language').notNull().default('javascript'),
  lastCode: text('last_code'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  userProblemIdx: index('user_progress_user_problem_idx').on(t.userId, t.problemId),
}))

export type Problem = typeof problems.$inferSelect
export type NewProblem = typeof problems.$inferInsert
export type Submission = typeof submissions.$inferSelect
export type NewSubmission = typeof submissions.$inferInsert
export type UserProgress = typeof userProgress.$inferSelect
