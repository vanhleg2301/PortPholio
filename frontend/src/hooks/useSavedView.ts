import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { LIBRARY_TOPICS, type LibraryTopic } from '@/data/library'
import { MAIN_TRACK, getStudyDayByDate } from '@/data/roadmap/studyDays'

const STORAGE_KEY = 'roadmap:view'
const LEGACY_PLAN_MODE_KEY = 'roadmap:plan-mode'
const TABS: RoadmapTab[] = ['today', 'plan', 'library', 'notes']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type PlanMode = 'course' | 'schedule'
export type LibraryFilter = LibraryTopic | 'all'

export interface RoadmapView {
  tab: RoadmapTab
  // Study track shown on Today: the main plan or a private track (see lib/privateTracks.ts).
  track: string
  // Study day open on Today; null = the current day (the first one with work left).
  day: number | null
  planMode: PlanMode
  libraryTopic: LibraryFilter
}

const isPlanMode = (value: unknown): value is PlanMode => value === 'course' || value === 'schedule'
const isLibraryFilter = (value: unknown): value is LibraryFilter =>
  value === 'all' || LIBRARY_TOPICS.some((t) => t.id === value)

const TRACK_RE = /^[a-z][a-z0-9-]*$/

// The tab, track, plan mode and topic are remembered; Today always reopens on the current day.
function readSaved(): RoadmapView {
  const view: RoadmapView = { tab: 'today', track: MAIN_TRACK, day: null, planMode: 'course', libraryTopic: 'all' }
  try {
    if (localStorage.getItem(LEGACY_PLAN_MODE_KEY) === 'schedule') view.planMode = 'schedule'
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (typeof parsed !== 'object' || parsed === null) return view
    const { tab, track, planMode, libraryTopic } = parsed as Record<string, unknown>
    if (TABS.includes(tab as RoadmapTab)) view.tab = tab as RoadmapTab
    if (typeof track === 'string' && TRACK_RE.test(track)) view.track = track
    if (isPlanMode(planMode)) view.planMode = planMode
    if (isLibraryFilter(libraryTopic)) view.libraryTopic = libraryTopic
  } catch {
    // Storage can be blocked (private mode); start from today.
  }
  return view
}

const toDayNumber = (value: string | undefined): number | null => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : null
}

export function getViewPath(view: RoadmapView): string {
  switch (view.tab) {
    case 'today': {
      const base = view.track === MAIN_TRACK ? '/roadmap' : `/roadmap/track/${view.track}`
      return view.day === null ? (view.track === MAIN_TRACK ? '/roadmap/today' : base) : `${base}/day/${view.day}`
    }
    case 'plan':
      return `/roadmap/plan/${view.planMode}`
    case 'library':
      return view.libraryTopic === 'all' ? '/roadmap/library' : `/roadmap/library/${view.libraryTopic}`
    case 'notes':
      return '/roadmap/notes'
  }
}

// `/roadmap` alone or an unknown path falls back to the last view (Today on the current day).
// `/roadmap/today/<date>` is an old link from the calendar plan: it opens the day that date became.
// A private track: `/roadmap/track/<id>` (its current day) and `/roadmap/track/<id>/day/<n>`.
function parseView(pathname: string, last: RoadmapView): RoadmapView {
  const [tab, arg, sub, n] = pathname.split('/').slice(2)
  if (tab === 'track' && arg && TRACK_RE.test(arg)) return { ...last, tab: 'today', track: arg, day: sub === 'day' ? toDayNumber(n) : null }
  if (tab === 'day') return { ...last, tab: 'today', track: MAIN_TRACK, day: toDayNumber(arg) }
  if (tab === 'today') return { ...last, tab, track: MAIN_TRACK, day: arg && DATE_RE.test(arg) ? getStudyDayByDate(arg).number : null }
  if (tab === 'plan') return { ...last, tab, planMode: isPlanMode(arg) ? arg : last.planMode }
  if (tab === 'library') return { ...last, tab, libraryTopic: isLibraryFilter(arg) ? arg : 'all' }
  if (tab === 'notes') return { ...last, tab }
  return { ...last, day: null }
}

export const isLessonPath = (pathname: string) => pathname.startsWith('/roadmap/learn/')

/*
  The URL holds the open view: /roadmap/today (the current study day), /roadmap/day/12,
  /roadmap/track/<id>[/day/<n>] (a private track),
  /roadmap/plan/course, /roadmap/library/dsa, /roadmap/notes. While a lesson (/roadmap/learn/:id) is open, the last view is kept for the side panel
  and for "back". The last view is also saved, so opening /roadmap (the PWA start) returns to it.
*/
export function useRoadmapRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const lastRef = useRef<RoadmapView | null>(null)
  if (lastRef.current === null) lastRef.current = readSaved()
  const isLesson = isLessonPath(location.pathname)
  const view = isLesson ? lastRef.current : parseView(location.pathname, lastRef.current)
  const path = getViewPath(view)

  useEffect(() => {
    if (isLesson) return
    lastRef.current = view
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...view, day: null }))
    } catch {
      // Storage can be blocked (private mode); the view just won't be remembered.
    }
    if (location.pathname !== path) navigate(path + location.hash, { replace: true })
    // `path` captures every field of `view`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLesson, path, location.pathname, location.hash, navigate])

  // Same view (another day on Today, another plan mode or topic) replaces the history entry;
  // another tab, or leaving a lesson, adds one so Back returns.
  function goTo(next: Partial<RoadmapView>, options: { hash?: string; replace?: boolean } = {}) {
    const target = { ...view, ...next }
    const replace = options.replace ?? (!isLesson && target.tab === view.tab)
    navigate(getViewPath(target) + (options.hash ? `#${options.hash}` : ''), { replace })
  }

  return { ...view, viewPath: path, goTo }
}
