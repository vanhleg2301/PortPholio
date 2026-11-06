import { motion } from 'framer-motion'
import { CloudUpload, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunMode } from '@/components/learn/CaseResults'
import type { RunResult } from '@/lib/pythonRunner'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl'

// Shared state of one code cell: the code, the last run and how to run or submit it.
export interface CodeRunState {
  code: string
  setCode: (code: string) => void
  reset: () => void
  result: RunResult | null
  mode: RunMode
  isRunning: boolean
  isReady: boolean
  run: () => Promise<RunResult | null>
  submit: () => Promise<RunResult | null>
  runCount: number
}

interface RunButtonsProps {
  state: CodeRunState
  isExercise: boolean
  onAfterRun?: () => void
}

export function RunButtons({ state, isExercise, onAfterRun }: RunButtonsProps) {
  async function handle(action: () => Promise<RunResult | null>) {
    await action()
    onAfterRun?.()
  }
  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => void handle(state.run)}
        disabled={state.isRunning}
        title={`Run (${MOD_KEY}+Enter)`}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60',
          isExercise ? 'bg-white/10 text-white hover:bg-white/[0.16]' : 'bg-emerald-500 text-white hover:bg-emerald-600'
        )}
      >
        {state.isRunning && state.mode === 'run' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        Run
      </motion.button>
      {isExercise && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => void handle(state.submit)}
          disabled={state.isRunning}
          title={`Submit (${MOD_KEY}+Shift+Enter)`}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
        >
          {state.isRunning && state.mode === 'submit' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudUpload className="h-3.5 w-3.5" />}
          Submit
        </motion.button>
      )}
    </>
  )
}
