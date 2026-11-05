import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const progressRowSchema = z.object({ task_id: z.string(), completed_at: z.string() })
type ProgressRow = z.infer<typeof progressRowSchema>

const PROGRESS_KEY = ['roadmap-progress'] as const

async function fetchProgress(): Promise<ProgressRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('roadmap_progress').select('task_id, completed_at')
  if (error) throw error
  return z.array(progressRowSchema).parse(data)
}

interface ToggleInput {
  taskId: string
  isDone: boolean
}

async function toggleTask({ taskId, isDone }: ToggleInput) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = isDone
    ? await supabase.from('roadmap_progress').upsert({ task_id: taskId })
    : await supabase.from('roadmap_progress').delete().eq('task_id', taskId)
  if (error) throw error
}

export function useRoadmapProgress() {
  return useQuery({ queryKey: PROGRESS_KEY, queryFn: fetchProgress, staleTime: 30_000 })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleTask,
    onMutate: async ({ taskId, isDone }) => {
      await queryClient.cancelQueries({ queryKey: PROGRESS_KEY })
      const previous = queryClient.getQueryData<ProgressRow[]>(PROGRESS_KEY) ?? []
      const next = isDone
        ? [...previous, { task_id: taskId, completed_at: new Date().toISOString() }]
        : previous.filter((row) => row.task_id !== taskId)
      queryClient.setQueryData(PROGRESS_KEY, next)
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context) queryClient.setQueryData(PROGRESS_KEY, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROGRESS_KEY }),
  })
}
