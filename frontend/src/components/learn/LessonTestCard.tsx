import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, CircleCheck, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChoiceTest } from '@/components/learn/ChoiceTest'
import { CodeCell } from '@/components/learn/CodeCell'
import { ExplainItem } from '@/components/learn/ExplainItem'
import { Reveal } from '@/components/learn/Reveal'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { getPassMark, getTestItemIds } from '@/data/lessons'
import type { Lesson, LessonTest } from '@/data/lessons/types'

interface LessonTestCardProps {
  lesson: Lesson
  test: LessonTest
  isOwner: boolean
  passed: Set<string>
  savedCode: Map<string, string>
  isOpenByDefault: boolean
  onSaveCode: (key: string, code: string) => void
  onPassed: (itemId: string) => void
}

function Part({ title, note, isDone, children }: { title: string; note: string; isDone: boolean; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-2">
      <h4 className="flex items-center gap-1.5 font-display text-base font-bold">
        {isDone && <CircleCheck className="h-4 w-4 text-emerald-500" />}
        {title}
      </h4>
      <p className="mb-3 text-xs text-muted-foreground">{note}</p>
      {children}
    </section>
  )
}

export function LessonTestCard({ lesson, test, isOwner, passed, savedCode, isOpenByDefault, onSaveCode, onPassed }: LessonTestCardProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault)
  const has = (itemId: string) => passed.has(`${lesson.id}:${itemId}`)
  const itemIds = getTestItemIds(test)
  const doneCount = itemIds.filter(has).length
  const isAllDone = doneCount === itemIds.length
  const codeDone = test.code.filter((q) => has(`test:code:${q.id}`)).length
  const explainDone = test.explain.filter((q) => has(`test:explain:${q.id}`)).length
  const pass = (itemId: string) => {
    if (isOwner && !has(itemId)) onPassed(itemId)
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
          <span className="block text-[15px] font-semibold leading-snug">Test: {lesson.title}</span>
          <span className="block text-xs text-muted-foreground">
            {test.choice.length} questions · {test.code.length} coding · {test.explain.length} interview
            {isOwner && ` · ${isAllDone ? 'passed' : `${doneCount}/${itemIds.length} parts done`}`}
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
              <Part
                title="Part 1 · Multiple choice"
                note={`Answer all ${test.choice.length}, then check. You need ${getPassMark(test.choice.length)} correct. Read every explanation — also for the ones you got right.`}
                isDone={has('test:choice')}
              >
                <ChoiceTest questions={test.choice} isPassed={has('test:choice')} onPass={() => pass('test:choice')} />
              </Part>

              <Part
                title={`Part 2 · Coding (${codeDone}/${test.code.length})`}
                note="Like a coding round: think first, say the complexity, then write it. Use the hint only when you are stuck."
                isDone={codeDone === test.code.length}
              >
                <div className="space-y-4">
                  {test.code.map((q) => {
                    const key = `${lesson.id}:test:${q.id}`
                    const itemId = `test:code:${q.id}`
                    return (
                      <div key={q.id} className="rounded-xl border border-border/70 bg-background/40 p-3.5">
                        <h5 className="font-semibold">{q.title}</h5>
                        <div className="mt-1 mb-3">
                          <MarkdownPreview content={q.prompt} withGlossary />
                        </div>
                        <CodeCell
                          label="Your solution"
                          initialCode={q.starter}
                          savedCode={savedCode.get(key)}
                          tests={q.tests}
                          isPassed={has(itemId)}
                          onSave={isOwner ? (code) => onSaveCode(key, code) : undefined}
                          onPassed={() => pass(itemId)}
                        />
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
                      </div>
                    )
                  })}
                </div>
              </Part>

              <Part
                title={`Part 3 · Interview questions (${explainDone}/${test.explain.length})`}
                note="Answer in your own words, as if the interviewer asked you. Then compare with the key points. Saying it out loud in English is great practice."
                isDone={explainDone === test.explain.length}
              >
                <div className="space-y-4">
                  {test.explain.map((q) => {
                    const key = `${lesson.id}:test:explain:${q.id}`
                    const itemId = `test:explain:${q.id}`
                    return (
                      <ExplainItem
                        key={q.id}
                        question={q}
                        savedAnswer={savedCode.get(key)}
                        isPassed={has(itemId)}
                        onSave={(text) => {
                          if (isOwner && text.trim()) onSaveCode(key, text)
                        }}
                        onPass={(text) => {
                          if (isOwner && text.trim()) onSaveCode(key, text)
                          pass(itemId)
                        }}
                      />
                    )
                  })}
                </div>
              </Part>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
