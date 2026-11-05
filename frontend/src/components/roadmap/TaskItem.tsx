import { Check, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapTask, TaskKind } from '@/data/roadmap/types'

const KIND_LABEL: Record<TaskKind, string> = {
  python: 'Python',
  dsa: 'DSA',
  cs: 'CS',
  sd: 'System Design',
  ai: 'AI',
  review: 'Review',
  career: 'Career',
}

const DIFFICULTY_CLASS = {
  easy: 'text-easy',
  medium: 'text-medium',
  hard: 'text-hard',
} as const

interface TaskItemProps {
  task: RoadmapTask
  isDone: boolean
  onToggle?: (taskId: string, isDone: boolean) => void
}

export function TaskItem({ task, isDone, onToggle }: TaskItemProps) {
  const canToggle = Boolean(onToggle)

  return (
    <li className="flex items-start gap-3 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Mark "${task.title}" as ${isDone ? 'not done' : 'done'}`}
        disabled={!canToggle}
        onClick={() => onToggle?.(task.id, !isDone)}
        className={cn(
          'mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[5px] border flex items-center justify-center transition-colors',
          isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-foreground/25',
          canToggle ? 'cursor-pointer hover:border-foreground' : 'cursor-default'
        )}
      >
        {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {KIND_LABEL[task.kind]}
          </span>
          {task.difficulty && (
            <span className={cn('text-[10px] font-semibold uppercase tracking-widest', DIFFICULTY_CLASS[task.difficulty])}>
              {task.difficulty}
            </span>
          )}
        </div>
        <p className={cn('text-sm leading-snug mt-0.5', isDone && 'text-muted-foreground line-through decoration-foreground/30')}>
          {task.title}
        </p>
        {task.links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {task.links.map((l) => (
              <a
                key={l.label + l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                {l.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}
