import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { InlineText } from '@/components/learn/InlineText'
import { VisualCard, VisualInput, useStepper } from './Player'

// ── Names point at objects: append vs b = b + [...] vs b += [...] ─────────────

type Scenario = 'append' | 'plus' | 'iadd'
interface AliasFrame {
  line: number
  names: Record<string, number>
  objects: Array<{ id: number; value: string }>
  output?: string
  note: string
}

const SCENARIOS: Record<Scenario, { label: string; code: string[]; frames: AliasFrame[] }> = {
  append: {
    label: 'b.append(3)',
    code: ['a = [1, 2]', 'b = a', 'b.append(3)', 'print(a)'],
    frames: [
      { line: 0, names: { a: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: 'Python makes a list object and points the name a at it.' },
      { line: 1, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: '`b = a` copies the arrow, not the list. Two names, one object.' },
      { line: 2, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2, 3]' }], note: '`append` changes the object in place. Both arrows still point at it.' },
      { line: 3, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2, 3]' }], output: '[1, 2, 3]', note: 'So a shows the change too.' },
    ],
  },
  plus: {
    label: 'b = b + [3]',
    code: ['a = [1, 2]', 'b = a', 'b = b + [3]', 'print(a)'],
    frames: [
      { line: 0, names: { a: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: 'Python makes a list object and points the name a at it.' },
      { line: 1, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: '`b = a`: two names, one object.' },
      { line: 2, names: { a: 0, b: 1 }, objects: [{ id: 0, value: '[1, 2]' }, { id: 1, value: '[1, 2, 3]' }], note: '`b + [3]` builds a NEW list, and `b =` moves only the arrow of b to it.' },
      { line: 3, names: { a: 0, b: 1 }, objects: [{ id: 0, value: '[1, 2]' }, { id: 1, value: '[1, 2, 3]' }], output: '[1, 2]', note: 'a still points at the old, unchanged list.' },
    ],
  },
  iadd: {
    label: 'b += [3]',
    code: ['a = [1, 2]', 'b = a', 'b += [3]', 'print(a)'],
    frames: [
      { line: 0, names: { a: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: 'Python makes a list object and points the name a at it.' },
      { line: 1, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2]' }], note: '`b = a`: two names, one object.' },
      { line: 2, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2, 3]' }], note: 'For a list, `+=` changes the object in place (like extend) — it does not make a new list.' },
      { line: 3, names: { a: 0, b: 0 }, objects: [{ id: 0, value: '[1, 2, 3]' }], output: '[1, 2, 3]', note: 'So a changes too. (For an int or a str, += would make a new object instead.)' },
    ],
  },
}

export function AliasingVisual({ caption }: { caption?: string }) {
  const [scenario, setScenario] = useState<Scenario>('append')
  const { code, frames } = SCENARIOS[scenario]
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]
  const nameY = (name: string) => (name === 'a' ? 40 : 110)
  const objectY = (index: number) => 40 + index * 70

  return (
    <VisualCard
      title="Names and objects"
      caption={caption}
      stepper={stepper}
      inputs={
        <div className="flex flex-wrap gap-1 rounded-full bg-foreground/[0.06] p-0.5 text-xs font-semibold">
          {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScenario(s)
                stepper.reset()
              }}
              className={cn('rounded-full px-2.5 py-1 font-mono transition-colors', scenario === s ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              {SCENARIOS[s].label}
            </button>
          ))}
        </div>
      }
      note={<InlineText text={f.note} />}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-center">
        <pre className="rounded-xl bg-[#21252b] p-3 font-mono text-[12.5px] leading-6 text-[#abb2bf]">
          {code.map((line, i) => (
            <div key={line} className={cn('rounded px-1.5', i === f.line && 'bg-sky-500/25 text-white')}>
              {line}
            </div>
          ))}
          {f.output && <div className="mt-1 px-1.5 text-emerald-400">→ {f.output}</div>}
        </pre>
        <svg viewBox="0 0 300 170" className="w-full" role="img" aria-label="Names pointing at objects">
          <defs>
            <marker id="alias-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-sky-500" />
            </marker>
          </defs>
          <text x={40} y={16} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">NAMES</text>
          <text x={220} y={16} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">OBJECTS</text>
          {Object.entries(f.names).map(([name, objectId]) => {
            const index = f.objects.findIndex((o) => o.id === objectId)
            return (
              <g key={name}>
                <motion.line
                  x1={64}
                  y1={nameY(name)}
                  initial={false}
                  animate={{ x2: 160, y2: objectY(index) }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="stroke-sky-500"
                  strokeWidth={2.5}
                  markerEnd="url(#alias-arrow)"
                />
                <rect x={16} y={nameY(name) - 16} width={48} height={32} rx={8} className="fill-foreground/[0.08]" />
                <text x={40} y={nameY(name)} textAnchor="middle" dy="0.35em" className="fill-foreground font-mono text-[15px] font-bold">
                  {name}
                </text>
              </g>
            )
          })}
          {f.objects.map((object, index) => (
            <motion.g key={object.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <rect x={162} y={objectY(index) - 18} width={124} height={36} rx={10} className="fill-violet-500/15 stroke-violet-500/50" />
              <text x={224} y={objectY(index)} textAnchor="middle" dy="0.35em" className="fill-foreground font-mono text-[13px] font-semibold">
                {object.value}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </VisualCard>
  )
}

// ── Slicing: s[start:stop:step] ──────────────────────────────────────────────

// Python's slice.indices(), so negative and missing values behave exactly like Python.
function sliceIndices(length: number, start: number | null, stop: number | null, step: number): number[] {
  const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))
  const norm = (value: number | null, fallback: number, low: number, high: number) => {
    if (value === null) return fallback
    const v = value < 0 ? value + length : value
    return clamp(v, low, high)
  }
  const out: number[] = []
  if (step > 0) {
    const s = norm(start, 0, 0, length)
    const e = norm(stop, length, 0, length)
    for (let i = s; i < e; i += step) out.push(i)
  } else {
    const s = norm(start, length - 1, -1, length - 1)
    const e = norm(stop, -1, -1, length - 1)
    for (let i = s; i > e; i += step) out.push(i)
  }
  return out
}

const parseOptional = (text: string) => (text.trim() === '' || Number.isNaN(Number(text)) ? null : Math.trunc(Number(text)))

export function SlicingVisual({ caption }: { caption?: string }) {
  const [text, setText] = useState('python')
  const [start, setStart] = useState('1')
  const [stop, setStop] = useState('4')
  const [step, setStep] = useState('')
  const s = text.slice(0, 16)
  const stepValue = parseOptional(step) ?? 1
  const isValidStep = stepValue !== 0
  const picked = isValidStep ? sliceIndices(s.length, parseOptional(start), parseOptional(stop), stepValue) : []
  const result = picked.map((i) => s[i]).join('')
  const expression = `s[${start.trim()}:${stop.trim()}${step.trim() ? `:${step.trim()}` : ''}]`

  return (
    <VisualCard
      title="Slicing playground"
      caption={caption}
      inputs={
        <>
          <VisualInput label="s" value={text} onChange={setText} width="w-24" />
          <VisualInput label="start" value={start} onChange={setStart} width="w-12" />
          <VisualInput label="stop" value={stop} onChange={setStop} width="w-12" />
          <VisualInput label="step" value={step} onChange={setStep} width="w-12" />
        </>
      }
      note={
        isValidStep ? (
          <>
            <span className="font-mono">{expression}</span> → <b className="font-mono">"{result}"</b>. Leave a box empty to use the default; the stop index is never included.
          </>
        ) : (
          'step cannot be 0 (Python raises ValueError).'
        )
      }
    >
      <div className="flex flex-wrap justify-center gap-1">
        {[...s].map((ch, i) => {
          const order = picked.indexOf(i)
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
              <motion.div
                animate={{ y: order >= 0 ? -4 : 0 }}
                className={cn(
                  'relative flex h-11 w-10 items-center justify-center rounded-lg border font-mono text-lg font-bold transition-colors',
                  order >= 0 ? 'border-sky-500 bg-sky-500/20 text-sky-800 dark:text-sky-200' : 'border-border text-muted-foreground'
                )}
              >
                {ch === ' ' ? '␣' : ch}
                {order >= 0 && <span className="absolute -right-1.5 -top-2 rounded-full bg-sky-500 px-1 text-[9px] text-white">{order + 1}</span>}
              </motion.div>
              <span className="font-mono text-[10px] text-muted-foreground">{i - s.length}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">top: index · bottom: negative index · badge: order taken</p>
    </VisualCard>
  )
}
