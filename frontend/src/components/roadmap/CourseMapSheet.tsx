import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CourseMap } from '@/components/roadmap/CourseMap'
import { ProgressBar } from '@/components/roadmap/ProgressBar'
import { PHASES } from '@/data/roadmap/plan'
import { MAIN_TRACK, getModuleTitle, getTrackDays, getTrackModules, getTrackPercent, type StudyDay } from '@/data/roadmap/studyDays'

interface CourseMapSheetProps {
  day: StudyDay
  currentDay: StudyDay
  doneIds: Set<string>
  onSelect: (day: number) => void
}

// Phone: a bar with where the selected day sits in the course; tapping it opens the whole course map.
export function CourseMapSheet({ day, currentDay, doneIds, onSelect }: CourseMapSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const trackDays = getTrackDays(day.track)
  const modules = getTrackModules(day.track)
  const module = modules.find((m) => m.week.id === day.week.id)
  const percent = getTrackPercent(day.track, doneIds)
  const previous = trackDays[day.number - 2]
  const next = trackDays[day.number]
  const isMain = day.track === MAIN_TRACK
  const place = isMain ? day.week.label : `Module ${module?.number ?? 1} of ${modules.length}`
  const phase = isMain ? PHASES.find((p) => p.id === day.week.phaseId) : undefined

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const select = (number: number) => {
    setIsOpen(false)
    onSelect(number)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => previous && onSelect(previous.number)}
          disabled={!previous}
          aria-label="Previous day"
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          className="min-w-0 flex-1 rounded-2xl border border-border px-3.5 py-2.5 text-left hover:border-foreground/30 hover:bg-foreground/[0.03] transition-colors"
        >
          <span className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="truncate">{place}</span>
            <span className="shrink-0 tabular-nums">{`Day ${day.number} of ${trackDays.length} · ${percent}%`}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{phase ? phase.title : getModuleTitle(day.week.label)}</span>
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-muted-foreground">
              All days <ChevronDown className="h-4 w-4" />
            </span>
          </span>
          <ProgressBar percent={percent} className="mt-2" />
        </button>
        <button
          type="button"
          onClick={() => next && onSelect(next.number)}
          disabled={!next}
          aria-label="Next day"
          className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Course map"
              className="fixed inset-x-0 bottom-0 z-[61] mx-auto flex max-h-[85dvh] max-w-lg flex-col rounded-t-3xl border-t border-border bg-background pt-3"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20" />
              <div className="flex items-start justify-between gap-3 px-6 pb-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold">Course map</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {`${modules.length} ${isMain ? 'weeks' : 'modules'} · ${trackDays.length} days · ${percent}% done`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="-mr-2 rounded-full p-2 text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div data-course-map-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <CourseMap selectedDay={day} currentDay={currentDay} doneIds={doneIds} isSelectionShown onSelect={select} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
