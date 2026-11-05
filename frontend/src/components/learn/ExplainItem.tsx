import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AutoTextarea } from '@/components/roadmap/AutoTextarea'
import { InlineText } from '@/components/learn/InlineText'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import type { ExplainQuestion } from '@/data/lessons/types'

const MIN_ANSWER_CHARS = 60

interface ExplainItemProps {
  question: ExplainQuestion
  savedAnswer?: string
  isPassed: boolean
  onSave: (text: string) => void
  onPass: (text: string) => void
}

// Interview-style question: write an answer first, then compare it with the key points and a model answer.
export function ExplainItem({ question, savedAnswer, isPassed, onSave, onPass }: ExplainItemProps) {
  const [text, setText] = useState(savedAnswer ?? '')
  const [isRevealed, setIsRevealed] = useState(isPassed)
  const [covered, setCovered] = useState<boolean[]>(() => question.points.map(() => false))
  const length = text.trim().length
  const coveredCount = covered.filter(Boolean).length

  function reveal() {
    setIsRevealed(true)
    onSave(text)
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-3.5">
      <MarkdownPreview content={question.question} withGlossary />
      <AutoTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text !== (savedAnswer ?? '')) onSave(text)
        }}
        minHeight={110}
        placeholder="Answer as if you are talking to the interviewer. Short sentences are fine."
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-foreground/40 transition-colors"
      />
      {!isRevealed && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reveal}
            disabled={length < MIN_ANSWER_CHARS}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 disabled:opacity-40 disabled:hover:bg-foreground transition-colors"
          >
            Compare with a strong answer
          </button>
          {length < MIN_ANSWER_CHARS && (
            <span className="text-xs text-muted-foreground">Write at least {MIN_ANSWER_CHARS - length} more characters first.</span>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Key points · tick the ones you covered ({coveredCount}/{question.points.length})
            </p>
            <ul className="space-y-1.5">
              {question.points.map((point, i) => (
                <li key={point}>
                  <button
                    type="button"
                    onClick={() => setCovered((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-foreground/[0.04] transition-colors"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        covered[i] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-foreground/30'
                      )}
                    >
                      {covered[i] && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="leading-relaxed">
                      <InlineText text={point} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-xl bg-violet-500/[0.06] px-3 py-2.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">A strong answer</p>
              <MarkdownPreview content={question.answer} withGlossary />
            </div>
            <div className="mt-3">
              {isPassed ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CircleCheck className="h-4 w-4" /> Done
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onPass(text)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600/85 transition-colors"
                >
                  {coveredCount === question.points.length ? 'I covered everything — done' : 'I learned the missing points — done'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
