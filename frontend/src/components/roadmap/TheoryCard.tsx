import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ChevronDown,
  CircleHelp,
  Gauge,
  Layers,
  ScanSearch,
  Target,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { getProblemInfo } from '@/data/roadmap/neetcode'
import type { TaskReference } from '@/data/roadmap/types'

const DIFFICULTY_DOT = { easy: 'bg-easy', medium: 'bg-medium', hard: 'bg-hard' } as const

function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-foreground/[0.08] px-1 py-0.5 font-mono text-[0.85em]">
            {part}
          </code>
        ) : (
          part
        )
      )}
    </>
  )
}

function Section({ icon: Icon, title, tone, children }: { icon: LucideIcon; title: string; tone?: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h4 className={cn('mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground', tone)}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h4>
      {children}
    </section>
  )
}

export function QuizItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <li className="rounded-xl border border-border bg-background/40">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm hover:bg-foreground/[0.04] transition-colors"
      >
        <span className="flex-1 leading-relaxed">
          <InlineCode text={question} />
        </span>
        <span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
          {isOpen ? 'Hide' : 'Answer'}
        </span>
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
            <p className="border-t border-border/60 px-3.5 py-3 text-sm leading-relaxed text-muted-foreground">
              <InlineCode text={answer} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

interface TheoryCardProps {
  reference: TaskReference
  isOpenByDefault?: boolean
  // Extra line under the summary, e.g. a topic badge and the matching text of a search.
  headerExtra?: ReactNode
}

export function TheoryCard({ reference, isOpenByDefault = true, headerExtra }: TheoryCardProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault)
  const sources = [reference.source, ...(reference.extraSource ? [reference.extraSource] : [])]

  return (
    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.04]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left hover:bg-sky-500/[0.06] transition-colors"
      >
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <span className="flex-1">
          <span className="block text-sm font-semibold">{reference.title}</span>
          {reference.summary && (
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              <InlineCode text={reference.summary} />
            </span>
          )}
          {headerExtra}
        </span>
        <ChevronDown className={cn('mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-transform', isOpen && 'rotate-180')} />
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
            <div className="border-t border-sky-500/15 px-4 pb-4 pt-4">
              {reference.recognize && (
                <Section icon={ScanSearch} title={reference.recognizeTitle ?? 'Spot it when you see'}>
                  <div className="flex flex-wrap gap-2">
                    {reference.recognize.map((signal) => (
                      <span key={signal} className="rounded-lg bg-sky-500/10 px-2.5 py-1.5 text-xs leading-snug text-sky-800 dark:text-sky-200">
                        <InlineCode text={signal} />
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              <Section icon={Layers} title="How it works">
                <ul className="space-y-2 text-sm leading-relaxed">
                  {reference.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-500" />
                      <span>
                        <InlineCode text={point} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              {reference.complexity && (
                <Section icon={Gauge} title={reference.tableTitle ?? 'Cost'}>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-border/60">
                        {reference.complexity.map((row) => (
                          <tr key={row.op} className="bg-background/40">
                            <td className="px-3 py-2">
                              <InlineCode text={row.op} />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-xs font-semibold">
                              {row.cost}
                              {row.note && <span className="block font-sans text-[10px] font-normal text-muted-foreground">{row.note}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}

              {reference.example && (
                <Section icon={BookOpen} title="Example">
                  <MarkdownPreview content={`\`\`\`${reference.exampleLang ?? 'python'}\n${reference.example}\n\`\`\``} />
                </Section>
              )}

              {reference.pitfalls && (
                <Section icon={TriangleAlert} title="Common mistakes" tone="text-amber-600 dark:text-amber-400">
                  <ul className="space-y-2">
                    {reference.pitfalls.map((p) => (
                      <li key={p.title} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3.5 py-2.5 text-sm">
                        <p className="font-semibold">
                          <InlineCode text={p.title} />
                        </p>
                        <p className="mt-0.5 leading-relaxed text-muted-foreground">
                          <InlineCode text={p.fix} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {reference.interview && (
                <Section icon={Target} title="In interviews">
                  <p className="text-sm leading-relaxed">
                    <InlineCode text={reference.interview.when} />
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {reference.interview.problems.map((slug) => {
                      const info = getProblemInfo(slug)
                      if (!info) return null
                      return (
                        <a
                          key={slug}
                          href={info.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-medium hover:bg-foreground/[0.12] transition-colors"
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', DIFFICULTY_DOT[info.difficulty])} />
                          {info.title}
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )
                    })}
                  </div>
                </Section>
              )}

              {reference.inWork && (
                <Section icon={Briefcase} title="In real work">
                  <ul className="space-y-1.5 text-sm leading-relaxed">
                    {reference.inWork.map((use) => (
                      <li key={use} className="flex gap-2.5">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                        <span>
                          <InlineCode text={use} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {reference.quiz && (
                <Section icon={CircleHelp} title="Check yourself">
                  <ul className="space-y-2">
                    {reference.quiz.map((q) => (
                      <QuizItem key={q.question} question={q.question} answer={q.answer} />
                    ))}
                  </ul>
                </Section>
              )}

              <div className="mt-5 flex flex-wrap gap-2 border-t border-sky-500/15 pt-4">
                {sources.map((s, i) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      i === 0
                        ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20'
                        : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.12]'
                    )}
                  >
                    {i === 0 ? 'Read' : 'Go deeper'}: {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
