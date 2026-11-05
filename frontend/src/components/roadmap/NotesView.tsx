import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight, FileText, Link2, Lock, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOPICS, TOPIC_ORDER, type NoteTopic } from '@/data/roadmap/topics'
import type { RoadmapNote } from '@/hooks/useRoadmapNotes'
import type { RoadmapResource } from '@/hooks/useRoadmapResources'

interface NotesViewProps {
  isOwner: boolean
  isLoading: boolean
  notes: RoadmapNote[]
  resources: RoadmapResource[]
  onOpenDay: (date: string) => void
  onRequestSignIn: () => void
}

export function NotesView({ isOwner, isLoading, notes, resources, onOpenDay, onRequestSignIn }: NotesViewProps) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<NoteTopic | 'all'>('all')

  if (!isOwner) {
    return (
      <button
        type="button"
        onClick={onRequestSignIn}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-10 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
      >
        <Lock className="h-4 w-4" /> Notes are private. Sign in to see them.
      </button>
    )
  }

  const q = query.trim().toLowerCase()
  const usedTopics = TOPIC_ORDER.filter((t) => notes.some((n) => n.topic === t))
  const matchingNotes = notes.filter(
    (n) => (topic === 'all' || n.topic === topic) && (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  )
  const matchingResources =
    topic === 'all' ? resources.filter((r) => !q || r.title.toLowerCase().includes(q) || r.url?.toLowerCase().includes(q)) : []
  const days = [...new Set([...matchingNotes.map((n) => n.day), ...matchingResources.map((r) => r.day)])].sort((a, b) => b.localeCompare(a))

  const chip = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
      isActive ? 'bg-foreground text-background' : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.12]'
    )

  return (
    <div>
      <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 hover:border-foreground/30 focus-within:border-foreground/50 transition-colors">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes and resources"
          className="flex-1 bg-transparent text-base outline-none"
        />
      </label>

      {usedTopics.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button type="button" onClick={() => setTopic('all')} className={chip(topic === 'all')}>
            All · {notes.length}
          </button>
          {usedTopics.map((t) => (
            <button key={t} type="button" onClick={() => setTopic(t)} className={chip(topic === t)}>
              {TOPICS[t].label} · {notes.filter((n) => n.topic === t).length}
            </button>
          ))}
        </div>
      )}

      {isLoading && <div className="mt-4 h-32 rounded-2xl bg-foreground/[0.04] animate-pulse" />}
      {!isLoading && days.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {q || topic !== 'all' ? 'Nothing matches.' : 'No notes yet. Write one from the Today tab.'}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {days.map((day) => {
          const dayNotes = matchingNotes.filter((n) => n.day === day)
          const dayResources = matchingResources.filter((r) => r.day === day)
          return (
            <li key={day} className="rounded-2xl border border-border bg-card/40 p-4">
              <button
                type="button"
                onClick={() => onOpenDay(day)}
                className="group -mx-2 -my-1 w-[calc(100%+1rem)] flex items-center justify-between rounded-lg px-2 py-1 hover:bg-foreground/[0.06] transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-widest">{format(parseISO(day), 'EEE d MMM yyyy')}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>

              {dayNotes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onOpenDay(day)}
                  className="mt-3 block w-full text-left rounded-xl px-2 py-1.5 -mx-2 w-[calc(100%+1rem)] hover:bg-foreground/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest', TOPICS[n.topic].chipClass)}>
                      {TOPICS[n.topic].label}
                    </span>
                    <span className="font-semibold text-sm truncate">{n.title || 'Untitled'}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">{n.content}</span>
                </button>
              ))}

              {dayResources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dayResources.map((r) => (
                    <a
                      key={r.id}
                      href={r.openUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs hover:bg-foreground/[0.12] transition-colors"
                    >
                      {r.kind === 'link' ? <Link2 className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{r.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
