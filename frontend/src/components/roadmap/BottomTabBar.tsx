import { CalendarCheck, Library, Map as MapIcon, NotebookPen, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'

export type RoadmapTab = 'today' | 'plan' | 'library' | 'notes'

const TABS: Array<{ id: RoadmapTab; label: string; icon: LucideIcon }> = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'plan', label: 'Plan', icon: MapIcon },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
]

interface BottomTabBarProps {
  active: RoadmapTab
  onChange: (tab: RoadmapTab) => void
}

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active === id ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
              active === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
            )}
          >
            {active === id && (
              <motion.span layoutId="tab-indicator" transition={SPRING} className="absolute top-0 h-0.5 w-10 rounded-full bg-foreground" />
            )}
            <motion.span animate={{ y: active === id ? -1 : 0 }} transition={SPRING}>
              <Icon className="h-5 w-5" strokeWidth={active === id ? 2.4 : 1.8} />
            </motion.span>
            {label}
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
