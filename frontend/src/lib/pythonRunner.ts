// Thin client for public/pyodide-worker.js: one shared worker, one run at a time,
// with a timeout that kills runaway code by recreating the worker.

export interface RunResult {
  output: string
  error: string | null
  // true/false when tests were run, null for a plain run
  passed: boolean | null
}

type Listener = (isReady: boolean) => void

const TIMEOUT_MS = 10_000
let worker: Worker | null = null
let isReady = false
let nextId = 1
const listeners = new Set<Listener>()
const pending = new Map<number, (result: RunResult) => void>()

function setReady(value: boolean) {
  isReady = value
  listeners.forEach((l) => l(value))
}

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker('/pyodide-worker.js')
  worker.onmessage = (event: MessageEvent) => {
    const data = event.data as { type: 'ready' } | ({ type: 'result'; id: number } & RunResult)
    if (data.type === 'ready') {
      setReady(true)
      return
    }
    const resolve = pending.get(data.id)
    pending.delete(data.id)
    resolve?.({ output: data.output, error: data.error, passed: data.passed })
  }
  return worker
}

function resetWorker() {
  worker?.terminate()
  worker = null
  setReady(false)
  // Anything still waiting on the old worker will never get an answer.
  pending.forEach((resolve) => resolve({ output: '', error: 'Python was restarted. Run again.', passed: null }))
  pending.clear()
}

export function isPythonReady() {
  return isReady
}

export function onPythonReady(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function runPython(code: string, tests?: string): Promise<RunResult> {
  const id = nextId++
  const w = getWorker()
  return new Promise((resolve) => {
    // The first run also downloads Python, so it gets a longer budget.
    const budget = isReady ? TIMEOUT_MS : TIMEOUT_MS + 60_000
    const timer = setTimeout(() => {
      if (!pending.has(id)) return
      pending.delete(id)
      resetWorker()
      resolve({ output: '', error: `Stopped after ${budget / 1000} s — is there an infinite loop?`, passed: tests ? false : null })
    }, budget)
    pending.set(id, (result) => {
      clearTimeout(timer)
      resolve(result)
    })
    w.postMessage({ id, code, tests })
  })
}
