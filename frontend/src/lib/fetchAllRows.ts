// Supabase (PostgREST) returns at most 1,000 rows per request, silently. Tables that grow all
// year (saved code, sessions, progress) are read page by page so nothing is cut off.
// The query must have a stable order (a unique column last) so pages do not overlap.

const PAGE_SIZE = 1000

interface PageResult {
  data: unknown[] | null
  error: { message: string } | null
}

export async function fetchAllRows(page: (from: number, to: number) => PromiseLike<PageResult>): Promise<unknown[]> {
  const rows: unknown[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}
