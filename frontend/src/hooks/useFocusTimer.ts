import { useEffect, useRef, useState } from 'react'

interface TimerState {
  startedAt: string
  targetMinutes: number | null
  taskId: string | null
}

export interface FinishedSession {
  startedAt: string
  minutes: number
  taskId: string | null
}

const STORAGE_KEY = 'roadmap-focus-timer'

function readStored(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TimerState) : null
  } catch {
    return null
  }
}

function writeStored(state: TimerState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage may be unavailable (private mode); the timer still works for this visit.
  }
}

function playChime(ctx: AudioContext | null) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 1.2)
}

// Elapsed time is always derived from the start timestamp, so it stays correct
// after the app is backgrounded or reloaded.
export function useFocusTimer() {
  const [timer, setTimer] = useState<TimerState | null>(readStored)
  const [now, setNow] = useState(() => Date.now())
  const audioRef = useRef<AudioContext | null>(null)
  const hasChimedRef = useRef(false)

  useEffect(() => {
    writeStored(timer)
    if (!timer) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])

  const elapsedSeconds = timer ? Math.max(0, Math.floor((now - Date.parse(timer.startedAt)) / 1000)) : 0
  const targetSeconds = timer?.targetMinutes ? timer.targetMinutes * 60 : null
  const isTargetReached = targetSeconds !== null && elapsedSeconds >= targetSeconds

  useEffect(() => {
    if (isTargetReached && !hasChimedRef.current) {
      hasChimedRef.current = true
      playChime(audioRef.current)
      navigator.vibrate?.(300)
    }
  }, [isTargetReached])

  function start(targetMinutes: number | null, taskId: string | null) {
    // Created inside the tap so iOS allows playing the chime later.
    try {
      audioRef.current ??= new AudioContext()
    } catch {
      audioRef.current = null
    }
    hasChimedRef.current = false
    setTimer({ startedAt: new Date().toISOString(), targetMinutes, taskId })
  }

  function stop(): FinishedSession | null {
    if (!timer) return null
    const minutes = Math.min(600, Math.round((Date.now() - Date.parse(timer.startedAt)) / 60000))
    setTimer(null)
    return minutes >= 1 ? { startedAt: timer.startedAt, minutes, taskId: timer.taskId } : null
  }

  function cancel() {
    setTimer(null)
  }

  return { timer, elapsedSeconds, targetSeconds, isTargetReached, start, stop, cancel }
}

export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
