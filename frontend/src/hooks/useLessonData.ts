import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const PROGRESS_KEY = ['roadmap-lesson-progress'] as const
const CODE_KEY = ['roadmap-code'] as const

const progressSchema = z.object({ lesson_id: z.string(), item_id: z.string() })
const codeSchema = z.object({ key: z.string(), code: z.string() })

async function fetchLessonProgress(): Promise<Set<string>> {
  if (!supabase) return new Set()
  const { data, error } = await supabase.from('roadmap_lesson_progress').select('lesson_id, item_id')
  if (error) throw error
  return new Set(z.array(progressSchema).parse(data).map((r) => `${r.lesson_id}:${r.item_id}`))
}

async function fetchSavedCode(): Promise<Map<string, string>> {
  if (!supabase) return new Map()
  const { data, error } = await supabase.from('roadmap_code').select('key, code')
  if (error) throw error
  return new Map(z.array(codeSchema).parse(data).map((r) => [r.key, r.code]))
}

// "lessonId:itemId" for every passed exercise.
export function useLessonProgress(isEnabled: boolean) {
  return useQuery({ queryKey: PROGRESS_KEY, queryFn: fetchLessonProgress, enabled: isEnabled })
}

export function useMarkExercisePassed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ lessonId, itemId }: { lessonId: string; itemId: string }) => {
      if (!supabase) throw new Error('Supabase is not configured')
      const { error } = await supabase.from('roadmap_lesson_progress').upsert({ lesson_id: lessonId, item_id: itemId })
      if (error) throw error
    },
    onSuccess: (_data, { lessonId, itemId }) =>
      queryClient.setQueryData<Set<string>>(PROGRESS_KEY, (prev) => new Set(prev ?? []).add(`${lessonId}:${itemId}`)),
  })
}

export function useSavedCode(isEnabled: boolean) {
  return useQuery({ queryKey: CODE_KEY, queryFn: fetchSavedCode, enabled: isEnabled, staleTime: Infinity })
}

export function useSaveCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, code }: { key: string; code: string }) => {
      if (!supabase) throw new Error('Supabase is not configured')
      const { error } = await supabase.from('roadmap_code').upsert({ key, code, updated_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: (_data, { key, code }) =>
      queryClient.setQueryData<Map<string, string>>(CODE_KEY, (prev) => new Map(prev ?? []).set(key, code)),
  })
}
