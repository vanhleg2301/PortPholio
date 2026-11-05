import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const sessionSchema = z.object({
  id: z.string(),
  day: z.string(),
  started_at: z.string(),
  minutes: z.number(),
  task_id: z.string().nullable(),
})
export type StudySession = z.infer<typeof sessionSchema>

const SESSIONS_KEY = ['roadmap-sessions'] as const

async function fetchSessions(): Promise<StudySession[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('roadmap_sessions').select('id, day, started_at, minutes, task_id').order('started_at')
  if (error) throw error
  return z.array(sessionSchema).parse(data)
}

interface AddSessionInput {
  day: string
  startedAt: string
  minutes: number
  taskId: string | null
}

async function addSession({ day, startedAt, minutes, taskId }: AddSessionInput) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('roadmap_sessions').insert({ day, started_at: startedAt, minutes, task_id: taskId })
  if (error) throw error
}

export function useStudySessions() {
  return useQuery({ queryKey: SESSIONS_KEY, queryFn: fetchSessions, staleTime: 60_000 })
}

export function useAddSession() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: addSession, onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }) })
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
