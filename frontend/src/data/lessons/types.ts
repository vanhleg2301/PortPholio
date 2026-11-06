import type { TaskLink } from '../roadmap/types'

export type CalloutTone = 'tip' | 'warning' | 'interview'

// Markdown in lessons and tests may mark technical words as [[word]] or [[glossary key|shown text]];
// they render as tap-to-explain terms (see data/lessons/glossary.ts).
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
  // Interactive, animated diagram (components/learn/visuals).
  | { type: 'visual'; visual: VisualId; caption?: string }

export type VisualId =
  | 'aliasing'
  | 'slicing'
  | 'dynamic-array'
  | 'hash-table'
  | 'call-stack'
  | 'heap'
  | 'two-sum'
  | 'prefix-suffix'
  | 'bucket-sort'
  | 'handshake'
  | 'slow-start'
  | 'hol-blocking'
  | 'globe'

export interface ChoiceQuestion {
  id: string
  // Questions with the same concept test the same idea; a test asks one of them per attempt.
  // Defaults to the question's own id.
  concept?: string
  question: string
  // Python snippet shown under the question. For "What does this print?" questions
  // the correct option is the snippet's exact output.
  code?: string
  options: string[]
  answer: number
  explain: string
  // The page the fact comes from (filled in from tests/sources.ts).
  ref?: TaskLink
}

export interface CodeQuestion {
  id: string
  title: string
  prompt: string
  starter: string
  tests: string
  hint?: string
  solution: string
  // The original problem, when there is one (filled in from tests/sources.ts).
  ref?: TaskLink
}

// Interview-style open question: the learner answers in their own words, then compares
// with the key points and a model answer.
export interface ExplainQuestion {
  id: string
  question: string
  points: string[]
  answer: string
}

export interface LessonTest {
  choice: ChoiceQuestion[]
  code: CodeQuestion[]
  explain: ExplainQuestion[]
  // References the test was written from.
  sources?: TaskLink[]
}

export interface Lesson {
  id: string
  title: string
  summary: string
  minutes: number
  blocks: LessonBlock[]
  // Best free videos on the topic, watched before or after the lesson.
  videos?: TaskLink[]
  // Read more / extra practice — the lesson itself is meant to be enough.
  furtherReading: TaskLink[]
}
