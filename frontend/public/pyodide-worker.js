// Runs Python (Pyodide = CPython compiled to WebAssembly) off the main thread.
// Loaded lazily the first time a code cell is run; the page terminates and
// recreates this worker if a run takes too long (e.g. an infinite loop).
/* global loadPyodide */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js')

const ready = loadPyodide().then((py) => {
  self.postMessage({ type: 'ready' })
  return py
})

// Keep only the part of a traceback that points at the learner's code.
function cleanError(err) {
  const text = String((err && err.message) || err)
  const lines = text.split('\n')
  const start = lines.findIndex((l) => l.includes('File "<exec>"'))
  return (start >= 0 ? lines.slice(start) : lines.slice(-3)).join('\n').trim()
}

self.onmessage = async (event) => {
  const { id, code, tests } = event.data
  const py = await ready
  let output = ''
  const write = (s) => {
    output += s + '\n'
  }
  py.setStdout({ batched: write })
  py.setStderr({ batched: write })

  const globals = py.globals.get('dict')()
  try {
    await py.loadPackagesFromImports(code)
    await py.runPythonAsync(code, { globals })
  } catch (err) {
    globals.destroy()
    self.postMessage({ type: 'result', id, output, error: cleanError(err), passed: tests ? false : null })
    return
  }
  if (!tests) {
    globals.destroy()
    self.postMessage({ type: 'result', id, output, error: null, passed: null })
    return
  }
  try {
    await py.runPythonAsync(tests, { globals })
    self.postMessage({ type: 'result', id, output, error: null, passed: true })
  } catch (err) {
    self.postMessage({ type: 'result', id, output, error: cleanError(err), passed: false })
  } finally {
    globals.destroy()
  }
}
