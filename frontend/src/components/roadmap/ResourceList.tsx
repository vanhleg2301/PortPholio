import { useRef, useState, type FormEvent } from 'react'
import { FileText, Link2, Paperclip, Plus, Trash2 } from 'lucide-react'
import { useAddLink, useDeleteResource, useUploadFile, type RoadmapResource } from '@/hooks/useRoadmapResources'

interface ResourceListProps {
  day: string
  resources: RoadmapResource[]
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ''
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ResourceList({ day, resources }: ResourceListProps) {
  const addLink = useAddLink()
  const uploadFile = useUploadFile()
  const deleteResource = useDeleteResource()
  const fileInput = useRef<HTMLInputElement>(null)
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const error = addLink.error ?? uploadFile.error ?? deleteResource.error

  async function handleAddLink(e: FormEvent) {
    e.preventDefault()
    const cleanUrl = /^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    if (!URL.canParse(cleanUrl)) return
    try {
      await addLink.mutateAsync({ day, url: cleanUrl, title: title.trim() || new URL(cleanUrl).hostname })
    } catch {
      return // shown via addLink.error
    }
    setUrl('')
    setTitle('')
    setIsLinkFormOpen(false)
  }

  async function handleFiles(files: FileList | null) {
    try {
      for (const file of Array.from(files ?? [])) await uploadFile.mutateAsync({ day, file })
    } catch {
      // shown via uploadFile.error
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function handleDelete(resource: RoadmapResource) {
    if (window.confirm(`Delete "${resource.title}"?`)) deleteResource.mutate(resource)
  }

  const inputClass = 'w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-base outline-none focus:border-foreground/50'

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-3">
      {resources.length > 0 && (
        <ul className="divide-y divide-border/50 mb-2">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              {r.kind === 'link' ? (
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {r.openUrl ? (
                <a href={r.openUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm hover:underline">
                  {r.title}
                </a>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{r.title}</span>
              )}
              <span className="text-[11px] text-muted-foreground">{formatSize(r.size_bytes)}</span>
              <button type="button" onClick={() => handleDelete(r)} aria-label={`Delete ${r.title}`} className="p-1.5 text-muted-foreground hover:text-hard">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isLinkFormOpen ? (
        <form onSubmit={(e) => void handleAddLink(e)} className="flex flex-col gap-2">
          <input type="text" inputMode="url" required autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a link" className={inputClass} />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" disabled={addLink.isPending} className="flex-1 rounded-xl bg-foreground text-background py-2.5 text-sm font-semibold disabled:opacity-50">
              {addLink.isPending ? 'Adding…' : 'Add link'}
            </button>
            <button type="button" onClick={() => setIsLinkFormOpen(false)} className="rounded-xl border border-border px-4 text-sm">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setIsLinkFormOpen(true)} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Link
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploadFile.isPending}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Paperclip className="h-4 w-4" /> {uploadFile.isPending ? 'Uploading…' : 'File'}
          </button>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
        </div>
      )}
      {error && <p className="mt-2 text-xs text-hard">{error.message}</p>}
    </div>
  )
}
