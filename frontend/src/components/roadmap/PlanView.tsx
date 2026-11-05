import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ActivityHeatmap } from '@/components/roadmap/ActivityHeatmap'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { WeekCard } from '@/components/roadmap/WeekCard'
import { PHASES, TARGETS, WEEKS } from '@/data/roadmap/plan'
import { getPhaseTasks, getProgress, toPercent } from '@/lib/roadmapStats'
import { EASE_OUT } from '@/lib/motion'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: EASE_OUT },
} as const

interface PlanViewProps {
  doneIds: Set<string>
  today: string
  onToggle: (taskId: string, isDone: boolean) => void
  onOpenDay: (date: string) => void
}

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="pb-3 mb-4 border-b border-border">
      <p className="text-[10px] font-mono text-muted-foreground mb-1.5 tracking-widest">{eyebrow}</p>
      <h2 className="font-display font-bold uppercase leading-none tracking-tight text-2xl md:text-4xl">{title}</h2>
    </div>
  )
}

export function PlanView({ doneIds, today, onToggle, onOpenDay }: PlanViewProps) {
  return (
    <div>
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Daily completion</p>
        <ActivityHeatmap doneIds={doneIds} today={today} />
      </section>

      <motion.section {...reveal} className="mt-12">
        <SectionLabel eyebrow="GOAL · 31 OCT 2027" title="Targets" />
        <ul className="divide-y divide-border/50">
          {TARGETS.map((t) => (
            <TaskItem key={t.id} task={t} isDone={doneIds.has(t.id)} onToggle={onToggle} />
          ))}
        </ul>
      </motion.section>

      {PHASES.map((phase) => {
        const percent = toPercent(getProgress(getPhaseTasks(phase.id), doneIds))
        return (
          <motion.section key={phase.id} {...reveal} className="mt-14">
            <SectionLabel
              eyebrow={`PHASE ${phase.number} · ${format(parseISO(phase.start), 'd MMM yyyy')} → ${format(parseISO(phase.end), 'd MMM yyyy')}`}
              title={phase.title}
            />
            <p className="text-sm text-muted-foreground">{phase.goal}</p>
            <div className="flex items-center gap-3 mt-3 mb-2">
              <ProgressBar percent={percent} />
              <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{percent}%</span>
            </div>

            <div className="border-t border-border">
              {WEEKS.filter((w) => w.phaseId === phase.id).map((week) => (
                <WeekCard key={week.id} week={week} doneIds={doneIds} today={today} onToggle={onToggle} onOpenDay={onOpenDay} />
              ))}
            </div>

            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-6 mb-1">Self-check: I can…</p>
            <ul className="divide-y divide-border/40">
              {phase.selfCheck.map((t) => (
                <TaskItem key={t.id} task={t} isDone={doneIds.has(t.id)} onToggle={onToggle} />
              ))}
            </ul>
          </motion.section>
        )
      })}
    </div>
  )
}
