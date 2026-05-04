export type Difficulty = 'easy' | 'medium' | 'hard'
export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go'
export type SubmissionStatus = 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'

export const LANGUAGES: Language[] = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go']
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export const DIFFICULTY_COLORS = {
  easy: '#00b8a3',
  medium: '#ffc01e',
  hard: '#ff375f',
} as const satisfies Record<Difficulty, string>

export interface ProblemExample {
  input: string
  output: string
  explanation?: string
}

export interface ProblemListItem {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  acceptanceRate: number
  orderIndex: number
  is_solved?: boolean
  tags?: Array<{ name: string; slug: string }>
}

export interface ProblemDetail extends ProblemListItem {
  description: string
  constraints: string
  examples: ProblemExample[]
  starterCode: Record<Language, string>
  solutionCode?: Record<Language, string>
  timeComplexity?: string
  spaceComplexity?: string
}

export interface SubmitPayload {
  language: Language
  code: string
}

export interface SubmitResult {
  status: SubmissionStatus
  runtime_ms?: number
  memory_kb?: number
  error_message?: string
  stdout?: string
}
