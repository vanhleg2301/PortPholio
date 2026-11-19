import { LESSONS, VISUAL_TITLES, blockAnchor, getTermPlace, toPlainText } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import { WEEKS } from '@/data/roadmap/plan'
import { getStudyDayByDate } from '@/data/roadmap/studyDays'
import { LIBRARY } from '@/data/library'
import { getQueryTokens, normalize } from '@/lib/normalize'

export type SearchGroup = 'Lessons' | 'Reference' | 'Theory' | 'Words' | 'Problems' | 'Plan' | 'Notes'

export type SearchAction =
  | { type: 'lesson'; lessonId: string; anchor?: string }
  | { type: 'day'; date: string }
  // A theory card in the Library.
  | { type: 'library'; entryId: string }

export interface SearchEntry {
  id: string
  group: SearchGroup
  title: string
  subtitle: string
  action: SearchAction
  // Normalised text used for matching.
  titleKey: string
  textKey: string
}

export interface SearchNote {
  id: string
  day: string
  title: string | null
  content: string
}

// Plan items and notes are saved under a calendar date of the plan; show the study day it became.
const dayLabel = (date: string) => `Day ${getStudyDayByDate(date).number}`

function entry(id: string, group: SearchGroup, title: string, subtitle: string, action: SearchAction, text = ''): SearchEntry {
  return { id, group, title, subtitle, action, titleKey: normalize(title), textKey: normalize(`${title} ${subtitle} ${text}`) }
}

let staticEntries: SearchEntry[] | null = null

// Lessons, their sections, glossary words and the study plan never change at run time.
function buildStaticEntries(): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const lesson of LESSONS) {
    entries.push(entry(`lesson:${lesson.id}`, 'Lessons', lesson.title, 'Lesson', { type: 'lesson', lessonId: lesson.id }, lesson.summary))
    lesson.blocks.forEach((block, i) => {
      const anchor = blockAnchor(i)
      if (block.type === 'text') {
        const heading = block.md.split('\n').find((line) => line.startsWith('## '))
        const title = heading ? toPlainText(heading.slice(3)) : lesson.title
        entries.push(entry(`section:${lesson.id}:${i}`, 'Lessons', title, lesson.title, { type: 'lesson', lessonId: lesson.id, anchor }, toPlainText(block.md)))
      } else if (block.type === 'exercise') {
        entries.push(entry(`exercise:${lesson.id}:${block.id}`, 'Lessons', block.title, `Exercise · ${lesson.title}`, { type: 'lesson', lessonId: lesson.id, anchor }, toPlainText(block.prompt)))
      } else if (block.type === 'visual') {
        entries.push(entry(`visual:${lesson.id}:${i}`, 'Lessons', VISUAL_TITLES[block.visual], `Animated diagram · ${lesson.title}`, { type: 'lesson', lessonId: lesson.id, anchor }))
      }
    })
  }

  for (const item of LIBRARY) {
    if (item.kind === 'ref') {
      const ref = entry(`reference:${item.id}`, 'Reference', item.title, `${item.item.module} · ${item.summary}`, { type: 'library', entryId: item.id }, item.search)
      // Its search words ("popleft" for deque) rank like its name.
      entries.push({ ...ref, titleKey: normalize(`${item.title} ${item.item.aliases ?? ''}`) })
      continue
    }
    if (item.kind !== 'theory') continue
    const topic = item.topic === 'sd' ? 'System design' : item.topic === 'ai' ? 'AI engineering' : item.topic === 'cs' ? 'CS' : item.topic === 'dsa' ? 'DSA' : item.topic === 'career' ? 'Career' : 'Python'
    entries.push(entry(`theory:${item.id}`, 'Theory', item.title, `Theory card · ${topic}`, { type: 'library', entryId: item.id }, item.search))
  }

  // A word opens the first block that explains it.
  for (const [key, value] of Object.entries(GLOSSARY)) {
    const place = getTermPlace(key)
    entries.push(entry(`word:${key}`, 'Words', key, `${value.en} — e.g. ${value.example}`, { type: 'lesson', lessonId: place?.lessonId ?? LESSONS[0].id, anchor: place?.anchor }))
  }

  const seenProblems = new Set<string>()
  const seenTasks = new Set<string>()
  for (const week of WEEKS) {
    entries.push(entry(`week:${week.id}`, 'Plan', week.label, week.goal, { type: 'day', date: week.start }))
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (task.difficulty) {
          if (seenProblems.has(task.title)) continue
          seenProblems.add(task.title)
          const [name, category] = task.title.split(' · ')
          entries.push(entry(`problem:${task.id}`, 'Problems', name, `${category ?? ''} · ${task.difficulty} · ${week.label}, ${dayLabel(day.date)}`, { type: 'day', date: day.date }))
        } else {
          if (seenTasks.has(task.title)) continue
          seenTasks.add(task.title)
          entries.push(entry(`task:${task.id}`, 'Plan', task.title, `${week.label} · ${dayLabel(day.date)}`, { type: 'day', date: day.date }))
        }
      }
    }
  }
  return entries
}

export function getSearchEntries(notes: SearchNote[]): SearchEntry[] {
  staticEntries ??= buildStaticEntries()
  const noteEntries = notes.map((n) =>
    entry(`note:${n.id}`, 'Notes', n.title?.trim() || 'Untitled note', `Note · ${dayLabel(n.day)}`, { type: 'day', date: n.day }, n.content.slice(0, 2000))
  )
  return [...staticEntries, ...noteEntries]
}

const GROUP_LIMIT = 6

// Question words are ignored ("what is", "how does"). Every word should appear; matches in the title,
// at the start of a word and the whole phrase rank higher. A one-letter word must be a whole word
// ("o" in "big o"). When nothing has every word, entries with the most of them are shown.
export function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = getQueryTokens(query)
  if (tokens.length === 0) return []
  const phrase = tokens.join(' ')
  const isWord = (text: string, token: string) => ` ${text} `.includes(` ${token} `)
  const scored: Array<{ entry: SearchEntry; score: number; matched: number; isTitleInQuery: boolean }> = []
  for (const e of entries) {
    let score = 0
    let matched = 0
    for (const token of tokens) {
      const before = score
      if (token.length === 1) {
        if (isWord(e.titleKey, token)) score += 4
        else if (isWord(e.textKey, token)) score += 1.5
      } else if (e.titleKey.startsWith(token)) score += 6
      else if (e.titleKey.includes(` ${token}`)) score += 4
      else if (e.titleKey.includes(token)) score += 3
      else if (e.textKey.includes(` ${token}`) || e.textKey.startsWith(token)) score += 1.5
      else if (e.textKey.includes(token)) score += 1
      if (score > before) matched++
    }
    if (matched === 0) continue
    if (e.titleKey === phrase) score += 5
    // The words appear together, in order ("do tre" inside "do tre lan truyen").
    if (tokens.length > 1 && isWord(e.textKey, phrase)) score += 8
    // The whole title is in the question: "what is big o notation" → the word "big o".
    const isTitleInQuery = tokens.length > 1 && e.titleKey.length > 1 && isWord(phrase, e.titleKey)
    if (isTitleInQuery) score += 10
    if (e.id.startsWith('lesson:')) score += 1
    scored.push({ entry: e, score, matched, isTitleInQuery })
  }
  const best = Math.max(0, ...scored.map((s) => s.matched))
  const kept = scored.filter((s) => s.isTitleInQuery || (s.matched === best && (best === tokens.length || best >= 2 || tokens.length <= 2)))
  kept.sort((a, b) => b.score - a.score)
  const perGroup = new Map<SearchGroup, number>()
  const out: SearchEntry[] = []
  for (const { entry: e } of kept) {
    const count = perGroup.get(e.group) ?? 0
    if (count >= GROUP_LIMIT) continue
    perGroup.set(e.group, count + 1)
    out.push(e)
  }
  // Groups follow their best match, so the most relevant group comes first.
  const groups = [...new Set(out.map((e) => e.group))]
  return groups.flatMap((group) => out.filter((e) => e.group === group))
}
