import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'

interface AccountSheetProps {
  isOpen: boolean
  session: Session | null
  isOwner: boolean
  onClose: () => void
  onSignIn: () => Promise<void>
  onSignOut: () => Promise<void>
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export function AccountSheet({ isOpen, session, isOwner, onClose, onSignIn, onSignOut }: AccountSheetProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    try {
      await onSignIn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Account"
            className="fixed inset-x-0 bottom-0 z-[61] mx-auto max-w-lg rounded-t-3xl border-t border-border bg-background px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/20" />
            {session ? (
              <>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-semibold">{session.user.email}</p>
                {!isOwner && <p className="mt-2 text-sm text-hard">This account can only view. Only the owner can edit.</p>}
                <button
                  type="button"
                  onClick={() => void onSignOut().then(onClose)}
                  className="mt-6 w-full rounded-2xl border border-border py-3.5 text-sm font-semibold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-xl">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tick tasks, write notes and attach files.</p>
                <button
                  type="button"
                  onClick={() => void handleSignIn()}
                  className="mt-6 w-full flex items-center justify-center gap-3 rounded-2xl bg-foreground text-background py-3.5 text-sm font-semibold"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                {error && <p className="mt-3 text-xs text-hard">{error}</p>}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
