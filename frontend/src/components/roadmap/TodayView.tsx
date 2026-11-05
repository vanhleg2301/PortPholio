import { format, parseISO } from 'date-fns'
import { Lock } from 'lucide-react'
import { DayNotes } from '@/components/roadmap/DayNotes'
import { ResourceList } from '@/components/roadmap/ResourceList'
import { TaskItem } from '@/components/roadmap/TaskItem'
import { WeekStrip } from '@/components/roadmap/WeekStrip'
import type { RoadmapNote } from '@/hooks/useRoadmapNotes'
import type { NoteTopic } from '@/data/roadmap/topics'
import type { RoadmapResource } from '@/hooks/useRoadmapResources'
import { DAY_BY_DATE, getWeekForDate } from '@/lib/roadmapStats'

interface TodayViewProps {
  date: string
  today: string
  doneIds: Set<string>
  isOwner: boolean
  notes: RoadmapNote[]
  isNotesReady: boolean
  resources: RoadmapResource[]
  onSelectDate: (date: string) => void
  onToggle: (taskId: string, isDone: boolean) => void
  onRequestSignIn: () => void
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-8">{children}</h3>
}

export function TodayView({ date, today, doneIds, isOwner, notes, isNotesReady, resources, onSelectDate, onToggle, onRequestSignIn }: TodayViewProps) {
  const day = DAY_BY_DATE.get(date)
  const week = getWeekForDate(date)
  const tasks = day?.tasks ?? []
  const done = tasks.filter((t) => doneIds.has(t.id)).length
  const dayNotes = notes.filter((n) => n.day === date)
  const suggestedTopics = [...new Set(tasks.map((t): NoteTopic => t.kind))]
  const dayResources = resources.filter((r) => r.day === date)

  return (
    <div>
      <WeekStrip selectedDate={date} today={today} doneIds={doneIds} onSelect={onSelectDate} />

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {week?.label}
            {date === today ? ' · Today' : ''}
          </p>
          <h2 className="font-display font-bold text-2xl leading-tight">{format(parseISO(date), 'EEEE, d MMM')}</h2>
        </div>
        {date !== today && DAY_BY_DATE.has(today) && (
          <button type="button" onClick={() => onSelectDate(today)} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40 hover:bg-foreground/[0.06] transition-colors">
            Today
          </button>
        )}
      </div>
      {week && <p className="mt-1 text-sm text-muted-foreground">{week.goal}</p>}

      <SectionTitle>{tasks.length === 0 ? 'Tasks' : `Tasks · ${done}/${tasks.length}`}</SectionTitle>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Rest day. Recharge.</p>
      ) : (
        <ul className="rounded-2xl border border-border bg-card/40 px-4 divide-y divide-border/50">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} isDone={doneIds.has(task.id)} onToggle={onToggle} />
          ))}
        </ul>
      )}

      {isOwner ? (
        <>
          <SectionTitle>Notes</SectionTitle>
          {isNotesReady ? (
            <DayNotes key={date} day={date} notes={dayNotes} suggestedTopics={suggestedTopics} />
          ) : (
            <div className="h-24 rounded-2xl bg-foreground/[0.04] animate-pulse" />
          )}
          <SectionTitle>Resources</SectionTitle>
          <ResourceList day={date} resources={dayResources} />
        </>
      ) : (
        <button
          type="button"
          onClick={onRequestSignIn}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
        >
          <Lock className="h-4 w-4" /> Sign in to tick tasks, write notes and attach files
        </button>
      )}
    </div>
  )
}
