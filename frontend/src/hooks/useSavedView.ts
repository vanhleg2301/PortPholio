import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { LIBRARY_TOPICS, type LibraryTopic } from '@/data/library'
import { clampToPlan } from '@/lib/roadmapStats'

const STORAGE_KEY = 'roadmap:view'
const LEGACY_PLAN_MODE_KEY = 'roadmap:plan-mode'
const TABS: RoadmapTab[] = ['today', 'plan', 'library', 'notes']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type PlanMode = 'course' | 'schedule'
export type LibraryFilter = LibraryTopic | 'all'

export interface RoadmapView {
  tab: RoadmapTab
  date: string
  planMode: PlanMode
  libraryTopic: LibraryFilter
}

const isPlanMode = (value: unknown): value is PlanMode => value === 'course' || value === 'schedule'
const isLibraryFilter = (value: unknown): value is LibraryFilter =>
  value === 'all' || LIBRARY_TOPICS.some((t) => t.id === value)

function readSaved(today: string): RoadmapView {
  const view: RoadmapView = { tab: 'today', date: clampToPlan(today), planMode: 'course', libraryTopic: 'all' }
  try {
    if (localStorage.getItem(LEGACY_PLAN_MODE_KEY) === 'schedule') view.planMode = 'schedule'
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (typeof parsed !== 'object' || parsed === null) return view
    const { tab, date, planMode, libraryTopic } = parsed as Record<string, unknown>
    if (TABS.includes(tab as RoadmapTab)) view.tab = tab as RoadmapTab
    if (typeof date === 'string' && DATE_RE.test(date)) view.date = clampToPlan(date)
    if (isPlanMode(planMode)) view.planMode = planMode
    if (isLibraryFilter(libraryTopic)) view.libraryTopic = libraryTopic
  } catch {
    // Storage can be blocked (private mode); start from today.
  }
  return view
}

export function getViewPath(view: RoadmapView): string {
  switch (view.tab) {
    case 'today':
      return `/roadmap/today/${view.date}`
    case 'plan':
      return `/roadmap/plan/${view.planMode}`
    case 'library':
      return view.libraryTopic === 'all' ? '/roadmap/library' : `/roadmap/library/${view.libraryTopic}`
    case 'notes':
      return '/roadmap/notes'
  }
}

// `/roadmap` alone or an unknown path falls back to the last view.
function parseView(pathname: string, today: string, last: RoadmapView): RoadmapView {
  const [tab, arg] = pathname.split('/').slice(2)
  if (tab === 'today') return { ...last, tab, date: arg && DATE_RE.test(arg) ? clampToPlan(arg) : clampToPlan(today) }
  if (tab === 'plan') return { ...last, tab, planMode: isPlanMode(arg) ? arg : last.planMode }
  if (tab === 'library') return { ...last, tab, libraryTopic: isLibraryFilter(arg) ? arg : 'all' }
  if (tab === 'notes') return { ...last, tab }
  return last
}

export const isLessonPath = (pathname: string) => pathname.startsWith('/roadmap/learn/')

/*
  The URL holds the open view: /roadmap/today/2026-11-16, /roadmap/plan/course, /roadmap/library/dsa,
  /roadmap/notes. While a lesson (/roadmap/learn/:id) is open, the last view is kept for the side panel
  and for "back". The last view is also saved, so opening /roadmap (the PWA start) returns to it.
*/
export function useRoadmapRoute(today: string) {
  const location = useLocation()
  const navigate = useNavigate()
  const lastRef = useRef<RoadmapView | null>(null)
  if (lastRef.current === null) lastRef.current = readSaved(today)
  const isLesson = isLessonPath(location.pathname)
  const view = isLesson ? lastRef.current : parseView(location.pathname, today, lastRef.current)
  const path = getViewPath(view)

  useEffect(() => {
    if (isLesson) return
    lastRef.current = view
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(view))
    } catch {
      // Storage can be blocked (private mode); the view just won't be remembered.
    }
    if (location.pathname !== path) navigate(path + location.hash, { replace: true })
    // `path` captures every field of `view`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLesson, path, location.pathname, location.hash, navigate])

  // Same view (a new day on Today, another plan mode or topic) replaces the history entry;
  // another tab, or leaving a lesson, adds one so Back returns.
  function goTo(next: Partial<RoadmapView>, options: { hash?: string; replace?: boolean } = {}) {
    const target = { ...view, ...next }
    const replace = options.replace ?? (!isLesson && target.tab === view.tab)
    navigate(getViewPath(target) + (options.hash ? `#${options.hash}` : ''), { replace })
  }

  return { ...view, viewPath: path, goTo }
}
