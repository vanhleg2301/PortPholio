import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Languages, Loader2, Volume2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'
import { translateToVietnamese, type Translation } from '@/lib/translate'

const MAX_CHARS = 1000
const GUTTER = 12
const CARD_WIDTH = 340

interface Anchor {
  text: string
  rect: DOMRect
}

// Text inside inputs, the code editor or this tool itself is not offered for translation.
function isTranslatable(node: Node | null): boolean {
  const el = node instanceof Element ? node : node?.parentElement
  if (!el) return false
  return !el.closest('input, textarea, [contenteditable="true"], .cm-editor, [data-no-translate]')
}

function readSelection(): Anchor | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null
  const text = selection.toString().trim()
  if (!text || text.length > MAX_CHARS || !/[A-Za-z]/.test(text)) return null
  if (!isTranslatable(selection.anchorNode) || !isTranslatable(selection.focusNode)) return null
  const rect = selection.getRangeAt(0).getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null
  return { text, rect }
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

// Like the Google Translate extension: select English text, press "Translate", read the
// Vietnamese. Also reads the English aloud for pronunciation practice.
export function SelectionTranslator() {
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Translation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  // The card stays open after the selection is cleared, until closed or a new selection starts.
  const isOpenRef = useRef(false)
  isOpenRef.current = isOpen

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    // Wait until the selection settles (dragging, or the phone's selection handles).
    const onSelectionChange = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (boxRef.current?.contains(document.activeElement)) return
        const next = readSelection()
        setAnchor((prev) => {
          if (!next && isOpenRef.current) return prev
          return next
        })
      }, 250)
    }
    const onScroll = () => {
      const next = readSelection()
      if (next) setAnchor(next)
    }
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  function close() {
    setIsOpen(false)
    setResult(null)
    setError(null)
    setAnchor(null)
  }

  async function translate() {
    if (!anchor) return
    setIsOpen(true)
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await translateToVietnamese(anchor.text))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not translate this text.')
    } finally {
      setIsLoading(false)
    }
  }

  async function copy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the text is still on screen.
    }
  }

  if (!anchor) return null

  // Above the selection on desktop; below it on phones, where the system menu sits above.
  const viewport = window.innerWidth
  const width = isOpen ? Math.min(CARD_WIDTH, viewport - GUTTER * 2) : 0
  const center = anchor.rect.left + anchor.rect.width / 2
  const placeBelow = isTouch || anchor.rect.top < 140
  const top = placeBelow ? anchor.rect.bottom + 10 : anchor.rect.top - 10

  return createPortal(
    <div
      ref={boxRef}
      data-no-translate
      style={{
        top,
        left: isOpen ? Math.min(Math.max(center - width / 2, GUTTER), viewport - width - GUTTER) : Math.min(Math.max(center, 60), viewport - 60),
        width: isOpen ? width : undefined,
      }}
      className={cn('fixed z-[90]', !placeBelow && '-translate-y-full', !isOpen && '-translate-x-1/2')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isOpen ? (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            // Keep the selection: a normal mousedown on the button would clear it.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => void translate()}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-semibold text-background shadow-lg shadow-black/25 hover:bg-foreground/85 transition-colors"
          >
            <Languages className="h-4 w-4" /> Translate
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: placeBelow ? -6 : 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-xl shadow-black/25"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Languages className="h-3.5 w-3.5" /> English → Tiếng Việt
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close translation"
                className="-m-1 rounded-lg p-1 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 line-clamp-3 text-xs italic leading-relaxed text-muted-foreground">{anchor.text}</p>
            <div className="mt-2 min-h-[2.5rem] text-[15px] leading-relaxed">
              {isLoading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Translating…
                </p>
              )}
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              {result && <p className="max-h-60 overflow-y-auto">{result.text}</p>}
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-border/70 pt-2.5">
              <button
                type="button"
                onClick={() => speak(anchor.text)}
                className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-semibold hover:bg-foreground/[0.12] transition-colors"
              >
                <Volume2 className="h-3.5 w-3.5" /> Listen
              </button>
              <button
                type="button"
                onClick={() => void copy()}
                disabled={!result}
                className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-semibold hover:bg-foreground/[0.12] disabled:opacity-40 transition-colors"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
              {result && <span className="ml-auto text-[10px] text-muted-foreground">via {result.engine}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  )
}
