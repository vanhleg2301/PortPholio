import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { CalendarCheck, CircleCheck, Lock, Timer } from 'lucide-react'
import { ChoiceTest } from '@/components/learn/ChoiceTest'
import { LessonTestCard } from '@/components/learn/LessonTestCard'
import { LESSON_BY_ID, LESSON_TESTS, isLessonTestPassed } from '@/data/lessons'
import { WEEK_TEST_LESSON, WEEK_TEST_SIZE, getTestedLessonIds, getWeekTestQuestions, isTaskLocked, isWeekTestPassed } from '@/lib/testGate'
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
import { cn } from '@/lib/utils'
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
  onOpenLesson: (task: RoadmapTask) => void
  // On desktop the week list and the notes/resources live in side columns.
  isDesktop: boolean
  // Signed-in account (any, not only the owner): test answers and progress are saved for it.
  canSaveAnswers: boolean
  isAnswersReady: boolean
  // "lessonId:itemId" keys of passed exercises and test parts.
  passed: Set<string>
  savedCode: Map<string, string>
  onSaveCode: (key: string, code: string) => void
  onTestPassed: (lessonId: string, itemId: string) => void
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
  onOpenLesson,
  isDesktop,
  canSaveAnswers,
  isAnswersReady,
  passed,
  savedCode,
  onSaveCode,
  onTestPassed,
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
  const testedLessonIds = getTestedLessonIds(tasks)
  const passedTests = testedLessonIds.filter((id) => isLessonTestPassed(id, passed)).length
  const hasWeekTest = Boolean(week) && tasks.some((t) => t.isWeekTest)
  const weekTestQuestions = week && hasWeekTest ? getWeekTestQuestions(week) : []
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
      {!isDesktop && <WeekStrip selectedDate={date} today={today} doneIds={doneIds} onSelect={onSelectDate} />}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={date} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
          <motion.div variants={section} className={cn('flex items-end justify-between gap-3', !isDesktop && 'mt-5')}>
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
                    onOpenLesson={onOpenLesson}
                    isLocked={isOwner && isTaskLocked(task, passed)}
                  />
                ))}
              </motion.ul>
            )}
          </motion.section>

          {testedLessonIds.length > 0 && (
            <motion.section variants={section} layout="position" id="day-test" className="scroll-mt-20">
              <SectionTitle>{`Day test · ${canSaveAnswers ? `${passedTests}/${testedLessonIds.length} passed` : `${testedLessonIds.length}`}`}</SectionTitle>
              <p className="mb-3 text-sm text-muted-foreground">
                Study the lessons first, then test yourself here. A lesson can be ticked only after its test is passed.
              </p>
              {!canSaveAnswers && (
                <button
                  type="button"
                  onClick={onRequestSignIn}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
                >
                  <Lock className="h-4 w-4" /> Sign in with Google to save your answers
                </button>
              )}
              {!isAnswersReady ? (
                <div className="h-16 rounded-2xl bg-foreground/[0.04] animate-pulse" />
              ) : (
              <div className="flex flex-col gap-3">
                {testedLessonIds.map((id, i) => {
                  const lesson = LESSON_BY_ID.get(id)
                  if (!lesson) return null
                  return (
                    <LessonTestCard
                      key={id}
                      lesson={lesson}
                      test={LESSON_TESTS[id]}
                      canSave={canSaveAnswers}
                      passed={passed}
                      savedCode={savedCode}
                      isOpenByDefault={i === 0 && !isLessonTestPassed(id, passed)}
                      onSaveCode={onSaveCode}
                      onPassed={(itemId) => onTestPassed(id, itemId)}
                    />
                  )
                })}
              </div>
              )}
            </motion.section>
          )}

          {week && weekTestQuestions.length > 0 && isAnswersReady && (
            <motion.section variants={section} layout="position" id="day-test" className="scroll-mt-20">
              <SectionTitle>Week test</SectionTitle>
              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
                <p className="flex items-center gap-2 font-semibold">
                  {isWeekTestPassed(week.id, passed) ? (
                    <CircleCheck className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <CalendarCheck className="h-5 w-5 text-violet-500" />
                  )}
                  {Math.min(WEEK_TEST_SIZE, weekTestQuestions.length)} mixed questions from {week.label}
                </p>
                <p className="mt-1 mb-4 text-sm text-muted-foreground">
                  New questions are drawn at random on every attempt. Try it without opening the lessons — that is how memory gets stronger.
                </p>
                <ChoiceTest
                  questions={weekTestQuestions}
                  sampleSize={WEEK_TEST_SIZE}
                  isPassed={isWeekTestPassed(week.id, passed)}
                  onPass={() => {
                    if (canSaveAnswers) onTestPassed(WEEK_TEST_LESSON, week.id)
                  }}
                  savedState={savedCode.get(`${WEEK_TEST_LESSON}:${week.id}:choice-state`)}
                  onSaveState={canSaveAnswers ? (state) => onSaveCode(`${WEEK_TEST_LESSON}:${week.id}:choice-state`, state) : undefined}
                />
              </div>
            </motion.section>
          )}

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

          {isDesktop ? null : isOwner ? (
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
