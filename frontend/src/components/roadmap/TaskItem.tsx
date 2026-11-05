import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ArrowUpRight, BookOpen, CalendarClock, GraduationCap, RotateCcw } from 'lucide-react'
import { TheoryCard } from '@/components/roadmap/TheoryCard'
import { cn } from '@/lib/utils'
import { EASE_OUT, SPRING, listItem } from '@/lib/motion'
import { TOPICS } from '@/data/roadmap/topics'
import type { RoadmapTask } from '@/data/roadmap/types'

const DIFFICULTY_CLASS = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
} as const

interface TaskItemProps {
  task: RoadmapTask
  isDone: boolean
  onToggle: (taskId: string, isDone: boolean) => void
  showTheoryToggle?: boolean
  // Spaced repetition: only passed for problems when the owner is signed in.
  isReviewScheduled?: boolean
  onToggleReview?: () => void
  onOpenLesson?: (task: RoadmapTask) => void
}

export function TaskItem({ task, isDone, onToggle, showTheoryToggle = true, isReviewScheduled = false, onToggleReview, onOpenLesson }: TaskItemProps) {
  const [isTheoryOpen, setIsTheoryOpen] = useState(false)

  return (
    <motion.li variants={listItem} className="flex items-start gap-3 py-3">
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Mark "${task.title}" as ${isDone ? 'not done' : 'done'}`}
        onClick={() => onToggle(task.id, !isDone)}
        whileTap={{ scale: 0.82 }}
        className="-m-2 p-2 shrink-0"
      >
        <motion.span
          animate={isDone ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={cn(
            'h-6 w-6 rounded-md border-[1.5px] flex items-center justify-center transition-colors duration-200',
            isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-foreground/30 hover:border-foreground'
          )}
        >
          <AnimatePresence initial={false}>
            {isDone && (
              <motion.span
                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={SPRING}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </motion.button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {TOPICS[task.kind].label}
          </span>
          {task.difficulty && (
            <span className={cn('text-[10px] font-semibold uppercase tracking-widest', DIFFICULTY_CLASS[task.difficulty])}>
              {task.difficulty}
            </span>
          )}
        </div>
        <p className={cn('text-[15px] leading-snug mt-0.5 transition-colors duration-300', isDone && 'text-muted-foreground line-through decoration-foreground/30')}>
          {task.title}
        </p>
        {(task.links.length > 0 || (task.lessonId && onOpenLesson)) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {task.lessonId && onOpenLesson && (
              <button
                type="button"
                onClick={() => onOpenLesson(task)}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background hover:bg-foreground/85 transition-colors"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Open lesson
              </button>
            )}
            {task.links.map((l) => (
              <a
                key={l.label + l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium hover:bg-foreground/[0.12] active:bg-foreground/[0.16] transition-colors"
              >
                {l.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
            {onToggleReview && (
              <button
                type="button"
                onClick={onToggleReview}
                title={isReviewScheduled ? 'Cancel the scheduled reviews' : 'Schedule reviews in 3, 7 and 30 days'}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isReviewScheduled
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                )}
              >
                {isReviewScheduled ? <CalendarClock className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                {isReviewScheduled ? 'Review set' : 'Missed it'}
              </button>
            )}
            {showTheoryToggle && task.reference && (
              <button
                type="button"
                onClick={() => setIsTheoryOpen((v) => !v)}
                aria-expanded={isTheoryOpen}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isTheoryOpen ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300' : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20'
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Theory
              </button>
            )}
          </div>
        )}
        <AnimatePresence initial={false}>
          {isTheoryOpen && task.reference && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <TheoryCard reference={task.reference} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
