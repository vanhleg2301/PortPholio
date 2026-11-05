import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { isNoteTopic, type NoteTopic } from '@/data/roadmap/topics'

const noteSchema = z.object({
  id: z.string(),
  day: z.string(),
  topic: z.string().transform((t): NoteTopic => (isNoteTopic(t) ? t : 'general')),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type RoadmapNote = z.infer<typeof noteSchema>

const NOTES_KEY = ['roadmap-notes'] as const
const COLUMNS = 'id, day, topic, title, content, created_at, updated_at'

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

function sortNotes(notes: RoadmapNote[]): RoadmapNote[] {
  return [...notes].sort((a, b) => b.day.localeCompare(a.day) || a.created_at.localeCompare(b.created_at))
}

async function fetchNotes(): Promise<RoadmapNote[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('roadmap_notes').select(COLUMNS)
  if (error) throw error
  return sortNotes(z.array(noteSchema).parse(data))
}

export interface NoteDraft {
  title: string
  topic: NoteTopic
  content: string
}

async function createNote(input: NoteDraft & { day: string }): Promise<RoadmapNote> {
  const { data, error } = await getClient().from('roadmap_notes').insert(input).select(COLUMNS).single()
  if (error) throw error
  return noteSchema.parse(data)
}

async function updateNote({ id, ...draft }: NoteDraft & { id: string }): Promise<RoadmapNote> {
  const { data, error } = await getClient()
    .from('roadmap_notes')
    .update({ ...draft, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return noteSchema.parse(data)
}

async function deleteNote(id: string): Promise<string> {
  const { error } = await getClient().from('roadmap_notes').delete().eq('id', id)
  if (error) throw error
  return id
}

export function useRoadmapNotes(isEnabled: boolean) {
  return useQuery({ queryKey: NOTES_KEY, queryFn: fetchNotes, enabled: isEnabled })
}

function useUpsertCache() {
  const queryClient = useQueryClient()
  return (note: RoadmapNote) =>
    queryClient.setQueryData<RoadmapNote[]>(NOTES_KEY, (prev = []) => sortNotes([...prev.filter((n) => n.id !== note.id), note]))
}

export function useCreateNote() {
  const upsert = useUpsertCache()
  return useMutation({ mutationFn: createNote, onSuccess: upsert })
}

export function useUpdateNote() {
  const upsert = useUpsertCache()
  return useMutation({ mutationFn: updateNote, onSuccess: upsert })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (id) => queryClient.setQueryData<RoadmapNote[]>(NOTES_KEY, (prev = []) => prev.filter((n) => n.id !== id)),
  })
}
