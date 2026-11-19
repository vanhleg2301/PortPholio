import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { formatStudyTime, type StudyDay } from '@/data/roadmap/studyDays'

interface DayCardProps {
  day: StudyDay
  doneIds: Set<string>
  isToday: boolean
  onToggle: (taskId: string, isDone: boolean) => void
  onOpen: (day: number) => void
}

export function DayCard({ day, doneIds, isToday, onToggle, onOpen }: DayCardProps) {
  const done = day.tasks.filter((t) => doneIds.has(t.id)).length
  const isComplete = day.tasks.length > 0 && done === day.tasks.length

  return (
    <div
      className={cn(
        'rounded-xl border p-4 bg-card/40',
        isToday ? 'border-foreground/50' : 'border-border',
        isComplete && 'border-emerald-500/40'
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(day.number)}
        className="group -mx-2 -mt-1 w-[calc(100%+1rem)] flex items-start justify-between gap-3 rounded-lg px-2 pt-1 pb-2 border-b border-border/60 text-left hover:bg-foreground/[0.06] transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-widest">
            Day {day.number} · {formatStudyTime(day.minutes)}
            {isToday && <span className="ml-2 text-emerald-500">Today</span>}
          </span>
          <span className="mt-0.5 block text-sm font-semibold leading-snug">{day.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[11px] font-mono text-muted-foreground group-hover:text-foreground">
          {`${done}/${day.tasks.length}`}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
      {day.tasks.length === 0 ? (
        <p className="pt-3 text-sm text-muted-foreground">Rest day.</p>
      ) : (
        <ul className="divide-y divide-border/40">
          {day.tasks.map((task) => (
            <TaskItem key={task.id} task={task} isDone={doneIds.has(task.id)} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </div>
  )
}
