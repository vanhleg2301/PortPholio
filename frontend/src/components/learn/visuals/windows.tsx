import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrayRow } from './arrays'
import { VisualCard, VisualInput, parseNumbers, useStepper } from './Player'

// ── Two pointers: Two Sum II on a sorted array ───────────────────────────────

export function TwoPointersVisual({ caption }: { caption?: string }) {
  const [numsText, setNumsText] = useState('1, 3, 4, 6, 8, 11, 15')
  const [targetText, setTargetText] = useState('14')
  const nums = [...parseNumbers(numsText, 10)].sort((a, b) => a - b)
  const target = Number(targetText) || 0

  const frames: Array<{ l: number; r: number; sum: number; found: boolean; note: string }> = []
  let l = 0
  let r = nums.length - 1
  while (l < r && frames.length < 30) {
    const sum = nums[l] + nums[r]
    if (sum === target) {
      frames.push({ l, r, sum, found: true, note: `${nums[l]} + ${nums[r]} = ${target}. Found it — and we never checked most of the pairs.` })
      break
    }
    if (sum < target) {
      frames.push({ l, r, sum, found: false, note: `${nums[l]} + ${nums[r]} = ${sum} is too small. Even the biggest partner (${nums[r]}) is not enough for ${nums[l]}, so ${nums[l]} can never be in the answer: move the left pointer right.` })
      l++
    } else {
      frames.push({ l, r, sum, found: false, note: `${nums[l]} + ${nums[r]} = ${sum} is too big. Even the smallest partner (${nums[l]}) is too much for ${nums[r]}, so ${nums[r]} can never be in the answer: move the right pointer left.` })
      r--
    }
  }
  if (frames.length === 0 || (!frames[frames.length - 1].found && l >= r)) {
    frames.push({ l, r: Math.max(l, r), sum: NaN, found: false, note: 'The pointers met: no pair adds up to the target. Each step threw away one number, so it took at most n steps — O(n), O(1) memory.' })
  }
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]

  return (
    <VisualCard
      title="Two pointers on a sorted array"
      caption={caption}
      stepper={stepper}
      inputs={
        <>
          <VisualInput label="nums" value={numsText} onChange={setNumsText} />
          <VisualInput label="target" value={targetText} onChange={setTargetText} width="w-14" type="number" />
        </>
      }
      note={f.note}
    >
      <div className="space-y-2">
        <ArrayRow
          label="sorted"
          values={nums}
          showIndex
          tone={(i) => (f.found && (i === f.l || i === f.r) ? 'match' : i === f.l || i === f.r ? 'current' : i < f.l || i > f.r ? 'dim' : 'normal')}
        />
        <div className="flex gap-1 pl-16">
          {nums.map((_, i) => (
            <span key={i} className="w-9 min-w-9 text-center font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
              {i === f.l && i === f.r ? 'L R' : i === f.l ? 'L' : i === f.r ? 'R' : ''}
            </span>
          ))}
        </div>
        {!Number.isNaN(f.sum) && (
          <p className="pl-16 font-mono text-xs text-muted-foreground">
            sum = <span className="font-semibold text-foreground">{f.sum}</span> {f.found ? '=' : f.sum < target ? '<' : '>'} target {target}
          </p>
        )}
      </div>
    </VisualCard>
  )
}

// ── Sliding window: longest substring without repeating characters ──────────

export function SlidingWindowVisual({ caption }: { caption?: string }) {
  const [text, setText] = useState('abcabcbb')
  const s = text.slice(0, 16)
  type Frame = { l: number; r: number; inWindow: string[]; best: [number, number]; note: string }
  const frames: Frame[] = []
  const seen = new Set<string>()
  let l = 0
  let best: [number, number] = [0, -1]
  for (let r = 0; r < s.length; r++) {
    const ch = s[r]
    while (seen.has(ch)) {
      frames.push({ l, r, inWindow: [...seen], best, note: `"${ch}" is already in the window. Shrink from the left: remove "${s[l]}" and move l to ${l + 1}.` })
      seen.delete(s[l])
      l++
    }
    seen.add(ch)
    if (r - l > best[1] - best[0]) best = [l, r]
    frames.push({
      l,
      r,
      inWindow: [...seen],
      best,
      note: `Add "${ch}". The window s[${l}..${r}] = "${s.slice(l, r + 1)}" has no repeats (length ${r - l + 1}). Best so far: ${best[1] - best[0] + 1}.`,
    })
  }
  if (frames.length === 0) frames.push({ l: 0, r: -1, inWindow: [], best, note: 'Type a string.' })
  const stepper = useStepper(frames.length)
  const f = frames[stepper.index]
  const isLast = stepper.index === frames.length - 1

  return (
    <VisualCard
      title="Sliding window"
      caption={caption}
      stepper={stepper}
      inputs={<VisualInput label="s" value={text} onChange={setText} width="w-32" />}
      note={
        <>
          {f.note}
          {isLast && s.length > 0 && (
            <b>
              {' '}
              Answer: {f.best[1] - f.best[0] + 1}. Each character entered and left the window at most once — O(n).
            </b>
          )}
        </>
      }
    >
      <div className="flex flex-wrap justify-center gap-1">
        {[...s].map((ch, i) => {
          const isIn = i >= f.l && i <= f.r
          const isBest = i >= f.best[0] && i <= f.best[1]
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <motion.div
                animate={{ y: isIn ? -4 : 0 }}
                className={cn(
                  'flex h-10 w-9 items-center justify-center rounded-lg border font-mono text-base font-bold transition-colors',
                  i === f.r ? 'border-sky-500 bg-sky-500 text-white' : isIn ? 'border-sky-500 bg-sky-500/20' : 'border-border text-muted-foreground'
                )}
              >
                {ch}
              </motion.div>
              <span className={cn('h-1 w-7 rounded-full', isBest ? 'bg-emerald-500' : 'bg-transparent')} />
              <span className="font-mono text-[10px] text-muted-foreground">{i === f.l && i === f.r ? 'l r' : i === f.l ? 'l' : i === f.r ? 'r' : i}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="w-16 shrink-0 text-right font-mono text-[11px] text-muted-foreground">in window</span>
        <div className="flex min-h-9 flex-1 flex-wrap items-center gap-1 rounded-xl border border-dashed border-border p-1">
          <AnimatePresence initial={false}>
            {f.inWindow.map((ch) => (
              <motion.span key={ch} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="rounded-md bg-sky-500/15 px-2 py-0.5 font-mono text-xs font-semibold">
                {ch}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">blue = window · green bar = best window so far</p>
    </VisualCard>
  )
}
