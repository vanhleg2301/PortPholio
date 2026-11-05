import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, Clock, Info, Lightbulb, Target, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeCell } from '@/components/learn/CodeCell'
import { MermaidDiagram } from '@/components/learn/MermaidDiagram'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { QuizItem } from '@/components/roadmap/TheoryCard'
import { EASE_OUT, listContainer, listItem } from '@/lib/motion'
import { getExerciseIds } from '@/data/lessons'
import type { CalloutTone, Lesson, LessonBlock } from '@/data/lessons/types'

const CALLOUT: Record<CalloutTone, { icon: LucideIcon; label: string; className: string }> = {
  tip: { icon: Lightbulb, label: 'Tip', className: 'border-sky-500/30 bg-sky-500/[0.06] text-sky-700 dark:text-sky-300' },
  warning: { icon: TriangleAlert, label: 'Watch out', className: 'border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300' },
  interview: { icon: Target, label: 'In the interview', className: 'border-violet-500/30 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300' },
}

interface LessonViewProps {
  lesson: Lesson
  isOwner: boolean
  passed: Set<string>
  savedCode: Map<string, string>
  isTaskDone: boolean | null
  onBack: () => void
  onToggleDone: (isDone: boolean) => void
  onSaveCode: (key: string, code: string) => void
  onPassed: (itemId: string) => void
}

function Reveal({ label, children }: { label: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-foreground/[0.12] hover:text-foreground transition-colors"
      >
        {isOpen ? `Hide ${label.toLowerCase()}` : label}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LessonView({ lesson, isOwner, passed, savedCode, isTaskDone, onBack, onToggleDone, onSaveCode, onPassed }: LessonViewProps) {
  const exerciseIds = getExerciseIds(lesson)
  const passedCount = exerciseIds.filter((id) => passed.has(`${lesson.id}:${id}`)).length
  const codeKey = (blockId: string) => `${lesson.id}:${blockId}`

  function renderBlock(block: LessonBlock) {
    switch (block.type) {
      case 'text':
        return <MarkdownPreview content={block.md} />
      case 'callout': {
        const style = CALLOUT[block.tone]
        return (
          <div className={cn('rounded-2xl border px-4 py-3', style.className)}>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest">
              <style.icon className="h-3.5 w-3.5" /> {style.label}
            </p>
            <div className="text-foreground">
              <MarkdownPreview content={block.md} />
            </div>
          </div>
        )
      }
      case 'code':
        return (
          <div>
            <CodeCell
              initialCode={block.code}
              savedCode={savedCode.get(codeKey(block.id))}
              onSave={isOwner ? (code) => onSaveCode(codeKey(block.id), code) : undefined}
            />
            {block.caption && <p className="mt-2 text-xs text-muted-foreground">{block.caption}</p>}
          </div>
        )
      case 'diagram':
        return <MermaidDiagram source={block.mermaid} caption={block.caption} />
      case 'exercise': {
        const isPassed = passed.has(codeKey(block.id))
        return (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Exercise</p>
            <h3 className="mt-1 font-display text-lg font-bold">{block.title}</h3>
            <div className="mt-1 mb-3">
              <MarkdownPreview content={block.prompt} />
            </div>
            <CodeCell
              label="Your solution"
              initialCode={block.starter}
              savedCode={savedCode.get(codeKey(block.id))}
              tests={block.tests}
              isPassed={isPassed}
              onSave={isOwner ? (code) => onSaveCode(codeKey(block.id), code) : undefined}
              onPassed={() => {
                if (isOwner && !isPassed) onPassed(block.id)
              }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {block.hint && (
                <Reveal label="Hint">
                  <p className="text-sm text-muted-foreground">{block.hint}</p>
                </Reveal>
              )}
              <Reveal label="Solution">
                <MarkdownPreview content={`\`\`\`python\n${block.solution}\n\`\`\``} />
              </Reveal>
            </div>
          </div>
        )
      }
      case 'quiz':
        return (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Check yourself
            </p>
            <ul className="space-y-2">
              {block.items.map((q) => (
                <QuizItem key={q.question} question={q.question} answer={q.answer} />
              ))}
            </ul>
          </div>
        )
    }
  }

  return (
    <motion.article variants={listContainer} initial="hidden" animate="show" className="pb-10">
      <motion.div variants={listItem}>
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Lesson <span>·</span> <Clock className="h-3.5 w-3.5" /> {lesson.minutes} min
          {exerciseIds.length > 0 && (
            <>
              <span>·</span> {passedCount}/{exerciseIds.length} exercises
            </>
          )}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{lesson.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </motion.div>

      {lesson.blocks.map((block, i) => (
        <motion.div key={i} variants={listItem} className="mt-6">
          {renderBlock(block)}
        </motion.div>
      ))}

      <motion.footer variants={listItem} className="mt-10 border-t border-border pt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Further reading</p>
        <div className="flex flex-wrap gap-2">
          {lesson.furtherReading.map((l) => (
            <a
              key={l.url + l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium hover:bg-foreground/[0.12] transition-colors"
            >
              {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>

        {isTaskDone !== null && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleDone(!isTaskDone)}
            className={cn(
              'mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors',
              isTaskDone
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
                : 'bg-foreground text-background hover:bg-foreground/85'
            )}
          >
            <Check className="h-4 w-4" /> {isTaskDone ? 'Lesson done' : 'Mark lesson as done'}
          </motion.button>
        )}
      </motion.footer>
    </motion.article>
  )
}
