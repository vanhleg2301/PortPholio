import { PYTHON_LESSONS } from './python'
import type { Lesson } from './types'

export const LESSONS: Lesson[] = [...PYTHON_LESSONS]
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))

export function getExerciseIds(lesson: Lesson): string[] {
  return lesson.blocks.flatMap((b) => (b.type === 'exercise' ? [b.id] : []))
}
