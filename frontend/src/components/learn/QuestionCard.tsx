import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { PRINT } from '@/data/lessons/tests/helpers'
import type { ChoiceQuestion } from '@/data/lessons/types'

interface QuestionCardProps {
  question: ChoiceQuestion
  // Option indexes in display order.
  order: number[]
  // Chosen option index; once set, the answer is locked and the explanation shows.
  chosen: number | null
  onChoose: (optionIndex: number) => void
}

// One multiple-choice question with instant feedback, shared by tests and flashcards.
export function QuestionCard({ question, order, chosen, onChoose }: QuestionCardProps) {
  const isAnswered = chosen !== null
  const isCorrect = chosen === question.answer

  return (
    <div>
      <MarkdownPreview content={question.question} withGlossary />
      {question.code && (
        <div className="mt-2">
          <MarkdownPreview content={`\`\`\`python\n${question.code}\n\`\`\``} />
        </div>
      )}
      <div className="mt-4 grid gap-2">
        {order.map((optionIndex, position) => {
          const isChosen = chosen === optionIndex
          const isAnswer = optionIndex === question.answer
          return (
            <motion.button
              key={optionIndex}
              type="button"
              disabled={isAnswered}
              onClick={() => onChoose(optionIndex)}
              whileTap={isAnswered ? undefined : { scale: 0.98 }}
              animate={isAnswered && isChosen && !isAnswer ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm leading-snug transition-colors disabled:cursor-default',
                question.question === PRINT && 'font-mono text-[13px]',
                !isAnswered && 'border-border hover:border-foreground/40 hover:bg-foreground/[0.04]',
                isAnswered && isAnswer && 'border-emerald-500/60 bg-emerald-500/10',
                isAnswered && isChosen && !isAnswer && 'border-red-500/60 bg-red-500/10',
                isAnswered && !isAnswer && !isChosen && 'border-border opacity-50'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-sans text-[11px] font-semibold',
                  isAnswered && isAnswer ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-foreground/25 text-muted-foreground'
                )}
              >
                {position + 1}
              </span>
              <span className="min-w-0 flex-1 pt-px">
                <InlineText text={question.options[optionIndex]} />
              </span>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className={cn('mt-4 rounded-xl px-3.5 py-3 text-sm', isCorrect ? 'bg-emerald-500/[0.08]' : 'bg-amber-500/[0.09]')}
          >
            <p
              className={cn(
                'mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest',
                isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
              )}
            >
              {isCorrect ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
              {isCorrect ? 'Correct — here is why' : 'Not quite — here is why'}
            </p>
            <MarkdownPreview content={question.explain} withGlossary />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
