import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NoteEditorProps {
  day: string
  initialContent: string
  isSaving: boolean
  onSave: (content: string) => Promise<void>
}

const PLACEHOLDER = `What did I learn today?
- Pattern:
- Mistake:
- Redo later:`

export function NoteEditor({ day, initialContent, isSaving, onSave }: NoteEditorProps) {
  const [draft, setDraft] = useState(initialContent)
  const [savedContent, setSavedContent] = useState(initialContent)
  const [mode, setMode] = useState<'write' | 'preview'>(initialContent ? 'preview' : 'write')
  const [error, setError] = useState<string | null>(null)
  const isDirty = draft !== savedContent

  async function handleSave() {
    if (!isDirty) return
    try {
      await onSave(draft)
      setSavedContent(draft)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the note.')
    }
  }

  function handleExport() {
    const blob = new Blob([draft], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-${day}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabClass = (active: boolean) =>
    cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', active ? 'bg-foreground text-background' : 'text-muted-foreground')

  return (
    <div className="rounded-2xl border border-border bg-card/40">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60">
        <div className="flex gap-1">
          <button type="button" onClick={() => setMode('write')} className={tabClass(mode === 'write')}>
            Write
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSave()
              setMode('preview')
            }}
            className={tabClass(mode === 'preview')}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {isSaving ? 'Saving…' : isDirty ? 'Unsaved' : savedContent ? 'Saved' : ''}
          </span>
          {draft && (
            <button type="button" onClick={handleExport} aria-label="Download note as .md" className="p-1.5 text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isDirty || isSaving}
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void handleSave()}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
              e.preventDefault()
              void handleSave()
            }
          }}
          placeholder={PLACEHOLDER}
          rows={8}
          className="w-full resize-y bg-transparent px-4 py-3 text-base leading-relaxed outline-none placeholder:text-muted-foreground/60 font-mono"
        />
      ) : (
        <div className="markdown px-4 py-3 text-[15px] leading-relaxed min-h-24">
          {draft ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">No notes yet. Tap Write to start.</p>
          )}
        </div>
      )}
      {error && <p className="px-4 pb-3 text-xs text-hard">{error}</p>}
    </div>
  )
}
