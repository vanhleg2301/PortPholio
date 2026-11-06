// Runs Python (Pyodide = CPython compiled to WebAssembly) off the main thread.
// Loaded lazily the first time a code cell is run; the page terminates and
// recreates this worker if a run takes too long (e.g. an infinite loop).
/* global loadPyodide */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js')

// Runs the hidden tests and, when one fails, explains which check failed in plain words:
// the check itself, the expected and the actual value (for `assert a == b`), or the error
// and the line of the learner's code that raised it. Returns None when every test passes.
const CHECK_TESTS = `
import ast

def __check_tests(src, ns):
    tree = ast.parse(src)
    try:
        exec(compile(tree, "<tests>", "exec"), ns)
        return None
    except Exception as e:
        test_line = user_line = None
        # Skip this function's own frame; the rest belong to the tests and the learner's code.
        tb = e.__traceback__.tb_next
        while tb:
            name = tb.tb_frame.f_code.co_filename
            if name == "<tests>":
                test_line = tb.tb_lineno
            elif name == "<exec>":
                user_line = tb.tb_lineno
            tb = tb.tb_next
        node = next((n for n in ast.walk(tree) if isinstance(n, ast.Assert) and n.lineno == test_line), None)
        check = ast.get_source_segment(src, node.test) if node else None
        if check is None and test_line:
            check = src.splitlines()[test_line - 1].strip()

        if isinstance(e, AssertionError) and node is not None:
            lines = ["Failed check: " + check]
            t = node.test
            if isinstance(t, ast.Compare) and len(t.ops) == 1 and isinstance(t.ops[0], (ast.Eq, ast.Is)):
                try:
                    got = eval(compile(ast.Expression(t.left), "<tests>", "eval"), ns)
                    expected = eval(compile(ast.Expression(t.comparators[0]), "<tests>", "eval"), ns)
                    lines.append("Expected: " + repr(expected))
                    lines.append("Got:      " + repr(got))
                    if got is None:
                        lines.append("Tip: your function returned None. Did you forget 'return' (or is 'pass' still there)?")
                except Exception:
                    pass
            return "\\n".join(lines)

        lines = []
        if check:
            lines.append("While running check: " + check)
        lines.append(type(e).__name__ + ": " + str(e))
        if user_line:
            lines.append("The error happened in your code, line " + str(user_line) + ".")
        if "NoneType" in str(e):
            lines.append("Tip: something is None here — does your function 'return' its result?")
        return "\\n".join(lines)
`

const ready = loadPyodide().then((py) => {
  py.runPython(CHECK_TESTS)
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
  const checkTests = py.globals.get('__check_tests')
  try {
    const failure = checkTests(tests, globals)
    self.postMessage({ type: 'result', id, output, error: failure ?? null, passed: failure == null })
  } catch (err) {
    self.postMessage({ type: 'result', id, output, error: cleanError(err), passed: false })
  } finally {
    checkTests.destroy()
    globals.destroy()
  }
}
