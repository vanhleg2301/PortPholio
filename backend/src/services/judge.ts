import type { Language } from '../db/schema.js'

const JUDGE0_URL = process.env.JUDGE0_URL ?? 'https://judge0-ce.p.rapidapi.com'
const JUDGE0_KEY = process.env.JUDGE0_API_KEY

const LANGUAGE_IDS: Record<Language, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
}

interface JudgeResult {
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'
  runtime_ms?: number
  memory_kb?: number
  error_message?: string
  stdout?: string
}

async function run(params: { language: Language; code: string; problemId: string }): Promise<JudgeResult> {
  if (!JUDGE0_KEY) {
    return { status: 'accepted', runtime_ms: 42, stdout: 'Judge0 not configured — mock result' }
  }

  const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify({
      language_id: LANGUAGE_IDS[params.language],
      source_code: params.code,
      cpu_time_limit: 2,
      memory_limit: 128000,
    }),
  })

  const result = await submitRes.json() as {
    status: { id: number; description: string }
    time?: string
    memory?: number
    stderr?: string
    compile_output?: string
    stdout?: string
  }

  const statusId = result.status?.id

  if (statusId === 3) {
    return {
      status: 'accepted',
      runtime_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : undefined,
      memory_kb: result.memory,
      stdout: result.stdout ?? undefined,
    }
  }
  if (statusId === 4) return { status: 'wrong_answer', stdout: result.stdout ?? undefined }
  if (statusId === 5) return { status: 'time_limit' }
  if ([6].includes(statusId)) return { status: 'compile_error', error_message: result.compile_output ?? undefined }
  return { status: 'runtime_error', error_message: result.stderr ?? undefined }
}

export const judgeService = { run }
