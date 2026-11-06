import { CS_LESSONS } from './cs'
import { DSA_LESSONS } from './dsa'
import { PYTHON_LESSONS } from './python'
import { CS_TESTS } from './tests/cs'
import { DSA_TESTS } from './tests/dsa'
import { PYTHON_TESTS } from './tests/python'
import { TEST_SOURCES } from './tests/sources'
import { CHOICE_VARIANTS } from './tests/variants'
import type { ChoiceQuestion, Lesson, LessonTest } from './types'

export const LESSONS: Lesson[] = [...PYTHON_LESSONS, ...DSA_LESSONS, ...CS_LESSONS]
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))

// Lesson id → its end-of-day test: original questions plus the alternative question for each
// concept, with the source of every concept and problem attached.
export const LESSON_TESTS: Record<string, LessonTest> = Object.fromEntries(
  Object.entries({ ...PYTHON_TESTS, ...DSA_TESTS, ...CS_TESTS }).map(([id, test]) => {
    const { sources, refs } = TEST_SOURCES[id] ?? { sources: [], refs: {} }
    return [
      id,
      {
        ...test,
        sources,
        choice: [...test.choice, ...(CHOICE_VARIANTS[id] ?? [])].map((q) => ({ ...q, ref: refs[q.concept ?? q.id] })),
        code: test.code.map((q) => ({ ...q, ref: refs[q.id] })),
      },
    ]
  })
)

// Each multiple-choice question → the lesson whose test it belongs to (week tests mix lessons).
export const CHOICE_LESSON = new Map(
  Object.entries(LESSON_TESTS).flatMap(([lessonId, test]) => test.choice.map((q) => [q, lessonId] as const))
)

// "lessonId/concept": questions sharing it test the same idea.
export function getConceptKey(question: ChoiceQuestion): string {
  return `${CHOICE_LESSON.get(question) ?? ''}/${question.concept ?? question.id}`
}

// Questions grouped by concept, in order of first appearance.
export function groupByConcept(questions: ChoiceQuestion[]): ChoiceQuestion[][] {
  const groups = new Map<string, ChoiceQuestion[]>()
  for (const q of questions) {
    const key = getConceptKey(q)
    groups.set(key, [...(groups.get(key) ?? []), q])
  }
  return [...groups.values()]
}

// Number of questions one attempt asks (one per concept).
export function getConceptCount(questions: ChoiceQuestion[]): number {
  return groupByConcept(questions).length
}

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
