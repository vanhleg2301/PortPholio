import type { TaskKind } from './types'

export type NoteTopic = TaskKind | 'general'

interface TopicMeta {
  label: string
  chipClass: string
  template: string
}

export const TOPICS: Record<NoteTopic, TopicMeta> = {
  python: {
    label: 'Python',
    chipClass: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
    template: '## Concept\n\n\n## Example\n```python\n\n```\n\n## Gotchas\n- \n',
  },
  dsa: {
    label: 'DSA',
    chipClass: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    template:
      '## Problem\n\n\n## Pattern\n\n\n## Approach\n1. \n\n## Complexity\n- Time: O()\n- Space: O()\n\n## Mistakes / redo\n- [ ] \n',
  },
  cs: {
    label: 'CS',
    chipClass: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
    template: '## Key idea\n\n\n## How it works\n\n\n## Interview question\n> \n\n## My answer\n\n',
  },
  sd: {
    label: 'System Design',
    chipClass: 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
    template:
      '## Requirements\n- Functional: \n- Non-functional: \n\n## Estimates\n- QPS: \n- Storage: \n\n## High-level design\n\n\n## Deep dives\n\n\n## Trade-offs\n| Option | Pros | Cons |\n| --- | --- | --- |\n|  |  |  |\n',
  },
  ai: {
    label: 'AI',
    chipClass: 'bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400',
    template: '## Goal\n\n\n## What I built\n\n\n## Results / numbers\n\n\n## Next\n- [ ] \n',
  },
  review: {
    label: 'Review',
    chipClass: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300',
    template: '## What I got wrong\n\n\n## Why\n\n\n## Redo on\n- [ ] \n',
  },
  career: {
    label: 'Career',
    chipClass: 'bg-orange-500/12 text-orange-600 dark:text-orange-400',
    template: '## Notes\n\n',
  },
  general: {
    label: 'General',
    chipClass: 'bg-foreground/[0.08] text-muted-foreground',
    template: '',
  },
}

export const TOPIC_ORDER: NoteTopic[] = ['python', 'dsa', 'cs', 'sd', 'ai', 'review', 'career', 'general']

export function isNoteTopic(value: string): value is NoteTopic {
  return value in TOPICS
}
