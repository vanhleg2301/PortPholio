import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VisualCard, VisualInput, useStepper } from './Player'

// ── TCP + TLS handshake as a real sequence diagram (time goes down) ──────────

type Phase = 'TCP' | 'TLS' | 'HTTP'
interface Message {
  from: 'client' | 'server'
  label: string
  phase: Phase
  // Send and arrival time in round trips.
  sent: number
  arrives: number
  note: string
}

const PHASE_COLOR: Record<Phase, string> = { TCP: '#0ea5e9', TLS: '#8b5cf6', HTTP: '#10b981' }

function handshake(tls: '1.2' | '1.3'): Message[] {
  const tcp: Message[] = [
    { from: 'client', label: 'SYN', phase: 'TCP', sent: 0, arrives: 0.5, note: 'The client says “I want to connect” and sends its starting sequence number.' },
    { from: 'server', label: 'SYN-ACK', phase: 'TCP', sent: 0.5, arrives: 1, note: 'The server confirms the client’s number and sends its own. One round trip is gone.' },
  ]
  if (tls === '1.3') {
    return [
      ...tcp,
      { from: 'client', label: 'ACK + ClientHello', phase: 'TLS', sent: 1, arrives: 1.5, note: 'The client finishes TCP (ACK) and starts TLS 1.3 in the same flight, already sending its key share.' },
      { from: 'server', label: 'ServerHello + cert + Finished', phase: 'TLS', sent: 1.5, arrives: 2, note: 'The server answers with its key share and its certificate (proof it owns the domain). Keys are agreed: two round trips gone.' },
      { from: 'client', label: 'Finished + GET /api', phase: 'HTTP', sent: 2, arrives: 2.5, note: 'Now, and only now, the real request can leave the client — encrypted.' },
      { from: 'server', label: '200 OK (first byte)', phase: 'HTTP', sent: 2.5, arrives: 3, note: 'The first byte of the answer arrives after 3 round trips (plus DNS and server time). That is why distance matters so much.' },
    ]
  }
  return [
    ...tcp,
    { from: 'client', label: 'ACK + ClientHello', phase: 'TLS', sent: 1, arrives: 1.5, note: 'TCP is done; TLS 1.2 starts. The client lists the ciphers it supports.' },
    { from: 'server', label: 'ServerHello + cert', phase: 'TLS', sent: 1.5, arrives: 2, note: 'The server picks a cipher and sends its certificate.' },
    { from: 'client', label: 'KeyExchange + Finished', phase: 'TLS', sent: 2, arrives: 2.5, note: 'TLS 1.2 needs a second TLS round trip to agree on keys.' },
    { from: 'server', label: 'Finished', phase: 'TLS', sent: 2.5, arrives: 3, note: 'Keys are ready after 3 round trips — one more than TLS 1.3.' },
    { from: 'client', label: 'GET /api', phase: 'HTTP', sent: 3, arrives: 3.5, note: 'The request can finally leave.' },
    { from: 'server', label: '200 OK (first byte)', phase: 'HTTP', sent: 3.5, arrives: 4, note: 'First byte after 4 round trips with TLS 1.2, compared with 3 with TLS 1.3.' },
  ]
}

export function HandshakeVisual({ caption }: { caption?: string }) {
  const [tls, setTls] = useState<'1.2' | '1.3'>('1.3')
  const [rtt, setRtt] = useState('100')
  const rttMs = Math.max(1, Math.min(1000, Number(rtt) || 100))
  const messages = handshake(tls)
  const stepper = useStepper(messages.length)
  const current = messages[stepper.index]
  const totalRtt = messages[messages.length - 1].arrives
  const top = 34
  const rowHeight = 62
  const height = top + totalRtt * 2 * rowHeight + 16
  const y = (t: number) => top + t * 2 * rowHeight
  const xClient = 58
  const xServer = 282

  return (
    <VisualCard
      title="New HTTPS connection"
      caption={caption}
      stepper={stepper}
      inputs={
        <>
          <div className="flex rounded-full bg-foreground/[0.06] p-0.5 text-xs font-semibold">
            {(['1.3', '1.2'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTls(v)}
                className={cn('rounded-full px-2.5 py-1 transition-colors', tls === v ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                TLS {v}
              </button>
            ))}
          </div>
          <VisualInput label="RTT ms" value={rtt} onChange={setRtt} width="w-16" type="number" />
        </>
      }
      note={
        <>
          <span className="font-semibold" style={{ color: PHASE_COLOR[current.phase] }}>
            {current.phase}
          </span>{' '}
          {current.note}
        </>
      }
    >
      <svg viewBox={`0 0 340 ${height}`} className="mx-auto w-full max-w-md" role="img" aria-label="Sequence diagram of the handshake">
        <text x={xClient} y={16} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">Client</text>
        <text x={xServer} y={16} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">Server</text>
        <line x1={xClient} y1={top - 8} x2={xClient} y2={height - 6} className="stroke-foreground/25" strokeWidth={2} />
        <line x1={xServer} y1={top - 8} x2={xServer} y2={height - 6} className="stroke-foreground/25" strokeWidth={2} />
        {Array.from({ length: totalRtt + 1 }, (_, i) => (
          <g key={i}>
            <line x1={xClient - 8} y1={y(i)} x2={xServer + 8} y2={y(i)} className="stroke-foreground/10" strokeDasharray="3 4" />
            <text x={6} y={y(i) + 4} className="fill-muted-foreground text-[9px]">{i * rttMs} ms</text>
          </g>
        ))}
        {messages.slice(0, stepper.index + 1).map((m, i) => {
          const x1 = m.from === 'client' ? xClient : xServer
          const x2 = m.from === 'client' ? xServer : xClient
          const y1 = y(m.sent)
          const y2 = y(m.arrives)
          const color = PHASE_COLOR[m.phase]
          const isCurrent = i === stepper.index
          return (
            <g key={`${tls}-${i}`} opacity={isCurrent ? 1 : 0.55}>
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={2.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <motion.circle
                r={4}
                fill={color}
                initial={{ cx: x1, cy: y1 }}
                animate={{ cx: x2, cy: y2 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 6}
                textAnchor="middle"
                className="stroke-background text-[10.5px] font-semibold"
                fill={color}
                strokeWidth={4}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Elapsed: <span className="font-semibold text-foreground">{current.arrives * rttMs} ms</span> ({current.arrives} × RTT)
      </p>
    </VisualCard>
  )
}

// ── Slow start: the congestion window doubles every round trip ───────────────

export function SlowStartVisual({ caption }: { caption?: string }) {
  const [size, setSize] = useState('200')
  const sizeKb = Math.max(1, Math.min(5000, Number(size) || 200))
  const rounds: Array<{ window: number; sent: number }> = []
  let window = 14
  let sent = 0
  while (sent < sizeKb && rounds.length < 12) {
    sent += window
    rounds.push({ window, sent: Math.min(sent, sizeKb) })
    window *= 2
  }
  const stepper = useStepper(rounds.length)
  const shown = rounds.slice(0, stepper.index + 1)
  const maxWindow = Math.max(...rounds.map((r) => r.window))
  const current = rounds[stepper.index]
  const isDone = current.sent >= sizeKb

  return (
    <VisualCard
      title="Slow start"
      caption={caption}
      stepper={stepper}
      inputs={<VisualInput label="response KB" value={size} onChange={setSize} width="w-20" type="number" />}
      note={
        <>
          Round trip {stepper.index + 1}: the window is <b>{current.window} KB</b>, so at most {current.window} KB can be “in flight” before an ACK comes back.{' '}
          {isDone ? <b>All {sizeKb} KB are sent after {rounds.length} round trips.</b> : 'Every ACKed round doubles the window.'}
        </>
      }
    >
      <div className="flex h-40 items-end gap-1.5 px-1">
        {rounds.map((r, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            {i < shown.length && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {r.window}
              </motion.span>
            )}
            <motion.div
              className={cn('w-full rounded-t-md', i === stepper.index ? 'bg-sky-500' : 'bg-sky-500/40')}
              initial={false}
              animate={{ height: i < shown.length ? `${Math.max(4, (r.window / maxWindow) * 120)}px` : '0px' }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            />
            <span className="text-[10px] text-muted-foreground">RT{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Sent</span>
          <span className="tabular-nums">
            {current.sent} / {sizeKb} KB
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
          <motion.div className="h-full bg-emerald-500" animate={{ width: `${(current.sent / sizeKb) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
    </VisualCard>
  )
}

// ── Head-of-line blocking: one lost packet holds back everything behind it ──

type PacketLane = 'sender' | 'flight' | 'lost' | 'buffer' | 'app'
const HOL_FRAMES: Array<{ lanes: Record<number, PacketLane>; note: string }> = [
  { lanes: { 1: 'sender', 2: 'sender', 3: 'sender', 4: 'sender', 5: 'sender', 6: 'sender' }, note: 'The sender has 6 packets of one response to send, in order.' },
  { lanes: { 1: 'flight', 2: 'flight', 3: 'flight', 4: 'flight', 5: 'flight', 6: 'flight' }, note: 'All 6 packets are on their way.' },
  { lanes: { 1: 'app', 2: 'app', 3: 'lost', 4: 'flight', 5: 'flight', 6: 'flight' }, note: 'Packets 1 and 2 arrive and go straight to the app. Packet 3 is lost on the way.' },
  { lanes: { 1: 'app', 2: 'app', 3: 'lost', 4: 'buffer', 5: 'buffer', 6: 'buffer' }, note: 'Packets 4, 5 and 6 arrive — but TCP must deliver bytes in order, so they wait in the buffer. The app gets nothing.' },
  { lanes: { 1: 'app', 2: 'app', 3: 'flight', 4: 'buffer', 5: 'buffer', 6: 'buffer' }, note: 'The receiver keeps answering “next, please send 3”. The sender sees the repeated ACKs and sends packet 3 again.' },
  { lanes: { 1: 'app', 2: 'app', 3: 'app', 4: 'app', 5: 'app', 6: 'app' }, note: 'Packet 3 arrives, and 3, 4, 5, 6 are given to the app all at once. One lost packet delayed everything behind it: head-of-line blocking.' },
]
const LANES: Array<{ id: PacketLane; label: string }> = [
  { id: 'sender', label: 'Sender' },
  { id: 'flight', label: 'On the network' },
  { id: 'lost', label: 'Lost' },
  { id: 'buffer', label: 'Receiver buffer (waiting)' },
  { id: 'app', label: 'Given to the app' },
]
const LANE_STYLE: Record<PacketLane, string> = {
  sender: 'bg-foreground/10 text-foreground',
  flight: 'bg-sky-500/20 text-sky-700 dark:text-sky-300',
  lost: 'bg-red-500/20 text-red-700 line-through dark:text-red-300',
  buffer: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  app: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
}

export function HeadOfLineVisual({ caption }: { caption?: string }) {
  const stepper = useStepper(HOL_FRAMES.length)
  const frame = HOL_FRAMES[stepper.index]
  return (
    <VisualCard title="Head-of-line blocking" caption={caption} stepper={stepper} note={frame.note}>
      <div className="space-y-2">
        {LANES.map((lane) => {
          const packets = Object.entries(frame.lanes)
            .filter(([, l]) => l === lane.id)
            .map(([p]) => Number(p))
          return (
            <div key={lane.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-right text-[11px] font-medium text-muted-foreground sm:w-40">{lane.label}</span>
              <div className="flex min-h-9 flex-1 flex-wrap items-center gap-1.5 rounded-xl bg-foreground/[0.03] px-2 py-1">
                {packets.map((p) => (
                  <motion.span
                    key={p}
                    layoutId={`hol-packet-${p}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold', LANE_STYLE[lane.id])}
                  >
                    {p}
                  </motion.span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </VisualCard>
  )
}
