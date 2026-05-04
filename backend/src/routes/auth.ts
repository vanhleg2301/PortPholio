import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'

export const authRouter = new Hono()

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

authRouter.post('/signin', zValidator('json', signInSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return c.json({ error: error.message }, 400)
  return c.json({ user: data.user, session: data.session })
})

authRouter.post('/signout', async (c) => {
  const token = c.req.header('Authorization')?.slice(7)
  if (token) await supabase.auth.admin.signOut(token)
  return c.json({ success: true })
})

authRouter.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.slice(7)
  if (!token) return c.json({ user: null })
  const { data } = await supabase.auth.getUser(token)
  return c.json({ user: data.user })
})
