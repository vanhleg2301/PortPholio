import { motion } from 'framer-motion'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { CalendarCheck, ChevronLeft, ChevronRight, Library, Map as MapIcon, NotebookPen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'
import { DAY_BY_DATE, clampToPlan, getWeekForDate } from '@/lib/roadmapStats'
import type { RoadmapTab } from '@/components/roadmap/BottomTabBar'

const NAV: Array<{ id: RoadmapTab; label: string; icon: LucideIcon }> = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'plan', label: 'Plan', icon: MapIcon },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
]

interface DesktopSidebarProps {
  tab: RoadmapTab
  selectedDate: string
  today: string
  doneIds: Set<string>
  onChangeTab: (tab: RoadmapTab) => void
  onSelectDate: (date: string) => void
}

export function DesktopSidebar({ tab, selectedDate, today, doneIds, onChangeTab, onSelectDate }: DesktopSidebarProps) {
  const monday = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 })
  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'))
  const week = getWeekForDate(selectedDate)
  const shiftWeek = (weeks: number) => onSelectDate(clampToPlan(format(addDays(parseISO(selectedDate), weeks * 7), 'yyyy-MM-dd')))

  return (
    <nav className="flex flex-col gap-8" aria-label="Roadmap">
      <ul className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onChangeTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                tab === id ? 'text-background' : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
              )}
            >
              {tab === id && <motion.span layoutId="sidebar-nav" transition={SPRING} className="absolute inset-0 rounded-xl bg-foreground" />}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{week?.label ?? 'Week'}</p>
          <div className="flex">
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              aria-label="Previous week"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              aria-label="Next week"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ul className="flex flex-col gap-0.5">
          {dates.map((date) => {
            const day = DAY_BY_DATE.get(date)
            const total = day?.tasks.length ?? 0
            const done = day?.tasks.filter((t) => doneIds.has(t.id)).length ?? 0
            const isSelected = date === selectedDate && tab === 'today'
            return (
              <li key={date}>
                <button
                  type="button"
                  disabled={!day}
                  onClick={() => {
                    onSelectDate(date)
                    onChangeTab('today')
                  }}
                  className={cn(
                    'relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors disabled:opacity-30',
                    isSelected ? 'bg-foreground/[0.08]' : 'hover:bg-foreground/[0.05]'
                  )}
                >
                  <span className={cn('w-9 text-[11px] font-semibold uppercase', date === today ? 'text-emerald-500' : 'text-muted-foreground')}>
                    {format(parseISO(date), 'EEE')}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{format(parseISO(date), 'd MMM')}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{total === 0 ? '—' : `${done}/${total}`}</span>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      total > 0 && done === total ? 'bg-emerald-500' : done > 0 ? 'bg-emerald-500/40' : 'bg-foreground/15'
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
        {week && <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">{week.goal}</p>}
      </section>
    </nav>
  )
}
