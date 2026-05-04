import { createMiddleware } from 'hono/factory'
import { supabase } from '../lib/supabase.js'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  c.set('user', data.user)
  await next()
})

export const optionalAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data } = await supabase.auth.getUser(token)
    if (data.user) c.set('user', data.user)
  }
  await next()
})
