import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { CATEGORY_SIZES, DIFFICULTY_TOTALS, NEETCODE_CATEGORIES } from '@/data/roadmap/neetcode'
import { PHASES, ROADMAP_START } from '@/data/roadmap/plan'
import type { ProblemDifficulty, RoadmapTask } from '@/data/roadmap/types'
import { ALL_TASKS, getPhaseTasks, getProgress, toPercent } from '@/lib/roadmapStats'

export interface ProgressRow {
  task_id: string
  completed_at: string
}

export interface SessionRow {
  day: string
  started_at: string
  minutes: number
}

export interface Milestone {
  id: string
  title: string
  detail: string
  achievedOn: string | null
}

const TASK_BY_ID = new Map(ALL_TASKS.map((t) => [t.id, t]))
const toDay = (iso: string) => format(new Date(iso), 'yyyy-MM-dd')

function isProblem(task: RoadmapTask | undefined): task is RoadmapTask & { difficulty: ProblemDifficulty; category: string } {
  return Boolean(task?.difficulty && task.category)
}

// Date on which the running count first reached each threshold.
function dateReaching(sortedDays: string[], threshold: number): string | null {
  return sortedDays.length >= threshold ? sortedDays[threshold - 1] : null
}

function getStreakMilestoneDate(activeDays: string[], length: number): string | null {
  let run = 0
  for (let i = 0; i < activeDays.length; i++) {
    run = i > 0 && differenceInCalendarDays(parseISO(activeDays[i]), parseISO(activeDays[i - 1])) === 1 ? run + 1 : 1
    if (run >= length) return activeDays[i]
  }
  return null
}

export function getJourneyStats(rows: ProgressRow[], sessions: SessionRow[], today: string) {
  const sortedRows = [...rows].sort((a, b) => a.completed_at.localeCompare(b.completed_at))
  const doneIds = new Set(rows.map((r) => r.task_id))

  const problemRows = sortedRows.filter((r) => isProblem(TASK_BY_ID.get(r.task_id)))
  const solvedProblems = problemRows.map((r) => TASK_BY_ID.get(r.task_id)).filter(isProblem)
  const byDifficulty = { easy: 0, medium: 0, hard: 0 } satisfies Record<ProblemDifficulty, number>
  const byCategory = Object.fromEntries(NEETCODE_CATEGORIES.map((c) => [c, 0])) as Record<string, number>
  for (const p of solvedProblems) {
    byDifficulty[p.difficulty]++
    byCategory[p.category]++
  }

  const activeDays = [...new Set(sortedRows.map((r) => toDay(r.completed_at)))].sort()
  let longestStreak = 0
  let run = 0
  activeDays.forEach((day, i) => {
    run = i > 0 && differenceInCalendarDays(parseISO(day), parseISO(activeDays[i - 1])) === 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
  })

  const sortedSessions = [...sessions].sort((a, b) => a.started_at.localeCompare(b.started_at))
  const totalMinutes = sortedSessions.reduce((sum, s) => sum + s.minutes, 0)
  const hourReachedOn = (hours: number) => {
    let sum = 0
    for (const s of sortedSessions) {
      sum += s.minutes
      if (sum >= hours * 60) return s.day
    }
    return null
  }

  const problemDays = problemRows.map((r) => toDay(r.completed_at))
  const phaseDoneOn = (phaseId: (typeof PHASES)[number]['id']) => {
    const tasks = getPhaseTasks(phaseId)
    if (tasks.length === 0 || !tasks.every((t) => doneIds.has(t.id))) return null
    const ids = new Set(tasks.map((t) => t.id))
    const last = sortedRows.filter((r) => ids.has(r.task_id)).at(-1)
    return last ? toDay(last.completed_at) : null
  }

  const milestones: Milestone[] = [
    { id: 'first', title: 'First problem', detail: 'Solved the first NeetCode problem', achievedOn: dateReaching(problemDays, 1) },
    { id: 'p25', title: '25 problems', detail: 'A sixth of NeetCode 150', achievedOn: dateReaching(problemDays, 25) },
    { id: 'p75', title: '75 problems', detail: 'Halfway through NeetCode 150', achievedOn: dateReaching(problemDays, 75) },
    { id: 'p150', title: 'NeetCode 150', detail: 'Every problem solved', achievedOn: dateReaching(problemDays, 150) },
    { id: 's7', title: '7-day streak', detail: 'Studied 7 days in a row', achievedOn: getStreakMilestoneDate(activeDays, 7) },
    { id: 's30', title: '30-day streak', detail: 'Studied 30 days in a row', achievedOn: getStreakMilestoneDate(activeDays, 30) },
    { id: 'h10', title: '10 focus hours', detail: 'Timed deep work', achievedOn: hourReachedOn(10) },
    { id: 'h100', title: '100 focus hours', detail: 'Timed deep work', achievedOn: hourReachedOn(100) },
    ...PHASES.filter((p) => p.id !== 'p0').map((p) => ({
      id: `phase-${p.id}`,
      title: `Phase ${p.number} done`,
      detail: p.title,
      achievedOn: phaseDoneOn(p.id),
    })),
  ]

  const recent = [...sortedRows]
    .reverse()
    .map((r) => ({ row: r, task: TASK_BY_ID.get(r.task_id) }))
    .filter((x): x is { row: ProgressRow; task: RoadmapTask } => Boolean(x.task))
    .slice(0, 8)

  return {
    dayNumber: Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(ROADMAP_START)) + 1),
    planPercent: toPercent(getProgress(ALL_TASKS, doneIds)),
    solved: solvedProblems.length,
    byDifficulty,
    difficultyTotals: DIFFICULTY_TOTALS,
    categories: NEETCODE_CATEGORIES.map((c) => ({ name: c, solved: byCategory[c], total: CATEGORY_SIZES[c] })),
    activeDays: activeDays.length,
    longestStreak,
    totalMinutes,
    phases: PHASES.map((p) => ({ ...p, percent: toPercent(getProgress(getPhaseTasks(p.id), doneIds)) })),
    milestones,
    recent,
    doneIds,
  }
}
