import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, CircleCheck, ClipboardCheck, FileText, HelpCircle, Languages, ListTree, PlayCircle, SquareCode, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { getLessonOutline, type OutlineItem, type OutlineKind } from '@/data/lessons'
import type { Lesson } from '@/data/lessons/types'

const KIND_ICON: Record<OutlineKind, LucideIcon> = {
  section: FileText,
  visual: PlayCircle,
  exercise: SquareCode,
  quiz: HelpCircle,
  words: Languages,
  reading: BookOpen,
  finish: ClipboardCheck,
}

// Distance from the top of the window at which a block counts as "being read" (below the sticky header).
const READING_LINE = 150

export function scrollToAnchor(anchor: string) {
  document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// The last block whose top has passed the reading line.
function useActiveAnchor(anchors: string[]): string | null {
  const [active, setActive] = useState<string | null>(anchors[0] ?? null)
  const key = anchors.join('|')
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = anchors[0] ?? null
      for (const anchor of anchors) {
        const el = document.getElementById(anchor)
        if (el && el.getBoundingClientRect().top <= READING_LINE) current = anchor
      }
      // At the very bottom the last item is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = anchors[anchors.length - 1] ?? current
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // anchors is rebuilt each render; `key` captures its content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

function useReadingProgress(): number {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return progress
}

interface OutlineListProps {
  items: OutlineItem[]
  active: string | null
  isDone: (item: OutlineItem) => boolean
  onSelect: (item: OutlineItem) => void
}

function OutlineList({ items, active, isDone, onSelect }: OutlineListProps) {
  return (
    <ol className="relative space-y-0.5 border-l border-border">
      {items.map((item) => {
        const Icon = KIND_ICON[item.kind]
        const isActive = item.anchor === active
        return (
          <li key={item.anchor} className="relative">
            {isActive && (
              <motion.span layoutId="outline-active" className="absolute -left-px top-1 bottom-1 w-0.5 rounded-full bg-violet-500" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-2 rounded-r-lg py-1.5 pl-3 pr-2 text-left text-[13px] leading-snug transition-colors',
                isActive ? 'bg-violet-500/[0.08] font-semibold text-foreground' : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-violet-500' : 'opacity-60')} />
              <span className="min-w-0 flex-1">{item.label}</span>
              {isDone(item) && <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

interface LessonOutlineProps {
  lesson: Lesson
  passed: Set<string>
  isTestPassed: boolean
}

// Desktop: "On this page" in the right column.
export function LessonOutlinePanel({ lesson, passed, isTestPassed }: LessonOutlineProps) {
  const items = getLessonOutline(lesson)
  const active = useActiveAnchor(items.map((i) => i.anchor))
  const progress = useReadingProgress()
  const isDone = (item: OutlineItem) =>
    (item.kind === 'exercise' && Boolean(item.exerciseId) && passed.has(`${lesson.id}:${item.exerciseId}`)) || (item.kind === 'finish' && isTestPassed)

  return (
    <nav aria-label="On this page" className="mb-6 rounded-2xl border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <ListTree className="h-3.5 w-3.5" /> On this page
        </p>
        <span className="text-[11px] tabular-nums text-muted-foreground">{Math.round(progress * 100)}%</span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-foreground/10">
        <motion.div className="h-full bg-violet-500" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.15 }} />
      </div>
      <OutlineList items={items} active={active} isDone={isDone} onSelect={(item) => scrollToAnchor(item.anchor)} />
    </nav>
  )
}

// Phone: a reading-progress bar plus a floating "Contents" button that opens the menu as a sheet.
export function LessonOutlineSheet({ lesson, passed, isTestPassed }: LessonOutlineProps) {
  const [isOpen, setIsOpen] = useState(false)
  const items = getLessonOutline(lesson)
  const active = useActiveAnchor(items.map((i) => i.anchor))
  const progress = useReadingProgress()
  const isDone = (item: OutlineItem) =>
    (item.kind === 'exercise' && Boolean(item.exerciseId) && passed.has(`${lesson.id}:${item.exerciseId}`)) || (item.kind === 'finish' && isTestPassed)
  const activeLabel = items.find((i) => i.anchor === active)?.label

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 pt-[env(safe-area-inset-top)]">
        <motion.div className="h-full bg-violet-500" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.1 }} />
      </div>

      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-40 flex max-w-[70vw] items-center gap-2 rounded-full border border-border bg-background/90 px-3.5 py-2.5 text-xs font-semibold shadow-lg shadow-black/20 backdrop-blur-md"
        aria-label="Lesson contents"
      >
        <ListTree className="h-4 w-4 shrink-0 text-violet-500" />
        <span className="truncate">{activeLabel ?? 'Contents'}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{Math.round(progress * 100)}%</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Lesson contents"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[75dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20" />
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg font-bold">{lesson.title}</p>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/[0.06]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <OutlineList
                items={items}
                active={active}
                isDone={isDone}
                onSelect={(item) => {
                  setIsOpen(false)
                  setTimeout(() => scrollToAnchor(item.anchor), 250)
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
