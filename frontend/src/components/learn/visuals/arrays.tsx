import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VisualCard, VisualInput, parseNumbers, useStepper } from './Player'

type CellTone = 'normal' | 'current' | 'match' | 'done' | 'dim'
const CELL_TONE: Record<CellTone, string> = {
  normal: 'border-border bg-background',
  current: 'border-sky-500 bg-sky-500/15 text-sky-800 dark:text-sky-200',
  match: 'border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200',
  done: 'border-border bg-foreground/[0.06] text-muted-foreground',
  dim: 'border-border/50 bg-background text-muted-foreground/60',
}

export function ArrayRow({ label, values, tone, showIndex = false }: { label: string; values: Array<ReactNode>; tone: (i: number) => CellTone; showIndex?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <motion.div
              layout
              className={cn('flex h-9 min-w-9 items-center justify-center rounded-lg border px-1.5 font-mono text-sm font-semibold transition-colors', CELL_TONE[tone(i)])}
            >
              {v}
            </motion.div>
            {showIndex && <span className="mt-0.5 font-mono text-[9px] text-muted-foreground">{i}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Two Sum with a hash map ─────────────────────────────────────────────────

export function TwoSumVisual({ caption }: { caption?: string }) {
  const [numsText, setNumsText] = useState('3, 8, 11, 4, 7')
  const [targetText, setTargetText] = useState('11')
  const nums = parseNumbers(numsText, 10)
  const target = Number(targetText) || 0

  const frames: Array<{ i: number; need: number; found: number | null; seen: Array<[number, number]> }> = []
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    const found = seen.has(need) ? (seen.get(need) ?? null) : null
    frames.push({ i, need, found, seen: [...seen] })
    if (found !== null) break
    seen.set(nums[i], i)
  }
  const stepper = useStepper(Math.max(frames.length, 1))
  const f = frames[stepper.index]

  if (!f) {
    return (
      <VisualCard title="Two Sum with a hash map" caption={caption} inputs={<VisualInput label="nums" value={numsText} onChange={setNumsText} />}>
        <p className="text-sm text-muted-foreground">Type some numbers.</p>
      </VisualCard>
    )
  }

  return (
    <VisualCard
      title="Two Sum with a hash map"
      caption={caption}
      stepper={stepper}
      inputs={
        <>
          <VisualInput label="nums" value={numsText} onChange={setNumsText} />
          <VisualInput label="target" value={targetText} onChange={setTargetText} width="w-14" type="number" />
        </>
      }
      note={
        f.found !== null ? (
          <>
            <b>
              {target} − {nums[f.i]} = {f.need}
            </b>{' '}
            is already in the map at index {f.found}. Answer: <b>[{f.found}, {f.i}]</b> — found in one pass, O(n).
          </>
        ) : (
          <>
            At index {f.i}: we need <b>{target} − {nums[f.i]} = {f.need}</b>. It is not in the map, so we store <b>{nums[f.i]} → {f.i}</b> and move on.
            {stepper.index === frames.length - 1 && ' No pair adds up to the target.'}
          </>
        )
      }
    >
      <div className="space-y-4">
        <ArrayRow
          label="nums"
          values={nums}
          showIndex
          tone={(i) => (f.found !== null && (i === f.i || i === f.found) ? 'match' : i === f.i ? 'current' : i < f.i ? 'done' : 'dim')}
        />
        <div className="flex items-start gap-2">
          <span className="w-14 shrink-0 pt-2 text-right font-mono text-[11px] text-muted-foreground">seen</span>
          <div className="flex min-h-10 flex-1 flex-wrap gap-1.5 rounded-xl border border-dashed border-border p-1.5">
            <AnimatePresence initial={false}>
              {f.seen.map(([value, index]) => (
                <motion.span
                  key={`${value}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    'rounded-lg px-2 py-1 font-mono text-xs font-semibold',
                    value === f.need ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-foreground/[0.06]'
                  )}
                >
                  {value} → {index}
                </motion.span>
              ))}
            </AnimatePresence>
            {f.seen.length === 0 && <span className="px-1 py-1 text-xs text-muted-foreground">empty dict</span>}
          </div>
        </div>
      </div>
    </VisualCard>
  )
}

// ── Product of Array Except Self: left pass, then right pass ────────────────

export function PrefixSuffixVisual({ caption }: { caption?: string }) {
  const [numsText, setNumsText] = useState('1, 2, 3, 4')
  const nums = parseNumbers(numsText, 8)
  const n = nums.length

  const frames: Array<{ out: number[]; i: number; phase: 'left' | 'right'; running: number; note: string }> = []
  const out = Array<number>(n).fill(1)
  let left = 1
  for (let i = 0; i < n; i++) {
    out[i] = left
    frames.push({ out: [...out], i, phase: 'left', running: left, note: `Left pass, i = ${i}: out[${i}] = product of everything left of it = ${left}. Then left *= ${nums[i]}.` })
    left *= nums[i]
  }
  let right = 1
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right
    frames.push({ out: [...out], i, phase: 'right', running: right, note: `Right pass, i = ${i}: out[${i}] *= product of everything right of it (${right}) → ${out[i]}. Then right *= ${nums[i]}.` })
    right *= nums[i]
  }
  const stepper = useStepper(Math.max(frames.length, 1))
  const f = frames[stepper.index]

  return (
    <VisualCard
      title="Product except self"
      caption={caption}
      stepper={f ? stepper : undefined}
      inputs={<VisualInput label="nums" value={numsText} onChange={setNumsText} />}
      note={f ? <>{f.note}{stepper.index === frames.length - 1 && <b> Done: O(n) time, no division.</b>}</> : 'Type some numbers.'}
    >
      {f && (
        <div className="space-y-3">
          <ArrayRow label="nums" values={nums} showIndex tone={(i) => (i === f.i ? 'current' : 'normal')} />
          <ArrayRow
            label="out"
            values={f.out}
            tone={(i) => (i === f.i ? 'match' : f.phase === 'left' ? (i < f.i ? 'done' : 'dim') : i > f.i ? 'match' : 'done')}
          />
          <p className="pl-16 font-mono text-xs text-muted-foreground">
            {f.phase} = <span className="font-semibold text-foreground">{f.running}</span>
          </p>
        </div>
      )}
    </VisualCard>
  )
}

// ── Top K Frequent with bucket sort ─────────────────────────────────────────

export function BucketSortVisual({ caption }: { caption?: string }) {
  const [numsText, setNumsText] = useState('1, 1, 1, 2, 2, 3, 4, 4')
  const [kText, setKText] = useState('2')
  const nums = parseNumbers(numsText, 12)
  const k = Math.max(1, Number(kText) || 1)
  const counts = new Map<number, number>()
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1)
  const entries = [...counts]

  type Frame = { placed: number; picked: number[]; scan: number | null; note: string }
  const frames: Frame[] = [{ placed: 0, picked: [], scan: null, note: `Count each value: ${entries.map(([v, c]) => `${v}×${c}`).join(', ')}. A count can be at most n = ${nums.length}.` }]
  entries.forEach(([v, c], i) => frames.push({ placed: i + 1, picked: [], scan: null, note: `Value ${v} appears ${c} time${c === 1 ? '' : 's'}, so it goes into bucket ${c}.` }))
  const picked: number[] = []
  for (let b = nums.length; b >= 1 && picked.length < k; b--) {
    const inBucket = entries.filter(([, c]) => c === b).map(([v]) => v)
    if (inBucket.length === 0) continue
    for (const v of inBucket) {
      if (picked.length < k) picked.push(v)
    }
    frames.push({ placed: entries.length, picked: [...picked], scan: b, note: `Walk the buckets from the top. Bucket ${b} gives ${inBucket.join(', ')}. Picked so far: [${picked.join(', ')}].` })
  }
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]
  const placed = entries.slice(0, f.placed)

  return (
    <VisualCard
      title="Top k with bucket sort"
      caption={caption}
      stepper={stepper}
      inputs={
        <>
          <VisualInput label="nums" value={numsText} onChange={setNumsText} />
          <VisualInput label="k" value={kText} onChange={setKText} width="w-12" type="number" />
        </>
      }
      note={<>{f.note}{stepper.index === frames.length - 1 && f.picked.length > 0 && <b> Answer: [{f.picked.join(', ')}] in O(n).</b>}</>}
    >
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {Array.from({ length: nums.length + 1 }, (_, b) => {
          const values = placed.filter(([, c]) => c === b).map(([v]) => v)
          return (
            <div key={b} className="flex min-w-10 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'flex min-h-24 w-full flex-col-reverse items-center gap-1 rounded-lg border p-1 transition-colors',
                  f.scan === b ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-foreground/[0.02]'
                )}
              >
                <AnimatePresence initial={false}>
                  {values.map((v) => (
                    <motion.span
                      key={v}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'w-full rounded-md py-0.5 text-center font-mono text-xs font-semibold',
                        f.picked.includes(v) ? 'bg-emerald-500 text-white' : 'bg-sky-500/20 text-sky-800 dark:text-sky-200'
                      )}
                    >
                      {v}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{b}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">bucket index = how many times a value appears</p>
    </VisualCard>
  )
}
