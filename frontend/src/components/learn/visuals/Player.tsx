import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'

const SPEEDS = [0.5, 1, 2] as const
const BASE_INTERVAL_MS = 1400

export interface Stepper {
  index: number
  count: number
  isPlaying: boolean
  speed: number
  next: () => void
  prev: () => void
  reset: () => void
  toggle: () => void
  cycleSpeed: () => void
}

// Step through the frames of an animation, by hand or automatically.
export function useStepper(count: number): Stepper {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(1)
  const last = Math.max(count - 1, 0)

  // New input can make the animation shorter.
  if (index > last) setIndex(last)

  useEffect(() => {
    if (!isPlaying) return
    if (index >= last) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), BASE_INTERVAL_MS / speed)
    return () => clearTimeout(timer)
  }, [isPlaying, index, last, speed])

  return {
    index: Math.min(index, last),
    count,
    isPlaying,
    speed,
    next: () => setIndex((i) => Math.min(i + 1, last)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setIsPlaying(false)
      setIndex(0)
    },
    toggle: () => {
      if (index >= last) setIndex(0)
      setIsPlaying((p) => !p)
    },
    cycleSpeed: () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s as (typeof SPEEDS)[number]) + 1) % SPEEDS.length]),
  }
}

function ControlButton({ label, onClick, disabled, children, isPrimary }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; isPrimary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 items-center justify-center rounded-full transition-colors disabled:opacity-30',
        isPrimary ? 'w-11 bg-foreground text-background hover:bg-foreground/85' : 'w-9 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function StepControls({ stepper }: { stepper: Stepper }) {
  const { index, count, isPlaying, speed } = stepper
  return (
    <div className="flex items-center gap-1">
      <ControlButton label="Restart" onClick={stepper.reset}>
        <RotateCcw className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Previous step" onClick={stepper.prev} disabled={index === 0}>
        <SkipBack className="h-4 w-4" />
      </ControlButton>
      <ControlButton label={isPlaying ? 'Pause' : 'Play'} onClick={stepper.toggle} isPrimary>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </ControlButton>
      <ControlButton label="Next step" onClick={stepper.next} disabled={index >= count - 1}>
        <SkipForward className="h-4 w-4" />
      </ControlButton>
      <button
        type="button"
        onClick={stepper.cycleSpeed}
        title="Speed"
        className="ml-1 rounded-full px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
      >
        {speed}×
      </button>
      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
        Step {index + 1}/{count}
      </span>
    </div>
  )
}

interface VisualCardProps {
  title: string
  // Inputs the learner can change.
  inputs?: ReactNode
  stepper?: Stepper
  // What happens in the current step, in plain words.
  note?: ReactNode
  caption?: string
  children: ReactNode
}

export function VisualCard({ title, inputs, stepper, note, caption, children }: VisualCardProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-violet-500/25 bg-violet-500/[0.03]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 px-4 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">▶ {title}</p>
        {inputs && <div className="ml-auto flex flex-wrap items-center gap-2">{inputs}</div>}
      </div>
      <div className="px-3 py-4 sm:px-4">{children}</div>
      {note !== undefined && (
        <div className="min-h-[3.25rem] border-t border-border/60 bg-background/40 px-4 py-2.5 text-sm leading-relaxed">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stepper ? stepper.index : String(note)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              {note}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      {stepper && (
        <div className="border-t border-border/60 px-3 py-1.5">
          <StepControls stepper={stepper} />
        </div>
      )}
      {caption && <figcaption className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

// Small labelled input used by the visuals ("nums", "target", …).
export function VisualInput({ label, value, onChange, width = 'w-40', type = 'text' }: { label: string; value: string; onChange: (value: string) => void; width?: string; type?: 'text' | 'number' }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="font-mono">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={cn('rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground outline-none focus:border-foreground/40', width)}
      />
    </label>
  )
}

export function parseNumbers(text: string, limit = 12): number[] {
  return text
    .split(/[\s,]+/)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n) && Number.isInteger(n))
    .slice(0, limit)
}
