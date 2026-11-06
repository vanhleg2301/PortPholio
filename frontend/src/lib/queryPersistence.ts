import type { Query, QueryClient } from '@tanstack/react-query'

// Keeps the last fetched copy of the study data in localStorage, so the app opens instantly
// (no empty screen while Supabase answers) and still shows progress, notes and saved code
// offline — e.g. the iPhone PWA on the metro. Fresh data is fetched in the background as usual.
//
// Not persisted: uploaded resources (their signed URLs expire) and anything outside the list.

const STORAGE_KEY = 'roadmap:query-cache:v1'
const PERSISTED_KEYS = new Set(['roadmap-progress', 'roadmap-sessions', 'roadmap-lesson-progress', 'roadmap-code', 'roadmap-notes', 'roadmap-reviews'])
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14
const MAX_CHARS = 2_000_000
const SAVE_DELAY_MS = 800

interface StoredEntry {
  key: readonly unknown[]
  data: unknown
  updatedAt: number
}

interface StoredCache {
  savedAt: number
  entries: StoredEntry[]
}

// Sets and Maps (lesson progress, saved code) do not survive JSON on their own.
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Set) return { __set: [...value] }
  if (value instanceof Map) return { __map: [...value] }
  return value
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object') {
    const v = value as { __set?: unknown; __map?: unknown }
    if (Array.isArray(v.__set)) return new Set(v.__set)
    if (Array.isArray(v.__map)) return new Map(v.__map as Array<[unknown, unknown]>)
  }
  return value
}

const isPersisted = (query: Query) => PERSISTED_KEYS.has(String(query.queryKey[0]))

export function restoreQueryCache(client: QueryClient) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const stored = JSON.parse(raw, reviver) as StoredCache
    if (!Array.isArray(stored.entries) || Date.now() - stored.savedAt > MAX_AGE_MS) return
    for (const entry of stored.entries) {
      if (!PERSISTED_KEYS.has(String(entry.key[0]))) continue
      // The old timestamp marks the copy as stale, so React Query refreshes it right away.
      client.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt })
    }
  } catch {
    // A broken or blocked store just means a normal, uncached start.
  }
}

export function persistQueryCache(client: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  const save = () => {
    try {
      const entries: StoredEntry[] = client
        .getQueryCache()
        .getAll()
        .filter((q) => isPersisted(q) && q.state.status === 'success' && q.state.data !== undefined)
        .map((q) => ({ key: q.queryKey, data: q.state.data, updatedAt: q.state.dataUpdatedAt }))
      const json = JSON.stringify({ savedAt: Date.now(), entries } satisfies StoredCache, replacer)
      if (json.length <= MAX_CHARS) localStorage.setItem(STORAGE_KEY, json)
    } catch {
      // Full or blocked storage: the app keeps working without the offline copy.
    }
  }
  return client.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || !isPersisted(event.query)) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(save, SAVE_DELAY_MS)
  })
}

// On sign-out: forget the private copy on this device.
export function clearPersistedQueryCache(client: QueryClient) {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored.
  }
  client.removeQueries({ predicate: isPersisted })
}
