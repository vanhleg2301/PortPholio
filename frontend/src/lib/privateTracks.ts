import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { registerTrack, type PrivateTrack } from '@/lib/privateTrackRegistry'

// Private study tracks (a company's internal processes, for example). Their content is not in the
// app's code: it lives in the owner-only table `roadmap_private_tracks` and is loaded after the owner
// signs in, then registered (lib/privateTrackRegistry.ts).

async function fetchPrivateTracks(): Promise<PrivateTrack[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('roadmap_private_tracks').select('id, data').order('id')
  if (error) throw error
  const tracks: PrivateTrack[] = []
  for (const row of data ?? []) {
    try {
      tracks.push(registerTrack(row.data))
    } catch (err) {
      // One broken track must not hide the others.
      console.error(`Private track ${String(row.id)} could not be read`, err)
    }
  }
  return tracks
}

// Only the owner can read the table, so nobody else even asks for it.
export function usePrivateTracks(isOwner: boolean) {
  return useQuery({ queryKey: ['roadmap-private-tracks'], queryFn: fetchPrivateTracks, enabled: isOwner, staleTime: 5 * 60 * 1000 })
}
