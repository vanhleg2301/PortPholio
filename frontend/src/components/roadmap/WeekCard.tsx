import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { DayCard } from '@/components/roadmap/DayCard'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { getProgress, toPercent } from '@/lib/roadmapStats'
import type { RoadmapWeek } from '@/data/roadmap/types'

interface WeekCardProps {
  week: RoadmapWeek
  doneIds: Set<string>
  today: string
  onToggle?: (taskId: string, isDone: boolean) => void
}

export function WeekCard({ week, doneIds, today, onToggle }: WeekCardProps) {
  const isCurrent = today >= week.start && today <= week.end
  const [isOpen, setIsOpen] = useState(isCurrent)
  const progress = getProgress(week.days.flatMap((d) => d.tasks), doneIds)
  const percent = toPercent(progress)
  const range = `${format(parseISO(week.start), 'd MMM')} – ${format(parseISO(week.end), 'd MMM yyyy')}`

  return (
    <div className={cn('border-b border-border', isCurrent && 'bg-foreground/[0.02]')}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full text-left py-5 md:py-6 grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_120px_auto] gap-x-6 gap-y-2 items-center group"
      >
        <div>
          <p className="font-display font-bold uppercase tracking-tight text-lg md:text-xl">
            {week.label}
            {isCurrent && <span className="ml-2 align-middle text-[10px] tracking-widest text-emerald-500">Now</span>}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">{range}</p>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform md:order-last', isOpen && 'rotate-180')}
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
              {week.days.map((day) => (
                <DayCard
                  key={day.date}
                  day={day}
                  doneIds={doneIds}
                  isToday={day.date === today}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
