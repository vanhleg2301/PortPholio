import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Lock, Timer } from 'lucide-react'
import { DayNotes } from '@/components/roadmap/DayNotes'
import { ResourceList } from '@/components/roadmap/ResourceList'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { TheoryCard } from '@/components/roadmap/TheoryCard'
import { ReviewList } from '@/components/roadmap/ReviewList'
import type { RoadmapReview } from '@/hooks/useRoadmapReviews'
import { formatMinutes } from '@/hooks/useStudySessions'
import type { RoadmapTask } from '@/data/roadmap/types'
import { WeekStrip } from '@/components/roadmap/WeekStrip'
import type { RoadmapNote } from '@/hooks/useRoadmapNotes'
import type { NoteTopic } from '@/data/roadmap/topics'
import type { RoadmapResource } from '@/hooks/useRoadmapResources'
import { DAY_BY_DATE, getWeekForDate } from '@/lib/roadmapStats'
import { appear, listContainer, section, slide } from '@/lib/motion'

interface TodayViewProps {
  date: string
  today: string
  doneIds: Set<string>
  isOwner: boolean
  notes: RoadmapNote[]
  isNotesReady: boolean
  resources: RoadmapResource[]
  onSelectDate: (date: string) => void
  onToggle: (taskId: string, isDone: boolean) => void
  onRequestSignIn: () => void
  reviews: RoadmapReview[]
  isReviewBusy: boolean
  onToggleReview: (task: RoadmapTask, isScheduled: boolean) => void
  onCompleteReview: (review: RoadmapReview, isStillHard: boolean) => void
  focusMinutes: number
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-8">{children}</h3>
}

export function TodayView({
  date,
  today,
  doneIds,
  isOwner,
  notes,
  isNotesReady,
  resources,
  onSelectDate,
  onToggle,
  onRequestSignIn,
  reviews,
  isReviewBusy,
  onToggleReview,
  onCompleteReview,
  focusMinutes,
}: TodayViewProps) {
  const day = DAY_BY_DATE.get(date)
  const week = getWeekForDate(date)
  const tasks = day?.tasks ?? []
  const done = tasks.filter((t) => doneIds.has(t.id)).length
  const dayNotes = notes.filter((n) => n.day === date)
  const suggestedTopics = [...new Set(tasks.map((t): NoteTopic => t.kind))]
  const dayResources = resources.filter((r) => r.day === date)
  const pendingReviews = reviews.filter((r) => !r.completed_at)
  const scheduledTaskIds = new Set(pendingReviews.map((r) => r.task_id))
  const dueReviews = pendingReviews.filter((r) => (date === today ? r.due_date <= today : r.due_date === date))
  const references = [...new Map(tasks.flatMap((t) => (t.reference ? [[t.reference.title, t.reference] as const] : []))).values()]

  // Slide direction follows the calendar: later day comes in from the right.
  const [lastDate, setLastDate] = useState(date)
  const [direction, setDirection] = useState(0)
  if (date !== lastDate) {
    setDirection(date > lastDate ? 1 : -1)
    setLastDate(date)
  }

  return (
    <div>
      <WeekStrip selectedDate={date} today={today} doneIds={doneIds} onSelect={onSelectDate} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={date} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
          <motion.div variants={section} className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {week?.label}
                {date === today ? ' · Today' : ''}
              </p>
              <h2 className="font-display font-bold text-2xl leading-tight">{format(parseISO(date), 'EEEE, d MMM')}</h2>
            </div>
            {date !== today && DAY_BY_DATE.has(today) && (
              <button
                type="button"
                onClick={() => onSelectDate(today)}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors"
              >
                Today
              </button>
            )}
          </motion.div>
          {week && (
            <motion.p variants={section} className="mt-1 text-sm text-muted-foreground">
              {week.goal}
            </motion.p>
          )}
          {focusMinutes > 0 && (
            <motion.p variants={section} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Timer className="h-3.5 w-3.5" /> Focused {formatMinutes(focusMinutes)}
            </motion.p>
          )}

          {isOwner && dueReviews.length > 0 && (
            <motion.section variants={section} layout="position">
              <SectionTitle>{`Review · ${dueReviews.length}`}</SectionTitle>
              <ReviewList reviews={dueReviews} today={today} isBusy={isReviewBusy} onComplete={onCompleteReview} />
            </motion.section>
          )}

          <motion.section variants={section} layout="position">
            <SectionTitle>{tasks.length === 0 ? 'Tasks' : `Tasks · ${done}/${tasks.length}`}</SectionTitle>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rest day. Recharge.</p>
            ) : (
              <motion.ul variants={listContainer} className="rounded-2xl border border-border bg-card/40 px-4 divide-y divide-border/50">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isDone={doneIds.has(task.id)}
                    onToggle={onToggle}
                    showTheoryToggle={false}
                    isReviewScheduled={scheduledTaskIds.has(task.id)}
                    onToggleReview={isOwner && task.difficulty ? () => onToggleReview(task, scheduledTaskIds.has(task.id)) : undefined}
                  />
                ))}
              </motion.ul>
            )}
          </motion.section>

          {references.length > 0 && (
            <motion.section variants={section} layout="position">
              <SectionTitle>Theory</SectionTitle>
              <div className="flex flex-col gap-3">
                {references.map((ref, i) => (
                  <TheoryCard key={ref.title} reference={ref} isOpenByDefault={i === 0} />
                ))}
              </div>
            </motion.section>
          )}

          {isOwner ? (
            <>
              <motion.section variants={section} layout="position">
                <SectionTitle>Notes</SectionTitle>
                <AnimatePresence mode="wait" initial={false}>
                  {isNotesReady ? (
                    <motion.div key="notes" {...appear()}>
                      <DayNotes day={date} notes={dayNotes} suggestedTopics={suggestedTopics} />
                    </motion.div>
                  ) : (
                    <motion.div key="skeleton" exit={{ opacity: 0 }} className="h-24 rounded-2xl bg-foreground/[0.04] animate-pulse" />
                  )}
                </AnimatePresence>
              </motion.section>
              <motion.section variants={section} layout="position">
                <SectionTitle>Resources</SectionTitle>
                <ResourceList day={date} resources={dayResources} />
              </motion.section>
            </>
          ) : (
            <motion.button
              variants={section}
              type="button"
              onClick={onRequestSignIn}
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
            >
              <Lock className="h-4 w-4" /> Sign in to tick tasks, write notes and attach files
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
