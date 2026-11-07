import { LESSONS, toPlainText } from '@/data/lessons'
import { GLOSSARY, type GlossaryArea } from '@/data/lessons/glossary'
import { CATEGORY_REFERENCES, CS_REFERENCES, PYTHON_REFERENCES, SD_REFERENCES } from '@/data/roadmap/references'
import { AI_REFERENCES, CAREER_REFERENCES } from '@/data/roadmap/practicalReferences'
import { normalize } from '@/lib/normalize'
import type { Lesson } from '@/data/lessons/types'
import type { TaskReference } from '@/data/roadmap/types'

// Everything the app teaches, in one place: lessons, theory cards and technical words, by topic.

export type LibraryTopic = 'python' | 'dsa' | 'cs' | 'sd' | 'ai' | 'career'

export const LIBRARY_TOPICS: Array<{ id: LibraryTopic; label: string; about: string }> = [
  { id: 'python', label: 'Python', about: 'The language of your interviews: how names, lists and dicts really work.' },
  { id: 'dsa', label: 'DSA & Algorithms', about: 'One card per NeetCode 150 pattern: how to spot it, the template, the traps.' },
  { id: 'cs', label: 'CS fundamentals', about: 'Networking, operating systems and databases — the "how does it work underneath" questions.' },
  { id: 'sd', label: 'System Design', about: 'From one server to millions of users, then one card per classic design question.' },
  { id: 'ai', label: 'AI engineering', about: 'Build real LLM features: API calls, tools, RAG, evals, agents, safety and cost.' },
  { id: 'career', label: 'Career', about: 'Get the job: CV, behavioral stories, open source, applying and negotiating.' },
]

const AREA_TOPIC: Record<GlossaryArea, LibraryTopic> = {
  Python: 'python',
  DSA: 'dsa',
  Networking: 'cs',
  'Operating systems': 'cs',
  Databases: 'cs',
  'System design': 'sd',
  'AI engineering': 'ai',
}

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
  ...Object.entries(AI_REFERENCES).map(([key, ref]) => theory(`ai:${key}`, 'ai', 'Build with LLMs', ref)),
  ...Object.entries(CAREER_REFERENCES).map(([key, ref]) => theory(`career:${key}`, 'career', 'Get the job', ref)),
  ...Object.entries(GLOSSARY)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]): LibraryEntry => ({
      kind: 'word',
      id: `word:${key}`,
      topic: AREA_TOPIC[value.area],
      group: 'Key words',
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
  // Every query word is a whole word somewhere (plural allowed) or starts a word of the title.
  isExact: boolean
}

// Every word of the query must appear; title matches come first.
// Every query word must start a word in the entry ("rag" finds RAG, not "storage"); whole-word
// and title matches rank first.
export function searchLibrary(query: string, topic: LibraryTopic | 'all'): LibraryHit[] {
  const pool = topic === 'all' ? LIBRARY : LIBRARY.filter((e) => e.topic === topic)
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return pool.map((entry) => ({ entry, snippet: null, isExact: true }))
  const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const starts = tokens.map((t) => new RegExp(`(^|[^a-z0-9])${escape(t)}`))
  const whole = tokens.map((t) => new RegExp(`(^|[^a-z0-9])${escape(t)}(s|es)?($|[^a-z0-9])`))
  const hits: Array<LibraryHit & { score: number }> = []
  for (const entry of pool) {
    const text = NORMALIZED.get(entry.id)
    if (!text || !starts.every((re) => re.test(text.title) || re.test(text.body))) continue
    const score =
      whole.filter((re) => re.test(text.title)).length * 20 +
      starts.filter((re) => re.test(text.title)).length * 10 +
      whole.filter((re) => re.test(text.body)).length * 3 +
      (entry.kind === 'lesson' ? 2 : entry.kind === 'theory' ? 1 : 0)
    // The search text starts with the title (and, for theory cards, the summary) — both already shown.
    const shown = entry.title.length + (entry.kind === 'theory' ? entry.summary.length + 1 : 0)
    // A title that starts a word with the query counts too: "dead" keeps "Deadlock" in the main list.
    const isExact = tokens.every((_, i) => whole[i].test(text.title) || whole[i].test(text.body) || starts[i].test(text.title))
    hits.push({ entry, snippet: getSnippet(entry.search.slice(shown), tokens), isExact, score })
  }
  return hits.sort((a, b) => b.score - a.score)
}

function getSnippet(text: string, tokens: string[]): string | null {
  const lower = text.toLowerCase()
  let at = -1
  for (const t of tokens) {
    const match = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).exec(lower)
    at = match ? match.index + match[1].length : lower.indexOf(t)
    if (at !== -1) break
  }
  if (at === -1) return null
  const start = Math.max(0, lower.lastIndexOf('\n', at) + 1, at - 70)
  const lineEnd = lower.indexOf('\n', at)
  const end = Math.min(lineEnd === -1 ? text.length : lineEnd, at + 130)
  return `${start > 0 && text[start - 1] !== '\n' ? '…' : ''}${text.slice(start, end).trim()}${end < text.length && text[end] !== '\n' ? '…' : ''}`
}
