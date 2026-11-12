// Checks every lesson and test against real Python. Run after editing lesson content:
//   npm run check:lessons        (needs `python` 3 on PATH; runs with `npx tsx`)
//
// - Every example code block runs without an error.
// - Every exercise and coding task: the solution passes its tests, the starter does not.
// - Every "What does this print?" answer is exactly what Python prints, and no wrong option is.
// - Every quiz concept has at least two questions, ids are unique, options are distinct.
// - Every [[glossary]] mark exists in the glossary, and every question has a source link.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { LESSONS, LESSON_TESTS } from '../src/data/lessons/index'
import { GLOSSARY } from '../src/data/lessons/glossary'
import { PYTHON_REFERENCE } from '../src/data/reference/python'
import { MOCK_TESTS } from '../src/data/lessons/mockTests'

const dir = mkdtempSync(join(tmpdir(), 'lesson-check-'))
const file = join(dir, 'snippet.py')
const python = process.platform === 'win32' ? 'python' : 'python3'

function run(code: string) {
  writeFileSync(file, code)
  const r = spawnSync(python, ['-I', file], { encoding: 'utf-8', timeout: 20_000 })
  return { ok: r.status === 0, out: (r.stdout ?? '').replace(/\r/g, '').replace(/\n$/, ''), err: (r.stderr ?? '').trim() }
}

const problems: string[] = []
const fail = (msg: string) => problems.push(msg)
const TERM = /\[\[([A-Za-z][^\]|\n]*)(?:\|[^\]\n]+)?\]\]/g
function checkTerms(where: string, md: string) {
  const prose = md.replace(/```[\s\S]*?```|`[^`\n]*`/g, '')
  for (const m of prose.matchAll(TERM)) if (!GLOSSARY[m[1].trim().toLowerCase()]) fail(`${where}: unknown glossary term "${m[1]}"`)
}

for (const lesson of LESSONS) {
  for (const block of lesson.blocks) {
    if (block.type === 'text' || block.type === 'callout') checkTerms(lesson.id, block.md)
    if (block.type === 'code') {
      const r = run(block.code)
      if (!r.ok) fail(`${lesson.id} example ${block.id} raises: ${r.err.split('\n').pop()}`)
    }
    if (block.type === 'exercise') {
      checkTerms(lesson.id, block.prompt)
      if (!run(`${block.solution}\n${block.tests}`).ok) fail(`${lesson.id} exercise ${block.id}: solution fails its tests`)
      if (run(`${block.starter}\n${block.tests}`).ok) fail(`${lesson.id} exercise ${block.id}: starter passes its tests`)
    }
  }

  const test = LESSON_TESTS[lesson.id]
  if (!test) continue
  const ids = new Set<string>()
  for (const q of [...test.choice, ...test.code, ...test.explain]) {
    if (ids.has(q.id)) fail(`${lesson.id}: duplicate question id ${q.id}`)
    ids.add(q.id)
  }
  const concepts = new Map<string, number>()
  for (const q of test.choice) concepts.set(q.concept ?? q.id, (concepts.get(q.concept ?? q.id) ?? 0) + 1)
  for (const [concept, n] of concepts) if (n < 2) fail(`${lesson.id}: concept ${concept} has only ${n} question`)

  for (const q of test.choice) {
    checkTerms(`${lesson.id}/${q.id}`, `${q.question}\n${q.explain}`)
    if (!q.ref) fail(`${lesson.id}/${q.id}: no source link`)
    if (new Set(q.options).size !== q.options.length) fail(`${lesson.id}/${q.id}: duplicate options`)
    if (q.question === 'What does this print?') {
      if (!q.code) {
        fail(`${lesson.id}/${q.id}: print question without code`)
        continue
      }
      const r = run(q.code)
      if (r.out !== q.options[q.answer]) fail(`${lesson.id}/${q.id}: prints ${JSON.stringify(r.out)}, answer says ${JSON.stringify(q.options[q.answer])}`)
      q.options.forEach((o, i) => i !== q.answer && o === r.out && fail(`${lesson.id}/${q.id}: a wrong option equals the output`))
    }
  }
  for (const q of test.code) {
    checkTerms(`${lesson.id}/${q.id}`, q.prompt)
    if (!run(`${q.solution}\n${q.tests}`).ok) fail(`${lesson.id} test task ${q.id}: solution fails its tests`)
    if (run(`${q.starter}\n${q.tests}`).ok) fail(`${lesson.id} test task ${q.id}: starter passes its tests`)
  }
  for (const q of test.explain) checkTerms(`${lesson.id}/${q.id}`, `${q.question}\n${q.answer}`)
  console.log(`checked ${lesson.id}: ${concepts.size} concepts / ${test.choice.length} quiz, ${test.code.length} coding, ${test.explain.length} interview`)
}

// Week and month mock interviews: every coding task is solvable and not solved by its starter.
for (const [day, mock] of Object.entries(MOCK_TESTS)) {
  for (const q of mock.code) {
    checkTerms(`mock ${day}/${q.id}`, q.prompt)
    if (!q.ref) fail(`mock ${day}/${q.id}: no source link`)
    if (!run(`${q.solution}\n${q.tests}`).ok) fail(`mock ${day} task ${q.id}: solution fails its tests`)
    if (run(`${q.starter}\n${q.tests}`).ok) fail(`mock ${day} task ${q.id}: starter passes its tests`)
  }
  for (const q of mock.explain) checkTerms(`mock ${day}/${q.id}`, `${q.question}\n${q.answer}`)
  console.log(`checked mock ${day}: ${mock.code.length} coding, ${mock.explain.length} interview`)
}

// Python reference: every example runs, and the `# comment` on each print line (or the comment
// lines under a print inside a loop) is exactly what it prints.
function expectedOutput(code: string): string {
  const out: string[] = []
  let isCollecting = false
  for (const line of code.split('\n')) {
    const trailing = /print\(.*\)\s+#\s?(.*)$/.exec(line)
    if (trailing) {
      out.push(trailing[1].trimEnd())
      isCollecting = false
    } else if (/^\s+.*print\(/.test(line)) isCollecting = true
    else if (isCollecting && /^# /.test(line)) out.push(line.slice(2).trimEnd())
    else isCollecting = false
  }
  return out.join('\n')
}
const refIds = new Set<string>()
for (const ref of PYTHON_REFERENCE) {
  if (refIds.has(ref.id)) fail(`reference: duplicate id ${ref.id}`)
  refIds.add(ref.id)
  const r = run(ref.example)
  if (!r.ok) fail(`reference ${ref.name} raises: ${r.err.split('\n').pop()}`)
  else {
    const got = r.out.split('\n').map((l) => l.trimEnd()).join('\n')
    if (got !== expectedOutput(ref.example)) fail(`reference ${ref.name}: prints\n${got}\n--- comments say ---\n${expectedOutput(ref.example)}`)
  }
}
console.log(`checked python reference: ${PYTHON_REFERENCE.length} entries`)

rmSync(dir, { recursive: true, force: true })
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log('\nAll lessons and tests OK')
