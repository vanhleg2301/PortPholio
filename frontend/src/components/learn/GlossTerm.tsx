import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { InlineText } from '@/components/learn/InlineText'
import { EASE_OUT } from '@/lib/motion'
import { GLOSSARY } from '@/data/lessons/glossary'

interface GlossTermProps {
  termKey: string
  children: ReactNode
}

// A technical word inside lesson text: tap it to show a plain-English explanation inline.
export function GlossTerm({ termKey, children }: GlossTermProps) {
  const [isOpen, setIsOpen] = useState(false)
  const entry = GLOSSARY[termKey]
  if (!entry) return <>{children}</>

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        title={`${entry.en} (${entry.vi})`}
        className="cursor-help underline decoration-sky-500/70 decoration-dotted decoration-2 underline-offset-4 hover:text-sky-700 hover:decoration-solid dark:hover:text-sky-300 transition-colors"
      >
        {children}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="mx-1 inline rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[13px] leading-relaxed text-sky-800 [box-decoration-break:clone] dark:text-sky-200"
          >
            <InlineText text={entry.en} /> <span className="opacity-70">· {entry.vi}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </>
  )
}
