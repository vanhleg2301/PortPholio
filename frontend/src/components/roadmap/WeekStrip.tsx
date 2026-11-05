import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DAY_BY_DATE, clampToPlan } from '@/lib/roadmapStats'

interface WeekStripProps {
  selectedDate: string
  today: string
  doneIds: Set<string>
  onSelect: (date: string) => void
}

function getDayState(date: string, doneIds: Set<string>): 'none' | 'partial' | 'done' | 'rest' {
  const day = DAY_BY_DATE.get(date)
  if (!day || day.tasks.length === 0) return 'rest'
  const done = day.tasks.filter((t) => doneIds.has(t.id)).length
  if (done === 0) return 'none'
  return done === day.tasks.length ? 'done' : 'partial'
}

export function WeekStrip({ selectedDate, today, doneIds, onSelect }: WeekStripProps) {
  const monday = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 })
  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'))
  const shiftWeek = (weeks: number) => onSelect(clampToPlan(format(addDays(parseISO(selectedDate), weeks * 7), 'yyyy-MM-dd')))

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        aria-label="Previous week"
        className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="grid grid-cols-7 flex-1 gap-1">
        {dates.map((date) => {
          const inPlan = DAY_BY_DATE.has(date)
          const isSelected = date === selectedDate
          const state = getDayState(date, doneIds)
          return (
            <button
              key={date}
              type="button"
              disabled={!inPlan}
              onClick={() => onSelect(date)}
              aria-label={format(parseISO(date), 'EEEE d MMMM')}
              aria-pressed={isSelected}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl py-2 transition-colors',
                isSelected ? 'bg-foreground text-background' : inPlan && 'hover:bg-foreground/[0.08]',
                !inPlan && 'opacity-30'
              )}
            >
              <span className={cn('text-[10px] font-semibold uppercase', !isSelected && 'text-muted-foreground')}>
                {format(parseISO(date), 'EEEEE')}
              </span>
              <span className={cn('text-base font-semibold leading-none', date === today && !isSelected && 'text-emerald-500')}>
                {format(parseISO(date), 'd')}
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  state === 'done' && 'bg-emerald-500',
                  state === 'partial' && 'bg-emerald-500/40',
                  state === 'none' && (isSelected ? 'bg-background/30' : 'bg-foreground/15'),
                  state === 'rest' && 'bg-transparent'
                )}
              />
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => shiftWeek(1)}
        aria-label="Next week"
        className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
