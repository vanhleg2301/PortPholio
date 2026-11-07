import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, Maximize2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaseResults, type RunMode } from '@/components/learn/CaseResults'
import { CodeEditor } from '@/components/learn/CodeEditor'
import { CodeWorkspace } from '@/components/learn/CodeWorkspace'
import { RunButtons, type CodeRunState } from '@/components/learn/RunButtons'
import { EASE_OUT } from '@/lib/motion'
import { isPythonReady, onPythonReady, runPython, type RunResult } from '@/lib/pythonRunner'

const SAVE_DELAY_MS = 1000

interface CodeCellProps {
  initialCode: string
  savedCode?: string
  tests?: string
  label?: string
  isPassed?: boolean
  onSave?: (code: string) => void
  onPassed?: () => void
  // Shown on the left of the full-screen workspace (title, prompt, hints).
  title?: string
  problem?: ReactNode
}

export function CodeCell({ initialCode, savedCode, tests, label = 'Python', isPassed = false, onSave, onPassed, title, problem }: CodeCellProps) {
  const [code, setCode] = useState(savedCode ?? initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [mode, setMode] = useState<RunMode>('run')
  const [isRunning, setIsRunning] = useState(false)
  const [isReady, setIsReady] = useState(isPythonReady)
  const [runCount, setRunCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const lastSaved = useRef(savedCode ?? initialCode)
  // Saved code often arrives after the cell mounted (opening a lesson by URL). Show it,
  // unless the learner has already typed something — then their text wins.
  const [shownSaved, setShownSaved] = useState(savedCode)
  if (savedCode !== shownSaved) {
    setShownSaved(savedCode)
    if (savedCode !== undefined && code === (shownSaved ?? initialCode)) {
      setCode(savedCode)
      lastSaved.current = savedCode
    }
  }
  const isExercise = tests !== undefined

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

  async function execute(nextMode: RunMode): Promise<RunResult | null> {
    if (isRunning) return null
    setMode(nextMode)
    setIsRunning(true)
    const res = await runPython(code, tests)
    setResult(res)
    setRunCount((n) => n + 1)
    setIsRunning(false)
    if (nextMode === 'submit' && res.passed) onPassed?.()
    return res
  }

  const state: CodeRunState = {
    code,
    setCode,
    reset: () => {
      setCode(initialCode)
      setResult(null)
    },
    result,
    mode,
    isRunning,
    isReady,
    run: () => execute('run'),
    // Without tests there is nothing to submit; Submit then behaves like Run.
    submit: () => execute(isExercise ? 'submit' : 'run'),
    runCount,
  }

  return (
    <>
      <div className={cn('overflow-hidden rounded-2xl border bg-[#21252b]', isPassed ? 'border-emerald-500/50' : 'border-white/10')}>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b border-white/10 px-3 py-2">
          <span className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-white/50">
            <span>{label}</span>
            {isPassed && (
              <span className="flex shrink-0 items-center gap-1 text-emerald-400">
                <CircleCheck className="h-3.5 w-3.5" /> Solved
              </span>
            )}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={state.reset}
              title="Reset to the starting code"
              aria-label="Reset code"
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Open in full screen (problem + editor + test cases)"
              aria-label="Open in full screen"
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <RunButtons state={state} isExercise={isExercise} />
          </div>
        </div>

        <CodeEditor value={code} onChange={setCode} onRun={() => void state.run()} onSubmit={() => void state.submit()} />

        <AnimatePresence initial={false}>
          {(isRunning || result) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="overflow-hidden border-t border-white/10 bg-[#1b1e23]"
            >
              <CaseResults key={runCount} result={result} mode={mode} isRunning={isRunning} isPythonReady={isReady} isExercise={isExercise} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <CodeWorkspace
            title={title ?? label}
            problem={problem}
            state={state}
            isExercise={isExercise}
            isPassed={isPassed}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
