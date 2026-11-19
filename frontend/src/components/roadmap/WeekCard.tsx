import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DayCard } from '@/components/roadmap/DayCard'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { getProgress, toPercent } from '@/lib/roadmapStats'
import { appear } from '@/lib/motion'
import type { RoadmapWeek } from '@/data/roadmap/types'
import { formatDayRange, getWeekDays, type StudyDay } from '@/data/roadmap/studyDays'

interface WeekCardProps {
  week: RoadmapWeek
  doneIds: Set<string>
  currentDay: StudyDay
  onToggle: (taskId: string, isDone: boolean) => void
  onOpenDay: (day: number) => void
}

export function WeekCard({ week, doneIds, currentDay, onToggle, onOpenDay }: WeekCardProps) {
  const days = getWeekDays(week)
  const isCurrent = currentDay.week.id === week.id
  const [isOpen, setIsOpen] = useState(isCurrent)
  const progress = getProgress(days.flatMap((d) => d.tasks), doneIds)
  const percent = toPercent(progress)
  const range = days.length > 0 ? formatDayRange(days[0].number, days[days.length - 1].number) : ''

  return (
    <div className={cn('border-b border-border', isCurrent && 'bg-foreground/[0.02]')}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="text-left py-5 md:py-6 -mx-3 px-3 w-[calc(100%+1.5rem)] rounded-xl hover:bg-foreground/[0.04] transition-colors grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_120px_auto] gap-x-6 gap-y-2 items-center group"
      >
        <div>
          <p className="font-display font-bold uppercase tracking-tight text-lg md:text-xl">
            {week.label}
            {isCurrent && <span className="ml-2 align-middle text-[10px] tracking-widest text-emerald-500">Now</span>}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">{range}</p>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all md:order-last', isOpen && 'rotate-180')}
        />
        <p className="col-span-2 md:col-span-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {week.goal}
        </p>
        <div className="col-span-2 md:col-span-1 flex items-center gap-3">
          <ProgressBar percent={percent} />
          <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{percent}%</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pb-8">
              {days.map((day, i) => (
                <motion.div key={day.number} {...appear(i)}>
                <DayCard
                  day={day}
                  doneIds={doneIds}
                  isToday={day.number === currentDay.number}
                  onToggle={onToggle}
                  onOpen={onOpenDay}
                />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
