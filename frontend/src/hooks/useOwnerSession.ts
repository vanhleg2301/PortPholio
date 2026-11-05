import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ROADMAP_OWNER_EMAIL, supabase } from '@/lib/supabase'

export function useOwnerSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client) return
    const loadSession = async () => {
      const { data } = await client.auth.getSession()
      setSession(data.session)
    }
    void loadSession()
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const isOwner = session?.user.email === ROADMAP_OWNER_EMAIL

  async function signIn(email: string) {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/roadmap` },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase?.auth.signOut()
  }

  return { session, isOwner, signIn, signOut }
}
