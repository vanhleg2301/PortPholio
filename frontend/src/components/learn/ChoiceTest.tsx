import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { getPassMark } from '@/data/lessons'
import type { ChoiceQuestion } from '@/data/lessons/types'
import { PRINT } from '@/data/lessons/tests/helpers'

interface Attempt {
  questions: ChoiceQuestion[]
  // Option indexes in the order shown, one array per question.
  orders: number[][]
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function createAttempt(questions: ChoiceQuestion[], sampleSize?: number): Attempt {
  const picked = sampleSize ? shuffle(questions).slice(0, sampleSize) : questions
  return { questions: picked, orders: picked.map((q) => shuffle(q.options.map((_, i) => i))) }
}

interface ChoiceTestProps {
  questions: ChoiceQuestion[]
  // Week test: draw this many questions at random on every attempt.
  sampleSize?: number
  isPassed: boolean
  onPass: () => void
}

export function ChoiceTest({ questions, sampleSize, isPassed, onPass }: ChoiceTestProps) {
  const [attempt, setAttempt] = useState(() => createAttempt(questions, sampleSize))
  const [answers, setAnswers] = useState<Array<number | null>>(() => attempt.questions.map(() => null))
  const [isSubmitted, setIsSubmitted] = useState(false)

  const total = attempt.questions.length
  const answered = answers.filter((a) => a !== null).length
  const score = attempt.questions.filter((q, i) => answers[i] === q.answer).length
  const passMark = getPassMark(total)
  const isPassingScore = score >= passMark

  function submit() {
    setIsSubmitted(true)
    if (score >= passMark && !isPassed) onPass()
  }

  function retake() {
    const next = createAttempt(questions, sampleSize)
    setAttempt(next)
    setAnswers(next.questions.map(() => null))
    setIsSubmitted(false)
  }

  return (
    <div>
      <ol className="space-y-5">
        {attempt.questions.map((q, qi) => {
          const chosen = answers[qi]
          const isCorrect = chosen === q.answer
          return (
            <li key={`${qi}-${q.id}`} className="rounded-xl border border-border/70 bg-background/40 p-3.5">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Question {qi + 1} of {total}
                {isSubmitted &&
                  (isCorrect ? (
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <CircleX className="h-3.5 w-3.5 text-red-500" />
                  ))}
              </p>
              <MarkdownPreview content={q.question} withGlossary />
              {q.code && (
                <div className="mt-2">
                  <MarkdownPreview content={`\`\`\`python\n${q.code}\n\`\`\``} />
                </div>
              )}
              <div className="mt-3 grid gap-2">
                {attempt.orders[qi].map((optionIndex) => {
                  const isChosen = chosen === optionIndex
                  const isAnswer = optionIndex === q.answer
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? optionIndex : a)))}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-left text-sm leading-snug transition-colors disabled:cursor-default',
                        q.question === PRINT && 'font-mono text-[13px]',
                        !isSubmitted && (isChosen ? 'border-foreground bg-foreground/[0.07]' : 'border-border hover:border-foreground/40 hover:bg-foreground/[0.04]'),
                        isSubmitted && isAnswer && 'border-emerald-500/60 bg-emerald-500/10',
                        isSubmitted && isChosen && !isAnswer && 'border-red-500/60 bg-red-500/10',
                        isSubmitted && !isAnswer && !isChosen && 'border-border opacity-60'
                      )}
                    >
                      <InlineText text={q.options[optionIndex]} />
                    </button>
                  )
                })}
              </div>
              <AnimatePresence initial={false}>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className={cn('mt-3 rounded-xl px-3 py-2.5 text-sm', isCorrect ? 'bg-emerald-500/[0.07]' : 'bg-amber-500/[0.08]')}>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {isCorrect ? 'Correct — why' : chosen === null ? 'Not answered' : 'Not quite — why'}
                      </p>
                      <MarkdownPreview content={q.explain} withGlossary />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isSubmitted ? (
          <>
            <p
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-semibold',
                isPassingScore ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              )}
            >
              {score}/{total} · {isPassingScore ? 'passed' : `${passMark} needed to pass`}
            </p>
            <button
              type="button"
              onClick={retake}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake with new order
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={answered < total}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 disabled:opacity-40 disabled:hover:bg-foreground transition-colors"
            >
              Check answers
            </button>
            <span className="text-xs text-muted-foreground">
              {answered}/{total} answered · pass with {passMark}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
