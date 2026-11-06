import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, ClipboardCheck, Clock, Info, Languages, Lightbulb, PlayCircle, Target, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeCell } from '@/components/learn/CodeCell'
import { InlineText } from '@/components/learn/InlineText'
import { Reveal } from '@/components/learn/Reveal'
import { MermaidDiagram } from '@/components/learn/MermaidDiagram'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { QuizItem } from '@/components/roadmap/TheoryCard'
import { listContainer, listItem } from '@/lib/motion'
import { getExerciseIds, getLessonTerms } from '@/data/lessons'
import { GLOSSARY } from '@/data/lessons/glossary'
import type { CalloutTone, Lesson, LessonBlock } from '@/data/lessons/types'

const CALLOUT: Record<CalloutTone, { icon: LucideIcon; label: string; className: string }> = {
  tip: { icon: Lightbulb, label: 'Tip', className: 'border-sky-500/30 bg-sky-500/[0.06] text-sky-700 dark:text-sky-300' },
  warning: { icon: TriangleAlert, label: 'Watch out', className: 'border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300' },
  interview: { icon: Target, label: 'In the interview', className: 'border-violet-500/30 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300' },
}

interface LessonViewProps {
  lesson: Lesson
  // Signed in: code and exercise progress are saved to this account.
  canSave: boolean
  passed: Set<string>
  savedCode: Map<string, string>
  isTaskDone: boolean | null
  // The lesson's test is not passed yet, so the task cannot be ticked from here.
  isTestPending: boolean
  onOpenTest: () => void
  onBack: () => void
  onToggleDone: (isDone: boolean) => void
  onSaveCode: (key: string, code: string) => void
  onPassed: (itemId: string) => void
}

export function LessonView({ lesson, canSave, passed, savedCode, isTaskDone, isTestPending, onOpenTest, onBack, onToggleDone, onSaveCode, onPassed }: LessonViewProps) {
  const terms = getLessonTerms(lesson).filter((key) => GLOSSARY[key])
  const exerciseIds = getExerciseIds(lesson)
  const passedCount = exerciseIds.filter((id) => passed.has(`${lesson.id}:${id}`)).length
  const codeKey = (blockId: string) => `${lesson.id}:${blockId}`

  function renderBlock(block: LessonBlock) {
    switch (block.type) {
      case 'text':
        return <MarkdownPreview content={block.md} withGlossary />
      case 'callout': {
        const style = CALLOUT[block.tone]
        return (
          <div className={cn('rounded-2xl border px-4 py-3', style.className)}>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest">
              <style.icon className="h-3.5 w-3.5" /> {style.label}
            </p>
            <div className="text-foreground">
              <MarkdownPreview content={block.md} withGlossary />
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
              onSave={canSave ? (code) => onSaveCode(codeKey(block.id), code) : undefined}
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
              <MarkdownPreview content={block.prompt} withGlossary />
            </div>
            <CodeCell
              label="Your solution"
              initialCode={block.starter}
              savedCode={savedCode.get(codeKey(block.id))}
              tests={block.tests}
              isPassed={isPassed}
              onSave={canSave ? (code) => onSaveCode(codeKey(block.id), code) : undefined}
              onPassed={() => {
                if (canSave && !isPassed) onPassed(block.id)
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
        <p className="mt-3 text-xs text-muted-foreground">
          Words with a <span className="underline decoration-sky-500/70 decoration-dotted decoration-2 underline-offset-4">dotted line</span> are technical terms — tap one to see what it means.
        </p>
      </motion.div>

      {lesson.videos && lesson.videos.length > 0 && (
        <motion.div variants={listItem} className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <PlayCircle className="h-3.5 w-3.5" /> Best videos
          </p>
          <div className="flex flex-wrap gap-2">
            {lesson.videos.map((v) => (
              <a
                key={v.url}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/20 dark:text-red-300 transition-colors"
              >
                <PlayCircle className="h-3.5 w-3.5" /> {v.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {lesson.blocks.map((block, i) => (
        <motion.div key={i} variants={listItem} className="mt-6">
          {renderBlock(block)}
        </motion.div>
      ))}

      {terms.length > 0 && (
        <motion.section variants={listItem} className="mt-10 border-t border-border pt-6">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Languages className="h-3.5 w-3.5" /> Words in this lesson
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Plain-English explanations written by Claude (AI); the Vietnamese words are the usual translations used in Vietnamese IT.
          </p>
          <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {terms.map((key) => (
              <div key={key} className="text-sm">
                <dt className="font-semibold">
                  {key} <span className="font-normal text-muted-foreground">· {GLOSSARY[key].vi}</span>
                </dt>
                <dd className="text-muted-foreground">
                  <InlineText text={GLOSSARY[key].en} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>
      )}

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

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">How this lesson was made.</span> Written for this app by Claude
          (Anthropic’s AI), based on the official docs and books in “Further reading” above. Every code example was run in Python
          3 and its printed output matches the comments; every exercise’s solution passes its tests. Videos are made by their
          creators and only linked here.
        </p>

        {isTaskDone === false && isTestPending ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onOpenTest}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-600/85 transition-colors"
          >
            <ClipboardCheck className="h-4 w-4" /> Take the day test to finish this lesson
          </motion.button>
        ) : isTaskDone !== null && (
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
