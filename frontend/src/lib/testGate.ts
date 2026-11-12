import { LESSON_TESTS, getTestItemIds, isLessonTestPassed } from '@/data/lessons'
import { MOCK_TESTS, type MockTest } from '@/data/lessons/mockTests'
import type { ChoiceQuestion, LessonTest } from '@/data/lessons/types'
import { PHASES, WEEKS } from '@/data/roadmap/plan'
import type { RoadmapTask, RoadmapWeek } from '@/data/roadmap/types'

// Progress rows for quiz-only week tests use this as their lesson_id and the test day (yyyy-mm-dd) as item_id.
export const WEEK_TEST_LESSON = 'week-test'
export const WEEK_TEST_SIZE = 15

export function isLessonTask(task: RoadmapTask): boolean {
  return Boolean(task.lessonId) && task.title.startsWith('Lesson:')
}

// Lessons with a test that are taught by the given tasks, in task order.
export function getTestedLessonIds(tasks: RoadmapTask[]): string[] {
  const ids = tasks.flatMap((t) => (isLessonTask(t) && t.lessonId && LESSON_TESTS[t.lessonId] ? [t.lessonId] : []))
  return [...new Set(ids)]
}

// Questions from the lessons of this week taught on or before the test day — never from a
// lesson that comes later (a week can have two Sundays, like Week 0).
export function getWeekTestQuestions(week: RoadmapWeek, testDay: string): ChoiceQuestion[] {
  return getQuestionsFrom([week], testDay)
}

function getQuestionsFrom(weeks: RoadmapWeek[], testDay: string): ChoiceQuestion[] {
  const lessonIds = getTestedLessonIds(weeks.flatMap((w) => w.days).filter((d) => d.date <= testDay).flatMap((d) => d.tasks))
  return lessonIds.flatMap((id) => LESSON_TESTS[id].choice)
}

export const getMockTestId = (testDay: string) => `mock-${testDay}`

export interface DayMockTest {
  id: string
  mock: MockTest
  // Quiz pool (the lessons of the week, or of the whole month) plus the coding and interview parts.
  test: LessonTest
}

// The interview-style test of a test day: the week's lessons for a week test, every lesson of
// the month so far for a month test.
export function getDayMockTest(testDay: string): DayMockTest | null {
  const mock = MOCK_TESTS[testDay]
  if (!mock) return null
  const week = WEEKS.find((w) => w.start <= testDay && testDay <= w.end)
  if (!week) return null
  const phase = PHASES.find((p) => p.id === week.phaseId)
  const weeks = mock.kind === 'month' && phase ? WEEKS.filter((w) => w.phaseId === phase.id) : [week]
  return { id: getMockTestId(testDay), mock, test: { choice: getQuestionsFrom(weeks, testDay), code: mock.code, explain: mock.explain } }
}

export function isMockPassed(day: DayMockTest, passed: Set<string>): boolean {
  return getTestItemIds(day.test).every((item) => passed.has(`${day.id}:${item}`))
}

export function isWeekTestPassed(testDay: string, passed: Set<string>): boolean {
  const day = getDayMockTest(testDay)
  if (day) return isMockPassed(day, passed)
  return passed.has(`${WEEK_TEST_LESSON}:${testDay}`)
}

// A week test without anything to test (no lesson with a test that week, no mock) stays open.
function hasWeekTest(testDay: string): boolean {
  if (getDayMockTest(testDay)) return true
  const week = WEEKS.find((w) => w.start <= testDay && testDay <= w.end)
  return Boolean(week) && getWeekTestQuestions(week as RoadmapWeek, testDay).length > 0
}

// A lesson task can only be ticked after its test; a week-test task after the week test.
export function isTaskLocked(task: RoadmapTask, passed: Set<string>): boolean {
  if (task.isWeekTest) {
    const testDay = task.id.slice(0, 10)
    return hasWeekTest(testDay) && !isWeekTestPassed(testDay, passed)
  }
  if (isLessonTask(task) && task.lessonId) return !isLessonTestPassed(task.lessonId, passed)
  return false
}
