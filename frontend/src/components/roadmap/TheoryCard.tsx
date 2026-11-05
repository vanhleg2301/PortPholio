import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import type { TaskReference } from '@/data/roadmap/types'

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

interface TheoryCardProps {
  reference: TaskReference
  isOpenByDefault?: boolean
}

export function TheoryCard({ reference, isOpenByDefault = true }: TheoryCardProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault)

  return (
    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.04]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-left hover:bg-sky-500/[0.06] transition-colors"
      >
        <BookOpen className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <span className="flex-1 text-sm font-semibold">{reference.title}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <ul className="space-y-1.5 text-sm leading-relaxed">
                {reference.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <InlineCode text={point} />
                    </span>
                  </li>
                ))}
              </ul>
              {reference.example && (
                <div className="mt-3">
                  <MarkdownPreview content={`\`\`\`python\n${reference.example}\n\`\`\``} />
                </div>
              )}
              <a
                href={reference.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors"
              >
                Read the official docs: {reference.source.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
