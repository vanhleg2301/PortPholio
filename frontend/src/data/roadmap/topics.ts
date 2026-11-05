import type { TaskKind } from './types'

export type NoteTopic = TaskKind | 'general'

interface TopicMeta {
  label: string
  chipClass: string
  // Each "## Heading" becomes a fill-in field in the note form.
  template: string
}

const CODE = '```python\n\n```'

export const TOPICS: Record<NoteTopic, TopicMeta> = {
  python: {
    label: 'Python',
    chipClass: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
    template: `## Concept\n\n## Example\n${CODE}\n\n## Gotchas\n`,
  },
  dsa: {
    label: 'DSA',
    chipClass: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    template: `## Problem\n\n## Pattern\n\n## Approach\n\n## Complexity\nTime: O()\nSpace: O()\n\n## Code\n${CODE}\n\n## Mistakes / redo\n`,
  },
  cs: {
    label: 'CS',
    chipClass: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
    template: '## Key idea\n\n## How it works\n\n## Interview question\n\n## My answer\n',
  },
  sd: {
    label: 'System Design',
    chipClass: 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
    template: '## Requirements\n\n## Estimates\n\n## High-level design\n\n## Deep dives\n\n## Trade-offs\n',
  },
  ai: {
    label: 'AI',
    chipClass: 'bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400',
    template: '## Goal\n\n## What I built\n\n## Results / numbers\n\n## Next\n',
  },
  review: {
    label: 'Review',
    chipClass: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300',
    template: '## What I got wrong\n\n## Why\n\n## Redo on\n',
  },
  career: {
    label: 'Career',
    chipClass: 'bg-orange-500/12 text-orange-600 dark:text-orange-400',
    template: '## Notes\n',
  },
  general: {
    label: 'General',
    chipClass: 'bg-foreground/[0.08] text-muted-foreground',
    template: '## Notes\n',
  },
}

export const TOPIC_ORDER: NoteTopic[] = ['python', 'dsa', 'cs', 'sd', 'ai', 'review', 'career', 'general']

// Hints shown inside empty fields of the note form.
export const SECTION_HINTS: Record<string, string> = {
  Concept: 'What is it, in your own words?',
  Example: 'A small example you wrote yourself',
  Gotchas: 'Traps and surprises to remember',
  Problem: 'Problem name and the one-line goal',
  Pattern: 'Which pattern? Why does it fit?',
  Approach: 'Steps of the solution',
  Complexity: 'Time and space',
  Code: 'Your final solution',
  'Mistakes / redo': 'What went wrong, and when to redo it',
  'Key idea': 'The one thing to remember',
  'How it works': 'Explain the mechanism step by step',
  'Interview question': 'A question an interviewer could ask',
  'My answer': 'Answer it without looking at notes',
  Requirements: 'Functional and non-functional requirements',
  Estimates: 'Users, QPS, storage',
  'High-level design': 'Main components and how data flows',
  'Deep dives': 'The hardest parts and how you solve them',
  'Trade-offs': 'What you chose, what you gave up',
}

export function isNoteTopic(value: string): value is NoteTopic {
  return value in TOPICS
}
