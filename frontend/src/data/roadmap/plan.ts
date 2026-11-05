import { createProblemTask, getCategorySlugs } from './neetcode'
import type { PhaseId, RoadmapDay, RoadmapPhase, RoadmapTask, RoadmapWeek, TaskKind, TaskLink, TaskSeed } from './types'

// ── Link helpers ──────────────────────────
const link = (label: string, url: string): TaskLink => ({ label, url })
const task = (kind: TaskKind, title: string, ...links: TaskLink[]): TaskSeed => ({ kind, title, links })

const LINKS = {
  coddy: 'https://coddy.tech/',
  pyVideo: 'https://www.youtube.com/watch?v=0K_eZGS5NsU',
  pyTutorial: 'https://docs.python.org/3/tutorial/',
  pyCollections: 'https://docs.python.org/3/library/collections.html',
  pyHeapq: 'https://docs.python.org/3/library/heapq.html',
  pyThreading: 'https://docs.python.org/3/library/threading.html',
  neetcode: 'https://neetcode.io/practice',
  leetcode: 'https://leetcode.com/',
  claude: 'https://claude.ai/',
  ostep: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
  cloudflareDns: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
  cloudflareTls: 'https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/',
  cloudflareCdn: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/',
  utilAnatomy: 'https://use-the-index-luke.com/sql/anatomy',
  utilWhere: 'https://use-the-index-luke.com/sql/where-clause',
  pgExplain: 'https://www.postgresql.org/docs/current/using-explain.html',
  pgIsolation: 'https://www.postgresql.org/docs/current/transaction-iso.html',
  pgWal: 'https://www.postgresql.org/docs/current/wal-intro.html',
  pgReplication: 'https://www.postgresql.org/docs/current/high-availability.html',
  cmu445: 'https://15445.courses.cs.cmu.edu/',
  cmu445Videos: 'https://www.youtube.com/@CMUDatabaseGroup',
  bbg: 'https://bytebytego.com/courses/system-design-interview/',
  helloInterview: 'https://www.hellointerview.com/learn/system-design',
  sdsPrimer: 'https://systemdesignschool.io/primer',
  claudeDocs: 'https://docs.claude.com/en/home',
  agents: 'https://www.anthropic.com/engineering/building-effective-agents',
  contextualRetrieval: 'https://www.anthropic.com/news/contextual-retrieval',
  mcp: 'https://modelcontextprotocol.io/',
  goodFirstIssue: 'https://goodfirstissue.dev/',
  resume: 'https://www.techinterviewhandbook.org/resume/',
  behavioral: 'https://www.techinterviewhandbook.org/behavioral-interview/',
  vercel: 'https://vercel.com/docs',
}

const hpbn = (title: string, path: string) => task('cs', `HPBN: ${title}`, link('Read', `https://hpbn.co/${path}/`))
const ostep = (chapter: number, title: string, file: string) =>
  task('cs', `OSTEP ch.${chapter}: ${title}`, link('PDF', `${LINKS.ostep}${file}.pdf`))
const problems = (category: string, from?: number, to?: number) =>
  getCategorySlugs(category, from, to).map(createProblemTask)
const askClaude = (kind: TaskKind, title: string) => task(kind, title, link('Claude', LINKS.claude))

function sdChapter(title: string, slug: string): TaskSeed[] {
  return [
    task('sd', `Read: ${title}`, link('ByteByteGo', `${LINKS.bbg}${slug}`), link('Hello Interview', LINKS.helloInterview)),
    task('sd', `Redraw ${title} from memory in 30 minutes`),
    askClaude('sd', `Walk Claude through your ${title} design and defend the trade-offs`),
  ]
}

const redoMissed = task('review', "Redo this week's missed problems without looking at solutions", link('NeetCode', LINKS.neetcode))
const weeklyQuiz = askClaude('review', 'Weekly quiz: Claude asks 10 questions on this week, pass with 8/10')
const timedReview = task('dsa', 'Timed review: 1 random NeetCode 150 problem in 25 minutes', link('NeetCode', LINKS.neetcode))

// ── Phases ────────────────────────────────
const phaseSeeds: Array<Omit<RoadmapPhase, 'selfCheck'> & { selfCheck: string[] }> = [
  {
    id: 'p0',
    number: '00',
    title: 'Warm-up',
    start: '2026-11-05',
    end: '2026-11-15',
    goal: 'Write Python fluently enough to start DSA.',
    selfCheck: [
      'Use list, dict, set, heapq, deque, Counter and defaultdict without looking anything up',
      'Solve an Easy problem end to end in Python',
    ],
  },
  {
    id: 'p1',
    number: '01',
    title: 'DSA Foundations + CS Fundamentals',
    start: '2026-11-16',
    end: '2027-02-28',
    goal: 'About 110 NeetCode problems. Networking, operating systems and databases at interview depth.',
    selfCheck: [
      'Explain what happens when you type a URL: DNS, TCP, TLS, HTTP, render',
      'Explain process vs thread, and when a deadlock happens',
      'Explain how an index speeds up a query, and when it slows the system down',
      'Explain the isolation levels and what a phantom read is',
    ],
  },
  {
    id: 'p2',
    number: '02',
    title: 'Finish DSA + System Design',
    start: '2027-03-01',
    end: '2027-05-02',
    goal: 'Finish NeetCode 150 and the 12 classic system design problems.',
    selfCheck: [
      'Recognise the pattern of a new problem within 5 minutes',
      'State time and space complexity of every solution you write',
      'Estimate QPS and storage for a system with 10 million users',
    ],
  },
  {
    id: 'p3',
    number: '03',
    title: 'AI Project + Advanced System Design',
    start: '2027-05-03',
    end: '2027-08-01',
    goal: 'Ship one AI project with evals and real numbers. Keep DSA warm with 5 timed problems a week.',
    selfCheck: [
      'The project is live, with an eval set and before/after numbers',
      'At least one open-source PR merged',
      'Design an LLM-backed system end to end in 45 minutes',
    ],
  },
  {
    id: 'p4',
    number: '04',
    title: 'Interviews + Applications',
    start: '2027-08-02',
    end: '2027-10-31',
    goal: 'Reach technical interview rounds and land an offer.',
    selfCheck: [
      'Medium problem solved in 25 minutes while talking through it',
      'Six behavioural stories ready in STAR format',
      'At least five technical interview rounds done',
    ],
  },
]

// ── Weeks ─────────────────────────────────
interface WeekSpec {
  label: string
  phaseId: PhaseId
  start: string
  end: string
  goal: string
  dsa?: TaskSeed[]
  study?: TaskSeed[]
  dailyDsa?: TaskSeed
  saturday?: TaskSeed[]
  sunday?: TaskSeed[]
}

const weekSpecs: WeekSpec[] = [
  {
    label: 'Week 0',
    phaseId: 'p0',
    start: '2026-11-05',
    end: '2026-11-15',
    goal: 'Python syntax and the built-ins used in interviews. First 3 problems solved.',
    study: [
      task('python', 'Coddy: variables, strings, lists', link('Coddy', LINKS.coddy)),
      task('python', 'Coddy: dicts, sets, loops, functions', link('Coddy', LINKS.coddy)),
      task('python', 'Watch Python for Coding Interviews (first half)', link('Video', LINKS.pyVideo)),
      task('python', 'Watch Python for Coding Interviews (second half)', link('Video', LINKS.pyVideo)),
      task('python', 'Rewrite from memory: heapq, deque, Counter, defaultdict, sorted(key=...)', link('collections', LINKS.pyCollections), link('heapq', LINKS.pyHeapq)),
      task('python', 'Create NeetCode and LeetCode accounts', link('NeetCode', LINKS.neetcode), link('LeetCode', LINKS.leetcode)),
      ...problems('Arrays & Hashing', 0, 3),
    ],
    saturday: [task('python', 'Python practice: 5 Coddy challenges', link('Coddy', LINKS.coddy))],
    sunday: [askClaude('python', 'Quiz: Claude asks 10 questions on Python built-ins')],
  },

  // Phase 1
  {
    label: 'Week 1',
    phaseId: 'p1',
    start: '2026-11-16',
    end: '2026-11-22',
    goal: 'Arrays & Hashing done. Understand latency and how TCP works.',
    dsa: problems('Arrays & Hashing', 3),
    study: [
      hpbn('Primer on latency and bandwidth', 'primer-on-latency-and-bandwidth'),
      hpbn('Building blocks of TCP: handshake, flow control', 'building-blocks-of-tcp'),
      hpbn('Building blocks of TCP: congestion control, head-of-line blocking', 'building-blocks-of-tcp'),
      askClaude('cs', 'Explain to Claude why latency matters more than bandwidth'),
    ],
  },
  {
    label: 'Week 2',
    phaseId: 'p1',
    start: '2026-11-23',
    end: '2026-11-29',
    goal: 'Two Pointers + Sliding Window done. Understand UDP and the TLS handshake.',
    dsa: [...problems('Two Pointers'), ...problems('Sliding Window')],
    study: [
      hpbn('Building blocks of UDP', 'building-blocks-of-udp'),
      hpbn('Transport Layer Security (TLS)', 'transport-layer-security-tls'),
      task('cs', 'What happens in a TLS handshake', link('Cloudflare', LINKS.cloudflareTls)),
      askClaude('cs', 'Draw the TCP + TLS handshake from memory and check it with Claude'),
    ],
  },
  {
    label: 'Week 3',
    phaseId: 'p1',
    start: '2026-11-30',
    end: '2026-12-06',
    goal: 'Stack done. Understand HTTP/1.1, HTTP/2 and DNS.',
    dsa: problems('Stack'),
    study: [
      hpbn('Brief history of HTTP', 'brief-history-of-http'),
      hpbn('HTTP/1.x', 'http1x'),
      hpbn('HTTP/2', 'http2'),
      task('cs', 'What is DNS + what is a CDN', link('DNS', LINKS.cloudflareDns), link('CDN', LINKS.cloudflareCdn)),
      askClaude('cs', 'Explain "what happens when you type a URL" end to end'),
    ],
  },
  {
    label: 'Week 4',
    phaseId: 'p1',
    start: '2026-12-07',
    end: '2026-12-13',
    goal: 'Binary Search done. Understand processes and how the OS runs them.',
    dsa: problems('Binary Search'),
    study: [
      ostep(4, 'The abstraction: the process', 'cpu-intro'),
      ostep(5, 'Process API: fork, exec, wait', 'cpu-api'),
      ostep(6, 'Limited direct execution', 'cpu-mechanisms'),
      askClaude('cs', 'Summarise process states and context switching to Claude'),
    ],
  },
  {
    label: 'Week 5',
    phaseId: 'p1',
    start: '2026-12-14',
    end: '2026-12-20',
    goal: 'Linked List done. Understand CPU scheduling.',
    dsa: problems('Linked List'),
    study: [
      ostep(7, 'Scheduling: introduction', 'cpu-sched'),
      ostep(8, 'Multi-level feedback queue', 'cpu-sched-mlfq'),
      ostep(9, 'Proportional share scheduling', 'cpu-sched-lottery'),
    ],
  },
  {
    label: 'Week 6',
    phaseId: 'p1',
    start: '2026-12-21',
    end: '2026-12-27',
    goal: 'Trees part 1. Understand virtual memory.',
    dsa: problems('Trees', 0, 8),
    study: [
      ostep(13, 'Address spaces', 'vm-intro'),
      ostep(14, 'Memory API', 'vm-api'),
      ostep(15, 'Address translation', 'vm-mechanism'),
      ostep(16, 'Segmentation', 'vm-segmentation'),
      ostep(18, 'Paging', 'vm-paging'),
    ],
  },
  {
    label: 'Week 7',
    phaseId: 'p1',
    start: '2026-12-28',
    end: '2027-01-03',
    goal: 'Trees + Tries done. Checkpoint: redo 10 random problems.',
    dsa: [...problems('Trees', 8), ...problems('Tries')],
    saturday: [task('review', 'Checkpoint: redo 10 random problems solved so far', link('NeetCode', LINKS.neetcode))],
    sunday: [askClaude('review', 'Checkpoint: re-explain TCP, TLS, processes and virtual memory to Claude')],
  },
  {
    label: 'Week 8',
    phaseId: 'p1',
    start: '2027-01-04',
    end: '2027-01-10',
    goal: 'Heap done. Understand threads and locks.',
    dsa: problems('Heap'),
    study: [
      ostep(26, 'Concurrency: an introduction', 'threads-intro'),
      ostep(27, 'Thread API', 'threads-api'),
      ostep(28, 'Locks', 'threads-locks'),
      ostep(29, 'Lock-based data structures', 'threads-locks-usage'),
    ],
  },
  {
    label: 'Week 9',
    phaseId: 'p1',
    start: '2027-01-11',
    end: '2027-01-17',
    goal: 'Backtracking done. Understand condition variables, semaphores and deadlock.',
    dsa: problems('Backtracking'),
    study: [
      ostep(30, 'Condition variables', 'threads-cv'),
      ostep(31, 'Semaphores', 'threads-sema'),
      ostep(32, 'Common concurrency bugs', 'threads-bugs'),
      task('cs', 'Write a producer-consumer in Python with threading + queue', link('threading', LINKS.pyThreading)),
    ],
  },
  {
    label: 'Week 10',
    phaseId: 'p1',
    start: '2027-01-18',
    end: '2027-01-24',
    goal: 'Graphs part 1. Understand B-tree indexes.',
    dsa: problems('Graphs', 0, 7),
    study: [
      task('cs', 'Use The Index, Luke: anatomy of an index', link('Read', LINKS.utilAnatomy)),
      task('cs', 'Use The Index, Luke: the WHERE clause (part 1)', link('Read', LINKS.utilWhere)),
      task('cs', 'Use The Index, Luke: the WHERE clause (part 2)', link('Read', LINKS.utilWhere)),
      task('cs', 'Run EXPLAIN ANALYZE on one of your Supabase queries', link('Postgres docs', LINKS.pgExplain)),
    ],
  },
  {
    label: 'Week 11',
    phaseId: 'p1',
    start: '2027-01-25',
    end: '2027-01-31',
    goal: 'Graphs done. Understand transactions, ACID and isolation levels.',
    dsa: problems('Graphs', 7),
    study: [
      task('cs', 'Postgres: transaction isolation', link('Postgres docs', LINKS.pgIsolation)),
      task('cs', 'CMU 15-445: concurrency control lecture', link('Course', LINKS.cmu445), link('Videos', LINKS.cmu445Videos)),
      task('cs', 'Reproduce a lost update with two SQL sessions', link('Postgres docs', LINKS.pgIsolation)),
    ],
  },
  {
    label: 'Week 12',
    phaseId: 'p1',
    start: '2027-02-01',
    end: '2027-02-07',
    goal: 'Light review before Tet. Redo every missed problem so far.',
    study: Array.from({ length: 5 }, () => task('review', 'Redo 3 missed problems', link('NeetCode', LINKS.neetcode))),
  },
  {
    label: 'Week 13',
    phaseId: 'p1',
    start: '2027-02-08',
    end: '2027-02-14',
    goal: 'Tet holiday. Optional: a few easy problems to keep the rhythm.',
    study: Array.from({ length: 3 }, () => task('review', 'Optional: 1 easy problem', link('NeetCode', LINKS.neetcode))),
    saturday: [],
    sunday: [],
  },
  {
    label: 'Week 14',
    phaseId: 'p1',
    start: '2027-02-15',
    end: '2027-02-21',
    goal: 'Advanced Graphs done. Understand storage engines, WAL and replication.',
    dsa: problems('Advanced Graphs'),
    study: [
      task('cs', 'CMU 15-445: database storage lecture', link('Course', LINKS.cmu445), link('Videos', LINKS.cmu445Videos)),
      task('cs', 'Postgres: write-ahead logging', link('Postgres docs', LINKS.pgWal)),
      task('cs', 'Postgres: high availability and replication', link('Postgres docs', LINKS.pgReplication)),
    ],
  },
  {
    label: 'Week 15',
    phaseId: 'p1',
    start: '2027-02-22',
    end: '2027-02-28',
    goal: '1-D DP part 1. Phase 1 checkpoint: 30-minute CS mock interview.',
    dsa: problems('1-D DP', 0, 6),
    study: [askClaude('review', 'Answer the Phase 1 self-check questions out loud')],
    sunday: [askClaude('review', 'Phase 1 checkpoint: 30-minute CS mock interview with Claude')],
  },

  // Phase 2
  {
    label: 'Week 16',
    phaseId: 'p2',
    start: '2027-03-01',
    end: '2027-03-07',
    goal: '1-D DP done. First system design chapter.',
    dsa: problems('1-D DP', 6),
    study: sdChapter('Scale from Zero to Millions of Users', 'scale-from-zero-to-millions-of-users'),
  },
  {
    label: 'Week 17',
    phaseId: 'p2',
    start: '2027-03-08',
    end: '2027-03-14',
    goal: '2-D DP part 1. Learn estimation and the interview framework.',
    dsa: problems('2-D DP', 0, 6),
    study: [
      task('sd', 'Read: Back-of-the-envelope estimation', link('ByteByteGo', `${LINKS.bbg}back-of-the-envelope-estimation`)),
      task('sd', 'Read: A framework for system design interviews', link('ByteByteGo', `${LINKS.bbg}a-framework-for-system-design-interviews`)),
      task('sd', 'System Design School primer', link('Read', LINKS.sdsPrimer)),
      askClaude('sd', 'Estimate QPS and storage for a 10M-user app, check with Claude'),
    ],
  },
  {
    label: 'Week 18',
    phaseId: 'p2',
    start: '2027-03-15',
    end: '2027-03-21',
    goal: '2-D DP done. Rate Limiter.',
    dsa: problems('2-D DP', 6),
    study: sdChapter('Rate Limiter', 'design-a-rate-limiter'),
  },
  {
    label: 'Week 19',
    phaseId: 'p2',
    start: '2027-03-22',
    end: '2027-03-28',
    goal: 'Greedy done. Consistent Hashing.',
    dsa: problems('Greedy'),
    study: sdChapter('Consistent Hashing', 'design-consistent-hashing'),
  },
  {
    label: 'Week 20',
    phaseId: 'p2',
    start: '2027-03-29',
    end: '2027-04-04',
    goal: 'Intervals done. Key-Value Store.',
    dsa: problems('Intervals'),
    study: sdChapter('Key-Value Store', 'design-a-key-value-store'),
  },
  {
    label: 'Week 21',
    phaseId: 'p2',
    start: '2027-04-05',
    end: '2027-04-11',
    goal: 'Math & Geometry done. Unique ID Generator + URL Shortener.',
    dsa: problems('Math & Geometry'),
    study: [
      ...sdChapter('Unique ID Generator', 'design-a-unique-id-generator-in-distributed-systems'),
      ...sdChapter('URL Shortener', 'design-a-url-shortener'),
    ],
  },
  {
    label: 'Week 22',
    phaseId: 'p2',
    start: '2027-04-12',
    end: '2027-04-18',
    goal: 'Bit Manipulation done. Web Crawler + Notification System.',
    dsa: problems('Bit Manipulation'),
    study: [
      ...sdChapter('Web Crawler', 'design-a-web-crawler'),
      ...sdChapter('Notification System', 'design-a-notification-system'),
    ],
  },
  {
    label: 'Week 23',
    phaseId: 'p2',
    start: '2027-04-19',
    end: '2027-04-25',
    goal: 'NeetCode 150 complete. Redo every missed problem. News Feed.',
    dsa: Array.from({ length: 5 }, () => task('review', 'Redo 3 missed problems', link('NeetCode', LINKS.neetcode))),
    study: sdChapter('News Feed', 'design-a-news-feed-system'),
  },
  {
    label: 'Week 24',
    phaseId: 'p2',
    start: '2027-04-26',
    end: '2027-05-02',
    goal: 'Chat System. Phase 2 checkpoint: one full design in 45 minutes, no notes.',
    dailyDsa: timedReview,
    study: sdChapter('Chat System', 'design-a-chat-system'),
    sunday: [task('sd', 'Phase 2 checkpoint: redraw one system design in 45 minutes with no notes')],
  },

  // Phase 3
  {
    label: 'Week 25',
    phaseId: 'p3',
    start: '2027-05-03',
    end: '2027-05-09',
    goal: 'Search Autocomplete. Pick the AI project and write its spec.',
    dailyDsa: timedReview,
    study: [
      ...sdChapter('Search Autocomplete', 'design-a-search-autocomplete-system'),
      task('ai', 'Read: Building effective agents', link('Anthropic', LINKS.agents)),
      task('ai', 'AI project: pick a problem with real users, write the spec and success metric'),
    ],
  },
  {
    label: 'Week 26',
    phaseId: 'p3',
    start: '2027-05-10',
    end: '2027-05-16',
    goal: 'YouTube. Call an LLM API with structured output and tool use.',
    dailyDsa: timedReview,
    study: [
      ...sdChapter('YouTube', 'design-youtube'),
      task('ai', 'AI project: call the Claude API, get structured JSON output', link('Claude docs', LINKS.claudeDocs)),
      task('ai', 'AI project: add tool use (function calling)', link('Claude docs', LINKS.claudeDocs)),
    ],
  },
  {
    label: 'Week 27',
    phaseId: 'p3',
    start: '2027-05-17',
    end: '2027-05-23',
    goal: 'Google Drive. RAG v1 working end to end.',
    dailyDsa: timedReview,
    study: [
      ...sdChapter('Google Drive', 'design-google-drive'),
      task('ai', 'Read: Contextual retrieval', link('Anthropic', LINKS.contextualRetrieval)),
      task('ai', 'AI project: RAG v1 — chunking, embeddings, vector search'),
    ],
  },
  {
    label: 'Week 28',
    phaseId: 'p3',
    start: '2027-05-24',
    end: '2027-05-30',
    goal: 'Design an LLM system yourself. Build a 50-question eval set and measure the baseline.',
    dailyDsa: timedReview,
    study: [
      task('sd', 'Design a RAG chatbot system: ingestion, retrieval, caching, cost'),
      askClaude('sd', 'Defend your RAG system design against Claude'),
      task('ai', 'AI project: write 50 eval questions with expected answers'),
      task('ai', 'AI project: run the eval, record the baseline score'),
    ],
  },
  {
    label: 'Week 29',
    phaseId: 'p3',
    start: '2027-05-31',
    end: '2027-06-06',
    goal: 'Hybrid search + rerank. Re-measure and record the improvement.',
    dailyDsa: timedReview,
    study: [
      task('ai', 'AI project: add BM25 keyword search alongside vectors'),
      task('ai', 'AI project: add a reranking step', link('Anthropic', LINKS.contextualRetrieval)),
      task('ai', 'AI project: re-run the eval and log before/after numbers'),
    ],
  },
  {
    label: 'Week 30',
    phaseId: 'p3',
    start: '2027-06-07',
    end: '2027-06-13',
    goal: 'Agent + MCP tool. First system design mock interview.',
    dailyDsa: timedReview,
    study: [
      task('ai', 'Read the MCP introduction', link('MCP', LINKS.mcp)),
      task('ai', 'AI project: expose one capability as an MCP tool', link('MCP', LINKS.mcp)),
      task('ai', 'AI project: add an agent loop with step limit and error handling', link('Anthropic', LINKS.agents)),
    ],
    sunday: [askClaude('sd', 'Mock interview #1: 45-minute system design with Claude')],
  },
  {
    label: 'Week 31',
    phaseId: 'p3',
    start: '2027-06-14',
    end: '2027-06-20',
    goal: 'Deploy with logging, cost and latency tracking.',
    dailyDsa: timedReview,
    study: [
      task('ai', 'AI project: deploy to production', link('Vercel docs', LINKS.vercel)),
      task('ai', 'AI project: log every request with tokens, cost and latency'),
      task('ai', 'AI project: add prompt-injection guardrails'),
    ],
  },
  {
    label: 'Week 32',
    phaseId: 'p3',
    start: '2027-06-21',
    end: '2027-06-27',
    goal: 'README with architecture and numbers. Publish one blog post.',
    dailyDsa: timedReview,
    study: [
      task('ai', 'AI project: README — problem, architecture diagram, eval numbers'),
      task('ai', 'Write a blog post: what you built and what the numbers showed'),
      task('ai', 'Publish the post and link it from this portfolio'),
    ],
  },
  {
    label: 'Weeks 33–34',
    phaseId: 'p3',
    start: '2027-06-28',
    end: '2027-07-11',
    goal: 'First open-source PR submitted.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Find 3 candidate repos with good first issues', link('Good First Issue', LINKS.goodFirstIssue)),
      task('career', 'Read CONTRIBUTING and run the repo locally'),
      task('career', 'Reproduce the issue and write a failing test'),
      task('career', 'Fix it and open PR #1'),
      task('career', 'Respond to review comments'),
    ],
  },
  {
    label: 'Weeks 35–36',
    phaseId: 'p3',
    start: '2027-07-12',
    end: '2027-07-25',
    goal: 'Second PR. Second system design mock interview.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Pick the next issue', link('Good First Issue', LINKS.goodFirstIssue)),
      task('career', 'Open PR #2'),
      task('career', 'Follow up on both PRs until merged'),
    ],
    sunday: [askClaude('sd', 'Mock interview: 45-minute system design with Claude')],
  },
  {
    label: 'Week 37',
    phaseId: 'p3',
    start: '2027-07-26',
    end: '2027-08-01',
    goal: 'Phase 3 checkpoint: project live, at least 1 PR, half of NeetCode 150 redone.',
    dailyDsa: timedReview,
    study: [task('review', 'Check the Phase 3 self-check list and close any gaps')],
  },

  // Phase 4
  {
    label: 'Weeks 38–39',
    phaseId: 'p4',
    start: '2027-08-02',
    end: '2027-08-15',
    goal: 'One-page CV, LinkedIn and GitHub updated, six STAR stories.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Write a one-page CV', link('Guide', LINKS.resume)),
      askClaude('career', 'Get CV feedback from Claude, revise'),
      task('career', 'Update LinkedIn and pin the best GitHub repos'),
      task('career', 'Write STAR stories 1–3', link('Guide', LINKS.behavioral)),
      task('career', 'Write STAR stories 4–6', link('Guide', LINKS.behavioral)),
      askClaude('career', 'Behavioural mock interview with Claude'),
    ],
  },
  {
    label: 'Weeks 40–41',
    phaseId: 'p4',
    start: '2027-08-16',
    end: '2027-08-29',
    goal: 'Second timed pass of NeetCode 150 done. Two mock interviews per week.',
    dailyDsa: task('dsa', 'Timed second pass: 2 NeetCode 150 problems, 25 minutes each', link('NeetCode', LINKS.neetcode)),
    study: [
      askClaude('review', 'Mock interview: DSA (45 min)'),
      askClaude('review', 'Mock interview: system design (45 min)'),
      askClaude('review', 'Mock interview: DSA (45 min)'),
      askClaude('review', 'Mock interview: system design (45 min)'),
    ],
  },
  {
    label: 'Weeks 42–43',
    phaseId: 'p4',
    start: '2027-08-30',
    end: '2027-09-12',
    goal: 'Application wave 1: 15 practice companies, at least 5 referrals asked.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Shortlist 15 practice companies'),
      task('career', 'Apply to companies 1–5'),
      task('career', 'Apply to companies 6–10'),
      task('career', 'Apply to companies 11–15'),
      task('career', 'Ask 5 people for referrals'),
    ],
  },
  {
    label: 'Weeks 44–46',
    phaseId: 'p4',
    start: '2027-09-13',
    end: '2027-10-03',
    goal: 'Application wave 2: 25 target companies. Log every interview question.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Shortlist 25 target companies'),
      task('career', 'Apply to target companies 1–10'),
      task('career', 'Apply to target companies 11–20'),
      task('career', 'Apply to target companies 21–25'),
      task('career', 'After each interview: write down every question asked'),
    ],
  },
  {
    label: 'Weeks 47–51',
    phaseId: 'p4',
    start: '2027-10-04',
    end: '2027-10-31',
    goal: 'Onsite rounds, offer negotiation. Final checkpoint: tick the targets at the top.',
    dailyDsa: timedReview,
    study: [
      task('career', 'Prepare company-specific questions for each onsite'),
      task('career', 'Negotiate the offer'),
      task('review', 'Final checkpoint: review the targets at the top of this page'),
    ],
  },
]

// ── Builder ───────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000

function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function getWeekday(date: string): number {
  return new Date(toUtc(date)).getUTCDay()
}

function listDates(start: string, end: string): string[] {
  const dates: string[] = []
  for (let t = toUtc(start); t <= toUtc(end); t += DAY_MS) dates.push(toIso(t))
  return dates
}

function distribute<T>(items: T[], slots: number): T[][] {
  const chunks: T[][] = Array.from({ length: slots }, () => [])
  const base = Math.floor(items.length / slots)
  const extra = items.length % slots
  let cursor = 0
  for (let i = 0; i < slots; i++) {
    const size = base + (i < extra ? 1 : 0)
    chunks[i] = items.slice(cursor, cursor + size)
    cursor += size
  }
  return chunks
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function assignIds(prefix: string, seeds: TaskSeed[]): RoadmapTask[] {
  const seen = new Map<string, number>()
  return seeds.map((seed) => {
    const base = `${prefix}:${slugify(seed.title)}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return { ...seed, id: count === 0 ? base : `${base}-${count + 1}` }
  })
}

function buildWeek(spec: WeekSpec): RoadmapWeek {
  const dates = listDates(spec.start, spec.end)
  const weekdayCount = dates.filter((d) => getWeekday(d) % 6 !== 0).length
  const dsaChunks = distribute(spec.dsa ?? [], weekdayCount)
  const studyChunks = distribute(spec.study ?? [], weekdayCount)
  let weekdayIndex = 0

  const days: RoadmapDay[] = dates.map((date) => {
    const weekday = getWeekday(date)
    let seeds: TaskSeed[]
    if (weekday === 6) seeds = spec.saturday ?? [redoMissed]
    else if (weekday === 0) seeds = spec.sunday ?? [weeklyQuiz]
    else {
      seeds = [
        ...(spec.dailyDsa ? [spec.dailyDsa] : []),
        ...dsaChunks[weekdayIndex],
        ...studyChunks[weekdayIndex],
      ]
      weekdayIndex++
    }
    return { date, tasks: assignIds(date, seeds) }
  })

  return {
    id: `week-${spec.start}`,
    label: spec.label,
    phaseId: spec.phaseId,
    start: spec.start,
    end: spec.end,
    goal: spec.goal,
    days,
  }
}

export const WEEKS: RoadmapWeek[] = weekSpecs.map(buildWeek)

export const PHASES: RoadmapPhase[] = phaseSeeds.map((phase) => ({
  ...phase,
  selfCheck: phase.selfCheck.map((title, i) => ({ id: `check:${phase.id}:${i}`, kind: 'review', title, links: [] })),
}))

export const TARGETS: RoadmapTask[] = [
  'Finish NeetCode 150, then a timed second pass: Medium in 25 minutes',
  'Present 12 system designs in 45 minutes each, no notes',
  'Explain networking, operating systems and databases in my own words',
  'Ship one AI project with evals, numbers, README and a blog post',
  'Get 1–2 pull requests merged into open source',
  'Send 40 applications, reach 5 technical rounds, land 1 offer',
].map((title, i) => ({ id: `target:${i}`, kind: 'career', title, links: [] }))

export const ROADMAP_START = WEEKS[0].start
export const ROADMAP_END = WEEKS[WEEKS.length - 1].end
