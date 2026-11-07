import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookMarked, BookOpen, CalendarDays, Clock, CornerDownLeft, Languages, NotebookPen, Search, SquareCode, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { getSearchEntries, search, type SearchEntry, type SearchGroup, type SearchNote } from '@/lib/searchIndex'

const GROUP_ICON: Record<SearchGroup, LucideIcon> = {
  Lessons: BookOpen,
  Theory: BookMarked,
  Words: Languages,
  Problems: SquareCode,
  Plan: CalendarDays,
  Notes: NotebookPen,
}
const RECENT_KEY = 'roadmap:recent-searches'
const SUGGESTIONS = ['latency', 'two sum', 'heap', 'deadlock', 'RAG', 'Week 2']

function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, 5) : []
  } catch {
    return []
  }
}

function saveRecent(query: string) {
  try {
    const next = [query, ...readRecent().filter((q) => q !== query)].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Not remembering recent searches is fine.
  }
}

interface SearchDialogProps {
  isOpen: boolean
  notes: SearchNote[]
  onClose: () => void
  // `query` is what was typed, so the page can jump to the first place it appears.
  onSelect: (entry: SearchEntry, query: string) => void
}

// Search everything in the app: lessons and their sections, glossary words (English or
// Vietnamese, with or without accents), NeetCode problems, the plan and your notes.
export function SearchDialog({ isOpen, notes, onClose, onSelect }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const entries = useMemo(() => (isOpen ? getSearchEntries(notes) : []), [isOpen, notes])
  const results = useMemo(() => search(entries, query), [entries, query])
  const recent = isOpen ? readRecent() : []

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setCursor(0)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previous
    }
  }, [isOpen])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  function choose(entry: SearchEntry) {
    if (query.trim()) saveRecent(query.trim())
    onSelect(entry, query.trim())
    onClose()
  }

  function handleKeyDown(e: ReactKeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      choose(results[cursor])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  let lastGroup: SearchGroup | null = null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-start justify-center bg-black/40 backdrop-blur-[2px] sm:px-4 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            onKeyDown={handleKeyDown}
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)] shadow-2xl sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-2xl sm:border sm:border-border sm:pt-0"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCursor(0)
                }}
                placeholder="Search lessons, theory, words, problems, notes…"
                aria-label="Search"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
              {query.trim() === '' ? (
                <div className="space-y-4 p-2">
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</p>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((q) => (
                          <button key={q} type="button" onClick={() => setQuery(q)} className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs hover:bg-foreground/[0.12] transition-colors">
                            <Clock className="h-3 w-3" /> {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Try</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((q) => (
                        <button key={q} type="button" onClick={() => setQuery(q)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-foreground/40 hover:bg-foreground/[0.04] transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Opening a result jumps to the first place your words appear and marks it.</p>
                </div>
              ) : results.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No results for “{query}”.</p>
              ) : (
                results.map((entry, i) => {
                  const Icon = GROUP_ICON[entry.group]
                  const header = entry.group !== lastGroup ? entry.group : null
                  lastGroup = entry.group
                  return (
                    <div key={entry.id}>
                      {header && <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground first:pt-1">{header}</p>}
                      <button
                        type="button"
                        data-index={i}
                        onMouseMove={() => setCursor(i)}
                        onClick={() => choose(entry)}
                        className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', i === cursor ? 'bg-foreground/[0.07]' : 'hover:bg-foreground/[0.04]')}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{entry.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{entry.subtitle}</span>
                        </span>
                        {i === cursor && <CornerDownLeft className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="hidden items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground sm:flex">
              <span>↑↓ to choose</span>
              <span>Enter to open</span>
              <span>Esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
