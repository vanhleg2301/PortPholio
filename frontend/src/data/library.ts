import { LESSONS, toPlainText } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import { CATEGORY_REFERENCES, CS_REFERENCES, PYTHON_REFERENCES, SD_REFERENCES } from '@/data/roadmap/references'
import { normalize } from '@/lib/searchIndex'
import type { Lesson } from '@/data/lessons/types'
import type { TaskReference } from '@/data/roadmap/types'

// Everything the app teaches, in one place: lessons, theory cards and technical words.

export type LibraryTopic = 'python' | 'dsa' | 'cs' | 'sd' | 'words'

export const LIBRARY_TOPICS: Array<{ id: LibraryTopic; label: string }> = [
  { id: 'python', label: 'Python' },
  { id: 'dsa', label: 'DSA & Algorithms' },
  { id: 'cs', label: 'CS fundamentals' },
  { id: 'sd', label: 'System Design' },
  { id: 'words', label: 'Words' },
]

export type LibraryEntry =
  | { kind: 'lesson'; id: string; topic: LibraryTopic; group: string; title: string; summary: string; lesson: Lesson; search: string }
  | { kind: 'theory'; id: string; topic: LibraryTopic; group: string; title: string; summary: string; reference: TaskReference; search: string }
  | { kind: 'word'; id: string; topic: LibraryTopic; group: string; title: string; summary: string; example: string; search: string }

const CS_GROUPS: Record<string, string> = {
  latencyTcp: 'Networking',
  udpTls: 'Networking',
  httpDns: 'Networking',
  processes: 'Operating systems',
  scheduling: 'Operating systems',
  virtualMemory: 'Operating systems',
  threadsLocks: 'Operating systems',
  conditionDeadlock: 'Operating systems',
  indexes: 'Databases',
  transactions: 'Databases',
  walReplication: 'Databases',
}

function lessonTopic(lesson: Lesson): LibraryTopic {
  if (lesson.id.startsWith('py-')) return 'python'
  if (lesson.id.startsWith('dsa-')) return 'dsa'
  return 'cs'
}

function lessonText(lesson: Lesson): string {
  const parts = [lesson.title, lesson.summary]
  for (const block of lesson.blocks) {
    if (block.type === 'text' || block.type === 'callout') parts.push(toPlainText(block.md))
    else if (block.type === 'code') parts.push(block.code, block.caption ?? '')
    else if (block.type === 'exercise') parts.push(block.title, toPlainText(block.prompt))
    else if (block.type === 'quiz') parts.push(...block.items.flatMap((q) => [q.question, q.answer]))
    else if (block.type === 'diagram' || block.type === 'visual') parts.push(block.caption ?? '')
  }
  return parts.join('\n')
}

function referenceText(ref: TaskReference): string {
  return [
    ref.title,
    ref.summary ?? '',
    ...(ref.recognize ?? []),
    ...(ref.inWork ?? []),
    ...ref.points,
    ...(ref.complexity ?? []).map((c) => `${c.op} ${c.cost} ${c.note ?? ''}`),
    ref.example ?? '',
    ...(ref.pitfalls ?? []).flatMap((p) => [p.title, p.fix]),
    ref.interview?.when ?? '',
    ...(ref.quiz ?? []).flatMap((q) => [q.question, q.answer]),
  ].join('\n')
}

const strip = (text: string) => text.replace(/`/g, '')

function theory(id: string, topic: LibraryTopic, group: string, reference: TaskReference): LibraryEntry {
  const text = referenceText(reference)
  return { kind: 'theory', id, topic, group, title: reference.title, summary: strip(reference.summary ?? reference.points[0] ?? ''), reference, search: strip(text) }
}

export const LIBRARY: LibraryEntry[] = [
  ...LESSONS.map((lesson): LibraryEntry => ({
    kind: 'lesson',
    id: `lesson:${lesson.id}`,
    topic: lessonTopic(lesson),
    group: 'Lessons',
    title: lesson.title,
    summary: lesson.summary,
    lesson,
    search: strip(lessonText(lesson)),
  })),
  ...Object.entries(PYTHON_REFERENCES).map(([key, ref]) => theory(`py:${key}`, 'python', 'Theory cards', ref)),
  ...Object.entries(CATEGORY_REFERENCES).map(([key, ref]) => theory(`dsa:${key}`, 'dsa', 'Patterns (NeetCode 150)', ref)),
  ...Object.entries(CS_REFERENCES).map(([key, ref]) => theory(`cs:${key}`, 'cs', CS_GROUPS[key] ?? 'More CS', ref)),
  ...Object.entries(SD_REFERENCES).map(([key, ref]) => theory(`sd:${key}`, 'sd', 'System design', ref)),
  ...Object.entries(GLOSSARY)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]): LibraryEntry => ({
      kind: 'word',
      id: `word:${key}`,
      topic: 'words',
      group: key[0].toUpperCase(),
      title: key,
      summary: strip(value.en),
      example: value.example,
      search: strip(`${key}\n${value.en}\n${value.example}`),
    })),
]

const NORMALIZED = new Map(LIBRARY.map((e) => [e.id, { title: normalize(e.title), body: normalize(e.search) }]))

export interface LibraryHit {
  entry: LibraryEntry
  // A short piece of the text around the first match, for the result list.
  snippet: string | null
}

// Every word of the query must appear; title matches come first.
export function searchLibrary(query: string, topic: LibraryTopic | 'all'): LibraryHit[] {
  const pool = topic === 'all' ? LIBRARY : LIBRARY.filter((e) => e.topic === topic)
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return pool.map((entry) => ({ entry, snippet: null }))
  const hits: Array<LibraryHit & { score: number }> = []
  for (const entry of pool) {
    const text = NORMALIZED.get(entry.id)
    if (!text || !tokens.every((t) => text.title.includes(t) || text.body.includes(t))) continue
    const titleHits = tokens.filter((t) => text.title.includes(t)).length
    const score = titleHits * 10 + (text.title.startsWith(tokens[0]) ? 5 : 0) + (entry.kind === 'lesson' ? 2 : entry.kind === 'theory' ? 1 : 0)
    // The search text starts with the title (and, for theory cards, the summary) — both already shown.
    const shown = entry.title.length + (entry.kind === 'theory' ? entry.summary.length + 1 : 0)
    hits.push({ entry, snippet: getSnippet(entry.search.slice(shown), tokens), score })
  }
  return hits.sort((a, b) => b.score - a.score)
}

function getSnippet(text: string, tokens: string[]): string | null {
  const lower = text.toLowerCase()
  let at = -1
  for (const t of tokens) {
    at = lower.indexOf(t)
    if (at !== -1) break
  }
  if (at === -1) return null
  const start = Math.max(0, lower.lastIndexOf('\n', at) + 1, at - 70)
  const lineEnd = lower.indexOf('\n', at)
  const end = Math.min(lineEnd === -1 ? text.length : lineEnd, at + 130)
  return `${start > 0 && text[start - 1] !== '\n' ? '…' : ''}${text.slice(start, end).trim()}${end < text.length && text[end] !== '\n' ? '…' : ''}`
}
