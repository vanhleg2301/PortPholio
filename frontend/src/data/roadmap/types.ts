export type TaskKind = 'python' | 'dsa' | 'cs' | 'sd' | 'ai' | 'review' | 'career'

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'

export interface TaskLink {
  label: string
  url: string
}

// Short "theory" card shown under a task: key points + one official source to read.
export interface TaskReference {
  title: string
  source: TaskLink
  points: string[]
  example?: string
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
