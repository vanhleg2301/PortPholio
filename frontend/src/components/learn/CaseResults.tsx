import { useState } from 'react'
import { CircleCheck, CircleX, Loader2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunResult } from '@/lib/pythonRunner'

export type RunMode = 'run' | 'submit'

interface CaseResultsProps {
  result: RunResult | null
  mode: RunMode
  isRunning: boolean
  isPythonReady: boolean
  isExercise: boolean
}

function Field({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-white/45">{label}</p>
      <pre
        className={cn(
          'max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/[0.06] px-3 py-2 font-mono text-[12.5px] leading-relaxed',
          tone === 'good' ? 'text-emerald-300' : tone === 'bad' ? 'text-red-300' : 'text-white/85'
        )}
      >
        {value}
      </pre>
    </div>
  )
}

// The bottom panel of the editor: LeetCode-style test cases (Case 1, Case 2…) or plain output.
export function CaseResults({ result, mode, isRunning, isPythonReady, isExercise }: CaseResultsProps) {
  const [selected, setSelected] = useState(0)

  if (isRunning) {
    return (
      <p className="flex items-center gap-2 px-4 py-4 text-sm text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isPythonReady ? 'Running…' : 'Loading Python (the first run downloads about 10 MB)…'}
      </p>
    )
  }
  if (!result) {
    return (
      <p className="px-4 py-4 text-sm text-white/45">
        {isExercise ? 'Press Run to check your code against the test cases. Submit when they all pass.' : 'Press Run to see the output.'}
      </p>
    )
  }

  const { cases } = result
  const passedCount = cases.filter((c) => c.passed).length
  const isAllPassed = cases.length > 0 && passedCount === cases.length
  const current = cases[Math.min(selected, cases.length - 1)]

  return (
    <div className="space-y-3 px-4 py-3">
      {result.error ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-base font-semibold text-red-400">
            <TriangleAlert className="h-4 w-4" /> Error
          </p>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-red-500/10 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-red-300">{result.error}</pre>
        </div>
      ) : cases.length > 0 ? (
        <p className={cn('flex items-center gap-1.5 text-base font-semibold', isAllPassed ? 'text-emerald-400' : 'text-red-400')}>
          {isAllPassed ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
          {isAllPassed ? (mode === 'submit' ? 'Accepted' : 'All cases passed') : 'Wrong Answer'}
          <span className="text-xs font-normal text-white/50">
            {passedCount}/{cases.length} cases passed{isAllPassed && mode === 'run' ? ' — press Submit to save' : ''}
          </span>
        </p>
      ) : null}

      {cases.length > 0 && current && (
        <>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Test cases">
            {cases.map((c, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={c === current}
                onClick={() => setSelected(i)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                  c === current ? 'bg-white/[0.12] text-white' : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', c.passed ? 'bg-emerald-400' : 'bg-red-400')} />
                Case {i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-2.5">
            <Field label="Input" value={current.input ?? current.label} />
            {current.error ? (
              <Field label="Error" value={current.error} tone="bad" />
            ) : (
              <>
                {current.got !== null && <Field label="Output" value={current.got} tone={current.passed ? 'good' : 'bad'} />}
                {current.expected !== null && <Field label="Expected" value={current.expected} />}
              </>
            )}
            {current.stdout && <Field label="Stdout" value={current.stdout.replace(/\n$/, '')} />}
            {current.got === 'None' && !current.passed && (
              <p className="text-xs text-amber-300">Your function returned None — did you forget <code className="font-mono">return</code>, or is <code className="font-mono">pass</code> still there?</p>
            )}
            <p className="text-[11px] text-white/35">Check: {current.label}</p>
          </div>
        </>
      )}

      {result.output && (
        <Field label={cases.length > 0 ? 'Stdout (outside the tests)' : 'Output'} value={result.output.replace(/\n$/, '')} />
      )}
      {!result.output && !result.error && cases.length === 0 && <p className="text-sm text-white/45">No output.</p>}
    </div>
  )
}
