import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { EASE_OUT } from '@/lib/motion'

const HIGHLIGHT = 'lesson-find'
const CURRENT = 'lesson-find-current'

interface HighlightRegistry {
  set: (name: string, value: unknown) => void
  delete: (name: string) => void
}
type HighlightCtor = new (...ranges: Range[]) => unknown

function getHighlightApi(): { registry: HighlightRegistry; Highlight: HighlightCtor } | null {
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
  const Highlight = (window as unknown as { Highlight?: HighlightCtor }).Highlight
  return registry && Highlight ? { registry, Highlight } : null
}

function isVisible(node: Text): boolean {
  const parent = node.parentElement
  if (!parent || parent.closest('[data-find-skip]')) return false
  return parent.getClientRects().length > 0
}

// Every match of `query` in the visible text under `root`, as DOM ranges. Text is joined across
// nodes first, so a phrase split by a glossary word or code span is still found.
function findRanges(root: HTMLElement, query: string): Range[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return []
  const nodes: { node: Text; start: number }[] = []
  let text = ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text
    if (!node.data || !isVisible(node)) continue
    nodes.push({ node, start: text.length })
    text += node.data
  }
  const haystack = text.toLowerCase()
  const locate = (offset: number, isEnd: boolean) => {
    let i = nodes.length - 1
    while (i > 0 && (isEnd ? nodes[i].start >= offset : nodes[i].start > offset)) i--
    return { node: nodes[i].node, offset: offset - nodes[i].start }
  }
  const ranges: Range[] = []
  for (let at = haystack.indexOf(needle); at !== -1 && ranges.length < 500; at = haystack.indexOf(needle, at + needle.length)) {
    const start = locate(at, false)
    const end = locate(at + needle.length, true)
    const range = document.createRange()
    range.setStart(start.node, start.offset)
    range.setEnd(end.node, end.offset)
    ranges.push(range)
  }
  return ranges
}

interface LessonFindProps {
  // The lesson content to search in.
  rootRef: RefObject<HTMLElement | null>
}

// "Find in this lesson": phones have no Ctrl+F in a home-screen app, so the lesson brings its own.
export function LessonFind({ rootRef }: LessonFindProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [ranges, setRanges] = useState<Range[]>([])
  const [current, setCurrent] = useState(0)
  const [top, setTop] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const header = document.querySelector('header')
    setTop(header ? header.getBoundingClientRect().height : 0)
    inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      const root = rootRef.current
      const found = root ? findRanges(root, query) : []
      setRanges(found)
      setCurrent(0)
      if (found.length) scrollToRange(found[0])
    }, 180)
    return () => clearTimeout(timer)
  }, [query, isOpen, rootRef])

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

  function scrollToRange(range: Range) {
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior: 'smooth' })
  }

  function step(delta: number) {
    if (ranges.length === 0) return
    const nextIndex = (current + delta + ranges.length) % ranges.length
    setCurrent(nextIndex)
    scrollToRange(ranges[nextIndex])
  }

  function close() {
    setIsOpen(false)
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
    <>
      <button
        type="button"
        data-find-skip
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" /> Find in lesson
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-find-skip
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{ top: top + 8 }}
            className="fixed inset-x-0 z-[45] mx-auto w-[calc(100%-2rem)] max-w-xl"
          >
            <div role="search" className="flex items-center gap-1 rounded-2xl border border-border bg-background/95 py-1.5 pl-3 pr-1.5 shadow-lg shadow-black/20 backdrop-blur-md">
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
                onClick={() => step(-1)}
                disabled={ranges.length === 0}
                aria-label="Previous match"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={ranges.length === 0}
                aria-label="Next match"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
