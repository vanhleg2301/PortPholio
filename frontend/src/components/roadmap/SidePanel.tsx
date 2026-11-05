import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { CodeCell } from '@/components/learn/CodeCell'
import { DayNotes } from '@/components/roadmap/DayNotes'
import { ResourceList } from '@/components/roadmap/ResourceList'
import { appear } from '@/lib/motion'
import { DAY_BY_DATE } from '@/lib/roadmapStats'
import type { NoteTopic } from '@/data/roadmap/topics'
import type { RoadmapNote } from '@/hooks/useRoadmapNotes'
import type { RoadmapResource } from '@/hooks/useRoadmapResources'

const SCRATCH_KEY = 'scratchpad'
const SCRATCH_STARTER = `# Scratchpad: try anything here
nums = [3, 1, 2]
print(sorted(nums))`

interface SidePanelProps {
  date: string
  isOwner: boolean
  notes: RoadmapNote[]
  isNotesReady: boolean
  resources: RoadmapResource[]
  savedCode: Map<string, string>
  isCodeReady: boolean
  onSaveCode: (key: string, code: string) => void
  onRequestSignIn: () => void
}

function Title({ children }: { children: string }) {
  return <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</h3>
}

// Desktop right column: notes, resources and a Python scratchpad next to whatever you are reading.
export function SidePanel({ date, isOwner, notes, isNotesReady, resources, savedCode, isCodeReady, onSaveCode, onRequestSignIn }: SidePanelProps) {
  const tasks = DAY_BY_DATE.get(date)?.tasks ?? []
  const suggestedTopics = [...new Set(tasks.map((t): NoteTopic => t.kind))]

  if (!isOwner) {
    return (
      <motion.button
        {...appear()}
        type="button"
        onClick={onRequestSignIn}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-6 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
      >
        <Lock className="h-4 w-4" /> Sign in for notes and the scratchpad
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <motion.section {...appear(0)}>
        <Title>Notes</Title>
        {isNotesReady ? (
          <DayNotes key={date} day={date} notes={notes.filter((n) => n.day === date)} suggestedTopics={suggestedTopics} />
        ) : (
          <div className="h-24 animate-pulse rounded-2xl bg-foreground/[0.04]" />
        )}
      </motion.section>
      <motion.section {...appear(1)}>
        <Title>Resources</Title>
        <ResourceList day={date} resources={resources.filter((r) => r.day === date)} />
      </motion.section>
      <motion.section {...appear(2)}>
        <Title>Scratchpad</Title>
        {isCodeReady ? (
          <CodeCell
            label="Python scratchpad"
            initialCode={SCRATCH_STARTER}
            savedCode={savedCode.get(SCRATCH_KEY)}
            onSave={(code) => onSaveCode(SCRATCH_KEY, code)}
          />
        ) : (
          <div className="h-32 animate-pulse rounded-2xl bg-foreground/[0.04]" />
        )}
      </motion.section>
    </div>
  )
}
