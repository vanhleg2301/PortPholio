import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { CircleCheck, Code2, FileText, FlaskConical, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaseResults } from '@/components/learn/CaseResults'
import { CodeEditor } from '@/components/learn/CodeEditor'
import { MOD_KEY, RunButtons, type CodeRunState } from '@/components/learn/RunButtons'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { EASE_OUT } from '@/lib/motion'

type MobileTab = 'problem' | 'code' | 'result'

interface CodeWorkspaceProps {
  title: string
  problem?: ReactNode
  state: CodeRunState
  isExercise: boolean
  isPassed: boolean
  onClose: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// Drag handle that sets a split ratio (0–1) along one axis of its container.
function useSplit(initial: number) {
  const [ratio, setRatio] = useState(initial)
  const containerRef = useRef<HTMLDivElement>(null)

  function start(axis: 'x' | 'y') {
    return (e: ReactPointerEvent) => {
      e.preventDefault()
      const box = containerRef.current?.getBoundingClientRect()
      if (!box) return
      const move = (ev: PointerEvent) => {
        const next = axis === 'x' ? (ev.clientX - box.left) / box.width : (ev.clientY - box.top) / box.height
        setRatio(clamp(next, 0.2, 0.8))
      }
      const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', stop)
        document.body.style.cursor = ''
      }
      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', stop)
    }
  }
  return { ratio, containerRef, start }
}

// Full-screen editor in the style of NeetCode / LeetCode: problem on the left, code on the
// right, test cases under the code. On a phone the three parts become tabs.
export function CodeWorkspace({ title, problem, state, isExercise, isPassed, onClose }: CodeWorkspaceProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [tab, setTab] = useState<MobileTab>(problem ? 'problem' : 'code')
  const columns = useSplit(0.42)
  const rows = useSplit(0.62)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const problemPane = (
    <div className="h-full overflow-y-auto px-5 py-4">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        {title}
        {isPassed && <CircleCheck className="h-5 w-5 text-emerald-500" />}
      </h2>
      <div className="mt-3">{problem ?? <p className="text-sm text-muted-foreground">Write and run Python here.</p>}</div>
    </div>
  )

  const editorPane = (
    <div className="flex h-full flex-col bg-[#21252b]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Python 3</span>
        <button
          type="button"
          onClick={state.reset}
          title="Reset to the starting code"
          aria-label="Reset code"
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor value={state.code} onChange={state.setCode} onRun={() => void state.run()} onSubmit={() => void state.submit()} isFill />
      </div>
    </div>
  )

  const resultPane = (
    <div className="h-full overflow-y-auto bg-[#1b1e23]">
      <p className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
        <FlaskConical className="h-3.5 w-3.5" /> {isExercise ? 'Test cases' : 'Output'}
      </p>
      <CaseResults key={state.runCount} result={state.result} mode={state.mode} isRunning={state.isRunning} isPythonReady={state.isReady} isExercise={isExercise} />
    </div>
  )

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close full screen"
          title="Close (Esc)"
          className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 truncate font-semibold">{title}</p>
        {isDesktop && <span className="text-xs text-muted-foreground">{MOD_KEY}+Enter to run{isExercise ? ` · ${MOD_KEY}+Shift+Enter to submit` : ''}</span>}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#21252b] p-1">
          <RunButtons state={state} isExercise={isExercise} onAfterRun={() => setTab('result')} />
        </div>
      </header>

      {isDesktop ? (
        <div ref={columns.containerRef} className="flex min-h-0 flex-1">
          <div style={{ width: `${columns.ratio * 100}%` }} className="min-w-0">
            {problemPane}
          </div>
          <div
            onPointerDown={columns.start('x')}
            className="w-1.5 shrink-0 cursor-col-resize bg-border/60 hover:bg-violet-500/60 transition-colors"
            aria-hidden
          />
          <div ref={rows.containerRef} className="flex min-w-0 flex-1 flex-col">
            <div style={{ height: `${rows.ratio * 100}%` }} className="min-h-0">
              {editorPane}
            </div>
            <div
              onPointerDown={rows.start('y')}
              className="h-1.5 shrink-0 cursor-row-resize bg-border/60 hover:bg-violet-500/60 transition-colors"
              aria-hidden
            />
            <div className="min-h-0 flex-1">{resultPane}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1">
            {tab === 'problem' && problemPane}
            {tab === 'code' && editorPane}
            {tab === 'result' && resultPane}
          </div>
          <nav className="grid grid-cols-3 border-t border-border" aria-label="Workspace">
            {(
              [
                ['problem', 'Problem', FileText],
                ['code', 'Code', Code2],
                ['result', isExercise ? 'Test cases' : 'Output', FlaskConical],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors',
                  tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>
        </>
      )}
    </motion.div>,
    document.body
  )
}
