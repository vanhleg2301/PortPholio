import { AnimatePresence, motion } from 'framer-motion'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { ALL_TASKS } from '@/lib/roadmapStats'
import type { RoadmapReview } from '@/hooks/useRoadmapReviews'

interface ReviewListProps {
  reviews: RoadmapReview[]
  today: string
  isBusy: boolean
  onComplete: (review: RoadmapReview, isStillHard: boolean) => void
}

const TASK_BY_ID = new Map(ALL_TASKS.map((t) => [t.id, t]))

export function ReviewList({ reviews, today, isBusy, onComplete }: ReviewListProps) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {reviews.map((review, i) => {
          const task = TASK_BY_ID.get(review.task_id)
          const lateDays = differenceInCalendarDays(parseISO(today), parseISO(review.due_date))
          return (
            <motion.li
              key={review.id}
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(i, 6) * 0.04 } }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] p-3.5"
            >
              <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-semibold uppercase tracking-widest">
                <span className="text-amber-600 dark:text-amber-400">{review.step_days}-day review</span>
                {lateDays > 0 && <span className="text-hard">{lateDays} day{lateDays > 1 ? 's' : ''} late</span>}
              </div>
              <p className="mt-1 text-[15px] leading-snug">{review.task_title}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {task?.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium hover:bg-foreground/[0.12] transition-colors"
                  >
                    {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
                <span className="flex-1" />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onComplete(review, true)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground',
                    'hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors disabled:opacity-50'
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Still hard
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onComplete(review, false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Solved
                </button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
