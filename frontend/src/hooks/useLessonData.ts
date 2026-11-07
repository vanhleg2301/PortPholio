import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchAllRows } from '@/lib/fetchAllRows'
import { supabase } from '@/lib/supabase'

// Lesson progress and saved answers belong to the signed-in account (RLS: user_id = auth.uid()).
const progressKey = (userId: string | undefined) => ['roadmap-lesson-progress', userId] as const
const codeKey = (userId: string | undefined) => ['roadmap-code', userId] as const

const progressSchema = z.object({ lesson_id: z.string(), item_id: z.string() })
const codeSchema = z.object({ key: z.string(), code: z.string() })

async function fetchLessonProgress(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set()
  const client = supabase
  const rows = await fetchAllRows((from, to) =>
    client.from('roadmap_lesson_progress').select('lesson_id, item_id').eq('user_id', userId).order('lesson_id').order('item_id').range(from, to)
  )
  return new Set(z.array(progressSchema).parse(rows).map((r) => `${r.lesson_id}:${r.item_id}`))
}

async function fetchSavedCode(userId: string): Promise<Map<string, string>> {
  if (!supabase) return new Map()
  const client = supabase
  const rows = await fetchAllRows((from, to) => client.from('roadmap_code').select('key, code').eq('user_id', userId).order('key').range(from, to))
  return new Map(z.array(codeSchema).parse(rows).map((r) => [r.key, r.code]))
}

// "lessonId:itemId" for every passed exercise and test part.
export function useLessonProgress(userId: string | undefined) {
  return useQuery({
    queryKey: progressKey(userId),
    queryFn: () => fetchLessonProgress(userId ?? ''),
    enabled: Boolean(userId),
    // The copy restored from this device's storage may be older than what another device saved.
    refetchOnMount: 'always',
  })
}

export function useMarkExercisePassed(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ lessonId, itemId }: { lessonId: string; itemId: string }) => {
      if (!supabase || !userId) throw new Error('Sign in to save your progress')
      const { error } = await supabase.from('roadmap_lesson_progress').upsert({ user_id: userId, lesson_id: lessonId, item_id: itemId })
      if (error) throw error
    },
    onSuccess: (_data, { lessonId, itemId }) =>
      queryClient.setQueryData<Set<string>>(progressKey(userId), (prev) => new Set(prev ?? []).add(`${lessonId}:${itemId}`)),
  })
}

// Code cells, interview answers and multiple-choice answers, by key.
export function useSavedCode(userId: string | undefined) {
  return useQuery({
    queryKey: codeKey(userId),
    queryFn: () => fetchSavedCode(userId ?? ''),
    enabled: Boolean(userId),
    // Was `staleTime: Infinity`: together with the offline copy in localStorage, each device kept
    // showing its own old answers, test state and flashcards and never loaded the other device's.
    refetchOnMount: 'always',
  })
}

export function useSaveCode(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, code }: { key: string; code: string }) => {
      if (!supabase || !userId) throw new Error('Sign in to save your answers')
      const { error } = await supabase.from('roadmap_code').upsert({ user_id: userId, key, code, updated_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: (_data, { key, code }) =>
      queryClient.setQueryData<Map<string, string>>(codeKey(userId), (prev) => new Map(prev ?? []).set(key, code)),
  })
}
