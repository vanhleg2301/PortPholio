import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'
import { formatClock } from '@/hooks/useFocusTimer'
import type { RoadmapTask } from '@/data/roadmap/types'

const PRESETS: Array<{ label: string; minutes: number | null }> = [
  { label: '25 min', minutes: 25 },
  { label: '50 min', minutes: 50 },
  { label: 'Free', minutes: null },
]

interface FocusSheetProps {
  isOpen: boolean
  isRunning: boolean
  elapsedSeconds: number
  targetSeconds: number | null
  isTargetReached: boolean
  runningTaskTitle: string | null
  tasks: RoadmapTask[]
  todayMinutes: number
  isSaving: boolean
  onStart: (minutes: number | null, taskId: string | null) => void
  onStop: () => void
  onDiscard: () => void
  onClose: () => void
}

export function FocusSheet({
  isOpen,
  isRunning,
  elapsedSeconds,
  targetSeconds,
  isTargetReached,
  runningTaskTitle,
  tasks,
  todayMinutes,
  isSaving,
  onStart,
  onStop,
  onDiscard,
  onClose,
}: FocusSheetProps) {
  const [preset, setPreset] = useState<number | null>(25)
  const [taskId, setTaskId] = useState<string>('')

  const shownSeconds = targetSeconds !== null && !isTargetReached ? targetSeconds - elapsedSeconds : elapsedSeconds
  const progress = targetSeconds ? Math.min(1, elapsedSeconds / targetSeconds) : 0
  const RADIUS = 88
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Focus timer"
            className="fixed inset-x-0 bottom-0 z-[61] mx-auto max-w-lg rounded-t-3xl border-t border-border bg-background px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/20" />
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold">Focus</h2>
              <span className="text-xs text-muted-foreground">Today: {todayMinutes} min</span>
            </div>

            {/* Clock */}
            <div className="relative mx-auto my-5 h-52 w-52">
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="6" className="stroke-foreground/10" />
                {targetSeconds !== null && isRunning && (
                  <motion.circle
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className={isTargetReached ? 'stroke-emerald-500' : 'stroke-foreground'}
                    strokeDasharray={CIRCUMFERENCE}
                    animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-semibold tabular-nums">
                  {isRunning ? formatClock(shownSeconds) : formatClock((preset ?? 0) * 60)}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {!isRunning ? 'Ready' : isTargetReached ? 'Done — take a break' : targetSeconds ? 'Remaining' : 'Elapsed'}
                </span>
              </div>
            </div>

            {isRunning ? (
              <>
                {runningTaskTitle && <p className="mb-4 text-center text-sm text-muted-foreground truncate">{runningTaskTitle}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onDiscard}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:text-hard hover:border-hard/40 hover:bg-hard/10 transition-colors"
                    aria-label="Discard session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={onStop}
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors disabled:opacity-60"
                  >
                    <Pause className="h-4 w-4" /> {isSaving ? 'Saving…' : `Stop & save ${Math.max(1, Math.round(elapsedSeconds / 60))} min`}
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPreset(p.minutes)}
                      className={cn(
                        'relative rounded-xl py-2.5 text-sm font-semibold transition-colors',
                        preset === p.minutes ? 'text-background' : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.1]'
                      )}
                    >
                      {preset === p.minutes && <motion.span layoutId="focus-preset" transition={SPRING} className="absolute inset-0 rounded-xl bg-foreground" />}
                      <span className="relative">{p.label}</span>
                    </button>
                  ))}
                </div>
                {tasks.length > 0 && (
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    aria-label="Task for this session"
                    className="mt-3 w-full rounded-xl border border-border bg-transparent px-3 py-3 text-base outline-none hover:border-foreground/30 focus:border-foreground/50 transition-colors"
                  >
                    <option value="" className="bg-background">No specific task</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id} className="bg-background">
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onStart(preset, taskId || null)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  <Play className="h-4 w-4" /> Start focus
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
