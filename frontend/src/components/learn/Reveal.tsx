import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE_OUT } from '@/lib/motion'

interface RevealProps {
  label: string
  children: ReactNode
}

export function Reveal({ label, children }: RevealProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-foreground/[0.12] hover:text-foreground transition-colors"
      >
        {isOpen ? `Hide ${label.toLowerCase()}` : label}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
