import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, UserRound } from 'lucide-react'
import { AccountSheet } from '@/components/roadmap/AccountSheet'
import { BottomTabBar, type RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { NotesView } from '@/components/roadmap/NotesView'
import { PlanView } from '@/components/roadmap/PlanView'
import { TodayView } from '@/components/roadmap/TodayView'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { useOwnerSession } from '@/hooks/useOwnerSession'
import { useRoadmapNotes } from '@/hooks/useRoadmapNotes'
import { useRoadmapProgress, useToggleTask } from '@/hooks/useRoadmapProgress'
import { useRoadmapResources } from '@/hooks/useRoadmapResources'
import {
  ALL_TASKS,
  clampToPlan,
  getActivityDates,
  getNeetCodeSolved,
  getProgress,
  getStreak,
  getTodayIso,
  toPercent,
} from '@/lib/roadmapStats'

export default function RoadmapPage() {
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

  const doneIds = useMemo(() => new Set(rows.map((r) => r.task_id)), [rows])
  const activity = useMemo(() => getActivityDates(rows.map((r) => r.completed_at)), [rows])
  const overall = toPercent(getProgress(ALL_TASKS, doneIds))
  const solved = getNeetCodeSolved(doneIds)
  const streak = getStreak(activity)

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
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
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
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 pb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>
            <span className="text-foreground">{overall}%</span> plan
          </span>
          <span>
            <span className="text-foreground">{solved}/{NEETCODE_150_TOTAL}</span> NeetCode
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-foreground">{streak}</span> streak
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
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
          />
        )}
        {tab === 'plan' && <PlanView doneIds={doneIds} today={today} onToggle={handleToggle} onOpenDay={openDay} />}
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
      </main>

      {toast && (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 mx-auto max-w-sm rounded-2xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg">
          {toast}
        </div>
      )}

      <BottomTabBar active={tab} onChange={changeTab} />
      <AccountSheet
        isOpen={isAccountOpen}
        session={session}
        isOwner={isOwner}
        onClose={() => setIsAccountOpen(false)}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />
    </div>
  )
}
