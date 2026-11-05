import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, CircleX, Loader2, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AutoTextarea } from '@/components/roadmap/AutoTextarea'
import { EASE_OUT } from '@/lib/motion'
import { isPythonReady, onPythonReady, runPython, type RunResult } from '@/lib/pythonRunner'

const SAVE_DELAY_MS = 1000
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

interface CodeCellProps {
  initialCode: string
  savedCode?: string
  tests?: string
  label?: string
  isPassed?: boolean
  onSave?: (code: string) => void
  onPassed?: () => void
}

// Insert text through the browser so Ctrl+Z still works.
function insertAtCursor(el: HTMLTextAreaElement, text: string) {
  if (!document.execCommand('insertText', false, text)) {
    const { selectionStart: s, selectionEnd: e, value } = el
    el.value = value.slice(0, s) + text + value.slice(e)
    el.setSelectionRange(s + text.length, s + text.length)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export function CodeCell({ initialCode, savedCode, tests, label = 'Python', isPassed = false, onSave, onPassed }: CodeCellProps) {
  const [code, setCode] = useState(savedCode ?? initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isReady, setIsReady] = useState(isPythonReady)
  const lastSaved = useRef(savedCode ?? initialCode)

  useEffect(() => onPythonReady(setIsReady), [])

  // Debounced save of the learner's edits.
  useEffect(() => {
    if (!onSave || code === lastSaved.current) return
    const timer = setTimeout(() => {
      lastSaved.current = code
      onSave(code)
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [code, onSave])

  async function run() {
    if (isRunning) return
    setIsRunning(true)
    const res = await runPython(code, tests)
    setResult(res)
    setIsRunning(false)
    if (res.passed) onPassed?.()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void run()
      return
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      insertAtCursor(el, '    ')
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      // Keep the current indentation, and add a level after a colon.
      const lineStart = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1
      const line = el.value.slice(lineStart, el.selectionStart)
      const indent = line.match(/^\s*/)?.[0] ?? ''
      const extra = line.trimEnd().endsWith(':') ? '    ' : ''
      e.preventDefault()
      insertAtCursor(el, `\n${indent}${extra}`)
    }
  }

  const isExercise = tests !== undefined
  const status = !result ? null : result.passed === true ? 'pass' : result.error ? 'fail' : 'ok'

  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-[#0d1117]', isPassed ? 'border-emerald-500/50' : 'border-white/10')}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
          {label}
          {isPassed && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CircleCheck className="h-3.5 w-3.5" /> Passed
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCode(initialCode)
              setResult(null)
            }}
            title="Reset to the starting code"
            aria-label="Reset code"
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => void run()}
            disabled={isRunning}
            title={`Run (${IS_MAC ? '⌘' : 'Ctrl'}+Enter)`}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-70"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isExercise ? 'Run tests' : 'Run'}
          </motion.button>
        </div>
      </div>

      <AutoTextarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        minHeight={80}
        aria-label={`${label} code editor`}
        className="block w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-[#e6edf3] outline-none"
      />

      <AnimatePresence initial={false}>
        {(isRunning || result) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden border-t border-white/10"
          >
            {isRunning && !isReady && <p className="px-4 py-3 text-xs text-white/60">Loading Python (first run downloads ~10 MB)…</p>}
            {result && !isRunning && (
              <div className="px-4 py-3">
                {status === 'pass' && (
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <CircleCheck className="h-4 w-4" /> All tests passed
                  </p>
                )}
                {isExercise && status === 'fail' && (
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                    <CircleX className="h-4 w-4" /> Not yet
                  </p>
                )}
                {result.output && <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-white/85">{result.output}</pre>}
                {result.error && <pre className="mt-1 whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-red-400">{result.error}</pre>}
                {!result.output && !result.error && status !== 'pass' && <p className="text-xs text-white/40">No output.</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
