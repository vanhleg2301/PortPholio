import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight, FileText, Link2, Lock, Search } from 'lucide-react'
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
  const days = [...new Set([...notes.map((n) => n.day), ...resources.map((r) => r.day)])].sort((a, b) => b.localeCompare(a))
  const groups = days
    .map((day) => ({
      day,
      note: notes.find((n) => n.day === day),
      resources: resources.filter((r) => r.day === day),
    }))
    .filter(
      (g) =>
        !q ||
        g.note?.content.toLowerCase().includes(q) ||
        g.resources.some((r) => r.title.toLowerCase().includes(q) || r.url?.toLowerCase().includes(q))
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

      {isLoading && <div className="mt-4 h-32 rounded-2xl bg-foreground/[0.04] animate-pulse" />}
      {!isLoading && groups.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {q ? 'Nothing matches.' : 'No notes yet. Write one from the Today tab.'}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {groups.map((g) => (
          <li key={g.day} className="rounded-2xl border border-border bg-card/40 p-4">
            <button
              type="button"
              onClick={() => onOpenDay(g.day)}
              className="group -mx-2 -my-1 w-[calc(100%+1rem)] flex items-center justify-between rounded-lg px-2 py-1 hover:bg-foreground/[0.06] transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-widest">{format(parseISO(g.day), 'EEE d MMM yyyy')}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
            {g.note && <p className="mt-2 text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">{g.note.content}</p>}
            {g.resources.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {g.resources.map((r) => (
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
        ))}
      </ul>
    </div>
  )
}
