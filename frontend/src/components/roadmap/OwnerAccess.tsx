import { useState, type FormEvent } from 'react'
import { ROADMAP_OWNER_EMAIL } from '@/lib/supabase'

interface OwnerAccessProps {
  isSignedIn: boolean
  isOwner: boolean
  onSignIn: (email: string) => Promise<void>
  onSignOut: () => Promise<void>
}

export function OwnerAccess({ isSignedIn, isOwner, onSignIn, onSignOut }: OwnerAccessProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (email.trim().toLowerCase() !== ROADMAP_OWNER_EMAIL) {
      setStatus('Only the owner can edit this roadmap.')
      return
    }
    try {
      await onSignIn(email.trim())
      setStatus('Magic link sent. Check your inbox.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not send the link.')
    }
  }

  const linkClass = 'text-[11px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors'

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {isOwner ? 'Editing as owner' : 'Signed in (read only)'}
        </span>
        <button type="button" onClick={() => void onSignOut()} className={linkClass}>
          Sign out
        </button>
      </div>
    )
  }

  if (!isFormOpen) {
    return (
      <button type="button" onClick={() => setIsFormOpen(true)} className={linkClass}>
        Owner sign in
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Owner email"
        aria-label="Owner email"
        className="rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-foreground/50"
      />
      <button
        type="submit"
        className="rounded-full bg-foreground text-background px-4 py-2 text-[11px] font-semibold uppercase tracking-widest"
      >
        Send magic link
      </button>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </form>
  )
}
