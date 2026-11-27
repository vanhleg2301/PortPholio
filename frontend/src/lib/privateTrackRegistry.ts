import { LESSON_BY_ID, LESSON_TESTS } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import type { Lesson, LessonBlock, LessonTest } from '@/data/lessons/types'
import type { RoadmapTask, RoadmapWeek } from '@/data/roadmap/types'
import { registerTrackDays, type StudyDay } from '@/data/roadmap/studyDays'
import { TASK_BY_ID } from '@/lib/roadmapStats'
import { trackSchema } from '@/lib/privateTrackSchema'

// Turns a private track (see lib/privateTracks.ts) into study days and adds its lessons, tests,
// words and tasks to the shared lookups, so lesson pages, tests and Today work unchanged.

export interface PrivateTrack {
  id: string
  title: string
  about: string
  checkedOn: string
  days: StudyDay[]
}

const TEST_MINUTES = 30
const TASK_MINUTES = 30

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// Adds the track to the shared lookups and returns its days. Task ids depend on the lesson or task,
// not on the day, so moving a lesson to another day keeps its progress.
export function registerTrack(raw: unknown): PrivateTrack {
  const track = trackSchema.parse(raw)
  const lessons = new Map(track.lessons.map((l) => [l.id, l as Lesson & { blocks: LessonBlock[] }]))
  for (const lesson of lessons.values()) LESSON_BY_ID.set(lesson.id, lesson)
  for (const [lessonId, test] of Object.entries(track.tests)) {
    const built: LessonTest = {
      sources: test.sources,
      choice: test.choice.map((q) => ({ ...q, answer: 0, primer: q.primer && { ...q.primer, lessonId } })),
      code: [],
      explain: test.explain.map((q) => ({ ...q, primer: q.primer && { ...q.primer, lessonId } })),
    }
    LESSON_TESTS[lessonId] = built
  }
  for (const [key, entry] of Object.entries(track.glossary)) {
    if (!GLOSSARY[key]) GLOSSARY[key] = { area: 'System design', ...entry }
  }

  const days: StudyDay[] = []
  for (const module of track.modules) {
    const week: RoadmapWeek = { id: `${track.id}:${module.id}`, label: module.title, phaseId: 'p0', start: '', end: '', goal: module.goal, days: [] }
    for (const day of module.days) {
      const lessonTasks: RoadmapTask[] = day.lessons.flatMap((id) => {
        const lesson = lessons.get(id)
        return lesson ? [{ id: `${track.id}:${id}`, kind: 'career', title: `Lesson: ${lesson.title}`, links: [], lessonId: id }] : []
      })
      const otherTasks: RoadmapTask[] = day.tasks.map((t) => ({
        id: `${track.id}:task:${slugify(t.title)}`,
        kind: 'career',
        title: t.title,
        links: t.link ? [t.link] : [],
      }))
      const tasks = [...lessonTasks, ...otherTasks]
      if (tasks.length === 0) continue
      const minutes =
        day.lessons.reduce((sum, id) => sum + (lessons.get(id)?.minutes ?? 0) + (track.tests[id] ? TEST_MINUTES : 0), 0) + day.tasks.length * TASK_MINUTES
      const topics = [...new Set(day.lessons.flatMap((id) => (lessons.has(id) ? [lessons.get(id)?.title ?? id] : [])))]
      days.push({
        track: track.id,
        number: days.length + 1,
        key: `${track.id}-${days.length + 1}`,
        dates: [],
        title: topics.length > 0 ? topics.join(' · ') : (day.tasks[0]?.title ?? module.title),
        topics,
        minutes,
        tasks,
        week,
      })
    }
  }
  for (const day of days) for (const task of day.tasks) TASK_BY_ID.set(task.id, task)
  registerTrackDays(track.id, days)
  return { id: track.id, title: track.title, about: track.about, checkedOn: track.checkedOn, days }
}

