import { CS_LESSONS } from './cs'
import { DSA_LESSONS } from './dsa'
import { PYTHON_LESSONS } from './python'
import { PYTHON_SYNTAX_LESSONS } from './pythonSyntax'
import { PYTHON_FOUNDATION_LESSONS } from './pythonFoundations'
import { CS_TESTS } from './tests/cs'
import { DSA_TESTS } from './tests/dsa'
import { PYTHON_TESTS } from './tests/python'
import { PYTHON_SYNTAX_TESTS, PYTHON_SYNTAX_VARIANTS } from './tests/pythonSyntax'
import { PYTHON_FOUNDATION_TESTS, PYTHON_FOUNDATION_VARIANTS } from './tests/pythonFoundations'
import { TEST_SOURCES } from './tests/sources'
import { CHOICE_VARIANTS } from './tests/variants'
import type { ChoiceQuestion, Lesson, LessonTest, VisualId } from './types'

// Week 0 order: if / else, how Python runs, for, while, Python vs other languages, then the rest.
const [SYNTAX_IF, SYNTAX_FOR, SYNTAX_WHILE, ...SYNTAX_REST] = PYTHON_SYNTAX_LESSONS
const [HOW_PYTHON_RUNS, PYTHON_REAL_WORLD] = PYTHON_FOUNDATION_LESSONS
export const LESSONS: Lesson[] = [
  SYNTAX_IF,
  HOW_PYTHON_RUNS,
  SYNTAX_FOR,
  SYNTAX_WHILE,
  PYTHON_REAL_WORLD,
  ...SYNTAX_REST,
  ...PYTHON_LESSONS,
  ...DSA_LESSONS,
  ...CS_LESSONS,
]
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))
const VARIANTS: Record<string, ChoiceQuestion[]> = { ...CHOICE_VARIANTS, ...PYTHON_SYNTAX_VARIANTS, ...PYTHON_FOUNDATION_VARIANTS }

// Lesson id → its end-of-day test: original questions plus the alternative question for each
// concept, with the source of every concept and problem attached.
export const LESSON_TESTS: Record<string, LessonTest> = Object.fromEntries(
  Object.entries({ ...PYTHON_SYNTAX_TESTS, ...PYTHON_FOUNDATION_TESTS, ...PYTHON_TESTS, ...DSA_TESTS, ...CS_TESTS }).map(([id, test]) => {
    const { sources, refs } = TEST_SOURCES[id] ?? { sources: [], refs: {} }
    return [
      id,
      {
        ...test,
        sources,
        choice: [...test.choice, ...(VARIANTS[id] ?? [])].map((q) => ({ ...q, ref: refs[q.concept ?? q.id] })),
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
  'Two Pointers': 'dsa-two-pointers',
  'Sliding Window': 'dsa-sliding-window',
  Stack: 'dsa-stack',
  'Binary Search': 'dsa-binary-search',
  'Linked List': 'dsa-linked-list',
  Trees: 'dsa-trees',
}

export function getExerciseIds(lesson: Lesson): string[] {
  return lesson.blocks.flatMap((b) => (b.type === 'exercise' ? [b.id] : []))
}

export function getPassMark(total: number): number {
  return Math.ceil(total * PASS_RATIO)
}

// Progress item ids (stored per lesson) that together mean "test passed".
export function getTestItemIds(test: LessonTest): string[] {
  return [...(test.choice.length > 0 ? ['test:choice'] : []), ...test.code.map((q) => `test:code:${q.id}`), ...test.explain.map((q) => `test:explain:${q.id}`)]
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

// Titles of the animated diagrams (shown in the lesson menu and search without loading them).
export const VISUAL_TITLES: Record<VisualId, string> = {
  aliasing: 'Names and objects',
  slicing: 'Slicing playground',
  'dynamic-array': 'list.append and resizing',
  'hash-table': 'Inside a hash table',
  'call-stack': 'The call stack',
  heap: 'Min-heap',
  'two-sum': 'Two Sum with a hash map',
  'prefix-suffix': 'Product except self',
  'bucket-sort': 'Top k with bucket sort',
  handshake: 'New HTTPS connection',
  'slow-start': 'Slow start',
  'hol-blocking': 'Head-of-line blocking',
  globe: 'Distance and the speed of light',
  'two-pointers': 'Two pointers on a sorted array',
  'sliding-window': 'Sliding window',
  'udp-vs-tcp': 'UDP vs TCP: one lost packet',
}

// Lesson markdown → plain text: glossary marks, links, emphasis and code ticks removed.
export function toPlainText(md: string): string {
  return md
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>|]/g, '')
    .replace(/-{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type OutlineKind = 'section' | 'visual' | 'exercise' | 'quiz' | 'words' | 'reading' | 'finish'

export interface OutlineItem {
  // DOM id of the place to scroll to.
  anchor: string
  label: string
  kind: OutlineKind
  exerciseId?: string
}

// DOM ids used by LessonView, so the menu and search can jump to a block.
export const blockAnchor = (index: number) => `lesson-block-${index}`
export const LESSON_ANCHORS = { words: 'lesson-words', reading: 'lesson-reading', finish: 'lesson-finish' } as const

// The lesson menu, built from the lesson's own structure (every lesson has the same shape).
export function getLessonOutline(lesson: Lesson): OutlineItem[] {
  const items: OutlineItem[] = []
  lesson.blocks.forEach((block, i) => {
    const anchor = blockAnchor(i)
    if (block.type === 'text') {
      const heading = block.md.split('\n').find((line) => line.startsWith('## '))
      if (heading) items.push({ anchor, label: toPlainText(heading.slice(3)), kind: 'section' })
    } else if (block.type === 'visual') {
      items.push({ anchor, label: VISUAL_TITLES[block.visual], kind: 'visual' })
    } else if (block.type === 'exercise') {
      items.push({ anchor, label: block.title, kind: 'exercise', exerciseId: block.id })
    } else if (block.type === 'quiz') {
      items.push({ anchor, label: 'Check yourself', kind: 'quiz' })
    }
  })
  if (getLessonTerms(lesson).length > 0) items.push({ anchor: LESSON_ANCHORS.words, label: 'Words in this lesson', kind: 'words' })
  items.push({ anchor: LESSON_ANCHORS.reading, label: 'Further reading', kind: 'reading' })
  items.push({ anchor: LESSON_ANCHORS.finish, label: LESSON_TESTS[lesson.id] ? 'Finish · test' : 'Finish', kind: 'finish' })
  return items
}
