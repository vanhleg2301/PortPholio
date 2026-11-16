import { addDays, format, parseISO } from 'date-fns'
import { z } from 'zod'
import { CHOICE_LESSON, LESSON_BY_ID, LESSON_TESTS } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import { MOCK_TESTS } from '@/data/lessons/mockTests'
import type { ChoiceQuestion, CodeQuestion, ExplainQuestion } from '@/data/lessons/types'

// Flashcards: multiple-choice questions answered wrong, glossary words the learner looked up, coding
// tasks from a test that failed on Submit (or whose solution was opened) and interview questions
// where key points were missed.
// Stored per account as one JSON value in roadmap_code under DECK_KEY.
export const DECK_KEY = 'review-deck'
// Days until the next review after each correct answer; past the last step a card is mastered.
export const REVIEW_INTERVALS = [1, 3, 7, 30]
export const DAILY_CARD_LIMIT = 10

const cardSchema = z.object({
  kind: z.enum(['choice', 'term', 'code', 'explain']),
  // choice: "lessonId/questionId"; term: glossary key; code / explain: "testId/itemId"
  // (testId = a lesson id, or mock-<date> for a mock interview).
  ref: z.string(),
  level: z.number().int().min(0),
  due: z.string(),
  added: z.string(),
})

export type DeckCard = z.infer<typeof cardSchema>
export type Deck = Record<string, DeckCard>

export type ResolvedCard =
  | { id: string; card: DeckCard; kind: 'choice'; question: ChoiceQuestion; lessonId: string }
  | { id: string; card: DeckCard; kind: 'term'; term: string }
  | { id: string; card: DeckCard; kind: 'code'; question: CodeQuestion; source: string }
  | { id: string; card: DeckCard; kind: 'explain'; question: ExplainQuestion; source: string }

const shiftDay = (day: string, days: number) => format(addDays(parseISO(day), days), 'yyyy-MM-dd')

// Card by card: one card this version cannot read is skipped instead of emptying the whole deck.
export function parseDeck(raw: string | undefined): Deck {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const deck: Deck = {}
    for (const [id, value] of Object.entries(parsed)) {
      const card = cardSchema.safeParse(value)
      if (card.success) deck[id] = card.data
    }
    return deck
  } catch {
    return {}
  }
}

// A lesson test, or the mock interview of a day (`mock-<date>`).
function getTestSource(testId: string): { title: string; code: CodeQuestion[]; explain: ExplainQuestion[] } | null {
  if (testId.startsWith('mock-')) {
    const mock = MOCK_TESTS[testId.slice(5)]
    return mock ? { title: mock.title, code: mock.code, explain: mock.explain } : null
  }
  const test = LESSON_TESTS[testId]
  return test ? { title: `${LESSON_BY_ID.get(testId)?.title ?? 'Lesson'} · test`, code: test.code, explain: test.explain } : null
}

export function isMastered(card: DeckCard): boolean {
  return card.level >= REVIEW_INTERVALS.length
}

// Adds a card (or sends an existing one back to the start), due tomorrow.
export function addCard(deck: Deck, kind: DeckCard['kind'], ref: string, today: string): Deck {
  const id = `${kind}:${ref}`
  const existing = deck[id]
  return { ...deck, [id]: { kind, ref, level: 0, due: shiftDay(today, REVIEW_INTERVALS[0]), added: existing?.added ?? today } }
}

export function gradeCard(deck: Deck, id: string, isCorrect: boolean, today: string): Deck {
  const card = deck[id]
  if (!card) return deck
  const level = isCorrect ? card.level + 1 : 0
  const step = REVIEW_INTERVALS[Math.min(level, REVIEW_INTERVALS.length - 1)]
  return { ...deck, [id]: { ...card, level, due: shiftDay(today, isCorrect ? step : REVIEW_INTERVALS[0]) } }
}

function resolveCard(id: string, card: DeckCard): ResolvedCard | null {
  if (card.kind === 'term') return GLOSSARY[card.ref] ? { id, card, kind: 'term', term: card.ref } : null
  if (card.kind === 'code' || card.kind === 'explain') {
    const [testId, itemId] = card.ref.split('/')
    const source = getTestSource(testId)
    if (!source) return null
    if (card.kind === 'code') {
      const question = source.code.find((q) => q.id === itemId)
      return question ? { id, card, kind: 'code', question, source: source.title } : null
    }
    const question = source.explain.find((q) => q.id === itemId)
    return question ? { id, card, kind: 'explain', question, source: source.title } : null
  }
  const [lessonId, questionId] = card.ref.split('/')
  const all = LESSON_TESTS[lessonId]?.choice ?? []
  const missed = all.find((q) => q.id === questionId)
  if (!missed) return null
  // Ask the same idea with a different question when one exists, so the card tests understanding, not memory.
  const concept = missed.concept ?? missed.id
  const others = all.filter((q) => q !== missed && (q.concept ?? q.id) === concept)
  const question = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : missed
  return { id, card, kind: 'choice', question, lessonId }
}

export function getDueCards(deck: Deck, today: string): ResolvedCard[] {
  return Object.entries(deck)
    .filter(([, card]) => !isMastered(card) && card.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due) || a.added.localeCompare(b.added))
    .flatMap(([id, card]) => {
      const resolved = resolveCard(id, card)
      return resolved ? [resolved] : []
    })
}

export function getChoiceRef(question: ChoiceQuestion): string | null {
  const lessonId = CHOICE_LESSON.get(question)
  return lessonId ? `${lessonId}/${question.id}` : null
}
