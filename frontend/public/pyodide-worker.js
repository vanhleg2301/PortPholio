// Runs Python (Pyodide = CPython compiled to WebAssembly) off the main thread.
// Loaded lazily the first time a code cell is run; the page terminates and
// recreates this worker if a run takes too long (e.g. an infinite loop).
/* global loadPyodide */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js')

// Runs the hidden tests one top-level statement at a time, like the test cases on LeetCode:
// every `assert` (or a loop that contains asserts) becomes one case with its input, the
// expected value, the learner's value, any error and what it printed. Other statements are
// setup. Returns the cases as JSON.
const RUN_CASES = `
import ast, contextlib, inspect, io, json

def __error_text(e):
    user_line = None
    tb = e.__traceback__
    while tb:
        if tb.tb_frame.f_code.co_filename == "<exec>":
            user_line = tb.tb_lineno
        tb = tb.tb_next
    text = type(e).__name__ + ": " + str(e)
    if user_line:
        text += " (your code, line " + str(user_line) + ")"
    return text

def __run_cases(src, ns):
    tree = ast.parse(src)
    lines = src.splitlines()

    def ev(node):
        return eval(compile(ast.Expression(node), "<tests>", "eval"), ns)

    def run_stmt(stmt):
        exec(compile(ast.Module([stmt], []), "<tests>", "exec"), ns)

    def describe(node):
        # A call to the learner's function shows its arguments by name: "n = 123".
        if isinstance(node, ast.Call):
            try:
                fn = ev(node.func)
                if getattr(getattr(fn, "__code__", None), "co_filename", "") == "<exec>":
                    args = [ev(a) for a in node.args]
                    kwargs = {k.arg: ev(k.value) for k in node.keywords if k.arg}
                    bound = inspect.signature(fn).bind(*args, **kwargs)
                    return "\\n".join(k + " = " + repr(v) for k, v in bound.arguments.items())
            except Exception:
                pass
        return ast.get_source_segment(src, node)

    def check_compare(case, test):
        if isinstance(test, ast.Compare) and len(test.ops) == 1 and isinstance(test.ops[0], (ast.Eq, ast.Is)):
            case["input"] = describe(test.left)
            got = ev(test.left)
            expected = ev(test.comparators[0])
            case["got"], case["expected"] = repr(got), repr(expected)
            return got == expected if isinstance(test.ops[0], ast.Eq) else got is expected
        case["input"] = ast.get_source_segment(src, test)
        ok = bool(ev(test))
        case["expected"], case["got"] = "True", repr(ok)
        return ok

    def has_assert(stmt):
        return any(isinstance(n, ast.Assert) for n in ast.walk(stmt))

    cases = []
    for stmt in tree.body:
        out = io.StringIO()
        if not has_assert(stmt):
            try:
                with contextlib.redirect_stdout(out):
                    run_stmt(stmt)
            except Exception as e:
                cases.append({"label": ast.get_source_segment(src, stmt), "input": None, "expected": None, "got": None,
                              "passed": False, "error": __error_text(e), "stdout": out.getvalue()})
                break
            continue

        first_line = lines[stmt.lineno - 1].strip()
        case = {"label": first_line, "input": None, "expected": None, "got": None, "passed": False, "error": None, "stdout": ""}
        try:
            with contextlib.redirect_stdout(out):
                if isinstance(stmt, ast.Assert):
                    case["passed"] = check_compare(case, stmt.test)
                else:
                    run_stmt(stmt)
                    case["passed"] = True
        except AssertionError as e:
            # An assert inside a loop failed: describe that assert with the loop's current values.
            line = None
            tb = e.__traceback__
            while tb:
                if tb.tb_frame.f_code.co_filename == "<tests>":
                    line = tb.tb_lineno
                tb = tb.tb_next
            node = next((n for n in ast.walk(stmt) if isinstance(n, ast.Assert) and n.lineno == line), None)
            if node is not None:
                try:
                    with contextlib.redirect_stdout(out):
                        check_compare(case, node.test)
                except Exception as inner:
                    case["error"] = __error_text(inner)
        except Exception as e:
            case["error"] = __error_text(e)
        case["stdout"] = out.getvalue()
        cases.append(case)
    return json.dumps(cases)
`

const ready = loadPyodide().then((py) => {
  py.runPython(RUN_CASES)
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
    self.postMessage({ type: 'result', id, output, error: cleanError(err), passed: tests ? false : null, cases: [] })
    return
  }
  if (!tests) {
    globals.destroy()
    self.postMessage({ type: 'result', id, output, error: null, passed: null, cases: [] })
    return
  }
  const runCases = py.globals.get('__run_cases')
  try {
    const cases = JSON.parse(runCases(tests, globals))
    const passed = cases.length > 0 && cases.every((c) => c.passed)
    self.postMessage({ type: 'result', id, output, error: null, passed, cases })
  } catch (err) {
    self.postMessage({ type: 'result', id, output, error: cleanError(err), passed: false, cases: [] })
  } finally {
    runCases.destroy()
    globals.destroy()
  }
}
