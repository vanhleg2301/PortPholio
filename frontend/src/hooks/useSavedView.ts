import { useEffect, useState } from 'react'
import type { RoadmapTab } from '@/components/roadmap/BottomTabBar'
import { clampToPlan } from '@/lib/roadmapStats'

const STORAGE_KEY = 'roadmap:view'
const TABS: RoadmapTab[] = ['today', 'plan', 'notes']

interface SavedView {
  tab: RoadmapTab
  date: string
}

function readView(today: string): SavedView {
  const fallback: SavedView = { tab: 'today', date: clampToPlan(today) }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return fallback
    const { tab, date } = parsed as Record<string, unknown>
    return {
      tab: TABS.includes(tab as RoadmapTab) ? (tab as RoadmapTab) : 'today',
      date: typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? clampToPlan(date) : fallback.date,
    }
  } catch {
    return fallback
  }
}

// Keeps the open tab and day across reloads, so the page reopens where the user left it.
export function useSavedView(today: string) {
  const [initial] = useState(() => readView(today))
  const [tab, setTab] = useState<RoadmapTab>(initial.tab)
  const [selectedDate, setSelectedDate] = useState(initial.date)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tab, date: selectedDate }))
    } catch {
      // Storage can be blocked (private mode); the view just won't be remembered.
    }
  }, [tab, selectedDate])

  return { tab, setTab, selectedDate, setSelectedDate }
}
