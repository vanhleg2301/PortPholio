import type { ChoiceQuestion, LessonTest } from '../types'
import { PRINT, choice } from './helpers'

// Day tests for the two "what Python really is" lessons. Same shape as tests/python.ts; the
// second question of every concept is in PYTHON_FOUNDATION_VARIANTS below.

function alt(concept: string, question: string, options: string[], explain: string, code?: string): ChoiceQuestion {
  return { id: `${concept}-b`, concept, question, options, answer: 0, explain, code }
}

export const PYTHON_FOUNDATION_TESTS: Record<string, LessonTest> = {
  'py-how-python-runs': {
    choice: [
      choice('two-stages', 'What does CPython do when you run `python app.py`?',
        ['Compiles the file to bytecode, then its virtual machine runs the bytecode step by step', 'Compiles the file to machine code, then the CPU runs it directly', 'Reads and runs each line of text with no compile step', 'Sends the code to a JIT compiler that makes an .exe'],
        'Two stages: the source becomes [[bytecode]] (stage 1), and a loop written in C — the Python [[virtual machine]] — runs one bytecode instruction at a time (stage 2). There is no machine-code step in the standard CPython.'),
      choice('pyc', 'What is inside the `__pycache__/*.pyc` files?',
        ['Saved bytecode of imported modules, so the next start can skip compiling them', 'Machine code for your CPU', 'A copy of your source code with comments removed', 'Logs of the last run'],
        '`.pyc` files cache the compiled [[bytecode]] of imported modules. Python checks that the source has not changed and then reuses them. They are still run by the virtual machine — they are not machine code.'),
      choice('cpython-jit', 'Why is Java usually much faster than CPython on a long loop of math?',
        ['Java’s virtual machine has a JIT that turns hot code into machine code; standard CPython interprets every bytecode step', 'Java does not use bytecode at all', 'Python has no compiler at all', 'Java has no garbage collector'],
        'Both compile to bytecode. The difference is the [[jit|JIT]]: the JVM compiles busy code to [[machine code]] while it runs, while standard CPython keeps interpreting each instruction. PyPy is a Python with a JIT.'),
      choice('everything-object', PRINT, ['True function', 'False function', 'True f', 'True int'],
        'A function is an [[object]] like any other: `g = f` sticks a second name on the same function object, so `g is f` is True, and its type is `function`.',
        'def f():\n    return 1\n\ng = f\nprint(g is f, type(f).__name__)'),
      choice('is-vs-eq', PRINT, ['True False True', 'True True True', 'False False True', 'True False False'],
        '`==` compares values; `is` asks “the same object?”. `a` and `b` are two lists with equal values (`==` True, `is` False). `c = a` is a second name for the same list (`is` True).',
        'a = [1, 2]\nb = [1, 2]\nc = a\nprint(a == b, a is b, a is c)'),
      choice('dynamic-typing', PRINT, ['str', 'int', 'TypeError', 'five'],
        'Python is [[dynamically typed]]: a name can be moved to an object of another type at any time. The object `"five"` is a `str`.',
        'x = 5\nx = "five"\nprint(type(x).__name__)'),
      choice('runtime-error', 'A file defines `def bad(): return "a" + 1` but never calls `bad()`. What happens when you run the file?',
        ['It runs normally: the TypeError would only happen if bad() were called', 'A TypeError before anything runs', 'A SyntaxError before anything runs', 'Python warns about the bad type and skips the function'],
        'The line is valid syntax, so the file compiles. Types are checked only at [[runtime]], when an operation actually happens — and `"a" + 1` never runs.'),
      choice('type-hints', PRINT, ['abab', 'TypeError', '0', 'None'],
        '[[type hint|Type hints]] are not checked when the program runs. `"ab" * 2` is valid, so the function happily returns `"abab"`. Tools like mypy would warn before running.',
        'def d(x: int) -> int:\n    return x * 2\n\nprint(d("ab"))'),
      choice('refcount', PRINT, ['2', '0', '1', '3'],
        'Each new name for the list adds one reference. `y = x` and `z = x` are two new references, so the count went up by 2. This is [[reference counting]].',
        'import sys\nx = []\nn = sys.getrefcount(x)\ny = x\nz = x\nprint(sys.getrefcount(x) - n)'),
      choice('gc-cycles', 'Two objects point to each other, and no name points to either of them any more. How does CPython free them?',
        ['Their reference counts never reach 0, so the cycle [[garbage collector]] finds and frees them later', 'Reference counting frees them at once', 'They are never freed until the program ends', 'You must call `del` on each one'],
        'Each object still has a reference — from the other one — so [[reference counting]] alone cannot free them. CPython’s extra cycle collector (the `gc` module) finds such unreachable groups and frees them.'),
      choice('why-slow', 'What is the main reason a pure-Python `for` loop that adds numbers is much slower than the same loop in C?',
        ['The virtual machine does extra work for every bytecode step, and every number is a full object', 'The GIL makes every loop wait for other threads', 'Python must recompile the loop on every pass', 'Python stores numbers as strings'],
        'Per-step overhead: find the types, choose the operation, check errors, create new int objects. The [[gil|GIL]] matters for threads, not for a single loop. Built-ins like `sum` run that loop in C instead.'),
      choice('gil', 'A program has 4 threads doing heavy math in pure Python on a 4-core CPU (standard CPython). What happens?',
        ['Only one thread runs Python bytecode at a time, so it is not ~4x faster; use multiprocessing for CPU work', 'All 4 threads run in parallel, ~4x faster', 'The program crashes: Python allows only one thread', 'Python moves the math to the GPU'],
        'The [[gil|GIL]] lets one [[thread]] run Python bytecode at a time. Threads still help when the program waits (network, files). For CPU-heavy work, use several [[process|processes]].'),
    ],
    code: [
      {
        id: 'checked-double',
        title: 'Check the type yourself',
        prompt: 'Type hints are not enforced, so write the check by hand. Return `x * 2` when `x` is an `int` or a `float`. For anything else — including `True` / `False` — `raise TypeError("need a number")`.',
        starter: `def checked_double(x: float) -> float:
    # your code here
    pass`,
        tests: `assert checked_double(4) == 8
assert checked_double(1.5) == 3.0
for bad in ["ab", None, True, [1]]:
    try:
        checked_double(bad)
    except TypeError:
        pass
    else:
        raise AssertionError(f"no TypeError for {bad!r}")`,
        hint: 'Reject bools first (`isinstance(x, bool)`), then accept `isinstance(x, (int, float))`.',
        solution: `def checked_double(x: float) -> float:
    if isinstance(x, bool) or not isinstance(x, (int, float)):
        raise TypeError("need a number")
    return x * 2`,
      },
      {
        id: 'safe-add',
        title: 'Add only matching types',
        prompt: 'Return `a + b` when both are numbers (`int` or `float`, but not `bool`) or both are strings. In every other case return `None` instead of letting Python raise a `TypeError` (or silently add `True` as 1).',
        starter: `def safe_add(a, b):
    # your code here
    pass`,
        tests: `assert safe_add(2, 3) == 5
assert safe_add(1.5, 2) == 3.5
assert safe_add("ab", "c") == "abc"
assert safe_add("a", 1) is None
assert safe_add(True, 1) is None
assert safe_add(None, None) is None`,
        hint: 'Write a small helper `is_number(x)` (not a bool, and an int or float), then two `if` checks.',
        solution: `def is_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)

def safe_add(a, b):
    if is_number(a) and is_number(b):
        return a + b
    if isinstance(a, str) and isinstance(b, str):
        return a + b
    return None`,
      },
    ],
    explain: [
      {
        id: 'compiled-or-interpreted',
        question: 'Is Python compiled or interpreted? Explain what happens when you run `python app.py`, and how this differs from C and Java.',
        points: [
          'Both: CPython compiles source to bytecode, then the virtual machine interprets it',
          'SyntaxError stops the file before it runs; TypeError appears only when the line runs',
          'Imported modules cache bytecode in `.pyc` files',
          'C compiles ahead of time to machine code; Java compiles to bytecode and its JVM JIT-compiles hot code',
          'No JIT in standard CPython → pure-Python loops are slower; PyPy has a JIT',
        ],
        answer: 'Both. When I run `python app.py`, CPython first compiles the whole file to bytecode — that is why a SyntaxError anywhere stops the program before line 1 runs. Then the Python virtual machine, a loop written in C, executes the bytecode one instruction at a time, so a TypeError only appears when that line actually runs. Imported modules keep their bytecode in `.pyc` files to start faster. C is compiled ahead of time to machine code, so it runs directly on the CPU. Java also compiles to bytecode, but the JVM has a JIT that turns hot code into machine code while running. Standard CPython has no JIT, which is a big reason pure-Python loops are slower; PyPy is a Python with a JIT.',
      },
      {
        id: 'speed-and-scale',
        question: 'Why is Python slower than C or Java, and how do companies still use it for large systems?',
        points: [
          'Interpreter overhead on every bytecode step; dynamic type checks',
          'Every value is a full object (more memory, more work)',
          'GIL: one thread runs Python bytecode at a time — matters for CPU-heavy threads',
          'Most backend time is waiting for I/O (network, database), not CPU',
          'Heavy work runs in C: built-ins, NumPy / PyTorch; scale out with processes and more machines',
        ],
        answer: 'Python pays the interpreter’s cost on every bytecode step — finding types, choosing the operation, checking errors — and every number is a full object, so pure CPU loops can be 10–100 times slower than C. The GIL also stops threads from running Python code in parallel. But most backend requests spend their time waiting for the network or a database, where Python is not the bottleneck. The CPU-heavy parts run in C: built-ins like `sum` and `sorted`, and libraries like NumPy and PyTorch, so Python is the glue. To scale, teams run many processes and machines behind a load balancer, cache results, and rewrite the few real hot spots in a faster language if they must.',
      },
    ],
  },

  'py-real-world': {
    choice: [
      choice('uses', 'For which job is Python usually NOT the first choice?',
        ['The user interface of an iPhone app', 'Training a machine-learning model', 'A backend REST API', 'A script that cleans data every night'],
        'Phone apps are written in Swift (iOS) or Kotlin (Android), and browser code in JavaScript / TypeScript. Python shines in AI / data, backends and automation.'),
      choice('big-ints', PRINT, ['18446744073709551616', '0', '-1', '1.8446744073709552e+19'],
        'Python ints have [[arbitrary precision]]: `2 ** 64` is computed exactly. In Java or C a 64-bit integer would [[overflow]].',
        'print(2 ** 64)'),
      choice('java-overflow', 'In Java, `int x = 2147483647;` (the largest int) and then `x + 1`. What is the result?',
        ['-2147483648: it wraps around with no error', '2147483648', 'An OverflowError is thrown', 'It turns into a long automatically'],
        'Java ints are 32-bit. Going past the largest value wraps around to the most negative one, silently. Python ints just grow.'),
      choice('floor-div', PRINT, ['-4 -4 1', '-3 -3 -1', '-4 -3 1', '-3 -4 1'],
        'Python’s `//` rounds **down** (towards minus infinity): `-7 // 2` and `7 // -2` are both -4, and `%` follows the sign of the divisor. Java, C and Go round towards zero (-3).',
        'print(-7 // 2, 7 // -2, -7 % 2)'),
      choice('static-catch', 'Which language finds the mistake in `"a" + 1`-style code BEFORE the program runs?',
        ['TypeScript / Java / Go — static typing checks types at compile time', 'Python — it compiles the file first', 'JavaScript — it checks types before running', 'All languages find it only at runtime'],
        'With [[static typing]] the compiler knows every type, so mismatches are errors before running. Python compiles the file too, but only checks syntax; types are checked at [[runtime]] (and JavaScript turns `"a" + 1` into `"a1"`).'),
      choice('speed', 'For pure CPU work (a long math loop), which list goes from fastest to slowest?',
        ['C++ / Rust → Java / Go → standard CPython', 'CPython → Java → C++', 'Java → CPython → C++', 'All about the same on modern CPUs'],
        'C++ and Rust compile to [[machine code]]; Java and Go are close behind (JIT or native compile with a GC); standard CPython [[interpreter|interprets]] bytecode and is usually the slowest.'),
      choice('memory-mgmt', 'Which language has neither a garbage collector nor manual `free`, because the compiler decides when memory is freed?',
        ['Rust (ownership rules)', 'C', 'Java', 'Python'],
        'Rust’s ownership rules let the compiler insert the frees. C frees by hand, Java uses a tracing [[garbage collector]], Python uses [[reference counting]] plus a cycle collector.'),
      choice('parallel', 'You need to use all 8 CPU cores for heavy pure-Python math. What is the usual choice in standard CPython?',
        ['Several processes (multiprocessing), each with its own interpreter and GIL', 'Several threads — they run Python code in parallel', 'asyncio — it runs coroutines on all cores', 'Nothing: Python can only ever use one core'],
        'The [[gil|GIL]] lets one thread run Python bytecode at a time per process, so threads do not speed up CPU work. Separate [[process|processes]] each have their own GIL. (Go would use goroutines, Java real threads.)'),
      choice('browser-js', 'Why is the code that runs inside a web page written in JavaScript / TypeScript, not Python?',
        ['Browsers run JavaScript natively; Python would need an extra runtime (like Pyodide) downloaded to the page', 'Python cannot draw text', 'JavaScript is always faster than Python everywhere', 'Python is not allowed on the internet'],
        'Every browser ships a JavaScript engine. Python can run in a page only through WebAssembly projects such as Pyodide — this app uses it for code cells — but that is a big download, so normal web front-ends use JS / TS.'),
      choice('ai-glue', 'If Python is slow, why is it the main language for AI and data science?',
        ['The heavy math runs in C / C++ / CUDA libraries (NumPy, PyTorch); Python just gives the orders', 'Python has a special fast mode for AI', 'AI code does not need speed', 'Python compiles to GPU code by itself'],
        'Python is the “glue”: short, readable code that calls libraries written in fast languages. The time is spent inside those libraries, not in the Python lines.'),
      choice('weaknesses', 'Which is a real weakness of Python compared with Java or Go?',
        ['Many type mistakes appear only when the code runs, so tests matter more', 'It has no standard library', 'It cannot do network programming', 'Its ints overflow at 2³¹'],
        'Because of dynamic typing, a wrong type is found at [[runtime]] (or by tools like mypy). Its ints never overflow, and its standard library is one of the largest.'),
      choice('interview-costs', 'You use Python in a coding interview. What do interviewers expect you to know?',
        ['The time cost of the built-ins you call, e.g. `x in list` O(n) vs `x in set` O(1)', 'Nothing extra: built-ins are free', 'How CPython is written in C, line by line', 'That Python code must be converted to Java at the end'],
        'Short code is the advantage; hiding a costly operation is the trap. Say the cost of `sorted` (O(n log n)), `list.pop(0)` (O(n)) or `in` on a list (O(n)) out loud.'),
    ],
    code: [
      {
        id: 'java-div',
        title: 'Divide like Java',
        prompt: 'Java and C round integer division **towards zero** (`-7 / 2` is `-3`), but Python’s `//` rounds down (`-7 // 2` is `-4`). Return `a` divided by `b` rounded towards zero, using only integer operations (no floats). `b` is never 0.',
        starter: `def java_div(a, b):
    # your code here
    pass`,
        tests: `assert java_div(7, 2) == 3
assert java_div(-7, 2) == -3
assert java_div(7, -2) == -3
assert java_div(-7, -2) == 3
assert java_div(6, 3) == 2
assert java_div(-6, 3) == -2
assert java_div(10 ** 20 + 1, -1) == -(10 ** 20 + 1)`,
        hint: 'Divide the absolute values with `//`, then make the result negative when exactly one of `a` and `b` is negative.',
        solution: `def java_div(a, b):
    q = abs(a) // abs(b)
    if (a < 0) != (b < 0):
        return -q
    return q`,
      },
      {
        id: 'digit-sum',
        title: 'Digit sum of a huge number',
        prompt: 'Return the sum of the digits of a non-negative integer `n`, using a `while` loop with `% 10` and `// 10` (no strings). Python ints never overflow, so `2 ** 100` works directly — in Java it would need `BigInteger`.',
        starter: `def digit_sum(n):
    # your code here
    pass`,
        tests: `assert digit_sum(0) == 0
assert digit_sum(9) == 9
assert digit_sum(1234) == 10
assert digit_sum(2 ** 100) == 115`,
        hint: '`n % 10` is the last digit; `n //= 10` removes it. Stop when `n` is 0.',
        solution: `def digit_sum(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`,
      },
    ],
    explain: [
      {
        id: 'choose-language',
        question: 'Which language would you choose for (a) a backend API, (b) a mobile app, (c) a game engine, (d) an ML training pipeline — and why?',
        points: [
          'Backend API: Python (FastAPI / Django), Go or Java — trade-off between speed of development and runtime speed',
          'Mobile app: Swift (iOS) / Kotlin (Android) — native platforms, not Python',
          'Game engine: C++ (or Rust) — tight control of memory and frame time',
          'ML pipeline: Python, because the libraries (PyTorch, NumPy) do the heavy work in C++ / CUDA',
          'Mention the team’s existing skills and libraries, not only raw speed',
        ],
        answer: 'For a backend API I would pick Python with FastAPI or Django when the team wants to move fast and most time is spent waiting for the database; Go or Java when we need high throughput per server or strict static types in a big codebase. For a mobile app, the native languages — Swift on iOS and Kotlin on Android — because the platforms and their UI tools are built for them. For a game engine, C++ (or Rust), because we need control over memory and every millisecond of frame time, with no garbage-collector pauses. For an ML training pipeline, Python, because PyTorch and NumPy run the heavy math in C++ and CUDA and the whole ecosystem is there. In real teams I also weigh what the team already knows and which libraries exist.',
      },
      {
        id: 'strengths-weaknesses',
        question: 'What are Python’s main strengths and weaknesses compared with Java or Go?',
        points: [
          'Strength: short, readable code; fast to write and change',
          'Strength: huge standard library and the best AI / data ecosystem',
          'Strength: ints never overflow; great for interviews and scripts',
          'Weakness: slower CPU work (interpreter, objects), GIL limits threads',
          'Weakness: dynamic typing → more runtime errors, needs tests / mypy; more memory per value',
        ],
        answer: 'Python’s strengths are short, readable code that is quick to write and change, a very large standard library, and the strongest ecosystem for AI and data. Its ints never overflow, and the built-ins make interview and script code compact. Its weaknesses are speed and parallelism: pure-Python CPU work is much slower than Java or Go because of the interpreter and boxed objects, and the GIL stops threads from running Python code in parallel. Dynamic typing means many mistakes show up only at runtime, so a large Python codebase needs good tests and type checking with mypy, and it uses more memory per value. Java and Go give you static types and real parallel threads or goroutines, at the cost of more code.',
      },
    ],
  },
}

export const PYTHON_FOUNDATION_VARIANTS: Record<string, ChoiceQuestion[]> = {
  'py-how-python-runs': [
    alt('two-stages', 'Line 1 of a file is `print("hi")` and line 10 has a missing colon (`if x > 0`). Why is "hi" never printed?',
      ['Stage 1 — compiling the whole file to bytecode — fails, so the virtual machine never starts', 'Python runs the file from the bottom up', 'print is disabled when a file has errors', 'Line 1 runs, but its output is deleted'],
      'CPython compiles the **whole** file to [[bytecode]] before running anything. A syntax error stops that stage, so not even line 1 runs.'),
    alt('pyc', 'Where does CPython keep the compiled bytecode of a module you import, to start faster next time?',
      ['In a `.pyc` file inside `__pycache__`', 'In the `.py` file itself', 'In an `.exe` next to the script', 'Nowhere: bytecode is never saved'],
      'Imported modules are cached as `.pyc` files in `__pycache__`. They hold [[bytecode]], not machine code.'),
    alt('cpython-jit', 'What does a JIT compiler do?',
      ['While the program runs, it turns frequently used code into machine code', 'It checks types before the program runs', 'It frees unused memory', 'It splits the program across CPU cores'],
      'A [[jit|JIT]] (just-in-time) compiler watches which code runs a lot and compiles it to [[machine code]] during the run. The JVM, V8 and PyPy have one; standard CPython does not (3.13 has only an experimental one).'),
    alt('everything-object', PRINT, ['builtin_function_or_method int', 'function int', 'len 42', 'builtin int'],
      'Built-in functions are [[object|objects]] too; their type is `builtin_function_or_method`. `42` is an object of type `int`.',
      'print(type(len).__name__, type(42).__name__)'),
    alt('is-vs-eq', PRINT, ['[0, 1] True', '[0] False', '[0, 1] False', '[0] True'],
      '`b = a` does not copy: both names point to one list. Appending through `b` changes the object that `a` also points to, and `a is b` is True.',
      'a = [0]\nb = a\nb.append(1)\nprint(a, a is b)'),
    alt('dynamic-typing', PRINT, ['4 abab', 'TypeError', '4 4', '22 abab'],
      'The same function works for any object that supports `+`: numbers add, strings join. That is [[dynamically typed|dynamic typing]] — the operation is chosen at [[runtime]] from the objects’ types.',
      'def f(x):\n    return x + x\n\nprint(f(2), f("ab"))'),
    alt('runtime-error', 'What does this file do? Line 1: `print("start")`, line 2: `print("a" + 1)`.',
      ['Prints start, then stops with a TypeError on line 2', 'Stops with a TypeError before printing anything', 'Prints start and a1', 'Prints start and skips line 2'],
      'The file compiles fine (it is valid syntax). Line 1 runs, then the type problem is found only when line 2 runs — a [[runtime]] error.'),
    alt('type-hints', PRINT, ['3.5', 'TypeError', '3', '1.52'],
      'The hints say `int`, but Python does not check them at runtime. `1.5 + 2` is `3.5`.',
      'def add(a: int, b: int) -> int:\n    return a + b\n\nprint(add(1.5, 2))'),
    alt('refcount', '`a = [1, 2, 3]`, then `a = None`. When is the list freed in CPython (no other names point to it)?',
      ['At once: its reference count drops to 0', 'Only when the program ends', 'At the next run of the cycle garbage collector', 'Never: lists are not freed'],
      'With [[reference counting]], the moment the last reference disappears the object is freed. The cycle collector is only needed for groups that point to each other.'),
    alt('gc-cycles', 'Why does CPython need a cycle garbage collector at all, if it already counts references?',
      ['Objects that point to each other keep each other’s count above 0 even when nothing else can reach them', 'Reference counting does not work for lists', 'To make programs faster', 'To free memory used by the GIL'],
      'In a cycle every object still has a reference — from another object in the cycle — so counting never reaches 0. The [[garbage collector]] finds such unreachable groups.'),
    alt('why-slow', 'Why is `sum(nums)` usually much faster than adding the numbers with your own `for` loop?',
      ['The loop inside sum() runs in C, so it skips the per-step cost of the Python virtual machine', 'sum() uses all CPU cores', 'sum() skips some numbers', 'Python caches the result of sum()'],
      'Built-ins are written in C. Your `for` loop pays the [[interpreter]]’s overhead on every step; the loop inside `sum` does not.'),
    alt('gil', 'A program downloads 50 web pages with 10 threads in standard CPython. Do the threads help?',
      ['Yes: while one thread waits for the network, the GIL is released and other threads run', 'No: the GIL means only one thread can exist', 'No: threads only help CPU work', 'Yes: the GIL makes threads run on all cores'],
      'The [[gil|GIL]] only stops threads from running Python bytecode at the same moment. Waiting for I/O releases it, so threads are a good fit for downloads.'),
  ],
  'py-real-world': [
    alt('uses', 'Which of these is a typical everyday use of Python at a tech company?',
      ['Backend APIs, data pipelines, ML training and automation scripts', 'The code inside the web browser page', 'The kernel of the operating system', 'Native iPhone screens'],
      'Python is strong where development speed and libraries matter: backends (Django, FastAPI), data and AI, and scripts. Browser code is JavaScript, kernels are C, iPhone apps are Swift.'),
    alt('big-ints', PRINT, ['100000000000000000001', '1e+20', '100000000000000000000', 'OverflowError'],
      'Python ints are exact at any size ([[arbitrary precision]]), so the + 1 is kept. A float (`1e20`) would lose it.',
      'print(10 ** 20 + 1)'),
    alt('java-overflow', PRINT, ['-2147483647', '2147483649', '1', '-1'],
      '`to_int32` copies Java’s 32-bit int: 2³¹ + 1 is too big, so it wraps around to -2³¹ + 1 = -2147483647.',
      'def to_int32(n):\n    n = n % 2 ** 32\n    if n >= 2 ** 31:\n        n -= 2 ** 32\n    return n\n\nprint(to_int32(2 ** 31 + 1))'),
    alt('floor-div', PRINT, ['-3 -4', '-4 -4', '-3 -3', '-4 -3'],
      '`int(-7 / 2)` cuts the float -3.5 towards zero → -3 (what Java gives). `-7 // 2` rounds down → -4.',
      'print(int(-7 / 2), -7 // 2)'),
    alt('static-catch', 'In Python, when is a type mistake like `len(5)` found?',
      ['When that line runs (or earlier only if you use a type checker like mypy)', 'When the file is compiled to bytecode', 'Never: Python fixes it automatically', 'When the computer starts'],
      'Python checks types at [[runtime]]. Compiling to bytecode only checks syntax. A static checker such as mypy can find it before running, which is what Java or Go compilers do by default.'),
    alt('speed', 'Why do Go and Java usually beat standard CPython on CPU-heavy code?',
      ['They run machine code (compiled ahead of time or by a JIT); CPython interprets bytecode step by step', 'They have no garbage collector', 'They use more threads by default', 'Their programs are shorter'],
      'Go compiles to [[machine code]]; Java’s JVM [[jit|JIT]]-compiles hot code. CPython has neither in its standard build, so each bytecode step carries interpreter overhead.'),
    alt('memory-mgmt', 'How does C free memory?',
      ['By hand: the programmer calls free() — forget it and memory leaks', 'With reference counting', 'With a tracing garbage collector', 'With ownership checked by the compiler'],
      'C gives full control and full responsibility. C++ adds RAII, Java / Go / JS use a [[garbage collector]], Python uses [[reference counting]], Rust uses ownership.'),
    alt('parallel', 'Which tool runs thousands of light tasks across all CPU cores at once with very little code?',
      ['Go’s goroutines', 'Python threads in standard CPython', 'JavaScript’s single main thread', 'A Python for loop'],
      'Goroutines are scheduled by Go on all cores. CPython threads share one [[gil|GIL]], and JavaScript runs your code on one thread with an event loop.'),
    alt('browser-js', 'How can this app run your Python code inside the browser?',
      ['With Pyodide: CPython compiled to WebAssembly and downloaded into the page', 'Browsers include Python', 'The code is sent to a server and run there', 'The code is translated to JavaScript line by line'],
      'Browsers natively run only JavaScript (and WebAssembly). Pyodide is CPython built for WebAssembly — a big download, which is why normal front-ends use JS / TS.'),
    alt('ai-glue', 'In a PyTorch training loop written in Python, where does most of the time go?',
      ['Inside PyTorch’s C++ / CUDA code doing the math on the GPU', 'In the Python for loop itself', 'In printing progress', 'In Python’s garbage collector'],
      'Each Python line launches big chunks of work in fast code. Python is the glue, so its slowness hardly matters here.'),
    alt('weaknesses', 'Why do large Python codebases often add tests and a type checker (mypy) early?',
      ['Dynamic typing means type mistakes otherwise appear only at runtime', 'Python cannot run without mypy', 'Tests make Python faster', 'Type checkers remove the GIL'],
      'Without [[static typing]] the compiler does not check types, so teams add tests and optional type checking to catch errors before users do.'),
    alt('interview-costs', 'In a Python interview solution, which line hides an O(n) cost inside a loop and can make the whole solution O(n²)?',
      ['`if x in seen_list:` where seen_list is a list', '`if x in seen_set:` where seen_set is a set', '`n = len(nums)`', '`seen_set.add(x)`'],
      '`in` on a list scans every item — O(n). In a loop that is O(n²). A set makes it O(1) on average. Saying this out loud shows you know what the short Python line really costs.'),
  ],
}
