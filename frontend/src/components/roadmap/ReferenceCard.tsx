import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Gauge, Languages, SquareFunction, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { EASE_OUT } from '@/lib/motion'
import { referenceDocUrl, type ReferenceItem } from '@/data/reference/python'

interface ReferenceCardProps {
  item: ReferenceItem
  isOpenByDefault?: boolean
  onOpenChange?: (isOpen: boolean) => void
  // Extra line under the description, e.g. a topic badge and the matching text of a search.
  headerExtra?: ReactNode
}

// One Python built-in or library tool: signature and meaning at a glance, then an example with
// its output, the cost, the usual trap and the same thing in other languages.
export function ReferenceCard({ item, isOpenByDefault = false, onOpenChange, headerExtra }: ReferenceCardProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault)
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03]">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          onOpenChange?.(!isOpen)
        }}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left hover:bg-emerald-500/[0.06] transition-colors"
      >
        <SquareFunction className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-sm font-semibold">{item.name}</span>
          <span className="mt-0.5 block break-words font-mono text-xs text-muted-foreground">{item.signature}</span>
          <span className="mt-1 block text-sm leading-relaxed">
            <InlineText text={item.what} />
          </span>
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
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div data-card-body className="space-y-3 border-t border-emerald-500/15 px-4 pb-4 pt-3 text-sm">
              <MarkdownPreview content={`\`\`\`python\n${item.example}\n\`\`\``} />
              {item.cost && (
                <p className="flex gap-2">
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Cost: </span>
                    <InlineText text={item.cost} />
                  </span>
                </p>
              )}
              {item.gotcha && (
                <p className="flex gap-2 rounded-xl bg-amber-500/[0.07] px-3 py-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <InlineText text={item.gotcha} />
                  </span>
                </p>
              )}
              {item.other && (
                <p className="flex gap-2 text-muted-foreground">
                  <Languages className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">In other languages: </span>
                    <InlineText text={item.other} />
                  </span>
                </p>
              )}
              <a
                href={referenceDocUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-3 py-1.5 text-xs font-semibold hover:bg-foreground/[0.12] transition-colors"
              >
                Python docs <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
