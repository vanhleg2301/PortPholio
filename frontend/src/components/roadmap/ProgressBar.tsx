import { cn } from '@/lib/utils'

interface ProgressBarProps {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1 w-full rounded-full bg-foreground/10 overflow-hidden', className)}
    >
      <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
    </div>
  )
}
