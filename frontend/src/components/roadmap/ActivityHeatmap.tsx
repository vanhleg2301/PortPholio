import { cn } from '@/lib/utils'
import { STUDY_DAYS, type StudyDay } from '@/data/roadmap/studyDays'

interface ActivityHeatmapProps {
  doneIds: Set<string>
  currentDay: StudyDay
}

function getLevelClass(ratio: number, isFuture: boolean): string {
  if (ratio === 0) return isFuture ? 'bg-foreground/[0.04]' : 'bg-foreground/[0.09]'
  if (ratio < 0.34) return 'bg-emerald-500/30'
  if (ratio < 0.67) return 'bg-emerald-500/55'
  if (ratio < 1) return 'bg-emerald-500/80'
  return 'bg-emerald-500'
}

// One square per study day, Day 1 first, filled by the share of its tasks that are done.
export function ActivityHeatmap({ doneIds, currentDay }: ActivityHeatmapProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-max">
        {STUDY_DAYS.map((day) => {
          const done = day.tasks.filter((t) => doneIds.has(t.id)).length
          const ratio = done / day.tasks.length
          const label = `Day ${day.number} · ${day.title}: ${done}/${day.tasks.length} tasks`
          return (
            <span
              key={day.number}
              title={label}
              aria-label={label}
              className={cn(
                'h-[11px] w-[11px] rounded-[2px]',
                getLevelClass(ratio, day.number > currentDay.number),
                day.number === currentDay.number && 'ring-1 ring-foreground ring-offset-1 ring-offset-background'
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
