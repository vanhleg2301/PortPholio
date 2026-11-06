import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays, format, parseISO } from 'date-fns'
import { z } from 'zod'
import { fetchAllRows } from '@/lib/fetchAllRows'
import { supabase } from '@/lib/supabase'

export const REVIEW_STEPS = [3, 7, 30] as const

const reviewSchema = z.object({
  id: z.string(),
  task_id: z.string(),
  task_title: z.string(),
  due_date: z.string(),
  step_days: z.number(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
})
export type RoadmapReview = z.infer<typeof reviewSchema>

const REVIEWS_KEY = ['roadmap-reviews'] as const
const COLUMNS = 'id, task_id, task_title, due_date, step_days, completed_at, created_at'

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const shiftDay = (day: string, days: number) => format(addDays(parseISO(day), days), 'yyyy-MM-dd')

async function fetchReviews(): Promise<RoadmapReview[]> {
  if (!supabase) return []
  const client = supabase
  const rows = await fetchAllRows((from, to) => client.from('roadmap_reviews').select(COLUMNS).order('due_date').order('id').range(from, to))
  return z.array(reviewSchema).parse(rows)
}

interface ScheduleInput {
  taskId: string
  taskTitle: string
  fromDay: string
}

async function scheduleReviews({ taskId, taskTitle, fromDay }: ScheduleInput) {
  const rows = REVIEW_STEPS.map((step) => ({ task_id: taskId, task_title: taskTitle, due_date: shiftDay(fromDay, step), step_days: step }))
  const { error } = await getClient().from('roadmap_reviews').insert(rows)
  if (error) throw error
}

async function unscheduleReviews(taskId: string) {
  const { error } = await getClient().from('roadmap_reviews').delete().eq('task_id', taskId).is('completed_at', null)
  if (error) throw error
}

interface CompleteInput {
  review: RoadmapReview
  isStillHard: boolean
  today: string
}

// "Still hard" closes this review and books another one 3 days out.
async function completeReview({ review, isStillHard, today }: CompleteInput) {
  const client = getClient()
  const { error } = await client.from('roadmap_reviews').update({ completed_at: new Date().toISOString() }).eq('id', review.id)
  if (error) throw error
  if (isStillHard) {
    const { error: insertError } = await client.from('roadmap_reviews').insert({
      task_id: review.task_id,
      task_title: review.task_title,
      due_date: shiftDay(today, REVIEW_STEPS[0]),
      step_days: REVIEW_STEPS[0],
    })
    if (insertError) throw insertError
  }
}

export function useRoadmapReviews(isEnabled: boolean) {
  return useQuery({ queryKey: REVIEWS_KEY, queryFn: fetchReviews, enabled: isEnabled })
}

function useReviewMutation<T>(mutationFn: (input: T) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }) })
}

export const useScheduleReviews = () => useReviewMutation(scheduleReviews)
export const useUnscheduleReviews = () => useReviewMutation(unscheduleReviews)
export const useCompleteReview = () => useReviewMutation(completeReview)
