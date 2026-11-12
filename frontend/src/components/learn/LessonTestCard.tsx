import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronDown, Info, CircleCheck, ClipboardCheck, Code2, ListChecks, MessagesSquare, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChoiceTest } from '@/components/learn/ChoiceTest'
import { CodeCell } from '@/components/learn/CodeCell'
import { ExplainItem } from '@/components/learn/ExplainItem'
import { Reveal } from '@/components/learn/Reveal'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { getConceptCount, getPassMark, getTestItemIds } from '@/data/lessons'
import type { LessonTest } from '@/data/lessons/types'
import { TestTimer } from '@/components/learn/TestTimer'

type PartId = 'choice' | 'code' | 'explain'

interface PartInfo {
  id: PartId
  label: string
  icon: LucideIcon
  done: number
  total: number
  note: string
}

interface LessonTestCardProps {
  // Progress rows are saved under this id: a lesson id, or `mock-<date>` for a mock interview.
  id: string
  title: string
  test: LessonTest
  // Quiz questions asked per attempt (default: one per concept).
  quizSize?: number
  // Suggested minutes; shows a timer the learner can start.
  minutes?: number
  // Signed in: answers and progress are saved to this account.
  canSave: boolean
  passed: Set<string>
  savedCode: Map<string, string>
  isOpenByDefault: boolean
  onSaveCode: (key: string, code: string) => void
  onPassed: (itemId: string) => void
}

const partVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24, transition: { duration: 0 } }),
  center: { opacity: 1, x: 0, transition: { duration: 0.26, ease: EASE_OUT } },
}

export function LessonTestCard({ id, title, test, quizSize, minutes, canSave, passed, savedCode, isOpenByDefault, onSaveCode, onPassed }: LessonTestCardProps) {
  const has = (itemId: string) => passed.has(`${id}:${itemId}`)
  const questionCount = Math.min(quizSize ?? Infinity, getConceptCount(test.choice))
  const itemIds = getTestItemIds(test)
  const doneCount = itemIds.filter(has).length
  const isAllDone = doneCount === itemIds.length
  const pass = (itemId: string) => {
    if (canSave && !has(itemId)) onPassed(itemId)
  }

  const allParts: PartInfo[] = [
    {
      id: 'choice',
      label: 'Quiz',
      icon: ListChecks,
      done: has('test:choice') ? 1 : 0,
      total: 1,
      note: `${questionCount} questions, one at a time. You see why right after each answer — read it even when you are right. You need ${getPassMark(questionCount)} correct. Wrong answers go to your flashcards.`,
    },
    {
      id: 'code',
      label: 'Coding',
      icon: Code2,
      done: test.code.filter((q) => has(`test:code:${q.id}`)).length,
      total: test.code.length,
      note: 'Like a coding round: think first, say the complexity, then write it. Run checks your code against the test cases; Submit saves the task once every case passes. The ⤢ button opens a full-screen editor.',
    },
    {
      id: 'explain',
      label: 'Interview',
      icon: MessagesSquare,
      done: test.explain.filter((q) => has(`test:explain:${q.id}`)).length,
      total: test.explain.length,
      note: 'Answer in your own words, as if the interviewer asked you. Then compare with the key points. Saying it out loud in English is great practice.',
    },
  ]
  const parts = allParts.filter((p) => (p.id === 'choice' ? test.choice.length > 0 : p.total > 0))
  const isPartDone = (part: PartInfo) => part.done === part.total

  const [isOpen, setIsOpen] = useState(isOpenByDefault)
  // Open on the first part that is not finished yet.
  const [activeId, setActiveId] = useState<PartId>(() => (parts.find((p) => !isPartDone(p)) ?? parts[0]).id)
  const [direction, setDirection] = useState(1)
  const activeIndex = parts.findIndex((p) => p.id === activeId)

  function selectPart(id: PartId) {
    const index = parts.findIndex((p) => p.id === id)
    setDirection(index > activeIndex ? 1 : -1)
    setActiveId(id)
  }

  function renderPart(id: PartId) {
    switch (id) {
      case 'choice':
        return (
          <ChoiceTest
            questions={test.choice}
            sampleSize={quizSize}
            isPassed={has('test:choice')}
            onPass={() => pass('test:choice')}
            savedState={savedCode.get(`${id}:test:choice-state`)}
            onSaveState={canSave ? (state) => onSaveCode(`${id}:test:choice-state`, state) : undefined}
          />
        )
      case 'code':
        return (
          <div className="space-y-4">
            {test.code.map((q, i) => {
              const key = `${id}:test:${q.id}`
              const itemId = `test:code:${q.id}`
              const help = (
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.hint && (
                    <Reveal label="Hint">
                      <MarkdownPreview content={q.hint} />
                    </Reveal>
                  )}
                  <Reveal label="Solution">
                    <MarkdownPreview content={`\`\`\`python\n${q.solution}\n\`\`\``} />
                  </Reveal>
                </div>
              )
              return (
                <div key={q.id} className="rounded-xl border border-border/70 bg-background/40 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Task {i + 1} of {test.code.length}
                  </p>
                  <h5 className="flex items-center gap-1.5 font-semibold">
                    {has(itemId) && <CircleCheck className="h-4 w-4 text-emerald-500" />}
                    {q.title}
                  </h5>
                  {q.ref && (
                    <a
                      href={q.ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs text-muted-foreground underline decoration-foreground/20 underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Based on {q.ref.label} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                  <div className="mt-1 mb-3">
                    <MarkdownPreview content={q.prompt} withGlossary />
                  </div>
                  <CodeCell
                    label="Your solution"
                    initialCode={q.starter}
                    savedCode={savedCode.get(key)}
                    tests={q.tests}
                    isPassed={has(itemId)}
                    onSave={canSave ? (code) => onSaveCode(key, code) : undefined}
                    onPassed={() => pass(itemId)}
                    title={q.title}
                    problem={
                      <>
                        <MarkdownPreview content={q.prompt} withGlossary />
                        {help}
                      </>
                    }
                  />
                  {help}
                </div>
              )
            })}
          </div>
        )
      case 'explain':
        return (
          <div className="space-y-4">
            {test.explain.map((q) => {
              const key = `${id}:test:explain:${q.id}`
              const itemId = `test:explain:${q.id}`
              return (
                <ExplainItem
                  key={q.id}
                  question={q}
                  savedAnswer={savedCode.get(key)}
                  isPassed={has(itemId)}
                  onSave={(text) => {
                    if (canSave && text.trim()) onSaveCode(key, text)
                  }}
                  onPass={(text) => {
                    if (canSave && text.trim()) onSaveCode(key, text)
                    pass(itemId)
                  }}
                />
              )
            })}
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border transition-colors',
        isAllDone ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-violet-500/30 bg-violet-500/[0.04]'
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left hover:bg-foreground/[0.03] transition-colors"
      >
        {isAllDone ? (
          <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <ClipboardCheck className="h-5 w-5 shrink-0 text-violet-500" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug">{title}</span>
          <span className="block text-xs text-muted-foreground">
            {[
              test.choice.length > 0 && `${questionCount} questions`,
              test.code.length > 0 && `${test.code.length} coding`,
              test.explain.length > 0 && `${test.explain.length} interview`,
              minutes && `${minutes} min`,
            ]
              .filter(Boolean)
              .join(' · ')}
            {canSave && ` · ${isAllDone ? 'passed' : `${parts.filter(isPartDone).length}/${parts.length} parts done`}`}
          </span>
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5">
              {minutes && (
                <TestTimer
                  minutes={minutes}
                  savedStart={savedCode.get(`${id}:timer`)}
                  onStart={(startedAt) => {
                    if (canSave) onSaveCode(`${id}:timer`, startedAt)
                  }}
                />
              )}
              <div
                role="tablist"
                aria-label="Test parts"
                className={cn('grid gap-1 rounded-2xl bg-foreground/[0.05] p-1', parts.length === 3 ? 'grid-cols-3' : parts.length === 2 ? 'grid-cols-2' : 'grid-cols-1')}
              >
                {parts.map((part, i) => {
                  const isActive = part.id === activeId
                  const isDone = isPartDone(part)
                  return (
                    <button
                      key={part.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectPart(part.id)}
                      className={cn(
                        'relative rounded-xl px-2 py-2 text-left transition-colors',
                        !isActive && 'hover:bg-foreground/[0.05]'
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={`test-tab-${id}`}
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-0 rounded-xl bg-background shadow-sm ring-1 ring-border"
                        />
                      )}
                      <span className="relative flex items-center gap-1.5">
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                            isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-violet-500 text-white' : 'bg-foreground/10 text-muted-foreground'
                          )}
                        >
                          {isDone ? <CircleCheck className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span className={cn('truncate text-xs font-semibold sm:text-sm', !isActive && 'text-muted-foreground')}>{part.label}</span>
                      </span>
                      <span className="relative mt-0.5 block truncate pl-[26px] text-[11px] text-muted-foreground">
                        {part.id === 'choice' ? (isDone ? 'passed' : `${questionCount} Qs`) : `${part.done}/${part.total} done`}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* All parts stay mounted, so switching tabs keeps unsaved answers (e.g. when signed out). */}
              <div className="overflow-hidden">
                {parts.map((part, i) => {
                  const isActive = part.id === activeId
                  const following = parts[i + 1]
                  return (
                    <motion.section
                      key={part.id}
                      role="tabpanel"
                      hidden={!isActive}
                      custom={direction}
                      variants={partVariants}
                      initial={false}
                      animate={isActive ? 'center' : 'enter'}
                      className="pt-4"
                    >
                      <h4 className="flex items-center gap-2 font-display text-lg font-bold">
                        <part.icon className="h-5 w-5 text-violet-500" />
                        Part {i + 1} · {part.label}
                      </h4>
                      <p className="mt-1 mb-4 text-xs leading-relaxed text-muted-foreground">{part.note}</p>
                      {renderPart(part.id)}

                      {following && (
                        <div className="mt-5 flex justify-end border-t border-border/60 pt-4">
                          <button
                            type="button"
                            onClick={() => selectPart(following.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                              isPartDone(part)
                                ? 'bg-violet-600 text-white hover:bg-violet-600/85'
                                : 'border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                            )}
                          >
                            Part {i + 2}: {following.label} <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </motion.section>
                  )
                })}
              </div>

              <div className="mt-6 rounded-xl bg-foreground/[0.04] px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                  <Info className="h-3.5 w-3.5" /> Where this test comes from
                </p>
                <p>
                  The questions, explanations and model answers were written for this app by Claude (Anthropic’s AI), using the
                  references below — they are not copied from a question bank. Every “What does this print?” answer and every coding
                  test was checked by running real Python. Each explanation links the exact page behind it.
                </p>
                {test.sources && test.sources.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {test.sources.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 underline decoration-foreground/20 underline-offset-2 hover:text-foreground transition-colors"
                        >
                          {s.label} <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
