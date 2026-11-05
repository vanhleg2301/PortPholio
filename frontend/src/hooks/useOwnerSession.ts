import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ROADMAP_OWNER_EMAIL, supabase } from '@/lib/supabase'

export function useOwnerSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(!supabase)

  useEffect(() => {
    const client = supabase
    if (!client) return
    const loadSession = async () => {
      const { data } = await client.auth.getSession()
      setSession(data.session)
      setIsReady(true)
    }
    void loadSession()
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const isOwner = session?.user.email === ROADMAP_OWNER_EMAIL

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/roadmap` },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase?.auth.signOut()
  }

  return { session, isReady, isOwner, signInWithGoogle, signOut }
}
