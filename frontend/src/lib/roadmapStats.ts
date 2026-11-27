import { format, subDays } from 'date-fns'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { WEEKS } from '@/data/roadmap/plan'
import type { PhaseId, RoadmapTask } from '@/data/roadmap/types'

export const ALL_TASKS: RoadmapTask[] = WEEKS.flatMap((w) => w.days.flatMap((d) => d.tasks))
// O(1) lookups by id (the plan has ~550 tasks; `find` ran on every render and tap).
export const TASK_BY_ID = new Map(ALL_TASKS.map((t) => [t.id, t]))
export interface Progress {
  done: number
  total: number
}

export function getProgress(tasks: RoadmapTask[], doneIds: Set<string>): Progress {
  return { done: tasks.filter((t) => doneIds.has(t.id)).length, total: tasks.length }
}

export function getPhaseTasks(phaseId: PhaseId): RoadmapTask[] {
  return WEEKS.filter((w) => w.phaseId === phaseId).flatMap((w) => w.days.flatMap((d) => d.tasks))
}

export function toPercent({ done, total }: Progress): number {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

export function getTodayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getActivityDates(completedAt: string[]): Set<string> {
  return new Set(completedAt.map((iso) => format(new Date(iso), 'yyyy-MM-dd')))
}

export function getStreak(activity: Set<string>): number {
  let cursor = new Date()
  if (!activity.has(format(cursor, 'yyyy-MM-dd'))) cursor = subDays(cursor, 1)
  let streak = 0
  while (activity.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function getNeetCodeSolved(doneIds: Set<string>): number {
  const solved = ALL_TASKS.filter((t) => t.kind === 'dsa' && t.difficulty && doneIds.has(t.id)).length
  return Math.min(solved, NEETCODE_150_TOTAL)
}
