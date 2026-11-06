import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Eye, Layers, PartyPopper, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { QuestionCard } from '@/components/learn/QuestionCard'
import { useReviewDeck } from '@/components/learn/ReviewDeckContext'
import { EASE_OUT } from '@/lib/motion'
import { GLOSSARY } from '@/data/lessons/glossary'
import { LESSON_BY_ID } from '@/data/lessons'
import { DAILY_CARD_LIMIT, getDueCards, isMastered, type ResolvedCard } from '@/lib/reviewDeck'

function shuffledOrder(count: number): number[] {
  const out = Array.from({ length: count }, (_, i) => i)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface FlashcardSessionProps {
  today: string
}

// Daily spaced review of wrong answers and looked-up words (1 → 3 → 7 → 30 days).
export function FlashcardSession({ today }: FlashcardSessionProps) {
  const deck = useReviewDeck()
  // The session works on a snapshot, so grading a card does not reshuffle the queue.
  const [queue, setQueue] = useState<ResolvedCard[] | null>(null)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [order, setOrder] = useState<number[]>([])
  const [correctCount, setCorrectCount] = useState(0)

  if (!deck?.isReady) return null
  const cards = Object.values(deck.deck)
  if (cards.length === 0) return null
  const due = getDueCards(deck.deck, today)
  const mastered = cards.filter(isMastered).length

  function start() {
    const next = due.slice(0, DAILY_CARD_LIMIT)
    setQueue(next)
    setIndex(0)
    setCorrectCount(0)
    prepare(next[0])
  }

  function prepare(card: ResolvedCard | undefined) {
    setChosen(null)
    setIsRevealed(false)
    setOrder(card?.kind === 'choice' ? shuffledOrder(card.question.options.length) : [])
  }

  function grade(card: ResolvedCard, isCorrect: boolean) {
    deck?.grade(card.id, isCorrect)
    if (isCorrect) setCorrectCount((n) => n + 1)
  }

  function advance() {
    if (!queue) return
    const nextIndex = index + 1
    setIndex(nextIndex)
    prepare(queue[nextIndex])
  }

  const header = (
    <p className="flex items-center gap-2 font-semibold">
      <Layers className="h-5 w-5 text-sky-500" /> Flashcards
      <span className="text-xs font-normal text-muted-foreground">
        {cards.length} card{cards.length === 1 ? '' : 's'} · {mastered} mastered
      </span>
    </p>
  )

  // Not started (or finished): show what is due.
  if (!queue || index >= queue.length) {
    const isFinished = queue !== null
    return (
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.04] p-4">
        {header}
        {isFinished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <PartyPopper className="h-4 w-4" /> Session done: {correctCount}/{queue.length} remembered.
          </motion.p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {due.length > 0
            ? `${due.length} card${due.length === 1 ? '' : 's'} due today. Wrong test answers and words you tap come back after 1, 3, 7 and 30 days.`
            : 'Nothing due today. Cards come back after 1, 3, 7 and 30 days.'}
        </p>
        {due.length > 0 && (
          <button
            type="button"
            onClick={start}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600/85 transition-colors"
          >
            {isFinished ? 'Review more' : 'Start review'} ({Math.min(due.length, DAILY_CARD_LIMIT)}) <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  const card = queue[index]
  const isAnswered = card.kind === 'choice' ? chosen !== null : false
  const source = card.kind === 'choice' ? LESSON_BY_ID.get(card.lessonId)?.title : 'Word'

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        {header}
        <span className="text-xs font-semibold text-muted-foreground">
          {index + 1}/{queue.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
        <motion.div className="h-full bg-sky-500" animate={{ width: `${(index / queue.length) * 100}%` }} transition={{ duration: 0.3, ease: EASE_OUT }} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={card.id + index}
          initial={{ opacity: 0, rotateY: -12, x: 24 }}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{source}</p>
          {card.kind === 'choice' ? (
            <QuestionCard
              question={card.question}
              order={order}
              chosen={chosen}
              onChoose={(optionIndex) => {
                setChosen(optionIndex)
                grade(card, optionIndex === card.question.answer)
              }}
            />
          ) : (
            <div className="py-2 text-center">
              <p className="font-display text-2xl font-bold">{card.term}</p>
              {isRevealed ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm">
                  <p>
                    <InlineText text={GLOSSARY[card.term].en} />
                  </p>
                  <p className="mt-1 text-muted-foreground">{GLOSSARY[card.term].vi}</p>
                </motion.div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Say what it means in English, then check.</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {card.kind === 'term' && !isRevealed && (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors"
          >
            <Eye className="h-4 w-4" /> Show meaning
          </button>
        )}
        {card.kind === 'term' && isRevealed && (
          <>
            <button
              type="button"
              onClick={() => {
                grade(card, false)
                advance()
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/10 dark:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" /> Forgot
            </button>
            <button
              type="button"
              onClick={() => {
                grade(card, true)
                advance()
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              <Check className="h-4 w-4" /> I knew it
            </button>
          </>
        )}
        {card.kind === 'choice' && (
          <button
            type="button"
            onClick={advance}
            disabled={!isAnswered}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors',
              'disabled:opacity-30 disabled:hover:bg-foreground'
            )}
          >
            {index === queue.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
