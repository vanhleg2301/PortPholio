import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const noteSchema = z.object({ day: z.string(), content: z.string(), updated_at: z.string() })
export type RoadmapNote = z.infer<typeof noteSchema>

const NOTES_KEY = ['roadmap-notes'] as const

async function fetchNotes(): Promise<RoadmapNote[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('roadmap_notes')
    .select('day, content, updated_at')
    .order('day', { ascending: false })
  if (error) throw error
  return z.array(noteSchema).parse(data)
}

interface SaveNoteInput {
  day: string
  content: string
}

async function saveNote({ day, content }: SaveNoteInput): Promise<RoadmapNote | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  if (content.trim() === '') {
    const { error } = await supabase.from('roadmap_notes').delete().eq('day', day)
    if (error) throw error
    return null
  }
  const { data, error } = await supabase
    .from('roadmap_notes')
    .upsert({ day, content, updated_at: new Date().toISOString() })
    .select('day, content, updated_at')
    .single()
  if (error) throw error
  return noteSchema.parse(data)
}

export function useRoadmapNotes(isEnabled: boolean) {
  return useQuery({ queryKey: NOTES_KEY, queryFn: fetchNotes, enabled: isEnabled })
}

export function useSaveNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveNote,
    onSuccess: (saved, { day }) => {
      queryClient.setQueryData<RoadmapNote[]>(NOTES_KEY, (prev = []) => {
        const rest = prev.filter((n) => n.day !== day)
        return saved ? [saved, ...rest].sort((a, b) => b.day.localeCompare(a.day)) : rest
      })
    },
  })
}
