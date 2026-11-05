import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ActivityHeatmap } from '@/components/roadmap/ActivityHeatmap'
import { DayCard } from '@/components/roadmap/DayCard'
import { OwnerAccess } from '@/components/roadmap/OwnerAccess'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { WeekCard } from '@/components/roadmap/WeekCard'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { PHASES, ROADMAP_END, ROADMAP_START, TARGETS, WEEKS } from '@/data/roadmap/plan'
import { useOwnerSession } from '@/hooks/useOwnerSession'
import { useRoadmapProgress, useToggleTask } from '@/hooks/useRoadmapProgress'
import {
  ALL_DAYS,
  ALL_TASKS,
  getActivityDates,
  getNeetCodeSolved,
  getPhaseTasks,
  getProgress,
  getStreak,
  getTodayIso,
  toPercent,
} from '@/lib/roadmapStats'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="pb-4 mb-6 border-b border-border">
      <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">{num}</p>
      <h2 className="font-display font-bold uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.75rem)' }}>
        {title}
      </h2>
    </div>
  )
}

export default function RoadmapPage() {
  const { data: rows = [], isLoading, isError } = useRoadmapProgress()
  const { session, isOwner, signIn, signOut } = useOwnerSession()
  const toggle = useToggleTask()
  const today = getTodayIso()

  const doneIds = useMemo(() => new Set(rows.map((r) => r.task_id)), [rows])
  const activity = useMemo(() => getActivityDates(rows.map((r) => r.completed_at)), [rows])

  const overall = toPercent(getProgress(ALL_TASKS, doneIds))
  const solved = getNeetCodeSolved(doneIds)
  const streak = getStreak(activity)
  const todayPlan = ALL_DAYS.find((d) => d.date === today)
  const onToggle = isOwner ? (taskId: string, isDone: boolean) => toggle.mutate({ taskId, isDone }) : undefined

  const stats = [
    { value: `${overall}%`, label: 'Plan complete' },
    { value: `${solved}/${NEETCODE_150_TOTAL}`, label: 'NeetCode solved' },
    { value: `${streak}`, label: streak === 1 ? 'Day streak' : 'Days streak' },
    { value: `${activity.size}`, label: 'Days active' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-28 md:pt-36 pb-24">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Learning in public
        </p>
        <h1 className="font-display font-extrabold uppercase leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(3rem, 9vw, 9rem)' }}>
          Road to
          <span className="block text-muted-foreground">Big Tech</span>
        </h1>
        <p className="mt-8 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
          A {ALL_DAYS.length}-day plan from {format(parseISO(ROADMAP_START), 'MMMM yyyy')} to{' '}
          {format(parseISO(ROADMAP_END), 'MMMM yyyy')}: data structures and algorithms, CS fundamentals, system design and
          AI engineering. Every tick below is real progress, updated as I go.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border"
      >
        {stats.map((s) => (
          <div key={s.label} className="py-8 px-4 md:px-6 first:pl-0">
            <p className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {isLoading ? '–' : s.value}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
      {isError && <p className="mt-3 text-xs text-hard">Could not load progress. The plan below is still accurate.</p>}
      {toggle.isError && <p className="mt-3 text-xs text-hard">Save failed: {toggle.error.message}</p>}

      {/* Heatmap */}
      <section className="mt-14">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Daily completion</p>
        <ActivityHeatmap doneIds={doneIds} today={today} />
      </section>

      {/* Today */}
      <section className="mt-20">
        <SectionLabel num="TODAY" title={format(new Date(), 'EEEE d MMMM')} />
        {todayPlan ? (
          <div className="max-w-xl">
            <DayCard day={todayPlan} doneIds={doneIds} isToday onToggle={onToggle} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {today < ROADMAP_START
              ? `The plan starts on ${format(parseISO(ROADMAP_START), 'd MMMM yyyy')}.`
              : 'The plan is finished.'}
          </p>
        )}
      </section>

      {/* Targets */}
      <section className="mt-20">
        <SectionLabel num="GOAL · 31 OCT 2027" title="Targets" />
        <ul className="grid md:grid-cols-2 gap-x-10 divide-y divide-border/50 md:divide-y-0">
          {TARGETS.map((t) => (
            <TaskItem key={t.id} task={t} isDone={doneIds.has(t.id)} onToggle={onToggle} />
          ))}
        </ul>
      </section>

      {/* Phases */}
      {PHASES.map((phase) => {
        const percent = toPercent(getProgress(getPhaseTasks(phase.id), doneIds))
        return (
          <section key={phase.id} className="mt-24">
            <SectionLabel
              num={`PHASE ${phase.number} · ${format(parseISO(phase.start), 'd MMM yyyy')} → ${format(parseISO(phase.end), 'd MMM yyyy')}`}
              title={phase.title}
            />
            <div className="grid md:grid-cols-[1fr_280px] gap-6 md:gap-10 mb-6">
              <p className="text-sm md:text-base text-muted-foreground">{phase.goal}</p>
              <div className="flex items-center gap-3">
                <ProgressBar percent={percent} />
                <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">{percent}%</span>
              </div>
            </div>

            <div className="border-t border-border">
              {WEEKS.filter((w) => w.phaseId === phase.id).map((week) => (
                <WeekCard key={week.id} week={week} doneIds={doneIds} today={today} onToggle={onToggle} />
              ))}
            </div>

            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Self-check: I can…</p>
              <ul className="divide-y divide-border/40 max-w-2xl">
                {phase.selfCheck.map((t) => (
                  <TaskItem key={t.id} task={t} isDone={doneIds.has(t.id)} onToggle={onToggle} />
                ))}
              </ul>
            </div>
          </section>
        )
      })}

      <div className="mt-24 pt-6 border-t border-border">
        <OwnerAccess isSignedIn={Boolean(session)} isOwner={isOwner} onSignIn={signIn} onSignOut={signOut} />
      </div>
    </div>
  )
}
