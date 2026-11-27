import { motion } from 'framer-motion'
import { CalendarCheck, Library, Map as MapIcon, NotebookPen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'
import { getTrackPercent, type StudyDay } from '@/data/roadmap/studyDays'
import { CourseMap } from '@/components/roadmap/CourseMap'
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
  return (
    <nav className="flex max-h-[calc(100dvh-9rem)] flex-col gap-8" aria-label="Roadmap">
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

      <section className="min-h-0 flex flex-col">
        <div className="mb-2 flex items-baseline justify-between px-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Course map</p>
          <p className="font-mono text-[11px] text-muted-foreground">{`${getTrackPercent(selectedDay.track, doneIds)}%`}</p>
        </div>
        <div data-course-map-scroll className="-mx-1 min-h-0 overflow-y-auto overscroll-contain px-1 [scrollbar-width:thin]">
          <CourseMap selectedDay={selectedDay} currentDay={currentDay} doneIds={doneIds} isSelectionShown={tab === 'today'} onSelect={onOpenDay} />
        </div>
      </section>
    </nav>
  )
}
