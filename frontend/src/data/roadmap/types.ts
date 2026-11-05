export type TaskKind = 'python' | 'dsa' | 'cs' | 'sd' | 'ai' | 'review' | 'career'

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

export interface TaskLink {
  label: string
  url: string
}

// "Theory" card shown with a task. Text fields may use `backticks` for inline code.
export interface TaskReference {
  title: string
  // One sentence: the mental model. Shown even when the card is collapsed.
  summary?: string
  // Signals in a problem statement that point to this pattern.
  recognize?: string[]
  // Where this shows up in real engineering work.
  inWork?: string[]
  // How it works under the hood.
  points: string[]
  complexity?: Array<{ op: string; cost: string; note?: string }>
  example?: string
  pitfalls?: Array<{ title: string; fix: string }>
  interview?: { when: string; problems: string[] }
  quiz?: Array<{ question: string; answer: string }>
  source: TaskLink
  extraSource?: TaskLink
}

export interface TaskSeed {
  kind: TaskKind
  title: string
  links: TaskLink[]
  difficulty?: ProblemDifficulty
  // NeetCode category, set on problem tasks only.
  category?: string
  reference?: TaskReference
}

export interface RoadmapTask extends TaskSeed {
  id: string
}

export interface RoadmapDay {
  date: string
  tasks: RoadmapTask[]
}

export type PhaseId = 'p0' | 'p1' | 'p2' | 'p3' | 'p4'

export interface RoadmapWeek {
  id: string
  label: string
  phaseId: PhaseId
  start: string
  end: string
  goal: string
  days: RoadmapDay[]
}

export interface RoadmapPhase {
  id: PhaseId
  number: string
  title: string
  start: string
  end: string
  goal: string
  selfCheck: RoadmapTask[]
}
