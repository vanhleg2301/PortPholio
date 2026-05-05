import { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, ArrowUpRight } from 'lucide-react'

// ── Context ───────────────────────────────
interface HireModalCtx {
  openModal: () => void
}

const Ctx = createContext<HireModalCtx>({ openModal: () => {} })

export function useHireModal() {
  return useContext(Ctx)
}

// ── Provider ──────────────────────────────
export function HireModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={{ openModal: () => setOpen(true) }}>
      {children}
      <HireModal open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  )
}

// ── Modal ─────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

const contacts = [
  {
    label: 'Email',
    value: 'vanhleg2301@gmail.com',
    href: 'mailto:vanhleg2301@gmail.com',
    note: 'Reply within 24h',
  },
]

const links = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'GitHub', href: 'https://github.com' },
]

function HireModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onMouseDown={onClose}
          />

          {/* Panel — bottom sheet on mobile, centered on desktop */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.45, ease }}
            className="fixed bottom-0 left-0 right-0 z-[101] md:inset-0 md:flex md:items-center md:justify-center md:p-6 pointer-events-none"
          >
            <div className="pointer-events-auto relative w-full md:max-w-lg bg-background border border-border rounded-t-3xl md:rounded-3xl p-8 md:p-10 shadow-2xl">

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Handle bar (mobile) */}
              <div className="mx-auto mb-7 h-1 w-10 rounded-full bg-border md:hidden" />

              {/* Heading */}
              <div className="mb-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Get in touch
                </p>
                <h2
                  className="font-display font-bold uppercase leading-[0.9] tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                >
                  Let's Work<br />Together
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Open to full-time roles, freelance projects, and exciting collaborations.
                I typically reply within 24 hours.
              </p>

              {/* Email card */}
              {contacts.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  onClick={(e) => { e.stopPropagation(); window.location.href = c.href }}
                  className="group flex items-center justify-between w-full rounded-2xl border border-border p-5 mb-3 hover:border-foreground/30 hover:bg-foreground/5 hover:translate-x-1 transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{c.label}</p>
                    <p className="font-medium text-sm">{c.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.note}</p>
                  </div>
                  <Mail className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </a>
              ))}

              {/* Secondary links */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {links.map((l) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="group flex items-center justify-between rounded-xl border border-border px-4 py-3.5 text-sm font-medium hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:rotate-12 transition-all duration-300 shrink-0" />
                  </motion.a>
                ))}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
