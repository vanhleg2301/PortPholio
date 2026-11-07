import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { EASE_OUT } from '@/lib/motion'
import { findBestRanges, findRanges, getHighlightApi, isAtOrAfter, scrollToRange } from '@/lib/textHighlight'

const HIGHLIGHT = 'lesson-find'
const CURRENT = 'lesson-find-current'

interface LessonFindProps {
  // The lesson content to search in.
  rootRef: RefObject<HTMLElement | null>
  isOpen: boolean
  onClose: () => void
  // Opened from a search result: search for this right away, starting at `anchor` if given.
  request?: LessonFindRequest | null
  onMiss?: (request: LessonFindRequest) => void
}

export interface LessonFindRequest {
  id: number
  lessonId: string
  query: string
  anchor?: string
}

// "Find in this lesson": phones have no Ctrl+F in a home-screen app, so the lesson brings its own.
// Render it as the first child of the lesson: the bar is sticky, not fixed. On iPhone, while the
// keyboard is open and the page scrolls by code, taps on a fixed bar land in the wrong place, so
// the arrows did nothing until the screen was touched once.
export function LessonFind({ rootRef, isOpen, onClose, request, onMiss }: LessonFindProps) {
  const [query, setQuery] = useState('')
  const [ranges, setRanges] = useState<Range[]>([])
  const [current, setCurrent] = useState(0)
  const [top, setTop] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  // The search result being opened, until its first match has been shown.
  const pending = useRef<LessonFindRequest | null>(null)
  const [handledId, setHandledId] = useState<number | null>(null)
  const onMissRef = useRef(onMiss)
  useEffect(() => {
    onMissRef.current = onMiss
  }, [onMiss])
  if (request && request.id !== handledId) {
    setHandledId(request.id)
    pending.current = request
    setQuery(request.query)
  }

  useEffect(() => {
    if (!isOpen) return
    const header = document.querySelector('header')
    setTop(header ? header.getBoundingClientRect().height : 0)
    // Coming from a search result, do not pop up the phone keyboard over the answer.
    if (!pending.current) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    const run = (triesLeft: number) => {
      const root = rootRef.current
      const opening = pending.current
      if (!opening) {
        const found = root ? findRanges(root, query) : []
        setRanges(found)
        setCurrent(0)
        if (found.length) scrollToRange(found[0])
        return
      }
      // From a search result: the lesson may still be rendering, so try a few times.
      const { ranges: found, used } = root ? findBestRanges(root, opening.query) : { ranges: [], used: opening.query }
      if (found.length === 0) {
        if (triesLeft > 0) timers.push(setTimeout(() => run(triesLeft - 1), 250))
        else {
          pending.current = null
          onMissRef.current?.(opening)
        }
        return
      }
      if (used !== query) setQuery(used)
      const anchor = opening.anchor ? document.getElementById(opening.anchor) : null
      const index = Math.max(0, anchor ? found.findIndex((r) => isAtOrAfter(r, anchor)) : 0)
      pending.current = null
      setRanges(found)
      setCurrent(index)
      scrollToRange(found[index])
      // The lesson animates in; land again once the layout has settled.
      timers.push(setTimeout(() => scrollToRange(found[index]), 650))
    }
    timers.push(setTimeout(() => run(8), 180))
    return () => timers.forEach(clearTimeout)
    // handledId: the same words searched again from another result still jump.
  }, [query, isOpen, rootRef, handledId])

  useEffect(() => {
    const api = getHighlightApi()
    if (!api) return
    if (!isOpen || ranges.length === 0) {
      api.registry.delete(HIGHLIGHT)
      api.registry.delete(CURRENT)
      return
    }
    api.registry.set(HIGHLIGHT, new api.Highlight(...ranges))
    api.registry.set(CURRENT, new api.Highlight(ranges[current]))
  }, [ranges, current, isOpen])

  useEffect(
    () => () => {
      const api = getHighlightApi()
      api?.registry.delete(HIGHLIGHT)
      api?.registry.delete(CURRENT)
    },
    []
  )

  function step(delta: number) {
    if (ranges.length === 0) return
    const nextIndex = (current + delta + ranges.length) % ranges.length
    setCurrent(nextIndex)
    scrollToRange(ranges[nextIndex])
  }

  // Tapping an arrow should not close the phone keyboard (that moves the page under the finger).
  function keepFocus(event: MouseEvent) {
    event.preventDefault()
  }

  // Arrows react on touch-down, not on click: with the iPhone keyboard open, iOS often drops the
  // click of the first tap (the page is still settling after the jump to a match), so the arrow
  // only worked after tapping the screen once. Keyboard Enter/Space still comes in as a click
  // with detail 0.
  function pressArrow(event: PointerEvent, delta: number) {
    if (event.button !== 0) return
    event.preventDefault()
    step(delta)
  }

  function close() {
    onClose()
    setQuery('')
    setRanges([])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      step(event.shiftKey ? -1 : 1)
    } else if (event.key === 'Escape') {
      close()
    }
  }

  const status = query.trim().length < 2 ? '' : ranges.length === 0 ? 'No results' : `${current + 1} of ${ranges.length}`

  return (
    <div data-find-skip style={{ top: top + 8 }} className="sticky z-[45]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-find-skip
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            // In the page flow (not on top of it), so the bar never covers the Back button.
            className="mb-4"
          >
            <div role="search" className="flex items-center gap-0.5 rounded-2xl border border-border bg-background py-1 pl-3 pr-1 shadow-lg shadow-black/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find in this lesson"
                aria-label="Find in this lesson"
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              <span aria-live="polite" className="shrink-0 px-1 text-xs tabular-nums text-muted-foreground">
                {status}
              </span>
              <button
                type="button"
                onPointerDown={(e) => pressArrow(e, -1)}
                onMouseDown={keepFocus}
                onClick={(e) => e.detail === 0 && step(-1)}
                disabled={ranges.length === 0}
                aria-label="Previous match"
                className="rounded-lg p-2.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onPointerDown={(e) => pressArrow(e, 1)}
                onMouseDown={keepFocus}
                onClick={(e) => e.detail === 0 && step(1)}
                disabled={ranges.length === 0}
                aria-label="Next match"
                className="rounded-lg p-2.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded-lg p-2.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
