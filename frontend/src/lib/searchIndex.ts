import { format, parseISO } from 'date-fns'
import { LESSONS, VISUAL_TITLES, blockAnchor, getLessonTerms, toPlainText } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import { WEEKS } from '@/data/roadmap/plan'

export type SearchGroup = 'Lessons' | 'Words' | 'Problems' | 'Plan' | 'Notes'

export type SearchAction = { type: 'lesson'; lessonId: string; anchor?: string } | { type: 'day'; date: string }

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

// Lower case, no Vietnamese accents ("độ trễ" → "do tre"), so either spelling matches.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9+#.\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const dayLabel = (date: string) => format(parseISO(date), 'EEE d MMM')

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

  // A word opens the first block that explains it.
  const termPlace = new Map<string, { lessonId: string; anchor?: string }>()
  for (const lesson of LESSONS) {
    for (const term of getLessonTerms(lesson)) {
      if (termPlace.has(term)) continue
      const index = lesson.blocks.findIndex((b) => {
        const md = b.type === 'text' || b.type === 'callout' ? b.md : b.type === 'exercise' ? b.prompt : ''
        return md.toLowerCase().includes(`[[${term}`)
      })
      termPlace.set(term, { lessonId: lesson.id, anchor: index >= 0 ? blockAnchor(index) : undefined })
    }
  }
  for (const [key, value] of Object.entries(GLOSSARY)) {
    const place = termPlace.get(key) ?? { lessonId: LESSONS[0].id }
    entries.push(entry(`word:${key}`, 'Words', key, `${value.en} — e.g. ${value.example}`, { type: 'lesson', ...place }))
  }

  const seenProblems = new Set<string>()
  const seenTasks = new Set<string>()
  for (const week of WEEKS) {
    entries.push(entry(`week:${week.id}`, 'Plan', week.label, week.goal, { type: 'day', date: week.start }, `${dayLabel(week.start)} ${dayLabel(week.end)}`))
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

// Every word of the query must appear; matches in the title, and at the start of a word, rank higher.
export function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = normalize(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return []
  const scored: Array<{ entry: SearchEntry; score: number }> = []
  for (const e of entries) {
    let score = 0
    let isMatch = true
    for (const token of tokens) {
      if (e.titleKey.startsWith(token)) score += 6
      else if (e.titleKey.includes(` ${token}`)) score += 4
      else if (e.titleKey.includes(token)) score += 3
      else if (e.textKey.includes(` ${token}`) || e.textKey.startsWith(token)) score += 1.5
      else if (e.textKey.includes(token)) score += 1
      else {
        isMatch = false
        break
      }
    }
    if (!isMatch) continue
    const phrase = tokens.join(' ')
    if (e.titleKey === phrase) score += 5
    // The words appear together, in order ("do tre" inside "do tre lan truyen").
    if (tokens.length > 1 && e.textKey.includes(phrase)) score += 8
    if (e.id.startsWith('lesson:')) score += 1
    scored.push({ entry: e, score })
  }
  scored.sort((a, b) => b.score - a.score)
  const perGroup = new Map<SearchGroup, number>()
  const out: SearchEntry[] = []
  for (const { entry: e } of scored) {
    const count = perGroup.get(e.group) ?? 0
    if (count >= GROUP_LIMIT) continue
    perGroup.set(e.group, count + 1)
    out.push(e)
  }
  // Groups follow their best match, so the most relevant group comes first.
  const groups = [...new Set(out.map((e) => e.group))]
  return groups.flatMap((group) => out.filter((e) => e.group === group))
}
