import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { getWeekday } from '@/data/roadmap/plan'
import { ALL_DAYS } from '@/lib/roadmapStats'

interface ActivityHeatmapProps {
  doneIds: Set<string>
  today: string
}

function getLevelClass(ratio: number, isFuture: boolean): string {
  if (ratio === 0) return isFuture ? 'bg-foreground/[0.04]' : 'bg-foreground/[0.09]'
  if (ratio < 0.34) return 'bg-emerald-500/30'
  if (ratio < 0.67) return 'bg-emerald-500/55'
  if (ratio < 1) return 'bg-emerald-500/80'
  return 'bg-emerald-500'
}

export function ActivityHeatmap({ doneIds, today }: ActivityHeatmapProps) {
  const leadingBlanks = (getWeekday(ALL_DAYS[0].date) + 6) % 7

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-max">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} className="h-[11px] w-[11px]" />
        ))}
        {ALL_DAYS.map((day) => {
          const done = day.tasks.filter((t) => doneIds.has(t.id)).length
          const ratio = day.tasks.length === 0 ? 0 : done / day.tasks.length
          const label = `${format(parseISO(day.date), 'EEE d MMM yyyy')}: ${done}/${day.tasks.length} tasks`
          return (
            <span
              key={day.date}
              title={label}
              aria-label={label}
              className={cn(
                'h-[11px] w-[11px] rounded-[2px]',
                getLevelClass(ratio, day.date > today),
                day.date === today && 'ring-1 ring-foreground ring-offset-1 ring-offset-background'
              )}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Less</span>
        {[0, 0.2, 0.5, 0.8, 1].map((r) => (
          <span key={r} className={cn('h-[11px] w-[11px] rounded-[2px]', getLevelClass(r, false))} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
