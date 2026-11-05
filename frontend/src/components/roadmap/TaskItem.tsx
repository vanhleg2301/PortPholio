import { Check, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOPICS } from '@/data/roadmap/topics'
import type { RoadmapTask } from '@/data/roadmap/types'

const DIFFICULTY_CLASS = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
} as const

interface TaskItemProps {
  task: RoadmapTask
  isDone: boolean
  onToggle: (taskId: string, isDone: boolean) => void
}

export function TaskItem({ task, isDone, onToggle }: TaskItemProps) {
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Mark "${task.title}" as ${isDone ? 'not done' : 'done'}`}
        onClick={() => onToggle(task.id, !isDone)}
        className="-m-2 p-2 shrink-0"
      >
        <span
          className={cn(
            'h-6 w-6 rounded-md border-[1.5px] flex items-center justify-center transition-colors',
            isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-foreground/30 hover:border-foreground'
          )}
        >
          {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {TOPICS[task.kind].label}
          </span>
          {task.difficulty && (
            <span className={cn('text-[10px] font-semibold uppercase tracking-widest', DIFFICULTY_CLASS[task.difficulty])}>
              {task.difficulty}
            </span>
          )}
        </div>
        <p className={cn('text-[15px] leading-snug mt-0.5', isDone && 'text-muted-foreground line-through decoration-foreground/30')}>
          {task.title}
        </p>
        {task.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {task.links.map((l) => (
              <a
                key={l.label + l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium hover:bg-foreground/[0.12] active:bg-foreground/[0.16] transition-colors"
              >
                {l.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}
