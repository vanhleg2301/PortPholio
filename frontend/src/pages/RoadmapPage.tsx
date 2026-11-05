import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Flame, Timer, UserRound } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { FocusSheet } from '@/components/roadmap/FocusSheet'
import { formatClock, useFocusTimer } from '@/hooks/useFocusTimer'
import { useCompleteReview, useRoadmapReviews, useScheduleReviews, useUnscheduleReviews, type RoadmapReview } from '@/hooks/useRoadmapReviews'
import { useAddSession, useStudySessions } from '@/hooks/useStudySessions'
import type { RoadmapTask } from '@/data/roadmap/types'
import { AccountSheet } from '@/components/roadmap/AccountSheet'
import { BottomTabBar, type RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { NotesView } from '@/components/roadmap/NotesView'
import { PlanView } from '@/components/roadmap/PlanView'
import { TodayView } from '@/components/roadmap/TodayView'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { useOwnerSession } from '@/hooks/useOwnerSession'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRoadmapNotes } from '@/hooks/useRoadmapNotes'
import { useRoadmapProgress, useToggleTask } from '@/hooks/useRoadmapProgress'
import { useRoadmapResources } from '@/hooks/useRoadmapResources'
import {
  ALL_TASKS,
  DAY_BY_DATE,
  clampToPlan,
  getActivityDates,
  getNeetCodeSolved,
  getProgress,
  getStreak,
  getTodayIso,
  toPercent,
} from '@/lib/roadmapStats'
import { EASE_OUT, SPRING, fadeSwap } from '@/lib/motion'

// Re-mounts on change so a new value rolls in instead of snapping.
function RollingValue({ value }: { value: string }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom text-foreground">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={SPRING}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function RoadmapPage() {
  useDocumentTitle('Road to Big Tech · Study plan')
  const today = getTodayIso()
  const [tab, setTab] = useState<RoadmapTab>('today')
  const [selectedDate, setSelectedDate] = useState(() => clampToPlan(today))
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const { session, isOwner, signInWithGoogle, signOut } = useOwnerSession()
  const { data: rows = [], isError } = useRoadmapProgress()
  const notesQuery = useRoadmapNotes(isOwner)
  const resourcesQuery = useRoadmapResources(isOwner)
  const toggle = useToggleTask()
  const reviewsQuery = useRoadmapReviews(isOwner)
  const scheduleReviews = useScheduleReviews()
  const unscheduleReviews = useUnscheduleReviews()
  const completeReview = useCompleteReview()
  const { data: sessions = [] } = useStudySessions()
  const addSession = useAddSession()
  const focus = useFocusTimer()
  const [isFocusOpen, setIsFocusOpen] = useState(false)

  const doneIds = useMemo(() => new Set(rows.map((r) => r.task_id)), [rows])
  const activity = useMemo(() => getActivityDates(rows.map((r) => r.completed_at)), [rows])
  const overall = toPercent(getProgress(ALL_TASKS, doneIds))
  const solved = getNeetCodeSolved(doneIds)
  const streak = getStreak(activity)
  const minutesByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions) map.set(s.day, (map.get(s.day) ?? 0) + s.minutes)
    return map
  }, [sessions])
  const todayTasks = DAY_BY_DATE.get(today)?.tasks ?? []
  const runningTask = focus.timer?.taskId ? ALL_TASKS.find((t) => t.id === focus.timer?.taskId) : undefined

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (isError) setToast('Could not load progress.')
  }, [isError])

  function handleToggle(taskId: string, isDone: boolean) {
    if (!isOwner) {
      setIsAccountOpen(true)
      return
    }
    toggle.mutate({ taskId, isDone }, { onError: (err) => setToast(`Save failed: ${err.message}`) })
  }

  function handleToggleReview(task: RoadmapTask, isScheduled: boolean) {
    const onError = (err: Error) => setToast(`Could not update reviews: ${err.message}`)
    if (isScheduled) {
      unscheduleReviews.mutate(task.id, { onError })
      return
    }
    scheduleReviews.mutate(
      { taskId: task.id, taskTitle: task.title, fromDay: today },
      { onError, onSuccess: () => setToast('Review booked in 3, 7 and 30 days') }
    )
  }

  function handleCompleteReview(review: RoadmapReview, isStillHard: boolean) {
    completeReview.mutate(
      { review, isStillHard, today },
      {
        onError: (err) => setToast(`Could not save: ${err.message}`),
        onSuccess: () => setToast(isStillHard ? 'Booked again in 3 days' : 'Nice — review done'),
      }
    )
  }

  function handleFocusStart(minutes: number | null, taskId: string | null) {
    if (!isOwner) {
      setIsFocusOpen(false)
      setIsAccountOpen(true)
      return
    }
    focus.start(minutes, taskId)
  }

  function handleFocusStop() {
    const finished = focus.stop()
    if (!finished) {
      setToast('Under a minute — not saved')
      return
    }
    addSession.mutate(
      { day: format(parseISO(finished.startedAt), 'yyyy-MM-dd'), ...finished },
      {
        onSuccess: () => {
          setToast(`Saved ${finished.minutes} min of focus`)
          setIsFocusOpen(false)
        },
        onError: (err) => setToast(`Could not save session: ${err.message}`),
      }
    )
  }

  function changeTab(next: RoadmapTab) {
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  function openDay(date: string) {
    setSelectedDate(date)
    changeTab('today')
  }

  const avatarUrl = session?.user.user_metadata.avatar_url as string | undefined

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-[100dvh] bg-background">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 -ml-2 rounded-full py-1 pl-1 pr-3 hover:bg-foreground/[0.06] transition-colors"
            aria-label="Back to portfolio"
          >
            <span className="h-8 w-8 shrink-0 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
              HV
            </span>
            <span className="font-display font-bold uppercase tracking-tight truncate">Road to Big Tech</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            layout
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsFocusOpen(true)}
            aria-label="Focus timer"
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors',
              focus.timer
                ? focus.isTargetReached
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 hover:bg-foreground/[0.06]'
            )}
          >
            <Timer className="h-4 w-4" />
            {focus.timer && (
              <span className="font-mono tabular-nums">
                {formatClock(
                  focus.targetSeconds !== null && !focus.isTargetReached ? focus.targetSeconds - focus.elapsedSeconds : focus.elapsedSeconds
                )}
              </span>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            aria-label={session ? 'Account' : 'Sign in'}
            className="shrink-0 h-9 w-9 rounded-full overflow-hidden border border-border flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/[0.06] transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserRound className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>
            <RollingValue value={`${overall}%`} /> plan
          </span>
          <span>
            <RollingValue value={`${solved}/${NEETCODE_150_TOTAL}`} /> NeetCode
          </span>
          <span className="flex items-center gap-1">
            <motion.span key={streak} initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING}>
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </motion.span>
            <RollingValue value={`${streak}`} /> streak
          </span>
        </div>
      </motion.header>

      <main className="mx-auto max-w-3xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} variants={fadeSwap} initial="initial" animate="animate" exit="exit">
        {tab === 'today' && (
          <TodayView
            date={selectedDate}
            today={today}
            doneIds={doneIds}
            isOwner={isOwner}
            notes={notesQuery.data ?? []}
            isNotesReady={notesQuery.isSuccess}
            resources={resourcesQuery.data ?? []}
            onSelectDate={setSelectedDate}
            onToggle={handleToggle}
            onRequestSignIn={() => setIsAccountOpen(true)}
            reviews={reviewsQuery.data ?? []}
            isReviewBusy={completeReview.isPending}
            onToggleReview={handleToggleReview}
            onCompleteReview={handleCompleteReview}
            focusMinutes={minutesByDay.get(selectedDate) ?? 0}
          />
        )}
        {tab === 'plan' && (
          <PlanView doneIds={doneIds} today={today} onToggle={handleToggle} onOpenDay={openDay} sessions={sessions} />
        )}
        {tab === 'notes' && (
          <NotesView
            isOwner={isOwner}
            isLoading={notesQuery.isLoading || resourcesQuery.isLoading}
            notes={notesQuery.data ?? []}
            resources={resourcesQuery.data ?? []}
            onOpenDay={openDay}
            onRequestSignIn={() => setIsAccountOpen(true)}
          />
        )}
        </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={SPRING}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 mx-auto max-w-sm rounded-2xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomTabBar active={tab} onChange={changeTab} />
      <FocusSheet
        isOpen={isFocusOpen}
        isRunning={focus.timer !== null}
        elapsedSeconds={focus.elapsedSeconds}
        targetSeconds={focus.targetSeconds}
        isTargetReached={focus.isTargetReached}
        runningTaskTitle={runningTask?.title ?? null}
        tasks={todayTasks}
        todayMinutes={minutesByDay.get(today) ?? 0}
        isSaving={addSession.isPending}
        onStart={handleFocusStart}
        onStop={handleFocusStop}
        onDiscard={() => {
          focus.cancel()
          setToast('Session discarded')
        }}
        onClose={() => setIsFocusOpen(false)}
      />
      <AccountSheet
        isOpen={isAccountOpen}
        session={session}
        isOwner={isOwner}
        onClose={() => setIsAccountOpen(false)}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />
    </div>
    </MotionConfig>
  )
}
