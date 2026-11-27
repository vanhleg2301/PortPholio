import { motion } from 'framer-motion'
import { CalendarCheck, ChevronLeft, ChevronRight, Library, Map as MapIcon, NotebookPen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'
import { getTrackDays, getWeekDays, type StudyDay } from '@/data/roadmap/studyDays'
import type { RoadmapTab } from '@/components/roadmap/BottomTabBar'

const NAV: Array<{ id: RoadmapTab; label: string; icon: LucideIcon }> = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'plan', label: 'Plan', icon: MapIcon },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
]

interface DesktopSidebarProps {
  tab: RoadmapTab
  selectedDay: StudyDay
  currentDay: StudyDay
  doneIds: Set<string>
  onChangeTab: (tab: RoadmapTab) => void
  onOpenDay: (day: number) => void
}

export function DesktopSidebar({ tab, selectedDay, currentDay, doneIds, onChangeTab, onOpenDay }: DesktopSidebarProps) {
  const week = selectedDay.week
  const days = getWeekDays(week)
  const trackDays = getTrackDays(selectedDay.track)
  const previous = trackDays[days[0].number - 2]
  const next = trackDays[days[days.length - 1].number]
  const shiftWeek = (target: StudyDay | undefined) => target && onOpenDay(getWeekDays(target.week)[0].number)

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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{week.label}</p>
          <div className="flex">
            <button
              type="button"
              onClick={() => shiftWeek(previous)}
              disabled={!previous}
              aria-label="Previous week"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftWeek(next)}
              disabled={!next}
              aria-label="Next week"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ul className="flex flex-col gap-0.5">
          {days.map((day) => {
            const total = day.tasks.length
            const done = day.tasks.filter((t) => doneIds.has(t.id)).length
            const isSelected = day.number === selectedDay.number && tab === 'today'
            return (
              <li key={day.number}>
                <button
                  type="button"
                  onClick={() => onOpenDay(day.number)}
                  title={day.title}
                  className={cn(
                    'relative flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors',
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
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug line-clamp-2">{day.title}</span>
                  <span className="pt-px font-mono text-[11px] text-muted-foreground">{`${done}/${total}`}</span>
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                      done === total ? 'bg-emerald-500' : done > 0 ? 'bg-emerald-500/40' : 'bg-foreground/15'
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">{week.goal}</p>
      </section>
    </nav>
  )
}
