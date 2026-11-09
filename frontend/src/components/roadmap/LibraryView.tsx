import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, ChevronRight, Clock, GraduationCap, Library, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { findRanges, flashFirstMatch, getHighlightApi } from '@/lib/textHighlight'
import { TheoryCard } from '@/components/roadmap/TheoryCard'
import { ReferenceCard } from '@/components/roadmap/ReferenceCard'
import { listContainer, listItem } from '@/lib/motion'
import { LIBRARY, LIBRARY_TOPICS, searchLibrary, type LibraryHit, type LibraryTopic } from '@/data/library'

const COUNTS = {
  lessons: LIBRARY.filter((e) => e.kind === 'lesson').length,
  theory: LIBRARY.filter((e) => e.kind === 'theory').length,
  words: LIBRARY.filter((e) => e.kind === 'word').length,
  refs: LIBRARY.filter((e) => e.kind === 'ref').length,
}

// Kept while the app is open, so going into a lesson and back keeps the search.
const lastView: { query: string; topic: LibraryTopic | 'all' } = { query: '', topic: 'all' }

const LIBRARY_HIGHLIGHT = 'library-find'

const SUGGESTIONS = ['sorted', 'Counter', 'deque', 'heapq', 'split', 'two pointers', 'TCP handshake', 'deadlock', 'RAG']

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const TOPIC_LABEL = Object.fromEntries(LIBRARY_TOPICS.map((t) => [t.id, t.label])) as Record<LibraryTopic, string>

// Wraps every query word found in `text` in a <mark>.
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>
  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-400/35 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

// Opened from the global search: show this query and open this card at its first match.
export interface LibraryRequest {
  id: number
  query: string
  entryId?: string
}

interface LibraryViewProps {
  // `query` is passed when the lesson is opened from a search result.
  onOpenLesson: (lessonId: string, query?: string) => void
  request?: LibraryRequest | null
}

// One tab with everything the app teaches — lessons, theory cards and words — and a search over all of it.
export function LibraryView({ onOpenLesson, request }: LibraryViewProps) {
  const [query, setQueryState] = useState(lastView.query)
  const [topic, setTopicState] = useState<LibraryTopic | 'all'>(lastView.topic)
  const setQuery = (value: string) => {
    lastView.query = value
    setQueryState(value)
  }
  const setTopic = (value: LibraryTopic | 'all') => {
    lastView.topic = value
    setTopicState(value)
  }
  // A card opened by a search request, keyed by the request so it mounts already open.
  const [openRequest, setOpenRequest] = useState<LibraryRequest | null>(null)
  if (request && request.id !== openRequest?.id) {
    setOpenRequest(request)
    lastView.query = request.query
    lastView.topic = 'all'
    setQueryState(request.query)
    setTopicState('all')
  }
  const deferredQuery = useDeferredValue(query)
  const isSearching = deferredQuery.trim().length > 0
  const tokens = useMemo(() => deferredQuery.toLowerCase().split(/\s+/).filter(Boolean), [deferredQuery])

  // When some results contain the exact word, show only those; results that only match the
  // start of a longer word ("star" in "start") wait behind a "partial matches" button.
  const searchHits = useMemo(() => searchLibrary(deferredQuery, 'all'), [deferredQuery])
  const hasExact = searchHits.some((h) => h.isExact)
  const allHits = useMemo(() => (hasExact ? searchHits.filter((h) => h.isExact) : searchHits), [searchHits, hasExact])
  const partialHits = hasExact ? searchHits.filter((h) => !h.isExact && (topic === 'all' || h.entry.topic === topic)) : []
  const [partialFor, setPartialFor] = useState<string | null>(null)
  const isPartialOpen = partialFor === deferredQuery || partialHits.some((h) => h.entry.id === openRequest?.entryId)
  const hits = topic === 'all' ? allHits : allHits.filter((h) => h.entry.topic === topic)
  const countByTopic = useMemo(() => {
    const counts = new Map<string, number>()
    for (const h of allHits) counts.set(h.entry.topic, (counts.get(h.entry.topic) ?? 0) + 1)
    return counts
  }, [allHits])

  // Opening a card while searching scrolls to the first match inside it.
  const cancelJump = useRef<(() => void) | null>(null)
  function jumpInsideCard(entryId: string, words: string) {
    cancelJump.current?.()
    if (words.trim().length < 2) return
    const card = () => resultsRef.current?.querySelector<HTMLElement>(`[data-entry-id="${CSS.escape(entryId)}"] [data-card-body]`) ?? null
    cancelJump.current = flashFirstMatch(card, words)
  }
  useEffect(() => {
    if (openRequest?.entryId) jumpInsideCard(openRequest.entryId, openRequest.query)
    return () => cancelJump.current?.()
  }, [openRequest])

  // Marks every match in the results, including inside a theory card once it is opened.
  const resultsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const api = getHighlightApi()
    const root = resultsRef.current
    if (!api || !root) return
    const words = tokens.filter((t) => t.length >= 2)
    if (!isSearching || words.length === 0) {
      api.registry.delete(LIBRARY_HIGHLIGHT)
      return
    }
    const apply = () => api.registry.set(LIBRARY_HIGHLIGHT, new api.Highlight(...words.flatMap((w) => findRanges(root, w, true))))
    apply()
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(apply, 150)
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      api.registry.delete(LIBRARY_HIGHLIGHT)
    }
  }, [tokens, isSearching])

  function renderEntry({ entry, snippet }: LibraryHit, showTopic: boolean): ReactNode {
    const topicChip = showTopic && (
      <span className="rounded-full bg-foreground/[0.07] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {TOPIC_LABEL[entry.topic]}
      </span>
    )
    const snippetLine = isSearching && snippet && (
      <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
        <Highlight text={snippet} tokens={tokens} />
      </span>
    )
    if (entry.kind === 'lesson') {
      return (
        <button
          type="button"
          onClick={() => onOpenLesson(entry.lesson.id, isSearching ? deferredQuery : undefined)}
          className="group flex w-full items-start gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] px-4 py-3.5 text-left hover:border-violet-500/50 hover:bg-violet-500/[0.08] transition-colors"
        >
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold">
                <Highlight text={entry.title} tokens={tokens} />
              </span>
              {topicChip}
            </span>
            <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Lesson · <Clock className="h-3 w-3" /> {entry.lesson.minutes} min
            </span>
            {!isSearching && <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{entry.summary}</span>}
            {snippetLine}
          </span>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </button>
      )
    }
    if (entry.kind === 'ref') {
      return (
        <ReferenceCard
          key={entry.id === openRequest?.entryId ? `${entry.id}-${openRequest.id}` : entry.id}
          item={entry.item}
          isOpenByDefault={entry.id === openRequest?.entryId}
          onOpenChange={(isOpen) => {
            if (isOpen && isSearching) jumpInsideCard(entry.id, deferredQuery)
          }}
          headerExtra={
            (topicChip || snippetLine) && (
              <span className="mt-1.5 block">
                {topicChip}
                {snippetLine}
              </span>
            )
          }
        />
      )
    }
    if (entry.kind === 'theory') {
      return (
        <TheoryCard
          key={entry.id === openRequest?.entryId ? `${entry.id}-${openRequest.id}` : entry.id}
          reference={entry.reference}
          isOpenByDefault={entry.id === openRequest?.entryId}
          onOpenChange={(isOpen) => {
            if (isOpen && isSearching) jumpInsideCard(entry.id, deferredQuery)
          }}
          headerExtra={
            (topicChip || snippetLine) && (
              <span className="mt-1.5 block">
                {topicChip}
                {snippetLine}
              </span>
            )
          }
        />
      )
    }
    return (
      <div className="rounded-2xl border border-border px-4 py-3">
        <p className="flex flex-wrap items-center gap-2">
          <BookMarked className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <span className="text-sm font-semibold">
            <Highlight text={entry.title} tokens={tokens} />
          </span>
          {topicChip}
        </p>
        <p className="mt-1 text-sm leading-relaxed">
          <InlineText text={entry.summary} />
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-semibold">For example: </span>
          <InlineText text={entry.example} />
        </p>
      </div>
    )
  }

  function renderTopic(id: LibraryTopic): ReactNode {
    const meta = LIBRARY_TOPICS.find((t) => t.id === id)
    const entries = hits.filter((h) => h.entry.topic === id)
    const groups = [...new Set(entries.map((h) => h.entry.group))]
    return (
      <section>
        <h2 className="font-display text-xl font-bold">{meta?.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{meta?.about}</p>
        {groups.length > 1 && (
          <nav aria-label="Sections" className="mt-3 flex flex-wrap gap-1.5">
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => document.getElementById(`library-${slug(group)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-foreground/[0.12] hover:text-foreground transition-colors"
              >
                {group} <span className="opacity-60">{entries.filter((h) => h.entry.group === group).length}</span>
              </button>
            ))}
          </nav>
        )}
        {groups.map((group) => (
          <div key={group} id={`library-${slug(group)}`} className="mt-6 scroll-mt-32">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{group}</p>
            <div className={cn('grid grid-cols-1 gap-2', group === 'Key words' && 'sm:grid-cols-2')}>
              {entries
                .filter((h) => h.entry.group === group)
                .map((h) => (
                  <div key={h.entry.id} data-entry-id={h.entry.id} className="min-w-0">
                    {renderEntry(h, false)}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  // "All" without a search: a contents page with one card per topic, instead of one very long list.
  function renderOverview(): ReactNode {
    return (
      <>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Try a search</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Topics</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LIBRARY_TOPICS.map((t) => {
            const entries = LIBRARY.filter((e) => e.topic === t.id)
            const count = (kind: string) => entries.filter((e) => e.kind === kind).length
            const parts = [
              count('lesson') > 0 && `${count('lesson')} lessons`,
              count('theory') > 0 && `${count('theory')} cards`,
              count('word') > 0 && `${count('word')} words`,
              count('ref') > 0 && `${count('ref')} functions and tools`,
            ].filter(Boolean)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTopic(t.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="group flex items-start gap-3 rounded-2xl border border-border p-4 text-left hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-bold">{t.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.about}</span>
                  <span className="mt-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{parts.join(' · ')}</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="pb-10">
      <motion.div variants={listItem}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Library className="h-3.5 w-3.5" /> Library
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">Learn and look up</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {COUNTS.lessons} lessons, {COUNTS.theory} theory cards, {COUNTS.refs} Python functions and tools, and {COUNTS.words} key words.
          Learn here, and look things up here while you solve problems: search looks inside every card, example and quiz.
        </p>
      </motion.div>

      <motion.div variants={listItem} className="mt-5">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 focus-within:border-foreground/50 transition-colors">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: hash map, deadlock, TCP, rate limiter…"
            aria-label="Search the library"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                setQuery('')
              }}
              aria-label="Clear search"
              className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {[{ id: 'all' as const, label: 'All' }, ...LIBRARY_TOPICS].map((t) => {
            const count = t.id === 'all' ? allHits.length : (countByTopic.get(t.id) ?? 0)
            const isActive = topic === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                aria-pressed={isActive}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  isActive ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {t.label} <span className={cn('tabular-nums', isActive ? 'opacity-70' : 'opacity-60')}>{count}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      <motion.div ref={resultsRef} variants={listItem} className="mt-6">
        {isSearching ? (
          hits.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing found for “{deferredQuery.trim()}”. Try a shorter or different word.
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                {hits.length} result{hits.length === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {hits.map((h) => (
                  <div key={h.entry.id} data-entry-id={h.entry.id} className="min-w-0">{renderEntry(h, topic === 'all')}</div>
                ))}
              </div>
              {partialHits.length > 0 && (
                <div className="mt-5">
                  <button
                    type="button"
                    data-find-skip
                    onClick={() => setPartialFor(isPartialOpen ? null : deferredQuery)}
                    aria-expanded={isPartialOpen}
                    className="w-full rounded-2xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    {isPartialOpen ? 'Hide' : 'Show'} {partialHits.length} partial match{partialHits.length === 1 ? '' : 'es'}
                    <span className="block text-xs opacity-80">Words that only start with “{deferredQuery.trim()}”, like longer words.</span>
                  </button>
                  {isPartialOpen && (
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {partialHits.map((h) => (
                        <div key={h.entry.id} data-entry-id={h.entry.id} className="min-w-0">{renderEntry(h, topic === 'all')}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )
        ) : topic === 'all' ? (
          renderOverview()
        ) : (
          renderTopic(topic)
        )}
      </motion.div>
    </motion.div>
  )
}
