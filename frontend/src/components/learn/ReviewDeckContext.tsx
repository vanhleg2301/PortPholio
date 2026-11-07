import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { DECK_KEY, addCard, getChoiceRef, gradeCard, parseDeck, type Deck } from '@/lib/reviewDeck'
import type { ChoiceQuestion } from '@/data/lessons/types'

interface ReviewDeckValue {
  deck: Deck
  isReady: boolean
  addWrongAnswer: (question: ChoiceQuestion) => void
  addTerm: (key: string) => void
  grade: (cardId: string, isCorrect: boolean) => void
}

const ReviewDeckContext = createContext<ReviewDeckValue | null>(null)

interface ReviewDeckProviderProps {
  today: string
  // Saved deck JSON is loaded (always true when signed out — the deck then lives only in memory).
  isReady: boolean
  saved: Map<string, string>
  onSave: (key: string, json: string) => void
  children: ReactNode
}

export function ReviewDeckProvider({ today, isReady, saved, onSave, children }: ReviewDeckProviderProps) {
  const [deck, setDeck] = useState<Deck | null>(null)
  // Latest deck, so quick successive changes build on each other instead of on a stale render.
  const deckRef = useRef<Deck>({})
  // The saved JSON the deck was last loaded from. When it changes (a refresh brought in what
  // another device saved, or our own save came back), the deck reloads from it.
  const savedJson = saved.get(DECK_KEY)
  const [loadedFrom, setLoadedFrom] = useState<string | undefined>(undefined)
  if (isReady && (deck === null || savedJson !== loadedFrom)) {
    const loaded = parseDeck(savedJson)
    deckRef.current = loaded
    setDeck(loaded)
    setLoadedFrom(savedJson)
  }

  function commit(update: (prev: Deck) => Deck) {
    if (!isReady) return
    const next = update(deckRef.current)
    if (next === deckRef.current) return
    deckRef.current = next
    setDeck(next)
    onSave(DECK_KEY, JSON.stringify(next))
  }

  const value: ReviewDeckValue = {
    deck: deck ?? {},
    isReady: deck !== null,
    addWrongAnswer: (question) => {
      const ref = getChoiceRef(question)
      if (ref) commit((prev) => addCard(prev, 'choice', ref, today))
    },
    // Looking a word up again means it is not remembered yet, so it restarts the schedule.
    addTerm: (key) => commit((prev) => addCard(prev, 'term', key, today)),
    grade: (cardId, isCorrect) => commit((prev) => gradeCard(prev, cardId, isCorrect, today)),
  }

  return <ReviewDeckContext.Provider value={value}>{children}</ReviewDeckContext.Provider>
}

// Null outside the roadmap page (e.g. previews); callers then simply skip the deck.
export function useReviewDeck(): ReviewDeckValue | null {
  return useContext(ReviewDeckContext)
}
