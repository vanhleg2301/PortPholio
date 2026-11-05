import { motion } from 'framer-motion'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRING } from '@/lib/motion'
import { usePushReminders } from '@/hooks/usePushReminders'

const HINTS = {
  'needs-install': 'Open this page in Safari, tap Share → Add to Home Screen, then turn reminders on from the installed app.',
  unsupported: 'This browser cannot receive push notifications.',
  blocked: 'Notifications are blocked. Allow them in Settings → Notifications → Roadmap.',
} as const

export function ReminderToggle() {
  const { status, isBusy, error, enable, disable } = usePushReminders(true)
  const isOn = status === 'on'
  const isAvailable = status === 'on' || status === 'off'

  return (
    <div className="mt-5 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        {isOn ? <Bell className="h-5 w-5 text-emerald-500" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
        <div className="flex-1">
          <p className="text-sm font-semibold">Daily reminder</p>
          <p className="text-xs text-muted-foreground">20:00 if today's tasks or reviews are not done</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Daily reminder"
          disabled={!isAvailable || isBusy}
          onClick={() => void (isOn ? disable() : enable())}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40',
            isOn ? 'bg-emerald-500' : 'bg-foreground/15 hover:bg-foreground/25'
          )}
        >
          <motion.span
            layout
            transition={SPRING}
            className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow', isOn ? 'right-1' : 'left-1')}
          />
        </button>
      </div>
      {status in HINTS && <p className="mt-3 text-xs text-muted-foreground">{HINTS[status as keyof typeof HINTS]}</p>}
      {error && <p className="mt-3 text-xs text-hard">{error}</p>}
    </div>
  )
}
