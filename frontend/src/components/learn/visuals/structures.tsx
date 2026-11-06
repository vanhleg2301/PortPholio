import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrayRow } from './arrays'
import { VisualCard, VisualInput, parseNumbers, useStepper } from './Player'

// ── Min-heap: push sifts up, pop sifts down ──────────────────────────────────

interface HeapItem {
  id: number
  value: number
}
interface HeapFrame {
  items: HeapItem[]
  marked: number[]
  popped: number[]
  note: string
}

function simulateHeap(values: number[], pops: number): HeapFrame[] {
  const frames: HeapFrame[] = []
  const heap: HeapItem[] = []
  const popped: number[] = []
  const snap = (marked: number[], note: string) => frames.push({ items: heap.map((x) => ({ ...x })), marked, popped: [...popped], note })
  const swap = (a: number, b: number) => ([heap[a], heap[b]] = [heap[b], heap[a]])

  values.forEach((value, id) => {
    heap.push({ id, value })
    let i = heap.length - 1
    snap([i], `heappush(${value}): add it at the end of the list (index ${i}).`)
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (heap[parent].value <= heap[i].value) {
        snap([i], `${heap[i].value} ≥ its parent ${heap[parent].value}, so it stays. Push done in at most log n swaps.`)
        break
      }
      snap([i, parent], `${heap[i].value} < its parent ${heap[parent].value} (index ${parent} = (${i} − 1) // 2), so they swap.`)
      swap(i, parent)
      i = parent
    }
    if (i === 0 && heap.length > 1) snap([0], `${heap[0].value} reached the top: it is the new smallest.`)
  })

  for (let p = 0; p < pops && heap.length > 0; p++) {
    const top = heap[0].value
    popped.push(top)
    const last = heap.pop()
    if (heap.length === 0 || !last) {
      snap([], `heappop() → ${top}. The heap is empty now.`)
      break
    }
    heap[0] = last
    snap([0], `heappop() → ${top} (always h[0]). Move the last item ${last.value} to the top.`)
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let smallest = i
      if (l < heap.length && heap[l].value < heap[smallest].value) smallest = l
      if (r < heap.length && heap[r].value < heap[smallest].value) smallest = r
      if (smallest === i) {
        snap([i], `${heap[i].value} is ≤ its children, so it stays. Pop done.`)
        break
      }
      snap([i, smallest], `${heap[i].value} is bigger than its smaller child ${heap[smallest].value}, so they swap (sift down).`)
      swap(i, smallest)
      i = smallest
    }
  }
  return frames
}

const HEAP_WIDTH = 340
function nodePosition(i: number) {
  const level = Math.floor(Math.log2(i + 1))
  const indexInLevel = i - (2 ** level - 1)
  const slots = 2 ** level
  return { x: ((indexInLevel + 0.5) / slots) * HEAP_WIDTH, y: 26 + level * 56 }
}

export function HeapVisual({ caption }: { caption?: string }) {
  const [valuesText, setValuesText] = useState('5, 3, 8, 1, 9, 2')
  const [popsText, setPopsText] = useState('2')
  const values = parseNumbers(valuesText, 10)
  const frames = simulateHeap(values, Math.min(Number(popsText) || 0, values.length))
  const stepper = useStepper(Math.max(frames.length, 1))
  const f = frames[stepper.index]
  const levels = f ? Math.floor(Math.log2(Math.max(f.items.length, 1))) + 1 : 1

  return (
    <VisualCard
      title="Min-heap"
      caption={caption}
      stepper={f ? stepper : undefined}
      inputs={
        <>
          <VisualInput label="push" value={valuesText} onChange={setValuesText} />
          <VisualInput label="pops" value={popsText} onChange={setPopsText} width="w-12" type="number" />
        </>
      }
      note={f?.note ?? 'Type some numbers to push.'}
    >
      {f && (
        <>
          <svg viewBox={`0 0 ${HEAP_WIDTH} ${levels * 56 + 10}`} className="mx-auto w-full max-w-md" role="img" aria-label="Heap as a tree">
            {f.items.map((_, i) =>
              i === 0 ? null : (
                <line
                  key={`edge-${i}`}
                  x1={nodePosition((i - 1) >> 1).x}
                  y1={nodePosition((i - 1) >> 1).y}
                  x2={nodePosition(i).x}
                  y2={nodePosition(i).y}
                  className="stroke-foreground/20"
                  strokeWidth={2}
                />
              )
            )}
            {f.items.map((item, i) => {
              const { x, y } = nodePosition(i)
              const isMarked = f.marked.includes(i)
              return (
                <motion.g key={item.id} initial={false} animate={{ x, y }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
                  <circle r={17} className={cn(isMarked ? 'fill-sky-500' : i === 0 ? 'fill-emerald-500' : 'fill-foreground/[0.12]')} />
                  <text textAnchor="middle" dy="0.35em" className={cn('text-[13px] font-bold', isMarked || i === 0 ? 'fill-white' : 'fill-foreground')}>
                    {item.value}
                  </text>
                </motion.g>
              )
            })}
          </svg>
          <div className="mt-3 space-y-2">
            <ArrayRow label="h" values={f.items.map((x) => x.value)} showIndex tone={(i) => (f.marked.includes(i) ? 'current' : i === 0 ? 'match' : 'normal')} />
            {f.popped.length > 0 && <p className="pl-16 font-mono text-xs text-muted-foreground">popped: [{f.popped.join(', ')}] — always in sorted order</p>}
          </div>
        </>
      )}
    </VisualCard>
  )
}

// ── Recursion and the call stack ─────────────────────────────────────────────

interface StackEntry {
  n: number
  result?: number
}

export function CallStackVisual({ caption }: { caption?: string }) {
  const [nText, setNText] = useState('4')
  const n = Math.max(1, Math.min(7, Number(nText) || 1))
  const frames: Array<{ stack: StackEntry[]; returned: number | null; note: string }> = []
  const stack: StackEntry[] = []
  for (let k = n; k >= 1; k--) {
    stack.push({ n: k })
    frames.push({
      stack: stack.map((s) => ({ ...s })),
      returned: null,
      note: k === 1 ? `factorial(1) is the base case: it returns 1 right away. ${n} calls are waiting on the stack now.` : `factorial(${k}) needs factorial(${k - 1}) first, so it waits and a new call goes on top of the stack.`,
    })
  }
  let value = 1
  stack[stack.length - 1].result = 1
  for (let k = 2; k <= n; k++) {
    stack.pop()
    value *= k
    stack[stack.length - 1].result = value
    frames.push({ stack: stack.map((s) => ({ ...s })), returned: value / k, note: `factorial(${k - 1}) returned ${value / k} and left the stack. factorial(${k}) = ${k} × ${value / k} = ${value}.` })
  }
  frames.push({ stack: [], returned: value, note: `The last call returns ${value}. The stack was ${n} calls deep: recursion uses O(n) memory here.` })
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]

  return (
    <VisualCard title="The call stack" caption={caption} stepper={stepper} inputs={<VisualInput label="factorial n" value={nText} onChange={setNText} width="w-12" type="number" />} note={f.note}>
      <div className="mx-auto flex min-h-56 max-w-xs flex-col-reverse justify-start gap-1.5 rounded-xl border-2 border-t-0 border-dashed border-border px-2 pb-2 pt-4">
        <AnimatePresence initial={false}>
          {f.stack.map((entry, i) => {
            const isTop = i === f.stack.length - 1
            return (
              <motion.div
                key={entry.n}
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 font-mono text-sm',
                  isTop ? 'bg-sky-500 text-white' : 'bg-foreground/[0.07]'
                )}
              >
                <span>factorial({entry.n})</span>
                <span className="text-xs opacity-80">{entry.result !== undefined && isTop ? `= ${entry.result}` : entry.n === 1 ? '' : `waits for factorial(${entry.n - 1})`}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {f.stack.length === 0 && <p className="py-4 text-center font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">result = {f.returned}</p>}
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">top of the stack = the call that is running</p>
    </VisualCard>
  )
}

// ── A list is a dynamic array: append and resize ─────────────────────────────

// CPython's growth rule (Objects/listobject.c, list_resize).
const grow = (newSize: number) => (newSize + (newSize >> 3) + 6) & ~3

export function DynamicArrayVisual({ caption }: { caption?: string }) {
  const [countText, setCountText] = useState('17')
  const count = Math.max(1, Math.min(40, Number(countText) || 1))
  const frames: Array<{ size: number; capacity: number; resizedFrom: number | null; copies: number; note: string }> = []
  let capacity = 0
  let copies = 0
  for (let size = 1; size <= count; size++) {
    let resizedFrom: number | null = null
    if (size > capacity) {
      resizedFrom = capacity
      copies += size - 1
      capacity = grow(size)
    }
    frames.push({
      size,
      capacity,
      resizedFrom,
      copies,
      note:
        resizedFrom !== null
          ? `append(${size}): no free slot! Get a bigger block (${capacity} slots) and copy the ${size - 1} old item${size - 1 === 1 ? '' : 's'} — O(n) this time.`
          : `append(${size}): there is a free slot, so just write it — O(1).`,
    })
  }
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]
  const average = (f.size + f.copies) / f.size

  return (
    <VisualCard title="list.append and resizing" caption={caption} stepper={stepper} inputs={<VisualInput label="appends" value={countText} onChange={setCountText} width="w-14" type="number" />} note={f.note}>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: f.capacity }, (_, i) => (
          <motion.div
            key={`${f.capacity}-${i}`}
            initial={f.resizedFrom !== null ? { scale: 0.6, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: f.resizedFrom !== null ? i * 0.015 : 0 }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs font-semibold',
              i === f.size - 1 ? 'border-sky-500 bg-sky-500 text-white' : i < f.size ? 'border-border bg-foreground/[0.08]' : 'border-dashed border-border text-transparent'
            )}
          >
            {i < f.size ? i + 1 : '·'}
          </motion.div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ['size', f.size],
          ['capacity', f.capacity],
          ['items copied so far', f.copies],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-foreground/[0.04] py-1.5">
            <p className="font-mono text-base font-bold tabular-nums">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Work per append on average: <b className="text-foreground">{average.toFixed(2)}</b> steps — it stays small, so append is O(1) amortized.
      </p>
    </VisualCard>
  )
}

// ── Hash table with a toy hash function and linear probing ───────────────────

const SLOTS = 8
const toyHash = (key: string) => [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

export function HashTableVisual({ caption }: { caption?: string }) {
  const [keysText, setKeysText] = useState('apple, kiwi, fig, pear, lime, plum')
  const keys = keysText
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, SLOTS)
  const frames: Array<{ table: Array<string | null>; probes: number[]; placed: number | null; note: string }> = []
  const table: Array<string | null> = Array(SLOTS).fill(null)
  for (const key of keys) {
    const h = toyHash(key)
    let slot = h % SLOTS
    const probes = [slot]
    while (table[slot] !== null && table[slot] !== key) {
      slot = (slot + 1) % SLOTS
      probes.push(slot)
    }
    table[slot] = key
    const codes = [...key].map((ch) => ch.charCodeAt(0)).join(' + ')
    frames.push({
      table: [...table],
      probes,
      placed: slot,
      note:
        probes.length === 1
          ? `hash("${key}") = ${codes} = ${h}; ${h} % ${SLOTS} = ${probes[0]}. Slot ${probes[0]} is free → stored there in one step.`
          : `hash("${key}") % ${SLOTS} = ${probes[0]}, but that slot is taken — a collision! Try the next slots (${probes.join(' → ')}) until one is free.`,
    })
  }
  const stepper = useStepper(Math.max(frames.length, 1))
  const f = frames[stepper.index]

  return (
    <VisualCard
      title="Inside a hash table"
      caption={caption ?? 'A toy hash (sum of character codes) with 8 slots. Python’s real hash and probing are smarter, but the idea is the same.'}
      stepper={f ? stepper : undefined}
      inputs={<VisualInput label="keys" value={keysText} onChange={setKeysText} width="w-48" />}
      note={f?.note ?? 'Type some keys.'}
    >
      {f && (
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {f.table.map((key, slot) => {
            const probeIndex = f.probes.indexOf(slot)
            const isPlaced = f.placed === slot
            return (
              <div key={slot} className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'relative flex h-12 w-full items-center justify-center rounded-lg border px-1 font-mono text-[11px] font-semibold transition-colors',
                    isPlaced ? 'border-emerald-500 bg-emerald-500/20' : probeIndex >= 0 ? 'border-amber-500 bg-amber-500/15' : key ? 'border-border bg-foreground/[0.06]' : 'border-dashed border-border'
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {key && (
                      <motion.span key={key} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="truncate">
                        {key}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {probeIndex >= 0 && (
                    <span className="absolute -right-1 -top-1.5 rounded-full bg-amber-500 px-1 text-[9px] text-white">{probeIndex + 1}</span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{slot}</span>
              </div>
            )
          })}
        </div>
      )}
    </VisualCard>
  )
}
