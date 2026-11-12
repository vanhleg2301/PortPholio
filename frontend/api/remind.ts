// Daily study reminder, called by Vercel Cron (see vercel.json).
// Sends a Web Push to every saved device when nothing was ticked today or
// reviews are waiting. Runs with the Supabase service role (server only).
// Kept self-contained (no imports from src/) so the function bundles on its own.
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const TIME_ZONE = 'Asia/Ho_Chi_Minh'

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

function getTodayInVietnam(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export async function GET(request: Request): Promise<Response> {
  if (request.headers.get('authorization') !== `Bearer ${getEnv('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
  webpush.setVapidDetails('mailto:vanhleg2301@gmail.com', getEnv('VITE_VAPID_PUBLIC_KEY'), getEnv('VAPID_PRIVATE_KEY'))

  const today = getTodayInVietnam()

  const [progress, reviews, subscriptions] = await Promise.all([
    supabase.from('roadmap_progress').select('task_id').like('task_id', `${today}:%`),
    supabase.from('roadmap_reviews').select('id').lte('due_date', today).is('completed_at', null),
    supabase.from('push_subscriptions').select('endpoint, p256dh, auth'),
  ])
  if (progress.error || reviews.error || subscriptions.error) {
    return Response.json({ error: (progress.error ?? reviews.error ?? subscriptions.error)?.message }, { status: 500 })
  }

  // Task ids start with the plan date, so this counts what was ticked for today.
  const tickedToday = progress.data.length
  const dueReviews = reviews.data.length
  if (tickedToday > 0 && dueReviews === 0) {
    return Response.json({ sent: 0, reason: 'studied today, no reviews due' })
  }

  const reviewText = `${dueReviews} review${dueReviews > 1 ? 's' : ''} waiting`
  const payload = JSON.stringify({
    title: tickedToday === 0 ? 'No study yet today' : 'Reviews are waiting',
    body: tickedToday === 0 ? `Open today's plan and keep the streak going.${dueReviews > 0 ? ` ${reviewText}.` : ''}` : `${reviewText}. A few minutes is enough.`,
    url: '/roadmap/today',
  })

  let sent = 0
  for (const sub of subscriptions.data) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
      sent++
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode
      // The device unsubscribed or the subscription expired: forget it.
      if (statusCode === 404 || statusCode === 410) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    }
  }

  return Response.json({ sent, tickedToday, dueReviews })
}
