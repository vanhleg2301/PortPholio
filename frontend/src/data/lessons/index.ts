import { CS_LESSONS } from './cs'
import { DSA_LESSONS } from './dsa'
import { PYTHON_LESSONS } from './python'
import { CS_TESTS } from './tests/cs'
import { DSA_TESTS } from './tests/dsa'
import { PYTHON_TESTS } from './tests/python'
import type { Lesson, LessonTest } from './types'

export const LESSONS: Lesson[] = [...PYTHON_LESSONS, ...DSA_LESSONS, ...CS_LESSONS]
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))

// Lesson id → its end-of-day test.
export const LESSON_TESTS: Record<string, LessonTest> = { ...PYTHON_TESTS, ...DSA_TESTS, ...CS_TESTS }

// Each multiple-choice question → the lesson whose test it belongs to (week tests mix lessons).
export const CHOICE_LESSON = new Map(
  Object.entries(LESSON_TESTS).flatMap(([lessonId, test]) => test.choice.map((q) => [q, lessonId] as const))
)

// Share of multiple-choice answers needed to pass a test.
export const PASS_RATIO = 0.8

// NeetCode category → the lesson that teaches it (and has its exercises).
export const CATEGORY_LESSON: Record<string, string> = {
  'Arrays & Hashing': 'dsa-arrays-hashing',
}

export function getExerciseIds(lesson: Lesson): string[] {
  return lesson.blocks.flatMap((b) => (b.type === 'exercise' ? [b.id] : []))
}

export function getPassMark(total: number): number {
  return Math.ceil(total * PASS_RATIO)
}

// Progress item ids (stored per lesson) that together mean "test passed".
export function getTestItemIds(test: LessonTest): string[] {
  return ['test:choice', ...test.code.map((q) => `test:code:${q.id}`), ...test.explain.map((q) => `test:explain:${q.id}`)]
}

// `passed` holds "lessonId:itemId" keys. Lessons without a test count as passed.
export function isLessonTestPassed(lessonId: string, passed: Set<string>): boolean {
  const test = LESSON_TESTS[lessonId]
  if (!test) return true
  return getTestItemIds(test).every((id) => passed.has(`${lessonId}:${id}`))
}

const TERM_RE = /\[\[([^\]|\n]+)(?:\|[^\]\n]+)?\]\]/g

// Glossary keys marked in the lesson text, in order of first use.
export function getLessonTerms(lesson: Lesson): string[] {
  const texts = lesson.blocks.flatMap((b) => {
    if (b.type === 'text' || b.type === 'callout') return [b.md]
    if (b.type === 'exercise') return [b.prompt]
    return []
  })
  const keys = texts.flatMap((t) => [...t.matchAll(TERM_RE)].map((m) => m[1].trim().toLowerCase()))
  return [...new Set(keys)]
}
