import { useRef, useState, type KeyboardEvent } from 'react'
import { z } from 'zod'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Layers, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuestionCard } from '@/components/learn/QuestionCard'
import { useReviewDeck } from '@/components/learn/ReviewDeckContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { EASE_OUT } from '@/lib/motion'
import { getPassMark } from '@/data/lessons'
import type { ChoiceQuestion } from '@/data/lessons/types'

interface Attempt {
  questions: ChoiceQuestion[]
  // Option indexes in the order shown, one array per question.
  orders: number[][]
}

interface TestState {
  attempt: Attempt
  answers: Array<number | null>
  // True once the last question is done and the summary is shown.
  isSubmitted: boolean
  current: number
  startedAt: number | null
  finishedAt: number | null
}

const SWIPE_PX = 70

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function createState(questions: ChoiceQuestion[], sampleSize?: number): TestState {
  const picked = sampleSize ? shuffle(questions).slice(0, sampleSize) : questions
  return {
    attempt: { questions: picked, orders: picked.map((q) => shuffle(q.options.map((_, i) => i))) },
    answers: picked.map(() => null),
    isSubmitted: false,
    current: 0,
    startedAt: null,
    finishedAt: null,
  }
}

// What is saved for the account. Older saves have no position or times.
const savedStateSchema = z.object({
  ids: z.array(z.string()),
  orders: z.array(z.array(z.number().int())),
  answers: z.array(z.number().int().nullable()),
  isSubmitted: z.boolean(),
  current: z.number().int().optional(),
  startedAt: z.number().nullable().optional(),
  finishedAt: z.number().nullable().optional(),
})

// Returns null when the saved state no longer fits the questions (e.g. the test was edited).
function restoreState(saved: string | undefined, questions: ChoiceQuestion[]): TestState | null {
  if (!saved) return null
  try {
    const s = savedStateSchema.parse(JSON.parse(saved))
    const byId = new Map(questions.map((q) => [q.id, q]))
    const picked = s.ids.map((id) => byId.get(id))
    const isValid =
      picked.length > 0 &&
      s.orders.length === picked.length &&
      s.answers.length === picked.length &&
      picked.every((q, i) => q && s.orders[i].length === q.options.length)
    if (!isValid) return null
    const firstOpen = s.answers.findIndex((a) => a === null)
    return {
      attempt: { questions: picked as ChoiceQuestion[], orders: s.orders },
      answers: s.answers,
      isSubmitted: s.isSubmitted,
      current: Math.min(s.current ?? (firstOpen === -1 ? 0 : firstOpen), picked.length - 1),
      startedAt: s.startedAt ?? null,
      finishedAt: s.finishedAt ?? null,
    }
  } catch {
    return null
  }
}

function serializeState(s: TestState): string {
  return JSON.stringify({
    ids: s.attempt.questions.map((q) => q.id),
    orders: s.attempt.orders,
    answers: s.answers,
    isSubmitted: s.isSubmitted,
    current: s.current,
    startedAt: s.startedAt,
    finishedAt: s.finishedAt,
  })
}

function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(seconds / 60)
  return minutes > 0 ? `${minutes} min ${seconds % 60}s` : `${seconds}s`
}

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40, transition: { duration: 0.16, ease: 'easeIn' as const } }),
}

interface ChoiceTestProps {
  questions: ChoiceQuestion[]
  // Week test: draw this many questions at random on every attempt.
  sampleSize?: number
  isPassed: boolean
  onPass: () => void
  // Saved answers of the signed-in account (JSON), and how to save new ones.
  savedState?: string
  onSaveState?: (state: string) => void
}

// One question per screen: answer, read why, move on. Ends with a summary of the attempt.
export function ChoiceTest({ questions, sampleSize, isPassed, onPass, savedState, onSaveState }: ChoiceTestProps) {
  const [state, setState] = useState<TestState>(() => restoreState(savedState, questions) ?? createState(questions, sampleSize))
  const [direction, setDirection] = useState(1)
  const deck = useReviewDeck()
  const isTouch = useMediaQuery('(pointer: coarse)')
  // Answered options become disabled and drop focus; keep it on the test so keys keep working.
  const containerRef = useRef<HTMLDivElement>(null)

  const { attempt, answers, isSubmitted, current } = state
  const total = attempt.questions.length
  const question = attempt.questions[current]
  const chosen = answers[current]
  const score = attempt.questions.filter((q, i) => answers[i] === q.answer).length
  const passMark = getPassMark(total)
  const firstOpen = answers.findIndex((a) => a === null)
  const reachable = firstOpen === -1 ? total - 1 : firstOpen
  const isLast = current === total - 1

  function update(next: TestState) {
    setState(next)
    onSaveState?.(serializeState(next))
  }

  function choose(optionIndex: number) {
    if (chosen !== null) return
    if (optionIndex !== question.answer) deck?.addWrongAnswer(question)
    update({
      ...state,
      answers: answers.map((a, i) => (i === current ? optionIndex : a)),
      startedAt: state.startedAt ?? Date.now(),
    })
    containerRef.current?.focus({ preventScroll: true })
  }

  function goTo(index: number) {
    if (index < 0 || index > reachable || index === current) return
    setDirection(index > current ? 1 : -1)
    update({ ...state, current: index })
    // A long explanation may have scrolled the question out of view; bring the next one back.
    const top = containerRef.current?.getBoundingClientRect().top ?? 0
    if (top < 80) containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function next() {
    if (chosen === null) return
    if (!isLast) {
      goTo(current + 1)
      return
    }
    if (firstOpen !== -1) {
      goTo(firstOpen)
      return
    }
    update({ ...state, isSubmitted: true, finishedAt: Date.now() })
    if (score >= passMark && !isPassed) onPass()
  }

  function retake() {
    setDirection(1)
    update(createState(questions, sampleSize))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (isSubmitted || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
    const digit = Number(e.key)
    if (Number.isInteger(digit) && digit >= 1 && digit <= attempt.orders[current].length) {
      choose(attempt.orders[current][digit - 1])
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      next()
    } else if (e.key === 'ArrowLeft') {
      goTo(current - 1)
    } else {
      return
    }
    e.preventDefault()
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) next()
    else if (info.offset.x > SWIPE_PX) goTo(current - 1)
  }

  if (isSubmitted) {
    const isPassing = score >= passMark
    const wrong = attempt.questions.flatMap((q, i) => (answers[i] !== q.answer ? [{ q, i }] : []))
    const duration = state.startedAt && state.finishedAt ? state.finishedAt - state.startedAt : null
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
        <div className={cn('rounded-2xl p-5 text-center', isPassing ? 'bg-emerald-500/10' : 'bg-amber-500/10')}>
          <motion.div
            initial={{ scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-full', isPassing ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')}
          >
            {isPassing ? <Trophy className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
          </motion.div>
          <p className="mt-3 font-display text-4xl font-bold">
            {score}
            <span className="text-xl text-muted-foreground">/{total}</span>
          </p>
          <p className={cn('mt-1 text-sm font-semibold', isPassing ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>
            {isPassing ? 'Passed — nice work' : `${passMark} needed to pass — read the explanations and try again`}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {duration !== null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {formatDuration(duration)}
              </span>
            )}
            {wrong.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" /> {wrong.length} added to your flashcards
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={retake}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retake with new order
          </button>
        </div>

        {wrong.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Your mistakes · {wrong.length}</p>
            <div className="space-y-3">
              {wrong.map(({ q, i }) => (
                <div key={`${i}-${q.id}`} className="rounded-xl border border-border/70 bg-background/40 p-3.5">
                  <QuestionCard question={q} order={attempt.orders[i]} chosen={answers[i]} onChoose={() => undefined} />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} tabIndex={-1} onKeyDown={handleKeyDown} className="scroll-mt-24 outline-none">
      <div className="mb-3 flex gap-1" role="list" aria-label="Questions">
        {attempt.questions.map((q, i) => {
          const answer = answers[i]
          return (
            <button
              key={`${i}-${q.id}`}
              type="button"
              role="listitem"
              aria-label={`Question ${i + 1}`}
              disabled={i > reachable}
              onClick={() => goTo(i)}
              className="group flex-1 py-1.5 disabled:cursor-default"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-colors',
                  answer === null ? 'bg-foreground/10' : answer === q.answer ? 'bg-emerald-500' : 'bg-red-500',
                  i === current && 'ring-2 ring-foreground/50 ring-offset-1 ring-offset-background',
                  i <= reachable && i !== current && 'group-hover:opacity-70'
                )}
              />
            </button>
          )
        })}
      </div>

      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>Pass with {passMark}</span>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`${current}-${question.id}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={isTouch ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            className="rounded-xl border border-border/70 bg-background/40 p-4"
          >
            <QuestionCard question={question} order={attempt.orders[current]} chosen={chosen} onChoose={choose} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="hidden text-xs text-muted-foreground sm:inline">{isTouch ? 'Swipe to move' : 'Keys 1–4 to answer, Enter for next'}</span>
        <button
          type="button"
          onClick={next}
          disabled={chosen === null}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 disabled:opacity-30 disabled:hover:bg-foreground transition-colors"
        >
          {isLast && firstOpen === -1 ? 'See results' : 'Next'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
