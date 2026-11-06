import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookMarked, Layers, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { useReviewDeck } from '@/components/learn/ReviewDeckContext'
import { EASE_OUT } from '@/lib/motion'
import { GLOSSARY } from '@/data/lessons/glossary'

const OPEN_DELAY_MS = 120
const CLOSE_DELAY_MS = 160
const GUTTER = 12
const MAX_WIDTH = 320

interface GlossTermProps {
  termKey: string
  children: ReactNode
}

interface Position {
  top: number
  left: number
  width: number
  arrowLeft: number
  isAbove: boolean
}

// Where the card goes: centred over the word, kept inside the screen, above the word
// when there is room and below it otherwise.
function measure(anchor: HTMLElement): Position {
  const rect = anchor.getBoundingClientRect()
  const viewport = window.innerWidth
  const width = Math.min(MAX_WIDTH, viewport - GUTTER * 2)
  const center = rect.left + rect.width / 2
  const left = Math.min(Math.max(center - width / 2, GUTTER), viewport - width - GUTTER)
  const isAbove = rect.top > 190
  return {
    top: isAbove ? rect.top - 10 : rect.bottom + 10,
    left,
    width,
    arrowLeft: Math.min(Math.max(center - left, 16), width - 16),
    isAbove,
  }
}

// A technical word in lesson text. Hover (mouse) shows its meaning in a card; a tap or
// click pins the card open and adds the word to the flashcards.
export function GlossTerm({ termKey, children }: GlossTermProps) {
  const entry = GLOSSARY[termKey]
  const deck = useReviewDeck()
  const tooltipId = useId()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mode, setMode] = useState<'hover' | 'pinned' | null>(null)
  // A touch already toggled the card; ignore the click the browser may send after it.
  const isTouchHandled = useRef(false)
  const [position, setPosition] = useState<Position | null>(null)
  const isOpen = mode !== null
  const isInDeck = Boolean(deck?.deck[`term:${termKey}`])

  function schedule(action: () => void, delay: number) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(action, delay)
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current) return
    const update = () => anchorRef.current && setPosition(measure(anchorRef.current))
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen])

  // A pinned card closes on a tap outside it or on Escape.
  useEffect(() => {
    if (mode !== 'pinned') return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!anchorRef.current?.contains(target) && !cardRef.current?.contains(target)) setMode(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [mode])

  if (!entry) return <>{children}</>

  function toggle() {
    if (timer.current) clearTimeout(timer.current)
    if (mode === 'pinned') {
      setMode(null)
      return
    }
    deck?.addTerm(termKey)
    setMode('pinned')
  }

  const openOnHover = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || mode === 'pinned') return
    schedule(() => setMode('hover'), OPEN_DELAY_MS)
  }
  const closeOnLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || mode === 'pinned') return
    schedule(() => setMode(null), CLOSE_DELAY_MS)
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        // Keyboard focus only: on phones a tap must not open the card twice (focus, then tap).
        onFocus={(e) => {
          if (mode === null && e.currentTarget.matches(':focus-visible')) setMode('hover')
        }}
        onBlur={() => mode === 'hover' && setMode(null)}
        // Phones and tablets: act on the touch itself. iOS (especially an installed PWA) can
        // swallow the click that would follow a tap, so the card would never open.
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') return
          isTouchHandled.current = true
          setTimeout(() => (isTouchHandled.current = false), 500)
          toggle()
        }}
        onClick={() => {
          if (isTouchHandled.current) return
          toggle()
        }}
        aria-describedby={isOpen ? tooltipId : undefined}
        className={cn(
          'cursor-help touch-manipulation rounded-sm underline decoration-dotted decoration-2 underline-offset-4 transition-colors',
          isOpen
            ? 'bg-sky-500/15 text-sky-700 decoration-sky-500 dark:text-sky-300'
            : 'decoration-sky-500/70 hover:bg-sky-500/10 hover:text-sky-700 hover:decoration-sky-500 dark:hover:text-sky-300'
        )}
      >
        {children}
      </button>
      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              style={{ top: position.top, left: position.left, width: position.width }}
              className={cn('fixed z-[80]', position.isAbove && '-translate-y-full')}
            >
            <motion.div
              id={tooltipId}
              role="tooltip"
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse' && timer.current) clearTimeout(timer.current)
              }}
              onPointerLeave={closeOnLeave}
              initial={{ opacity: 0, y: position.isAbove ? 6 : -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position.isAbove ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              style={{ transformOrigin: position.isAbove ? `${position.arrowLeft}px 100%` : `${position.arrowLeft}px 0%` }}
              className="relative rounded-2xl border border-sky-500/30 bg-card p-3.5 text-left shadow-xl shadow-black/25"
            >
              <span
                aria-hidden
                style={{ left: position.arrowLeft - 6 }}
                className={cn(
                  'absolute h-3 w-3 rotate-45 border-sky-500/30 bg-card',
                  position.isAbove ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-l border-t'
                )}
              />
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                <BookMarked className="h-3.5 w-3.5" /> {termKey}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                <InlineText text={entry.en} />
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                <span className="mr-1.5 rounded bg-foreground/[0.07] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">VI</span>
                {entry.vi}
              </p>
              {deck && (
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/70 pt-2 text-xs text-muted-foreground">
                  {isInDeck ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-sky-500" /> In your flashcards
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deck.addTerm(termKey)}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 font-semibold text-sky-700 hover:bg-sky-500/20 dark:text-sky-300 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add to flashcards
                    </button>
                  )}
                  <span className="hidden sm:inline">{mode === 'pinned' ? 'Esc to close' : 'Click to pin'}</span>
                </div>
              )}
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
