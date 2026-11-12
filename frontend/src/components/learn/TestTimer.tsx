import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestTimerProps {
  minutes: number
  // Start time (ms since epoch, as text) saved to the account, so the timer survives a reload or a device switch.
  savedStart?: string
  onStart: (startedAt: string) => void
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// A countdown like a real interview. It only shows the time; nothing is locked when it runs out.
export function TestTimer({ minutes, savedStart, onStart }: TestTimerProps) {
  const [localStart, setLocalStart] = useState<number | null>(null)
  const parsed = savedStart ? Number(savedStart) : NaN
  const startedAt = localStart ?? (Number.isFinite(parsed) ? parsed : null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (startedAt === null) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  function start() {
    const at = Date.now()
    setLocalStart(at)
    setNow(at)
    onStart(String(at))
  }

  if (startedAt === null) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3.5 py-3">
        <p className="text-sm text-muted-foreground">
          Like a real interview: {minutes} minutes for every part. Say your ideas out loud while you work.
        </p>
        <button
          type="button"
          onClick={start}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-600/85 transition-colors"
        >
          <Timer className="h-3.5 w-3.5" /> Start the timer
        </button>
      </div>
    )
  }

  const left = Math.max(0, minutes * 60 - Math.floor((now - startedAt) / 1000))
  const isOver = left === 0
  return (
    <div
      role="timer"
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm',
        isOver ? 'border-amber-500/40 bg-amber-500/[0.06]' : 'border-border/70 bg-background/40'
      )}
    >
      <span className="flex items-center gap-1.5 font-semibold">
        <Timer className={cn('h-4 w-4', isOver ? 'text-amber-500' : 'text-violet-500')} />
        {isOver ? 'Time is up' : `${formatClock(left)} left`}
      </span>
      <span className="text-xs text-muted-foreground">
        {isOver ? 'Finish anyway, and note what slowed you down.' : `of ${minutes} minutes`}
      </span>
    </div>
  )
}
