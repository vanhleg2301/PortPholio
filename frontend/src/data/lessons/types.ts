import type { TaskLink } from '../roadmap/types'

export type CalloutTone = 'tip' | 'warning' | 'interview'

export type LessonBlock =
  | { type: 'text'; md: string }
  | { type: 'callout'; tone: CalloutTone; md: string }
  // Runnable example; the learner can edit and run it.
  | { type: 'code'; id: string; code: string; caption?: string }
  // Mermaid source: flowcharts, mind maps, sequence diagrams.
  | { type: 'diagram'; mermaid: string; caption?: string }
  // Auto-checked exercise: `tests` (Python asserts) run after the learner's code.
  | {
      type: 'exercise'
      id: string
      title: string
      prompt: string
      starter: string
      tests: string
      hint?: string
      solution: string
    }
  | { type: 'quiz'; items: Array<{ question: string; answer: string }> }

export interface Lesson {
  id: string
  title: string
  summary: string
  minutes: number
  blocks: LessonBlock[]
  // Read more / extra practice — the lesson itself is meant to be enough.
  furtherReading: TaskLink[]
}
