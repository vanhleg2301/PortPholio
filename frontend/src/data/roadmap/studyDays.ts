import { LESSON_BY_ID, LESSON_TESTS } from '../lessons'
import { WEEKS } from './plan'
import type { RoadmapTask, RoadmapWeek } from './types'

// The plan as numbered study days (Day 1, Day 2, …) instead of calendar dates. The learner goes at
// their own pace: "Today" is the first day with something left to do.
//
// Each day holds about 1–3 hours. Calendar days of the plan (still the source of the order, the
// task ids and the week tests) are packed in order within each week: a day keeps one topic when it
// can, and light days (a few problems, a review) are joined with their neighbours. A calendar day is
// never split, so task ids, notes and saved answers keep working.

export const DAY_MAX_MINUTES = 180
const DAY_MIN_MINUTES = 60

export interface StudyDay {
  number: number
  // Stable key: the first calendar date packed into this day (notes and resources are saved under it).
  key: string
  // Every calendar date packed into this day, in order.
  dates: string[]
  // What is learned: lesson titles, NeetCode categories, the test… joined with " · ".
  title: string
  topics: string[]
  minutes: number
  tasks: RoadmapTask[]
  week: RoadmapWeek
}

// Optional tasks ("Optional: …", "HPBN: Optional: …") add no time and never hold a day open.
export const isRequiredTask = (task: RoadmapTask) => !/(^|: )Optional[: ]/.test(task.title)

const PROBLEM_MINUTES = { easy: 20, medium: 35, hard: 50 } as const

// Rough study time of one task, used only to pack days.
export function estimateMinutes(task: RoadmapTask): number {
  if (!isRequiredTask(task)) return 0
  if (task.title.startsWith('Lesson:')) {
    const lesson = task.lessonId ? LESSON_BY_ID.get(task.lessonId) : undefined
    return lesson ? lesson.minutes + (LESSON_TESTS[lesson.id] ? 30 : 0) : 75
  }
  if (task.difficulty) return PROBLEM_MINUTES[task.difficulty]
  if (task.isWeekTest) return task.title.startsWith('Month') ? 75 : 45
  return 30
}

function getTopic(task: RoadmapTask): string {
  if (task.title.startsWith('Lesson:')) return task.title.slice('Lesson:'.length).trim()
  if (task.category) return task.category
  if (task.isWeekTest) return task.title.startsWith('Month') ? 'Month test' : 'Week test'
  if (task.kind === 'review' || /^(redo|timed) /i.test(task.title)) return 'Review'
  if (task.reference) return task.reference.title
  return task.title.replace(/^(Read|Optional|HPBN|Watch|Build|Write):\s*/i, '')
}

function getTopics(tasks: RoadmapTask[]): string[] {
  const required = tasks.filter(isRequiredTask)
  return [...new Set((required.length > 0 ? required : tasks).map(getTopic))]
}

interface Chunk {
  dates: string[]
  tasks: RoadmapTask[]
  minutes: number
  topics: string[]
}

function packWeek(week: RoadmapWeek): Chunk[] {
  const chunks: Chunk[] = []
  for (const day of week.days) {
    if (day.tasks.length === 0) continue
    const minutes = day.tasks.reduce((sum, t) => sum + estimateMinutes(t), 0)
    const topics = getTopics(day.tasks)
    const last = chunks[chunks.length - 1]
    const isSameTopic = Boolean(last) && topics.every((t) => last.topics.includes(t))
    if (last && last.minutes + minutes <= DAY_MAX_MINUTES && (isSameTopic || last.minutes < DAY_MIN_MINUTES || minutes === 0)) {
      last.dates.push(day.date)
      last.tasks.push(...day.tasks)
      last.minutes += minutes
      last.topics = [...new Set([...last.topics, ...topics])]
    } else {
      chunks.push({ dates: [day.date], tasks: [...day.tasks], minutes, topics })
    }
  }
  return chunks
}

function buildStudyDays(): StudyDay[] {
  const days: StudyDay[] = []
  for (const week of WEEKS) {
    for (const chunk of packWeek(week)) {
      const last = days[days.length - 1]
      // Only optional tasks (a holiday catch-up): they join the day before instead of making a day.
      if (chunk.minutes === 0 && last) {
        last.dates.push(...chunk.dates)
        last.tasks.push(...chunk.tasks)
        continue
      }
      days.push({ number: days.length + 1, key: chunk.dates[0], dates: chunk.dates, title: chunk.topics.join(' · '), topics: chunk.topics, minutes: chunk.minutes, tasks: chunk.tasks, week })
    }
  }
  return days
}

export const STUDY_DAYS: StudyDay[] = buildStudyDays()

export const STUDY_DAY_COUNT = STUDY_DAYS.length
const BY_DATE = new Map(STUDY_DAYS.flatMap((d) => d.dates.map((date) => [date, d] as const)))
const BY_TASK = new Map(STUDY_DAYS.flatMap((d) => d.tasks.map((t) => [t.id, d] as const)))

export const getStudyDay = (number: number): StudyDay | undefined => STUDY_DAYS[number - 1]

// The study day a calendar date of the plan was packed into (old links, notes, search results). A
// date before or after the plan maps to the first or last day; a date with no tasks, to the next day.
export function getStudyDayByDate(date: string): StudyDay {
  const exact = BY_DATE.get(date)
  if (exact) return exact
  return STUDY_DAYS.find((d) => d.key > date) ?? STUDY_DAYS[STUDY_DAYS.length - 1]
}

export const getStudyDayOfTask = (taskId: string): StudyDay | undefined => BY_TASK.get(taskId)

export const getWeekDays = (week: RoadmapWeek): StudyDay[] => STUDY_DAYS.filter((d) => d.week.id === week.id)


// The first day with a required task not done yet; the last day once everything is done.
export function getCurrentDay(doneIds: Set<string>): StudyDay {
  return STUDY_DAYS.find((d) => d.tasks.some((t) => isRequiredTask(t) && !doneIds.has(t.id))) ?? STUDY_DAYS[STUDY_DAYS.length - 1]
}

// "Day 12" or "Days 12–15".
export function formatDayRange(from: number, to: number): string {
  return from === to ? `Day ${from}` : `Days ${from}–${to}`
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `~${Math.max(minutes, 15)} min`
  const hours = Math.round((minutes / 60) * 2) / 2
  return `~${hours % 1 === 0 ? hours : hours.toFixed(1)} h`
}
