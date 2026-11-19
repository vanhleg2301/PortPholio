import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDY_DAYS, getWeekDays, type StudyDay } from '@/data/roadmap/studyDays'
import { SPRING, slide } from '@/lib/motion'

interface DayStripProps {
  day: StudyDay
  currentDay: StudyDay
  doneIds: Set<string>
  onSelect: (day: number) => void
}

function getDayState(day: StudyDay, doneIds: Set<string>): 'none' | 'partial' | 'done' {
  const done = day.tasks.filter((t) => doneIds.has(t.id)).length
  if (done === 0) return 'none'
  return done === day.tasks.length ? 'done' : 'partial'
}

// Phone: the study days of the selected day's week; the arrows jump to the week before or after.
export function DayStrip({ day, currentDay, doneIds, onSelect }: DayStripProps) {
  const days = getWeekDays(day.week)
  const weekId = day.week.id
  const [lastWeek, setLastWeek] = useState({ id: weekId, first: days[0].number })
  const [direction, setDirection] = useState(1)
  if (weekId !== lastWeek.id) {
    setDirection(days[0].number > lastWeek.first ? 1 : -1)
    setLastWeek({ id: weekId, first: days[0].number })
  }
  const previous = STUDY_DAYS[days[0].number - 2]
  const next = STUDY_DAYS[days[days.length - 1].number]

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => previous && onSelect(getWeekDays(previous.week)[0].number)}
          disabled={!previous}
          aria-label="Previous week"
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div key={weekId} custom={direction} variants={slide} initial="enter" animate="center" exit="exit" className="flex gap-1">
              {days.map((d) => {
                const isSelected = d.number === day.number
                const state = getDayState(d, doneIds)
                return (
                  <motion.button
                    key={d.number}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => onSelect(d.number)}
                    aria-label={`Day ${d.number}: ${d.title}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors duration-200',
                      isSelected ? 'text-background' : 'hover:bg-foreground/[0.08]'
                    )}
                  >
                    {isSelected && <motion.span layoutId="day-strip-pill" transition={SPRING} className="absolute inset-0 -z-0 rounded-xl bg-foreground" />}
                    <span className={cn('relative text-[10px] font-semibold uppercase', !isSelected && 'text-muted-foreground')}>Day</span>
                    <span
                      className={cn(
                        'relative text-base font-semibold leading-none tabular-nums',
                        d.number === currentDay.number && !isSelected && 'text-emerald-500'
                      )}
                    >
                      {d.number}
                    </span>
                    <span
                      className={cn(
                        'relative h-1.5 w-1.5 rounded-full transition-colors duration-300',
                        state === 'done' && 'bg-emerald-500',
                        state === 'partial' && 'bg-emerald-500/40',
                        state === 'none' && (isSelected ? 'bg-background/30' : 'bg-foreground/15')
                      )}
                    />
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => next && onSelect(next.number)}
          disabled={!next}
          aria-label="Next week"
          className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{day.week.label}</p>
    </div>
  )
}
