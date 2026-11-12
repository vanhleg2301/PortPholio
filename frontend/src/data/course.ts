import { LESSON_BY_ID } from './lessons'
import { MOCK_TESTS } from './lessons/mockTests'
import type { Lesson } from './lessons/types'
import { WEEKS } from './roadmap/plan'
import type { RoadmapTask } from './roadmap/types'

// The whole plan as one course: tracks → modules → items. The schedule (Today / Plan) says
// *when*; the course says *what*, in a sensible order, and lets you learn any part at any time.
//
// An item is a lesson when `lessonId` names a written lesson. Otherwise it is a topic that is
// planned but not written yet; its date comes from the first scheduled task that matches it.
export interface CourseItemSeed {
  title: string
  lessonId?: string
  // NeetCode category whose problems belong to this item.
  category?: string
  // Text found in the title of the scheduled task(s) for this item.
  match?: string
}

export interface CourseItem {
  key: string
  title: string
  lesson?: Lesson
  category?: string
  // First scheduled day (yyyy-mm-dd), if the plan has one.
  date?: string
}

export interface CourseModule {
  title: string
  items: CourseItem[]
}

export interface CourseTrack {
  id: string
  title: string
  about: string
  modules: CourseModule[]
}

const ALL_TASKS: RoadmapTask[] = WEEKS.flatMap((w) => w.days.flatMap((d) => d.tasks))
const dateOf = (task: RoadmapTask | undefined) => task?.id.slice(0, 10)

function findDate(seed: CourseItemSeed): string | undefined {
  const byLesson = seed.lessonId
    ? ALL_TASKS.find((t) => t.title.startsWith('Lesson:') && (t.lessonId === seed.lessonId || t.title === `Lesson: ${seed.title}`))
    : undefined
  if (byLesson) return dateOf(byLesson)
  if (seed.category) return dateOf(ALL_TASKS.find((t) => t.category === seed.category))
  if (seed.match) return dateOf(ALL_TASKS.find((t) => t.title.includes(seed.match as string)))
  return undefined
}

const item = (seed: CourseItemSeed): CourseItem => {
  const lesson = seed.lessonId ? LESSON_BY_ID.get(seed.lessonId) : undefined
  return { key: seed.lessonId ?? seed.match ?? seed.category ?? seed.title, title: lesson?.title ?? seed.title, lesson, category: seed.category, date: findDate(seed) }
}
const lesson = (lessonId: string, title: string, category?: string) => item({ lessonId, title, category })
const topic = (title: string, find: Omit<CourseItemSeed, 'title'>) => item({ title, ...find })

export const COURSE: CourseTrack[] = [
  {
    id: 'python',
    title: 'Python',
    about: 'What Python is, its syntax, and the built-in tools you use in every interview.',
    modules: [
      { title: 'What Python is', items: [lesson('py-how-python-runs', 'How Python runs your code'), lesson('py-real-world', 'Python in the real world')] },
      { title: 'Syntax', items: [lesson('py-syntax-if', 'if / else'), lesson('py-for-loops', 'for loops'), lesson('py-while-loops', 'while loops')] },
      {
        title: 'Core data and tools',
        items: [
          lesson('py-variables', 'Variables'),
          lesson('py-strings', 'Strings'),
          lesson('py-lists', 'Lists'),
          lesson('py-dicts-sets', 'Dicts and sets'),
          lesson('py-loops-functions', 'Loops and functions'),
          lesson('py-toolkit', 'Interview toolkit'),
        ],
      },
    ],
  },
  {
    id: 'dsa',
    title: 'Data structures and algorithms',
    about: 'The patterns behind most interview problems, in NeetCode 150 order. Each lesson ends with a test; the problems are in Today.',
    modules: [
      {
        title: 'Month 1 · arrays and strings',
        items: [
          lesson('dsa-arrays-hashing', 'Arrays & Hashing', 'Arrays & Hashing'),
          lesson('dsa-two-pointers', 'Two Pointers', 'Two Pointers'),
          lesson('dsa-sliding-window', 'Sliding Window', 'Sliding Window'),
          lesson('dsa-stack', 'Stack', 'Stack'),
          lesson('dsa-binary-search', 'Binary Search', 'Binary Search'),
        ],
      },
      {
        title: 'Month 2 · linked structures',
        items: [lesson('dsa-linked-list', 'Linked List', 'Linked List'), lesson('dsa-trees', 'Trees: DFS and BFS', 'Trees')],
      },
      {
        title: '2027',
        items: [
          topic('Tries', { category: 'Tries' }),
          topic('Heap / priority queue', { category: 'Heap' }),
          topic('Backtracking', { category: 'Backtracking' }),
          topic('Graphs', { category: 'Graphs' }),
          topic('Advanced graphs', { category: 'Advanced Graphs' }),
          topic('1-D dynamic programming', { category: '1-D DP' }),
          topic('2-D dynamic programming', { category: '2-D DP' }),
          topic('Greedy', { category: 'Greedy' }),
          topic('Intervals', { category: 'Intervals' }),
          topic('Math & geometry', { category: 'Math & Geometry' }),
          topic('Bit manipulation', { category: 'Bit Manipulation' }),
        ],
      },
    ],
  },
  {
    id: 'networking',
    title: 'Networking',
    about: 'What happens between the browser and the server: latency, TCP, UDP, TLS, DNS and HTTP.',
    modules: [
      {
        title: 'A web request, end to end',
        items: [lesson('net-latency-tcp', 'Latency, bandwidth and TCP'), lesson('net-udp-tls', 'UDP and TLS'), lesson('net-http-dns', 'HTTP and DNS')],
      },
    ],
  },
  {
    id: 'os',
    title: 'Operating systems',
    about: 'How a computer runs many programs at once, and the bugs that come from it.',
    modules: [
      { title: 'Month 2', items: [lesson('os-processes-threads', 'Processes and threads')] },
      {
        title: '2027',
        items: [
          topic('CPU scheduling and virtual memory', { match: 'OSTEP ch.7' }),
          topic('Threads and locks', { match: 'OSTEP ch.26' }),
          topic('Condition variables, semaphores and deadlock', { match: 'OSTEP ch.30' }),
        ],
      },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    about: 'Indexes, transactions and replication — what makes a database fast and correct.',
    modules: [
      {
        title: '2027',
        items: [
          topic('Indexes', { match: 'anatomy of an index' }),
          topic('Transactions and isolation levels', { match: 'transaction isolation' }),
          topic('Storage, WAL and replication', { match: 'write-ahead logging' }),
        ],
      },
    ],
  },
  {
    id: 'sd',
    title: 'System design',
    about: 'From one server to millions of users, then the classic interview designs.',
    modules: [
      { title: 'Month 2', items: [lesson('sd-basics', 'System design basics')] },
      {
        title: '2027 · classic designs',
        items: [
          topic('Estimation and the interview framework', { match: 'Numbers to know for estimation' }),
          topic('Rate limiter', { match: 'Read: Rate Limiter' }),
          topic('Consistent hashing', { match: 'Read: Consistent Hashing' }),
          topic('Key-value store', { match: 'Read: Key-Value Store' }),
          topic('Unique ID generator and URL shortener', { match: 'Read: Unique ID Generator' }),
          topic('Web crawler and notification system', { match: 'Read: Web Crawler' }),
          topic('News feed', { match: 'Read: News Feed' }),
          topic('Chat system', { match: 'Read: Chat System' }),
          topic('Search autocomplete', { match: 'Read: Search Autocomplete' }),
          topic('YouTube', { match: 'Read: YouTube' }),
          topic('Google Drive', { match: 'Read: Google Drive' }),
        ],
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI engineering',
    about: 'Build one real AI project with evals and numbers: LLM APIs, RAG, agents, deployment.',
    modules: [
      {
        title: '2027 · the AI project',
        items: [
          topic('Pick the problem and write the spec', { match: 'AI project: pick a problem' }),
          topic('LLM API: structured output and tool use', { match: 'AI project: call the Claude API' }),
          topic('RAG v1', { match: 'AI project: RAG v1' }),
          topic('Evals and a baseline', { match: 'AI project: write 50 eval questions' }),
          topic('Hybrid search and reranking', { match: 'AI project: add BM25' }),
          topic('Agents and MCP', { match: 'AI project: expose one capability' }),
          topic('Deploy, log cost and latency', { match: 'AI project: deploy' }),
        ],
      },
    ],
  },
  {
    id: 'career',
    title: 'Career',
    about: 'CV, stories, applications and interviews.',
    modules: [
      {
        title: '2027',
        items: [
          topic('CV, LinkedIn and GitHub', { match: 'Write a one-page CV' }),
          topic('Six STAR stories', { match: 'Write STAR stories 1–3' }),
          topic('Applications and referrals', { match: 'Shortlist 15 practice companies' }),
        ],
      },
    ],
  },
]

export interface MockTestEntry {
  date: string
  title: string
  kind: 'week' | 'month'
  minutes: number
}

// Every test day with a mock interview, in date order.
export const MOCK_TEST_DAYS: MockTestEntry[] = Object.entries(MOCK_TESTS)
  .map(([date, m]) => ({ date, title: m.title, kind: m.kind, minutes: m.minutes }))
  .sort((a, b) => a.date.localeCompare(b.date))

// Written lessons in the order the schedule teaches them (lessons not in the schedule last).
export const SCHEDULED_LESSONS: Array<{ lesson: Lesson; date?: string }> = COURSE.flatMap((t) => t.modules.flatMap((m) => m.items))
  .flatMap((i) => (i.lesson ? [{ lesson: i.lesson, date: i.date }] : []))
  .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
