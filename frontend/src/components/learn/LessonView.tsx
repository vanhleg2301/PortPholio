import { lazy, Suspense, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Info, Languages, Lightbulb, PlayCircle, Search, Shuffle, Target, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeCell } from '@/components/learn/CodeCell'
import { InlineText } from '@/components/learn/InlineText'
import { Reveal } from '@/components/learn/Reveal'
import { MermaidDiagram } from '@/components/learn/MermaidDiagram'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { QuizItem } from '@/components/roadmap/TheoryCard'
import { listContainer, listItem } from '@/lib/motion'
import { LESSONS, LESSON_ANCHORS, LESSON_TESTS, blockAnchor, getExerciseIds, getLessonTerms } from '@/data/lessons'
import { LessonTestCard } from '@/components/learn/LessonTestCard'
import { LessonOutlineSheet } from '@/components/learn/LessonOutline'
import { LessonFind, type LessonFindRequest } from '@/components/learn/LessonFind'
import { GLOSSARY } from '@/data/lessons/glossary'
import type { CalloutTone, Lesson, LessonBlock } from '@/data/lessons/types'

const LessonVisual = lazy(() => import('@/components/learn/visuals'))

const CALLOUT: Record<CalloutTone, { icon: LucideIcon; label: string; className: string }> = {
  tip: { icon: Lightbulb, label: 'Tip', className: 'border-sky-500/30 bg-sky-500/[0.06] text-sky-700 dark:text-sky-300' },
  warning: { icon: TriangleAlert, label: 'Watch out', className: 'border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-300' },
  interview: { icon: Target, label: 'In the interview', className: 'border-violet-500/30 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300' },
  compare: { icon: Shuffle, label: 'In other languages', className: 'border-teal-500/30 bg-teal-500/[0.06] text-teal-700 dark:text-teal-300' },
}

interface LessonViewProps {
  // Opened from a search: find and show the first match.
  findRequest?: LessonFindRequest | null
  onFindMiss?: (request: LessonFindRequest) => void
  lesson: Lesson
  // Signed in: code and exercise progress are saved to this account.
  canSave: boolean
  passed: Set<string>
  savedCode: Map<string, string>
  isTaskDone: boolean | null
  // The lesson's test is not passed yet, so the task cannot be ticked from here.
  isTestPending: boolean
  // The lesson's test is shown at the end of the lesson too, so it can be taken on any day.
  onTestPassed: (itemId: string) => void
  onBack: () => void
  onToggleDone: (isDone: boolean) => void
  onSaveCode: (key: string, code: string) => void
  onPassed: (itemId: string) => void
  // Phones get the floating "Contents" menu; desktop shows the menu in the right column.
  isDesktop: boolean
  isTestPassed: boolean
  onOpenLesson: (lessonId: string) => void
}

export function LessonView({
  findRequest,
  onFindMiss,
  lesson,
  canSave,
  passed,
  savedCode,
  isTaskDone,
  isTestPending,
  onTestPassed,
  onBack,
  onToggleDone,
  onSaveCode,
  onPassed,
  isDesktop,
  isTestPassed,
  onOpenLesson,
}: LessonViewProps) {
  const position = LESSONS.findIndex((l) => l.id === lesson.id)
  const previous = position > 0 ? LESSONS[position - 1] : null
  const next = position >= 0 && position < LESSONS.length - 1 ? LESSONS[position + 1] : null
  const terms = getLessonTerms(lesson).filter((key) => GLOSSARY[key])
  const exerciseIds = getExerciseIds(lesson)
  const passedCount = exerciseIds.filter((id) => passed.has(`${lesson.id}:${id}`)).length
  const codeKey = (blockId: string) => `${lesson.id}:${blockId}`
  const articleRef = useRef<HTMLElement>(null)
  const activeRequest = findRequest && findRequest.lessonId === lesson.id ? findRequest : null
  const [isFindOpen, setIsFindOpen] = useState(Boolean(activeRequest))
  const [openedFor, setOpenedFor] = useState(activeRequest?.id ?? null)
  if (activeRequest && activeRequest.id !== openedFor) {
    setOpenedFor(activeRequest.id)
    setIsFindOpen(true)
  }

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
              title={`Example · ${lesson.title}`}
              problem={block.caption ? <p className="text-sm text-muted-foreground">{block.caption}</p> : undefined}
            />
            {block.caption && <p className="mt-2 text-xs text-muted-foreground">{block.caption}</p>}
          </div>
        )
      case 'diagram':
        return <MermaidDiagram source={block.mermaid} caption={block.caption} />
      case 'visual':
        return (
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-foreground/[0.04]" />}>
            <LessonVisual id={block.visual} caption={block.caption} />
          </Suspense>
        )
      case 'exercise': {
        const isPassed = passed.has(codeKey(block.id))
        const help = (
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
        )
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
              title={block.title}
              problem={
                <>
                  <MarkdownPreview content={block.prompt} withGlossary />
                  {help}
                </>
              }
            />
            {help}
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
    <motion.article ref={articleRef} variants={listContainer} initial="hidden" animate="show" className="pb-10">
      <LessonFind rootRef={articleRef} isOpen={isFindOpen} onClose={() => setIsFindOpen(false)} request={activeRequest} onMiss={onFindMiss} />
      <motion.div variants={listItem}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            data-find-skip
            onClick={() => setIsFindOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" /> Find in lesson
          </button>
        </div>
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
          Words with a <span className="underline decoration-sky-500/70 decoration-dotted decoration-2 underline-offset-4">dotted line</span> are technical terms — hover over one (or tap it on a phone) to see what it means. Tapping also adds it to your flashcards.
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
        <motion.div key={i} id={blockAnchor(i)} variants={listItem} className="mt-6 scroll-mt-32">
          {renderBlock(block)}
        </motion.div>
      ))}

      {terms.length > 0 && (
        <motion.section id={LESSON_ANCHORS.words} variants={listItem} className="mt-10 scroll-mt-32 border-t border-border pt-6">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Languages className="h-3.5 w-3.5" /> Words in this lesson
          </p>
          <p className="mb-3 text-xs text-muted-foreground">Plain-English explanations with a real-life example, written by Claude (AI).</p>
          <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {terms.map((key) => (
              <div key={key} className="text-sm">
                <dt className="font-semibold">{key}</dt>
                <dd className="text-muted-foreground">
                  <InlineText text={GLOSSARY[key].en} />
                </dd>
                <dd className="mt-0.5 text-[13px] text-muted-foreground/80">
                  <span className="font-medium">e.g.</span> <InlineText text={GLOSSARY[key].example} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>
      )}

      <motion.footer id={LESSON_ANCHORS.reading} variants={listItem} className="mt-10 scroll-mt-32 border-t border-border pt-6">
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

        <div id={LESSON_ANCHORS.finish} className="scroll-mt-32" />
        {LESSON_TESTS[lesson.id] && (
          <div className="mt-8">
            <LessonTestCard
              id={lesson.id}
              title={`Test: ${lesson.title}`}
              test={LESSON_TESTS[lesson.id]}
              canSave={canSave}
              passed={passed}
              savedCode={savedCode}
              isOpenByDefault={false}
              onSaveCode={onSaveCode}
              onPassed={onTestPassed}
            />
          </div>
        )}
        {isTaskDone === false && isTestPending ? (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm text-muted-foreground">
            <ClipboardCheck className="h-4 w-4" /> Pass the test above to finish this lesson
          </p>
        ) : isTaskDone !== null && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleDone(!isTaskDone)}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors',
              isTaskDone
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
                : 'bg-foreground text-background hover:bg-foreground/85'
            )}
          >
            <Check className="h-4 w-4" /> {isTaskDone ? 'Lesson done' : 'Mark lesson as done'}
          </motion.button>
        )}

        {(previous || next) && (
          <nav aria-label="Other lessons" className="mt-8 grid grid-cols-2 gap-3">
            {previous ? (
              <button
                type="button"
                onClick={() => onOpenLesson(previous.id)}
                className="group rounded-2xl border border-border p-3 text-left hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
              >
                <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Previous
                </span>
                <span className="mt-1 block text-sm font-semibold leading-snug">{previous.title}</span>
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button
                type="button"
                onClick={() => onOpenLesson(next.id)}
                className="group rounded-2xl border border-border p-3 text-right hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
              >
                <span className="flex items-center justify-end gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Next <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 block text-sm font-semibold leading-snug">{next.title}</span>
              </button>
            )}
          </nav>
        )}
      </motion.footer>
      {!isDesktop && <LessonOutlineSheet lesson={lesson} passed={passed} isTestPassed={isTestPassed} />}
    </motion.article>
  )
}
