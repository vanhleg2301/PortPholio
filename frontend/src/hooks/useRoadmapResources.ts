import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const BUCKET = 'roadmap-files'
const SIGNED_URL_SECONDS = 60 * 60

const resourceSchema = z.object({
  id: z.string(),
  day: z.string(),
  kind: z.enum(['link', 'file']),
  title: z.string(),
  url: z.string().nullable(),
  storage_path: z.string().nullable(),
  mime_type: z.string().nullable(),
  size_bytes: z.number().nullable(),
  created_at: z.string(),
})

export type RoadmapResource = z.infer<typeof resourceSchema> & { openUrl: string | null }

const RESOURCES_KEY = ['roadmap-resources'] as const

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function fetchResources(): Promise<RoadmapResource[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('roadmap_resources')
    .select('id, day, kind, title, url, storage_path, mime_type, size_bytes, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = z.array(resourceSchema).parse(data)

  const paths = rows.flatMap((r) => (r.storage_path ? [r.storage_path] : []))
  const signed = new Map<string, string>()
  if (paths.length > 0) {
    const { data: urls, error: signError } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
    if (signError) throw signError
    for (const u of urls) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl)
  }

  return rows.map((r) => ({ ...r, openUrl: r.kind === 'link' ? r.url : signed.get(r.storage_path ?? '') ?? null }))
}

interface AddLinkInput {
  day: string
  title: string
  url: string
}

async function addLink({ day, title, url }: AddLinkInput) {
  const { error } = await getClient().from('roadmap_resources').insert({ day, kind: 'link', title, url })
  if (error) throw error
}

interface UploadFileInput {
  day: string
  file: File
}

async function uploadFile({ day, file }: UploadFileInput) {
  const client = getClient()
  const safeName = file.name.replace(/[^\w.-]+/g, '_')
  const path = `${day}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'application/octet-stream' })
  if (uploadError) throw uploadError

  const { error } = await client.from('roadmap_resources').insert({
    day,
    kind: 'file',
    title: file.name,
    storage_path: path,
    mime_type: file.type || null,
    size_bytes: file.size,
  })
  if (error) {
    await client.storage.from(BUCKET).remove([path])
    throw error
  }
}

async function deleteResource(resource: RoadmapResource) {
  const client = getClient()
  const { error } = await client.from('roadmap_resources').delete().eq('id', resource.id)
  if (error) throw error
  if (resource.storage_path) await client.storage.from(BUCKET).remove([resource.storage_path])
}

export function useRoadmapResources(isEnabled: boolean) {
  return useQuery({
    queryKey: RESOURCES_KEY,
    queryFn: fetchResources,
    enabled: isEnabled,
    staleTime: (SIGNED_URL_SECONDS / 2) * 1000,
  })
}

function useResourceMutation<T>(mutationFn: (input: T) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export const useAddLink = () => useResourceMutation(addLink)
export const useUploadFile = () => useResourceMutation(uploadFile)
export const useDeleteResource = () => useResourceMutation(deleteResource)
