import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, BookOpen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { scrollToAnchor } from '@/components/learn/LessonOutline'
import { getPrimerLink } from '@/data/lessons'
import type { Primer } from '@/data/lessons/types'

interface LearnFirstProps {
  primer: Primer
  // False where leaving the page would lose work in progress (flashcards).
  hasLessonLink?: boolean
}

// "Learn first": the idea a question needs, shown on demand next to the question, with a link to
// the part of the lesson that teaches it. Inside that lesson the link scrolls there and offers a
// way back to the question; elsewhere it opens the lesson at that part.
export function LearnFirst({ primer, hasLessonLink = true }: LearnFirstProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAway, setIsAway] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const link = hasLessonLink ? getPrimerLink(primer) : null

  function openSection() {
    if (!link) return
    if (location.pathname === `/roadmap/learn/${link.lessonId}`) {
      scrollToAnchor(link.anchor)
      setIsAway(true)
    } else {
      navigate(`/roadmap/learn/${link.lessonId}#${link.anchor}`)
    }
  }

  function backToQuestion() {
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setIsAway(false)
  }

  return (
    <div ref={rootRef} className="scroll-mt-32">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
          isOpen
            ? 'bg-sky-500/15 text-sky-800 dark:text-sky-200'
            : 'bg-sky-500/[0.08] text-sky-700 hover:bg-sky-500/15 dark:text-sky-300'
        )}
      >
        <BookOpen className="h-3.5 w-3.5" />
        Learn first
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
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
            <div className="mt-2 min-w-0 rounded-xl border border-sky-500/20 bg-sky-500/[0.05] px-3.5 py-3 text-sm">
              <MarkdownPreview content={primer.read} withGlossary />
              {link && (
                <button
                  type="button"
                  onClick={openSection}
                  className="mt-2 inline-flex max-w-full items-start gap-1.5 border-t border-foreground/10 pt-2 text-left text-xs font-medium text-sky-700 underline decoration-sky-500/30 underline-offset-2 hover:decoration-sky-500 dark:text-sky-300 transition-colors"
                >
                  <BookOpen className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">
                    Read it in the lesson: {link.label}
                    {!location.pathname.endsWith(`/${link.lessonId}`) && ` · ${link.lessonTitle}`}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isAway &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+8.75rem)]">
            <motion.button
              type="button"
              onClick={backToQuestion}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lg hover:bg-foreground/85 transition-colors"
            >
              <ArrowDown className="h-4 w-4" />
              Back to the question
            </motion.button>
          </div>,
          document.body
        )}
    </div>
  )
}
