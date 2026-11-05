import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { TaskItem } from '@/components/roadmap/TaskItem'
import type { RoadmapDay } from '@/data/roadmap/types'

interface DayCardProps {
  day: RoadmapDay
  doneIds: Set<string>
  isToday: boolean
  onToggle?: (taskId: string, isDone: boolean) => void
}

export function DayCard({ day, doneIds, isToday, onToggle }: DayCardProps) {
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
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <p className="text-xs font-semibold uppercase tracking-widest">
          {format(parseISO(day.date), 'EEE d MMM')}
          {isToday && <span className="ml-2 text-emerald-500">Today</span>}
        </p>
        <span className="text-[11px] font-mono text-muted-foreground">
          {day.tasks.length === 0 ? 'rest' : `${done}/${day.tasks.length}`}
        </span>
      </div>
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
