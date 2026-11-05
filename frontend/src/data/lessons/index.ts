import { CS_LESSONS } from './cs'
import { DSA_LESSONS } from './dsa'
import { PYTHON_LESSONS } from './python'
import type { Lesson } from './types'

export const LESSONS: Lesson[] = [...PYTHON_LESSONS, ...DSA_LESSONS, ...CS_LESSONS]
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]))

// NeetCode category → the lesson that teaches it (and has its exercises).
export const CATEGORY_LESSON: Record<string, string> = {
  'Arrays & Hashing': 'dsa-arrays-hashing',
}

export function getExerciseIds(lesson: Lesson): string[] {
  return lesson.blocks.flatMap((b) => (b.type === 'exercise' ? [b.id] : []))
}
