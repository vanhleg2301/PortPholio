import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight, CalendarClock, ChevronRight, Circle, CircleCheck, CircleDot, ClipboardCheck, Clock, History } from 'lucide-react'
import { COURSE, MOCK_TEST_DAYS, SCHEDULED_LESSONS, type CourseItem } from '@/data/course'
import { LESSON_TESTS, isLessonTestPassed } from '@/data/lessons'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { getDayMockTest, isMockPassed } from '@/lib/testGate'
import { cn } from '@/lib/utils'

interface CourseViewProps {
  today: string
  // "lessonId:itemId" keys of passed exercises and test parts.
  passed: Set<string>
  savedCode: Map<string, string>
  onOpenLesson: (lessonId: string) => void
  onOpenDay: (date: string) => void
}

type Status = 'done' | 'started' | 'new' | 'planned'

const shortDate = (date: string) => format(parseISO(date), 'EEE d MMM')
const monthOf = (date: string) => format(parseISO(date), 'MMM yyyy')

function hasKeyFor(prefix: string, passed: Set<string>, savedCode: Map<string, string>): boolean {
  for (const key of passed) if (key.startsWith(prefix)) return true
  for (const key of savedCode.keys()) if (key.startsWith(prefix)) return true
  return false
}

// Done = the lesson's test is passed; started = an exercise, a test part or saved code exists.
function getLessonStatus(lessonId: string, passed: Set<string>, savedCode: Map<string, string>): Status {
  if (LESSON_TESTS[lessonId] && isLessonTestPassed(lessonId, passed)) return 'done'
  return hasKeyFor(`${lessonId}:`, passed, savedCode) ? 'started' : 'new'
}

function getStatus(item: CourseItem, passed: Set<string>, savedCode: Map<string, string>): Status {
  return item.lesson ? getLessonStatus(item.lesson.id, passed, savedCode) : 'planned'
}

const STATUS_ICON = {
  done: <CircleCheck className="h-5 w-5 text-emerald-500" />,
  started: <CircleDot className="h-5 w-5 text-violet-500" />,
  new: <Circle className="h-5 w-5 text-muted-foreground/60" />,
  planned: <CalendarClock className="h-5 w-5 text-muted-foreground/50" />,
} satisfies Record<Status, ReactNode>

export function CourseView({ today, passed, savedCode, onOpenLesson, onOpenDay }: CourseViewProps) {
  const lessonStatus = (lessonId: string) => getLessonStatus(lessonId, passed, savedCode)
  const notDone = SCHEDULED_LESSONS.filter((s) => lessonStatus(s.lesson.id) !== 'done')
  const next = notDone.find((s) => lessonStatus(s.lesson.id) === 'started') ?? notDone[0]
  const behind = notDone.filter((s) => s.date && s.date < today)
  const doneCount = SCHEDULED_LESSONS.length - notDone.length

  return (
    <div>
      <section className="rounded-2xl border border-border p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Your course</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {doneCount} of {SCHEDULED_LESSONS.length} written lessons passed. Learn in any order, go ahead of the plan, or open a
          finished lesson again — its test is at the end of every lesson and can be retaken any time.
        </p>
        {next && (
          <button
            type="button"
            onClick={() => onOpenLesson(next.lesson.id)}
            className="group mt-4 flex w-full items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-left text-background hover:bg-foreground/85 transition-colors"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-widest opacity-70">
                {lessonStatus(next.lesson.id) === 'started' ? 'Continue' : 'Next lesson'}
                {next.date && ` · planned ${shortDate(next.date)}`}
              </span>
              <span className="mt-0.5 block font-semibold leading-snug">{next.lesson.title}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
        {behind.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <History className="h-4 w-4 text-amber-500" /> Catch up · {behind.length} lesson{behind.length > 1 ? 's' : ''} behind the plan
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">No penalty — do them when you can. The plan does not move.</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {behind.slice(0, 6).map((s) => (
                <li key={s.lesson.id}>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(s.lesson.id)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-foreground/40 transition-colors"
                  >
                    {s.lesson.title}
                  </button>
                </li>
              ))}
              {behind.length > 6 && <li className="self-center text-xs text-muted-foreground">+{behind.length - 6} more below</li>}
            </ul>
          </div>
        )}
      </section>

      {COURSE.map((track) => {
        const lessons = track.modules.flatMap((m) => m.items).filter((i) => i.lesson)
        const done = lessons.filter((i) => getStatus(i, passed, savedCode) === 'done').length
        const percent = lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100)
        return (
          <section key={track.id} id={`course-${track.id}`} className="mt-10 scroll-mt-24">
            <div className="border-b border-border pb-3">
              <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-tight md:text-3xl">{track.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{track.about}</p>
              {lessons.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar percent={percent} />
                  <span className="w-16 text-right text-[11px] font-mono text-muted-foreground">
                    {done}/{lessons.length}
                  </span>
                </div>
              )}
            </div>
            {track.modules.map((module) => (
              <div key={module.title} className="mt-4">
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{module.title}</h3>
                <ul className="divide-y divide-border/50">
                  {module.items.map((item) => (
                    <CourseRow key={item.key} item={item} status={getStatus(item, passed, savedCode)} onOpenLesson={onOpenLesson} onOpenDay={onOpenDay} />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )
      })}

      <section className="mt-10">
        <div className="border-b border-border pb-3">
          <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-tight md:text-3xl">Mock interviews</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A short one every week, a longer timed one at the end of each month. Open the day to take it — early or late is fine.
          </p>
        </div>
        <ul className="divide-y divide-border/50">
          {MOCK_TEST_DAYS.map((m) => {
            const day = getDayMockTest(m.date)
            const isDone = day ? isMockPassed(day, passed) : false
            return (
              <li key={m.date}>
                <button
                  type="button"
                  onClick={() => onOpenDay(m.date)}
                  className="group flex w-full items-center gap-3 py-3 text-left hover:bg-foreground/[0.03] transition-colors"
                >
                  {isDone ? <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" /> : <ClipboardCheck className={cn('h-5 w-5 shrink-0', m.kind === 'month' ? 'text-violet-500' : 'text-muted-foreground/70')} />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-snug">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {shortDate(m.date)} · {m.minutes} min{m.kind === 'month' ? ' · month test' : ''}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

interface CourseRowProps {
  item: CourseItem
  status: Status
  onOpenLesson: (lessonId: string) => void
  onOpenDay: (date: string) => void
}

function CourseRow({ item, status, onOpenLesson, onOpenDay }: CourseRowProps) {
  const lesson = item.lesson
  const detail = lesson
    ? [item.date && `Planned ${shortDate(item.date)}`, `${lesson.minutes} min`, status === 'done' ? 'test passed' : status === 'started' ? 'in progress' : null]
    : [item.date ? `Coming · ${monthOf(item.date)}` : 'Coming later', item.category && 'problems in the plan']
  const content = (
    <>
      <span className="shrink-0">{STATUS_ICON[status]}</span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[15px] leading-snug', lesson ? 'font-semibold' : 'text-muted-foreground')}>{item.title}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {lesson && <Clock className="h-3 w-3" />}
          {detail.filter(Boolean).join(' · ')}
        </span>
      </span>
      {(lesson || item.date) && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
    </>
  )
  const rowClass = 'group flex w-full items-center gap-3 py-3 text-left hover:bg-foreground/[0.03] transition-colors'
  if (lesson) {
    return (
      <li>
        <button type="button" onClick={() => onOpenLesson(lesson.id)} className={rowClass}>
          {content}
        </button>
      </li>
    )
  }
  if (item.date) {
    const date = item.date
    return (
      <li>
        <button type="button" onClick={() => onOpenDay(date)} className={rowClass} aria-label={`${item.title}: open ${shortDate(date)} in Today`}>
          {content}
        </button>
      </li>
    )
  }
  return <li className="flex items-center gap-3 py-3">{content}</li>
}
