import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ArrowUpRight, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ActivityHeatmap } from '@/components/roadmap/ActivityHeatmap'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { ALL_DAYS, getTodayIso } from '@/lib/roadmapStats'
import { getJourneyStats } from '@/lib/journeyStats'
import { EASE_OUT } from '@/lib/motion'
import { NEETCODE_150_TOTAL } from '@/data/roadmap/neetcode'
import { TOPICS } from '@/data/roadmap/topics'
import { useRoadmapProgress } from '@/hooks/useRoadmapProgress'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatMinutes, useStudySessions } from '@/hooks/useStudySessions'

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: EASE_OUT },
} as const

const DIFFICULTY_STYLE = {
  easy: { label: 'Easy', bar: 'bg-easy', text: 'text-easy' },
  medium: { label: 'Medium', bar: 'bg-medium', text: 'text-medium' },
  hard: { label: 'Hard', bar: 'bg-hard', text: 'text-hard' },
} as const

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-10 pb-5 border-b border-border">
      <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest">{num}</p>
      <h2 className="font-display font-bold uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
        {title}
      </h2>
    </div>
  )
}

export default function JourneyPage() {
  useDocumentTitle('Road to Big Tech · Hoang Cao Viet Anh')
  const today = getTodayIso()
  const { data: rows = [], isLoading } = useRoadmapProgress()
  const { data: sessions = [] } = useStudySessions()
  const stats = useMemo(() => getJourneyStats(rows, sessions, today), [rows, sessions, today])

  const headline = [
    { value: `${stats.solved}`, suffix: `/${NEETCODE_150_TOTAL}`, label: 'NeetCode solved' },
    { value: formatMinutes(stats.totalMinutes), suffix: '', label: 'Focused study' },
    { value: `${stats.longestStreak}`, suffix: ' days', label: 'Longest streak' },
    { value: `${stats.planPercent}`, suffix: '%', label: 'Plan complete' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-28 md:pt-36 pb-24">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE_OUT }}>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Learning in public · Day {Math.min(stats.dayNumber, ALL_DAYS.length)} of {ALL_DAYS.length}
        </p>
        <h1 className="font-display font-extrabold uppercase leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(3rem, 9vw, 9rem)' }}>
          Road to
          <span className="block text-muted-foreground">Big Tech</span>
        </h1>
        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <p className="max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            A year of deliberate practice — data structures and algorithms, CS fundamentals, system design and AI engineering. Every
            number on this page comes from progress I log daily, so it updates as I go.
          </p>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 self-start rounded-full border border-foreground/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
          >
            See the full plan <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* Headline numbers */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 border-y border-border"
      >
        {headline.map((s, i) => (
          <div key={s.label} className={cn('py-8 px-4 md:px-6', i % 2 === 1 && 'border-l border-border', i >= 2 && 'md:border-l border-t md:border-t-0 border-border')}>
            <p className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}>
              {isLoading ? '–' : s.value}
              <span className="text-muted-foreground text-[0.45em] font-bold">{s.suffix}</span>
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Difficulty split */}
      <motion.section {...reveal} className="mt-10">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <motion.div
              key={d}
              className={DIFFICULTY_STYLE[d].bar}
              initial={{ width: 0 }}
              whileInView={{ width: `${(stats.byDifficulty[d] / NEETCODE_150_TOTAL) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE_OUT }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <span key={d} className="text-muted-foreground">
              <span className={cn('font-semibold', DIFFICULTY_STYLE[d].text)}>{DIFFICULTY_STYLE[d].label}</span> {stats.byDifficulty[d]}/
              {stats.difficultyTotals[d]}
            </span>
          ))}
        </div>
      </motion.section>

      {/* Activity */}
      <motion.section {...reveal} className="mt-24">
        <SectionHeader num="01" title="Consistency" />
        <ActivityHeatmap doneIds={stats.doneIds} today={today} />
        <p className="mt-4 text-sm text-muted-foreground">
          {stats.activeDays} active day{stats.activeDays === 1 ? '' : 's'} so far. Each square is one day of the plan, coloured by how much of
          it got done.
        </p>
      </motion.section>

      {/* Skill map */}
      <motion.section {...reveal} className="mt-24">
        <SectionHeader num="02" title="Skill map" />
        <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
          {stats.categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: (i % 6) * 0.04 }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {c.solved}/{c.total}
                </span>
              </div>
              <ProgressBar percent={Math.round((c.solved / c.total) * 100)} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Phases */}
      <motion.section {...reveal} className="mt-24">
        <SectionHeader num="03" title="The plan" />
        <ol className="divide-y divide-border border-y border-border">
          {stats.phases.map((p) => (
            <li key={p.id} className="grid gap-3 py-6 md:grid-cols-[80px_1fr_260px] md:items-center">
              <span className="font-mono text-xs text-muted-foreground">PHASE {p.number}</span>
              <div>
                <p className="font-display text-xl font-bold uppercase tracking-tight">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(parseISO(p.start), 'MMM yyyy')} – {format(parseISO(p.end), 'MMM yyyy')} · {p.goal}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ProgressBar percent={p.percent} />
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">{p.percent}%</span>
              </div>
            </li>
          ))}
        </ol>
      </motion.section>

      {/* Milestones */}
      <motion.section {...reveal} className="mt-24">
        <SectionHeader num="04" title="Milestones" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.milestones.map((m, i) => {
            const isDone = m.achievedOn !== null
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: (i % 4) * 0.05 }}
                className={cn(
                  'rounded-2xl border p-5',
                  isDone ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : 'border-border bg-card/40'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    isDone ? 'bg-emerald-500 text-white' : 'bg-foreground/[0.06] text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <Lock className="h-4 w-4" />}
                </span>
                <p className={cn('mt-4 font-semibold', !isDone && 'text-muted-foreground')}>{m.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.detail}</p>
                <p className="mt-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  {isDone && m.achievedOn ? format(parseISO(m.achievedOn), 'd MMM yyyy') : 'Locked'}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Recent */}
      <motion.section {...reveal} className="mt-24">
        <SectionHeader num="05" title="Latest" />
        {stats.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">The first entries arrive as the plan gets going.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {stats.recent.map(({ row, task }) => (
              <li key={row.task_id} className="flex items-center gap-4 py-4">
                <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{format(new Date(row.completed_at), 'd MMM')}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-24 shrink-0 hidden sm:block">
                  {TOPICS[task.kind].label}
                </span>
                <span className="text-sm">{task.title}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </div>
  )
}
