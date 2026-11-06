import { LESSON_TESTS, isLessonTestPassed } from '@/data/lessons'
import type { ChoiceQuestion } from '@/data/lessons/types'
import type { RoadmapTask, RoadmapWeek } from '@/data/roadmap/types'

// Progress rows for week tests use this as their lesson_id and the test day (yyyy-mm-dd) as item_id.
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
  const lessonIds = getTestedLessonIds(week.days.filter((d) => d.date <= testDay).flatMap((d) => d.tasks))
  return lessonIds.flatMap((id) => LESSON_TESTS[id].choice)
}

export function isWeekTestPassed(testDay: string, passed: Set<string>): boolean {
  return passed.has(`${WEEK_TEST_LESSON}:${testDay}`)
}

// A lesson task can only be ticked after its test; a week-test task after the week test.
export function isTaskLocked(task: RoadmapTask, passed: Set<string>): boolean {
  if (task.isWeekTest) return !isWeekTestPassed(task.id.slice(0, 10), passed)
  if (isLessonTask(task) && task.lessonId) return !isLessonTestPassed(task.lessonId, passed)
  return false
}
