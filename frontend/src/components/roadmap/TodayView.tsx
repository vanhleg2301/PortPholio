import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, CircleCheck, Lock, Timer } from 'lucide-react'
import { ChoiceTest } from '@/components/learn/ChoiceTest'
import { FlashcardSession } from '@/components/learn/FlashcardSession'
import { useReviewDeck } from '@/components/learn/ReviewDeckContext'
import { LessonTestCard } from '@/components/learn/LessonTestCard'
import { LESSON_BY_ID, LESSON_TESTS, getConceptCount, isLessonTestPassed } from '@/data/lessons'
import { WEEK_TEST_LESSON, WEEK_TEST_SIZE, getDayMockTest, getTestedLessonIds, getWeekTestQuestions, isTaskLocked, isWeekTestPassed } from '@/lib/testGate'
import { DayNotes } from '@/components/roadmap/DayNotes'
import { ResourceList } from '@/components/roadmap/ResourceList'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { TheoryCard } from '@/components/roadmap/TheoryCard'
import { ReviewList } from '@/components/roadmap/ReviewList'
import type { RoadmapReview } from '@/hooks/useRoadmapReviews'
import { formatMinutes } from '@/hooks/useStudySessions'
import type { RoadmapTask } from '@/data/roadmap/types'
import { DayStrip } from '@/components/roadmap/DayStrip'
import type { RoadmapNote } from '@/hooks/useRoadmapNotes'
import type { NoteTopic } from '@/data/roadmap/topics'
import type { RoadmapResource } from '@/hooks/useRoadmapResources'
import { formatStudyTime, type StudyDay } from '@/data/roadmap/studyDays'
import { cn } from '@/lib/utils'
import { appear, listContainer, section, slide } from '@/lib/motion'

interface TodayViewProps {
  day: StudyDay
  // The first day with work left: flashcards and due reviews show there.
  currentDay: StudyDay
  // Calendar date, for reviews and flashcards that fall due.
  today: string
  doneIds: Set<string>
  isOwner: boolean
  notes: RoadmapNote[]
  isNotesReady: boolean
  resources: RoadmapResource[]
  onSelectDay: (day: number) => void
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
  // Loading the saved answers failed; offer a retry instead of a skeleton that never ends.
  isAnswersFailed?: boolean
  onRetryAnswers?: () => void
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
  day,
  currentDay,
  today,
  doneIds,
  isOwner,
  notes,
  isNotesReady,
  resources,
  onSelectDay,
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
  isAnswersFailed = false,
  onRetryAnswers,
  passed,
  savedCode,
  onSaveCode,
  onTestPassed,
}: TodayViewProps) {
  const week = day.week
  const tasks = day.tasks
  const isCurrent = day.number === currentDay.number
  const done = tasks.filter((t) => doneIds.has(t.id)).length
  // Notes and files written on any calendar date packed into this day.
  const dayNotes = notes.filter((n) => day.dates.includes(n.day))
  const suggestedTopics = [...new Set(tasks.map((t): NoteTopic => t.kind))]
  const dayResources = resources.filter((r) => day.dates.includes(r.day))
  const pendingReviews = reviews.filter((r) => !r.completed_at)
  const scheduledTaskIds = new Set(pendingReviews.map((r) => r.task_id))
  const dueReviews = isCurrent ? pendingReviews.filter((r) => r.due_date <= today) : []
  const reviewDeck = useReviewDeck()
  const hasFlashcards = Boolean(reviewDeck?.isReady) && Object.keys(reviewDeck?.deck ?? {}).length > 0
  const testedLessonIds = getTestedLessonIds(tasks)
  const passedTests = testedLessonIds.filter((id) => isLessonTestPassed(id, passed)).length
  // Week tests are keyed by the calendar date of their task (the first 10 characters of its id).
  const testDay = tasks.find((t) => t.isWeekTest)?.id.slice(0, 10) ?? null
  const dayMock = testDay ? getDayMockTest(testDay) : null
  const weekTestQuestions = testDay && !dayMock ? getWeekTestQuestions(week, testDay) : []
  const references = [...new Map(tasks.flatMap((t) => (t.reference ? [[t.reference.title, t.reference] as const] : []))).values()]

  // Slide direction follows the day number: a later day comes in from the right.
  const [lastNumber, setLastNumber] = useState(day.number)
  const [direction, setDirection] = useState(0)
  if (day.number !== lastNumber) {
    setDirection(day.number > lastNumber ? 1 : -1)
    setLastNumber(day.number)
  }

  return (
    <div>
      {!isDesktop && <DayStrip day={day} currentDay={currentDay} doneIds={doneIds} onSelect={onSelectDay} />}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={day.number} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
          <motion.div variants={section} className={cn('flex items-end justify-between gap-3', !isDesktop && 'mt-5')}>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {week.label} · {formatStudyTime(day.minutes)}
                {isCurrent ? ' · Today' : ''}
              </p>
              <h2 className="font-display font-bold text-2xl leading-tight">Day {day.number}</h2>
            </div>
            {!isCurrent && (
              <button
                type="button"
                onClick={() => onSelectDay(currentDay.number)}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors"
              >
                Today
              </button>
            )}
          </motion.div>
          <motion.p variants={section} className="mt-1 text-base font-semibold leading-snug">
            {day.title}
          </motion.p>
          <motion.p variants={section} className="mt-1 text-sm text-muted-foreground">
            {week.goal}
          </motion.p>
          {focusMinutes > 0 && (
            <motion.p variants={section} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Timer className="h-3.5 w-3.5" /> Focused {formatMinutes(focusMinutes)}
            </motion.p>
          )}

          {isCurrent && hasFlashcards && (
            <motion.section variants={section} layout="position">
              <SectionTitle>Daily review</SectionTitle>
              <FlashcardSession today={today} />
            </motion.section>
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
              {!isAnswersReady && isAnswersFailed ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm">
                  <span>Could not load your saved answers. Check your connection, then try again.</span>
                  <button
                    type="button"
                    onClick={onRetryAnswers}
                    className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background hover:bg-foreground/85 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : !isAnswersReady ? (
                <div className="h-16 rounded-2xl bg-foreground/[0.04] animate-pulse" />
              ) : (
              <div className="flex flex-col gap-3">
                {testedLessonIds.map((id, i) => {
                  const lesson = LESSON_BY_ID.get(id)
                  if (!lesson) return null
                  return (
                    <LessonTestCard
                      key={id}
                      id={id}
                      title={`Test: ${lesson.title}`}
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

          {dayMock && isAnswersReady && (
            <motion.section variants={section} layout="position" id="day-test" className="scroll-mt-20">
              <SectionTitle>{dayMock.mock.kind === 'month' ? 'Month test' : 'Week test'}</SectionTitle>
              <p className="mb-3 text-sm text-muted-foreground">
                {dayMock.mock.kind === 'month'
                  ? 'A mock interview over the whole month: quiz, two coding tasks and four spoken answers. Start the timer and try it without opening the lessons.'
                  : 'A short mock interview: a quiz on this week’s lessons, one new coding task and two questions to answer out loud. Easier than the month test.'}
              </p>
              <LessonTestCard
                id={dayMock.id}
                title={dayMock.mock.title}
                test={dayMock.test}
                quizSize={dayMock.mock.quizSize}
                minutes={dayMock.mock.minutes}
                canSave={canSaveAnswers}
                passed={passed}
                savedCode={savedCode}
                isOpenByDefault={!testDay || !isWeekTestPassed(testDay, passed)}
                onSaveCode={onSaveCode}
                onPassed={(itemId) => onTestPassed(dayMock.id, itemId)}
              />
            </motion.section>
          )}

          {testDay && weekTestQuestions.length > 0 && isAnswersReady && (
            <motion.section variants={section} layout="position" id="day-test" className="scroll-mt-20">
              <SectionTitle>Week test</SectionTitle>
              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
                <p className="flex items-center gap-2 font-semibold">
                  {isWeekTestPassed(testDay, passed) ? (
                    <CircleCheck className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <CalendarCheck className="h-5 w-5 text-violet-500" />
                  )}
                  {Math.min(WEEK_TEST_SIZE, getConceptCount(weekTestQuestions))} mixed questions from {week.label} so far
                </p>
                <p className="mt-1 mb-4 text-sm text-muted-foreground">
                  New questions are drawn at random on every attempt. Try it without opening the lessons — that is how memory gets stronger.
                </p>
                <ChoiceTest
                  questions={weekTestQuestions}
                  sampleSize={WEEK_TEST_SIZE}
                  isPassed={isWeekTestPassed(testDay, passed)}
                  onPass={() => {
                    if (canSaveAnswers) onTestPassed(WEEK_TEST_LESSON, testDay)
                  }}
                  savedState={savedCode.get(`${WEEK_TEST_LESSON}:${testDay}:choice-state`)}
                  onSaveState={canSaveAnswers ? (state) => onSaveCode(`${WEEK_TEST_LESSON}:${testDay}:choice-state`, state) : undefined}
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
                      <DayNotes day={day.key} notes={dayNotes} suggestedTopics={suggestedTopics} />
                    </motion.div>
                  ) : (
                    <motion.div key="skeleton" exit={{ opacity: 0 }} className="h-24 rounded-2xl bg-foreground/[0.04] animate-pulse" />
                  )}
                </AnimatePresence>
              </motion.section>
              <motion.section variants={section} layout="position">
                <SectionTitle>Resources</SectionTitle>
                <ResourceList day={day.key} resources={dayResources} />
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
