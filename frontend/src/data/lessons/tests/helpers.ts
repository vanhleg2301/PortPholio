import type { ChoiceQuestion } from '../types'

export const PRINT = 'What does this print?'

// The first option is the correct one; the test UI shuffles options on every attempt.
export function choice(id: string, question: string, options: string[], explain: string, code?: string): ChoiceQuestion {
  return { id, question, options, answer: 0, explain, code }
}
