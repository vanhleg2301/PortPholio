import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { ConfirmDialog } from '@/components/roadmap/ConfirmDialog'
import { NoteEditor } from '@/components/roadmap/NoteEditor'
import { TOPICS, TOPIC_ORDER, type NoteTopic } from '@/data/roadmap/topics'
import { useCreateNote, useDeleteNote, useUpdateNote, type RoadmapNote } from '@/hooks/useRoadmapNotes'

interface DayNotesProps {
  day: string
  notes: RoadmapNote[]
  suggestedTopics: NoteTopic[]
}

function getSnippet(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|[\]-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140)
}

export function DayNotes({ day, notes, suggestedTopics }: DayNotesProps) {
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<RoadmapNote | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const pickerTopics = [...suggestedTopics, ...TOPIC_ORDER.filter((t) => !suggestedTopics.includes(t))]

  async function handleCreate(topic: NoteTopic) {
    setIsPickerOpen(false)
    try {
      const note = await createNote.mutateAsync({
        day,
        topic,
        title: topic === 'general' ? '' : `${TOPICS[topic].label} notes`,
        content: TOPICS[topic].template,
      })
      setActiveId(note.id)
    } catch {
      // shown via createNote.error
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteNote.mutate(pendingDelete.id, {
      onSettled: () => {
        setIsConfirmOpen(false)
        if (activeId === pendingDelete.id) setActiveId(null)
      },
    })
  }

  const error = createNote.error ?? deleteNote.error

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
      {notes.map((note, i) => (
        <motion.div
          key={note.id}
          layout="position"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(i, 8) * 0.04 } }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
        >
        <motion.div
          key={note.id === activeId ? 'editor' : 'card'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
        {note.id === activeId ? (
          <NoteEditor
            note={note}
            onSave={async (draft) => {
              await updateNote.mutateAsync({ id: note.id, ...draft })
            }}
            onDelete={() => {
              setPendingDelete(note)
              setIsConfirmOpen(true)
            }}
            onClose={() => setActiveId(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setActiveId(note.id)}
            className="text-left rounded-2xl border border-border bg-card/40 px-4 py-3.5 hover:border-foreground/30 hover:bg-foreground/[0.03] transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest', TOPICS[note.topic].chipClass)}>
                {TOPICS[note.topic].label}
              </span>
              <span className="text-[11px] text-muted-foreground">{format(parseISO(note.updated_at), 'HH:mm')}</span>
            </div>
            <p className="mt-2 font-semibold leading-snug">{note.title || 'Untitled'}</p>
            {getSnippet(note.content) && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{getSnippet(note.content)}</p>}
          </button>
        )}
        </motion.div>
        </motion.div>
      ))}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
      {isPickerOpen ? (
        <motion.div
          key="picker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="rounded-2xl border border-dashed border-border p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">New note about…</p>
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              aria-label="Cancel"
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pickerTopics.map((topic, i) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.025 } }}
                whileTap={{ scale: 0.94 }}
                key={topic}
                type="button"
                onClick={() => void handleCreate(topic)}
                className={cn(
                  'rounded-full px-3.5 py-2 text-xs font-semibold transition-shadow hover:ring-2 hover:ring-current',
                  TOPICS[topic].chipClass,
                  suggestedTopics.includes(topic) && 'ring-1 ring-current'
                )}
              >
                {TOPICS[topic].label}
              </motion.button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Each topic starts with its own template. Highlighted ones match today's tasks.</p>
        </motion.div>
      ) : (
        <motion.button
          key="new"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setIsPickerOpen(true)}
          disabled={createNote.isPending}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {createNote.isPending ? 'Creating…' : 'New note'}
        </motion.button>
      )}
      </AnimatePresence>

      {error && <p className="text-xs text-hard">{error.message}</p>}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this note?"
        description={
          <>
            <span className="font-medium text-foreground">{pendingDelete?.title || 'Untitled'}</span> will be permanently deleted.
          </>
        }
        confirmLabel="Delete note"
        isPending={deleteNote.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
