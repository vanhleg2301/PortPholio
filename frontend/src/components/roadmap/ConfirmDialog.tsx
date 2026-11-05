import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, description, confirmLabel, isPending = false, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full sm:w-[400px] sm:mx-4 rounded-t-3xl sm:rounded-3xl border border-border bg-background px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-6 shadow-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hard/10 text-hard">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 id="confirm-title" className="mt-4 font-display text-xl font-bold">
              {title}
            </h2>
            <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                autoFocus
                className="flex-1 rounded-2xl bg-hard py-3 text-sm font-semibold text-white hover:bg-hard/85 transition-colors disabled:opacity-60"
              >
                {isPending ? 'Deleting…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
