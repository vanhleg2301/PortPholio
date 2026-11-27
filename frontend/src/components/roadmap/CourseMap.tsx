import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { PHASES } from '@/data/roadmap/plan'
import { MAIN_TRACK, formatDayRange, getDayState, getModuleTitle, getTrackModules, type DayState, type StudyDay } from '@/data/roadmap/studyDays'

function StateDot({ state, className }: { state: DayState; className?: string }) {
  return (
    <span
      className={cn(
        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
        state === 'done' ? 'bg-emerald-500' : state === 'partial' ? 'bg-emerald-500/40' : 'bg-foreground/15',
        className
      )}
    />
  )
}

interface CourseMapProps {
  selectedDay: StudyDay
  currentDay: StudyDay
  doneIds: Set<string>
  // Mark the selected day (off while another tab is on screen).
  isSelectionShown: boolean
  onSelect: (day: number) => void
}

// Every week (main plan) or module (private track) with its days; the module of the selected day
// starts open, the others fold so the whole course fits on one screen.
export function CourseMap({ selectedDay, currentDay, doneIds, isSelectionShown, onSelect }: CourseMapProps) {
  const track = selectedDay.track
  const modules = getTrackModules(track)
  const isMain = track === MAIN_TRACK
  const [openIds, setOpenIds] = useState(() => new Set([selectedDay.week.id]))
  const [lastWeekId, setLastWeekId] = useState(selectedDay.week.id)
  if (selectedDay.week.id !== lastWeekId) {
    setLastWeekId(selectedDay.week.id)
    setOpenIds((ids) => new Set(ids).add(selectedDay.week.id))
  }
  const selectedRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    // Only the map's own scroll box moves (scrollIntoView would scroll the page as well).
    const item = selectedRef.current
    const box = item?.closest<HTMLElement>('[data-course-map-scroll]')
    if (!item || !box) return
    const top = item.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
    if (top < box.scrollTop || top + item.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top - box.clientHeight / 3
  }, [selectedDay.number])

  const toggle = (id: string) =>
    setOpenIds((ids) => {
      const next = new Set(ids)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <ol className="flex flex-col gap-1">
      {modules.map((module, index) => {
        const { week, days } = module
        const isOpen = openIds.has(week.id)
        const doneDays = days.filter((d) => getDayState(d, doneIds) === 'done').length
        const isComplete = doneDays === days.length
        const hasCurrent = days.some((d) => d.number === currentDay.number)
        const phase = isMain && week.phaseId !== modules[index - 1]?.week.phaseId ? PHASES.find((p) => p.id === week.phaseId) : undefined
        return (
          <li key={week.id}>
            {phase && (
              <p className={cn('px-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground', index > 0 && 'pt-4')}>
                {phase.label ?? `Phase ${phase.number}`} · {phase.title}
              </p>
            )}
            <button
              type="button"
              onClick={() => toggle(week.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-foreground/[0.05] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {!isMain && `Module ${module.number} · `}
                  {formatDayRange(days[0].number, days[days.length - 1].number)}
                  {hasCurrent && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-label="You are here" />}
                </span>
                <span className="mt-0.5 block text-sm font-semibold leading-snug">{getModuleTitle(week.label)}</span>
                <ProgressBar percent={Math.round((doneDays / days.length) * 100)} className="mt-1.5" />
              </div>
              <span className="flex shrink-0 items-center gap-1 pt-3 font-mono text-[11px] text-muted-foreground">
                {isComplete ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : `${doneDays}/${days.length}`}
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  {week.goal && <p className="px-3 pb-1.5 text-xs leading-relaxed text-muted-foreground">{week.goal}</p>}
                  <ul className="flex flex-col gap-0.5 pb-2">
                    {days.map((day) => {
                      const isSelected = isSelectionShown && day.number === selectedDay.number
                      return (
                        <li key={day.number}>
                          <button
                            ref={isSelected ? selectedRef : undefined}
                            type="button"
                            onClick={() => onSelect(day.number)}
                            aria-current={isSelected ? 'step' : undefined}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                              isSelected ? 'bg-foreground/[0.08]' : 'hover:bg-foreground/[0.05]'
                            )}
                          >
                            <span
                              className={cn(
                                'w-12 shrink-0 pt-px text-[11px] font-semibold uppercase tabular-nums',
                                day.number === currentDay.number ? 'text-emerald-500' : 'text-muted-foreground'
                              )}
                            >
                              Day {day.number}
                            </span>
                            <span className="min-w-0 flex-1 text-sm leading-snug line-clamp-2">{day.title}</span>
                            <StateDot state={getDayState(day, doneIds)} className="mt-1.5" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}
