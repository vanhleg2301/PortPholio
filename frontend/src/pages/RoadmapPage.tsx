import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Flame, Search, Timer, UserRound } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { FocusSheet } from '@/components/roadmap/FocusSheet'
import { DesktopSidebar } from '@/components/roadmap/DesktopSidebar'
import { SidePanel } from '@/components/roadmap/SidePanel'
import { LessonView } from '@/components/learn/LessonView'
import type { LessonFindRequest } from '@/components/learn/LessonFind'
import { flashFirstMatch } from '@/lib/textHighlight'
import { ReviewDeckProvider } from '@/components/learn/ReviewDeckContext'
import { SelectionTranslator } from '@/components/learn/SelectionTranslator'
import { LessonOutlinePanel, scrollToAnchor } from '@/components/learn/LessonOutline'
import { SearchDialog } from '@/components/roadmap/SearchDialog'
import type { SearchEntry } from '@/lib/searchIndex'
import { LESSON_BY_ID, LESSON_TESTS, isLessonTestPassed } from '@/data/lessons'
import { WEEK_TEST_LESSON, isTaskLocked } from '@/lib/testGate'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLessonProgress, useMarkExercisePassed, useSaveCode, useSavedCode } from '@/hooks/useLessonData'
import { formatClock, useFocusTimer } from '@/hooks/useFocusTimer'
import { useCompleteReview, useRoadmapReviews, useScheduleReviews, useUnscheduleReviews, type RoadmapReview } from '@/hooks/useRoadmapReviews'
import { useAddSession, useStudySessions } from '@/hooks/useStudySessions'
import type { RoadmapTask } from '@/data/roadmap/types'
import { AccountSheet } from '@/components/roadmap/AccountSheet'
import { BottomTabBar, type RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { LibraryView, type LibraryRequest } from '@/components/roadmap/LibraryView'
import { NotesView } from '@/components/roadmap/NotesView'
import { PlanView } from '@/components/roadmap/PlanView'
import { TodayView } from '@/components/roadmap/TodayView'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { useOwnerSession } from '@/hooks/useOwnerSession'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSavedView } from '@/hooks/useSavedView'
import { useRoadmapNotes } from '@/hooks/useRoadmapNotes'
import { useRoadmapProgress, useToggleTask } from '@/hooks/useRoadmapProgress'
import { useRoadmapResources } from '@/hooks/useRoadmapResources'
import {
  ALL_TASKS,
  TASK_BY_ID,
  DAY_BY_DATE,
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
  const { tab, setTab, selectedDate, setSelectedDate } = useSavedView(today)
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  // Section to scroll to once a lesson opened from search has rendered.
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null)
  // Opening a search result: where to look for the words that were searched.
  const [lessonFind, setLessonFind] = useState<LessonFindRequest | null>(null)
  const [dayFind, setDayFind] = useState<{ id: number; query: string } | null>(null)
  const [libraryRequest, setLibraryRequest] = useState<LibraryRequest | null>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const location = useLocation()
  const navigate = useNavigate()
  // Lesson progress and answers are saved per account; tasks, notes and files stay owner-only.
  const userId = session?.user.id
  const canSaveAnswers = Boolean(userId)
  const lessonProgress = useLessonProgress(userId)
  const savedCodeQuery = useSavedCode(userId)
  const markPassed = useMarkExercisePassed(userId)
  const saveCode = useSaveCode(userId)
  // Tests and flashcards start from this account's latest server copy, not from the copy stored on
  // this device (it may be older than what another device saved). Offline, the stored copy is used.
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isFresh = (query: { isSuccess: boolean; isFetchedAfterMount: boolean }) => query.isSuccess && (query.isFetchedAfterMount || isOffline)
  const isAnswersReady = !canSaveAnswers || (isFresh(lessonProgress) && isFresh(savedCodeQuery))

  const lessonId = /^\/roadmap\/learn\/([^/]+)/.exec(location.pathname)?.[1]
  const lesson = lessonId ? LESSON_BY_ID.get(lessonId) : undefined
  // Only dedicated lesson tasks can be ticked from the lesson page; a problem or reading task
  // that merely links to a lesson keeps its own checkbox.
  const openedTaskId = (location.state as { taskId?: string } | null)?.taskId
  const lessonTask =
    (openedTaskId ? TASK_BY_ID.get(openedTaskId) : undefined) ?? ALL_TASKS.find((t) => t.lessonId === lessonId && t.title.startsWith('Lesson:'))
  const lessonTaskId = lessonTask?.title.startsWith('Lesson:') ? lessonTask.id : null

  const doneIds = useMemo(() => new Set(rows.map((r) => r.task_id)), [rows])
  const passedItems = useMemo(() => lessonProgress.data ?? new Set<string>(), [lessonProgress.data])
  const savedCode = useMemo(() => savedCodeQuery.data ?? new Map<string, string>(), [savedCodeQuery.data])
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
  const runningTask = focus.timer?.taskId ? TASK_BY_ID.get(focus.timer.taskId) : undefined

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
    const task = TASK_BY_ID.get(taskId)
    if (isDone && task && isTaskLocked(task, passedItems)) {
      setToast(task.isWeekTest ? 'Pass the week test first' : 'Pass the day test first')
      goToTest(taskId.slice(0, 10))
      return
    }
    toggle.mutate({ taskId, isDone }, { onError: (err) => setToast(`Save failed: ${err.message}`) })
  }

  // Opens the Today page of `date` and scrolls to its test section.
  function goToTest(date: string) {
    if (lesson) navigate('/roadmap')
    setTab('today')
    setSelectedDate(date)
    setTimeout(() => document.getElementById('day-test')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
  }

  function handleTestPassed(lessonId: string, itemId: string) {
    markPassed.mutate(
      { lessonId, itemId },
      {
        onError: (err) => setToast(`Could not save: ${err.message}`),
        onSuccess: () => {
          if (lessonId === WEEK_TEST_LESSON) {
            setToast('Week test passed — you can tick it now')
            return
          }
          const next = new Set(passedItems).add(`${lessonId}:${itemId}`)
          setToast(isLessonTestPassed(lessonId, next) ? 'Test passed — you can tick the lesson now' : 'Part passed')
        },
      }
    )
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
    if (lesson) navigate('/roadmap')
    window.scrollTo({ top: 0 })
  }

  // Ctrl+K / ⌘K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!pendingAnchor || !lesson) return
    const first = setTimeout(() => scrollToAnchor(pendingAnchor), 450)
    // The lesson animates in; a second try lands exactly once the layout has settled.
    const second = setTimeout(() => {
      scrollToAnchor(pendingAnchor)
      setPendingAnchor(null)
    }, 1100)
    return () => {
      clearTimeout(first)
      clearTimeout(second)
    }
  }, [pendingAnchor, lesson])

  // With `query`, the lesson opens its find bar on the first match (inside or after `anchor`).
  function openLessonById(id: string, anchor?: string, query?: string) {
    navigate(`/roadmap/learn/${id}`)
    if (query && query.trim().length >= 2) {
      window.scrollTo({ top: 0 })
      setLessonFind({ id: Date.now(), lessonId: id, query: query.trim(), anchor })
    } else if (anchor) setPendingAnchor(anchor)
    else window.scrollTo({ top: 0 })
  }

  function handleSearchSelect(entry: SearchEntry, query: string) {
    const { action } = entry
    if (action.type === 'lesson') openLessonById(action.lessonId, action.anchor, query)
    else if (action.type === 'library') {
      changeTab('library')
      setLibraryRequest({ id: Date.now(), query, entryId: action.entryId })
    } else {
      openDay(action.date)
      if (query.length >= 2) setDayFind({ id: Date.now(), query })
    }
  }

  // A plan task, problem or note opened from search: scroll to where the words appear on Today.
  useEffect(() => {
    if (!dayFind || tab !== 'today' || lesson) return
    return flashFirstMatch(() => document.querySelector('main'), dayFind.query)
  }, [dayFind, tab, lesson])

  function openLesson(task: RoadmapTask) {
    if (!task.lessonId) return
    navigate(`/roadmap/learn/${task.lessonId}`, { state: { taskId: task.id } })
    window.scrollTo({ top: 0 })
  }

  function closeLesson() {
    navigate('/roadmap')
    window.scrollTo({ top: 0 })
  }

  function handleSaveCode(key: string, code: string) {
    saveCode.mutate({ key, code }, { onError: (err) => setToast(`Could not save code: ${err.message}`) })
  }

  function openDay(date: string) {
    setSelectedDate(date)
    changeTab('today')
  }

  const avatarUrl = session?.user.user_metadata.avatar_url as string | undefined
  const showSidePanel = isDesktop && (tab === 'today' || Boolean(lesson))

  return (
    <ReviewDeckProvider
      key={userId ?? 'guest'}
      today={today}
      isReady={isAnswersReady}
      saved={savedCode}
      onSave={canSaveAnswers ? handleSaveCode : () => undefined}
    >
    <MotionConfig reducedMotion="user">
    <SelectionTranslator />
    <div className="min-h-[100dvh] bg-background">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 lg:max-w-[1440px] lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 -ml-2 rounded-full py-1 pl-1 pr-3 hover:bg-foreground/[0.06] transition-colors"
            aria-label="Back to portfolio"
          >
            <span className="h-8 w-8 shrink-0 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
              HV
            </span>
            <span className="font-display text-sm font-bold uppercase tracking-tight truncate sm:text-base">Road to Big Tech</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            title="Search (Ctrl+K)"
            className="flex h-9 items-center gap-2 rounded-full border border-border px-2.5 text-sm text-muted-foreground hover:border-foreground/50 hover:bg-foreground/[0.06] hover:text-foreground transition-colors lg:w-56 lg:px-3"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden flex-1 text-left lg:inline">Search…</span>
            <kbd className="hidden rounded border border-border px-1.5 font-sans text-[10px] lg:inline">Ctrl K</kbd>
          </button>
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
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-2.5 lg:max-w-[1440px] lg:px-8 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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

      <div
        className={cn(
          'mx-auto',
          isDesktop
            ? cn('grid max-w-[1440px] gap-10 px-8 pt-6 pb-16', showSidePanel ? 'grid-cols-[220px_minmax(0,1fr)_minmax(320px,400px)]' : 'grid-cols-[220px_minmax(0,1fr)]')
            : 'max-w-3xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]'
        )}
      >
        {isDesktop && (
          <aside className="sticky top-32 self-start">
            <DesktopSidebar
              tab={tab}
              selectedDate={selectedDate}
              today={today}
              doneIds={doneIds}
              onChangeTab={changeTab}
              onSelectDate={(date) => {
                setSelectedDate(date)
                if (lesson) navigate('/roadmap')
              }}
            />
          </aside>
        )}
        <main className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {lesson ? (
              <motion.div key={`lesson-${lesson.id}`} variants={fadeSwap} initial="initial" animate="animate" exit="exit">
                <LessonView
                  findRequest={lessonFind}
                  onFindMiss={(request) => request.anchor && setPendingAnchor(request.anchor)}
                  lesson={lesson}
                  canSave={canSaveAnswers}
                  passed={passedItems}
                  savedCode={savedCode}
                  isTaskDone={lessonTaskId ? doneIds.has(lessonTaskId) : null}
                  isTestPending={isOwner && Boolean(LESSON_TESTS[lesson.id]) && !isLessonTestPassed(lesson.id, passedItems)}
                  onOpenTest={() => {
                    if (lessonTaskId) goToTest(lessonTaskId.slice(0, 10))
                  }}
                  onBack={closeLesson}
                  onToggleDone={(isDone) => {
                    if (lessonTaskId) handleToggle(lessonTaskId, isDone)
                  }}
                  onSaveCode={handleSaveCode}
                  isDesktop={isDesktop}
                  isTestPassed={isLessonTestPassed(lesson.id, passedItems)}
                  onOpenLesson={(id) => openLessonById(id)}
                  onPassed={(itemId) => {
                    markPassed.mutate({ lessonId: lesson.id, itemId })
                    setToast('Exercise passed')
                  }}
                />
              </motion.div>
            ) : (
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
            onOpenLesson={openLesson}
            isDesktop={isDesktop}
            canSaveAnswers={canSaveAnswers}
            isAnswersReady={isAnswersReady}
            passed={passedItems}
            savedCode={savedCode}
            onSaveCode={handleSaveCode}
            onTestPassed={handleTestPassed}
          />
        )}
        {tab === 'plan' && (
          <PlanView doneIds={doneIds} today={today} onToggle={handleToggle} onOpenDay={openDay} sessions={sessions} />
        )}
        {tab === 'library' && (
          <LibraryView request={libraryRequest} onOpenLesson={(id, query) => openLessonById(id, undefined, query)} />
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
            )}
          </AnimatePresence>
        </main>
        {showSidePanel && (
          <aside className="sticky top-32 self-start max-h-[calc(100dvh-9rem)] overflow-y-auto pb-8 pr-1 [scrollbar-width:thin]">
            {lesson && <LessonOutlinePanel lesson={lesson} passed={passedItems} isTestPassed={isLessonTestPassed(lesson.id, passedItems)} />}
            <SidePanel
              date={selectedDate}
              isOwner={isOwner}
              notes={notesQuery.data ?? []}
              isNotesReady={notesQuery.isSuccess}
              resources={resourcesQuery.data ?? []}
              savedCode={savedCodeQuery.data ?? new Map<string, string>()}
              isCodeReady={savedCodeQuery.isSuccess}
              onSaveCode={handleSaveCode}
              onRequestSignIn={() => setIsAccountOpen(true)}
            />
          </aside>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={SPRING}
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] lg:bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {!isDesktop && <BottomTabBar active={tab} onChange={changeTab} />}
      <SearchDialog isOpen={isSearchOpen} notes={notesQuery.data ?? []} onClose={() => setIsSearchOpen(false)} onSelect={handleSearchSelect} />
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
    </ReviewDeckProvider>
  )
}
