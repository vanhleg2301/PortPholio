import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { clearPersistedQueryCache } from '@/lib/queryPersistence'
import { ROADMAP_OWNER_EMAIL, supabase } from '@/lib/supabase'

export function useOwnerSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(!supabase)
  const queryClient = useQueryClient()

  useEffect(() => {
    const client = supabase
    if (!client) return
    const loadSession = async () => {
      const { data } = await client.auth.getSession()
      setSession(data.session)
      setIsReady(true)
    }
    void loadSession()
    const { data } = client.auth.onAuthStateChange((event, next) => {
      // Signing out removes this account's data from the device (memory and offline copy).
      if (event === 'SIGNED_OUT') clearPersistedQueryCache(queryClient)
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

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
