import { addDays, format, parseISO } from 'date-fns'
import { z } from 'zod'
import { CHOICE_LESSON, LESSON_TESTS } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import type { ChoiceQuestion } from '@/data/lessons/types'

// Flashcards: multiple-choice questions answered wrong and glossary words the learner looked up.
// Stored per account as one JSON value in roadmap_code under DECK_KEY.
export const DECK_KEY = 'review-deck'
// Days until the next review after each correct answer; past the last step a card is mastered.
export const REVIEW_INTERVALS = [1, 3, 7, 30]
export const DAILY_CARD_LIMIT = 10

const cardSchema = z.object({
  kind: z.enum(['choice', 'term']),
  // choice: "lessonId/questionId"; term: glossary key.
  ref: z.string(),
  level: z.number().int().min(0),
  due: z.string(),
  added: z.string(),
})
const deckSchema = z.record(z.string(), cardSchema)

export type DeckCard = z.infer<typeof cardSchema>
export type Deck = Record<string, DeckCard>

export type ResolvedCard =
  | { id: string; card: DeckCard; kind: 'choice'; question: ChoiceQuestion; lessonId: string }
  | { id: string; card: DeckCard; kind: 'term'; term: string }

const shiftDay = (day: string, days: number) => format(addDays(parseISO(day), days), 'yyyy-MM-dd')

export function parseDeck(raw: string | undefined): Deck {
  if (!raw) return {}
  try {
    return deckSchema.parse(JSON.parse(raw))
  } catch {
    return {}
  }
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
