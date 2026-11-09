import type { Lesson } from './types'

// Week 0: what Python really is. Monday (after if / else): how CPython runs a file — bytecode,
// objects, dynamic typing, memory, speed and the GIL. Wednesday (after while): what Python is
// used for at work and how it compares with JavaScript, Java, C++, Go and Rust.

const PY = 'https://docs.python.org/3'
const md = (...lines: string[]) => lines.join('\n')
const yt = (label: string, id: string) => ({ label, url: `https://www.youtube.com/watch?v=${id}` })

export const PYTHON_FOUNDATION_LESSONS: Lesson[] = [
  {
    id: 'py-how-python-runs',
    title: 'How Python runs your code',
    summary:
      'What really happens after `python app.py`: your code becomes bytecode, a virtual machine runs it, every value is an object, types are checked while the program runs, and memory is freed by counting references. Why this makes Python slower than C — and why that is usually fine.',
    minutes: 35,
    videos: [yt('Neural Download: Why Python is 100x slower than C', 'JXrPfI08euE'), yt('PyCon PL: Python internals — how does CPython work?', '4QJOEeldFUc')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Two ways to run code',
          'A CPU only understands [[machine code]]: very small steps written as numbers. Every language must turn your text into those steps somehow. There are two main ways:',
          '',
          '- A [[compiler]] translates the **whole program before it runs**. C, C++, Go and Rust do this: you get a program file (`app.exe`) that runs directly on the CPU. Fast, but you must compile again after every change, and the program file works only on one kind of computer.',
          '- An [[interpreter]] reads the program **while it runs** and does each step for you. Easy to change and run anywhere, but every step costs extra work.',
          '',
          'Python (the normal version, called [[cpython|CPython]]) does **both**, in two stages:',
          '',
          '1. **Compile** your `.py` file into [[bytecode]]: simple instructions like “load x”, “load 1.1”, “multiply”, “return”. This is fast and happens automatically every time you run the file. Imported modules keep their bytecode in `__pycache__/*.pyc` files so the next start is quicker.',
          '2. **Interpret** the bytecode: a loop written in C — the Python [[virtual machine]] — takes one instruction at a time and does it.',
          '',
          'This is why a `SyntaxError` anywhere stops the whole file before line 1 runs (stage 1 failed), but a `TypeError` happens only when Python **reaches** that line (stage 2).',
        ),
      },
      {
        type: 'diagram',
        caption: 'CPython: compile to bytecode once, then the virtual machine runs it step by step.',
        mermaid: `flowchart LR
  A["app.py<br/>(your text)"] --> B["Compiler<br/>(part of CPython)"]
  B --> C["Bytecode<br/>(.pyc cache)"]
  C --> D["Python virtual machine<br/>(a loop written in C)"]
  D --> E["Result"]`,
      },
      {
        type: 'code',
        id: 'dis',
        caption: 'The dis module shows the bytecode of a function. The exact names change a little between Python versions — the idea does not.',
        code: `import dis

def add_tax(price):
    return price * 1.1

# Each line below is one small instruction for the Python virtual machine:
# load price, load the constant 1.1, multiply, return the result.
dis.dis(add_tax)`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**C, C++, Go, Rust** compile ahead of time to machine code: fastest, but slower to change. **Java and C#** compile to bytecode too, but their virtual machines also have a [[jit|JIT]] compiler that turns hot code into machine code while it runs — that is why Java is usually much faster than CPython. **JavaScript** engines (V8 in Chrome and Node.js) are also JIT-compiled. **PyPy** is another Python with a JIT: often several times faster on pure-Python loops, but some libraries do not support it.',
      },
      {
        type: 'text',
        md: md(
          '## Everything is an object, and names are labels',
          'In Python **every value is an [[object]]**: numbers, strings, lists, functions, even classes. Each object has a **type** (what it is), a **value**, and an **identity** (where it lives in memory; `id(x)` shows it).',
          '',
          'A variable is not a box with a value inside. It is a **name tag** stuck on an object. `x = 42` creates the object `42` and sticks the name `x` on it. `y = x` sticks a second name on the **same** object.',
          '',
          'So Python has two different questions:',
          '',
          '- `a == b`: do they have **equal values**?',
          '- `a is b`: are they **the same object** (same identity)?',
          '',
          'Two lists can be equal but still be two different objects. Use `is` only to check for `None` (`if x is None:`).',
        ),
      },
      {
        type: 'code',
        id: 'objects',
        caption: 'Functions are objects too: they have a type and you can give them a second name.',
        code: `x = 42
print(type(x), isinstance(x, object))   # <class 'int'> True

def greet():
    return "hi"

say = greet                  # a second name for the same function object
print(say(), say is greet)   # hi True
print(type(greet))           # <class 'function'>

a = [1, 2]
b = [1, 2]
c = a
print(a == b, a is b)   # True False  -> equal values, two objects
print(a is c)           # True        -> one object, two names`,
      },
      {
        type: 'text',
        md: md(
          '## Dynamic typing: types are checked while the program runs',
          'Python is [[dynamically typed]]. A name has no fixed type: `x = 5` and later `x = "five"` is fine. The **object** has a type, and Python checks it at [[runtime]], at the moment an operation happens. `"a" + 1` raises a `TypeError` only when that line runs.',
          '',
          'You can write [[type hint|type hints]] (`def double(x: int) -> int:`). They help your editor and tools like `mypy` find mistakes, but **Python ignores them when it runs**. If you really need a check, write it yourself with `isinstance`.',
        ),
      },
      {
        type: 'code',
        id: 'dynamic',
        caption: 'The same function works for any type that supports *. The type hint does not stop "ab".',
        code: `def double(x: int) -> int:
    return x * 2

print(double(4))      # 8
print(double("ab"))   # abab  -> the hint says int, Python does not check it
print(double([0]))    # [0, 0]

try:
    double(None)
except TypeError as e:
    print("TypeError:", e)   # only now, while running, Python finds the problem`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Java, Go, C++, Rust and TypeScript** use [[static typing]]: every variable has a type that the compiler checks **before** the program runs, so `"a" + 1`-style mistakes never reach users. The price: more code to write. Python’s choice is the opposite: short, flexible code, but some mistakes appear only at runtime — so tests (and `mypy` in bigger projects) matter more.',
      },
      {
        type: 'text',
        md: md(
          '## Memory: who cleans up?',
          'You never free memory yourself in Python. CPython uses two tools:',
          '',
          '1. [[reference counting|Reference counting]]: every object counts how many names and containers point to it. When the count drops to 0, the object is freed **at once**.',
          '2. A [[garbage collector]] for **cycles**: if two objects point to each other (`a.friend = b`, `b.friend = a`), their counts never reach 0, so a separate collector (the `gc` module) finds and frees such groups from time to time.',
          '',
          'Python objects are also big: a small `int` is a full object (about 28 bytes on a 64-bit computer), while a C `int` is 4 bytes. Easy to use, but it costs memory and speed.',
        ),
      },
      {
        type: 'code',
        id: 'refcount',
        caption: 'sys.getrefcount shows the count (it is one higher than you expect, because the call itself holds a reference).',
        code: `import sys

data = [1, 2, 3]
before = sys.getrefcount(data)
alias = data                       # a second name -> one more reference
print(sys.getrefcount(data) - before)   # 1
del alias                          # the name is gone -> the count goes back down
print(sys.getrefcount(data) - before)   # 0
print(sys.getsizeof(1), "bytes for the int 1")   # about 28 on a 64-bit computer`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**C**: you free memory by hand (`malloc` / `free`) — fast, but forgetting causes leaks and freeing twice causes crashes. **C++**: objects free themselves when they go out of scope (RAII, smart pointers). **Java, Go, JavaScript, C#**: a tracing [[garbage collector]] that runs from time to time (no counting). **Rust**: no garbage collector at all — the compiler decides when memory is freed from “ownership” rules. Python’s counting frees memory early and predictably, but adds a little work to every assignment.',
      },
      {
        type: 'text',
        md: md(
          '## Why Python is slower — and how people make it fast',
          'A loop in pure Python is often **10–100 times slower** than the same loop in C. The main reasons are not the [[gil|GIL]]:',
          '',
          '- The virtual machine does extra work for **every** bytecode step: find the types, choose the right operation, check for errors.',
          '- Every number is a full object in memory, not a raw CPU number.',
          '',
          'Real programs still use Python at scale because the slow part is usually somewhere else (waiting for the network or a database), and because the heavy work is done by code written in C:',
          '',
          '- **Built-ins** like `sum`, `sorted`, `min`, `dict` and `set` run in C. Using them is faster than writing the same loop yourself.',
          '- **Libraries** like NumPy, pandas and PyTorch do the number crunching in C, C++ or CUDA. Python only gives the orders: it is the “glue”.',
        ),
      },
      {
        type: 'code',
        id: 'speed',
        caption: 'Timings change from computer to computer; the built-in is almost always several times faster.',
        code: `import time

nums = list(range(1_000_000))

start = time.perf_counter()
total = 0
for n in nums:            # one bytecode loop step per number
    total += n
loop_time = time.perf_counter() - start

start = time.perf_counter()
total2 = sum(nums)        # the loop runs inside C
sum_time = time.perf_counter() - start

print(total == total2)                     # True
print("sum() was faster:", sum_time < loop_time)
print(f"about {loop_time / sum_time:.0f}x faster")`,
      },
      {
        type: 'text',
        md: md(
          '## The GIL: one thread at a time',
          'CPython has a [[gil|Global Interpreter Lock (GIL)]]: inside one Python [[process]], only **one [[thread]] runs Python bytecode at a time**. It keeps reference counting safe and simple.',
          '',
          '- Threads still help when the program **waits** (downloads, files, databases): while one thread waits, the GIL is released and another runs.',
          '- For **CPU-heavy** work on several cores, use several processes (`multiprocessing`) or a C library that releases the GIL.',
          '',
          'Python 3.13 added an optional “free-threaded” build without the GIL (PEP 703). It is still experimental, so for interviews remember the classic rule above.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Go** runs thousands of light “goroutines” on all CPU cores at once. **Java and C++** threads also run truly in parallel. **JavaScript** has one main thread and an event loop: it never runs your code in parallel, but it is great at waiting for many things at once — the same idea as Python’s `asyncio`.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '“Is Python compiled or interpreted?” A strong answer: “Both. CPython compiles the source to bytecode, then its virtual machine interprets the bytecode. There is no JIT in the standard build, which is a big reason pure-Python loops are slower than Java or C. In practice we push heavy work into built-ins or C libraries like NumPy.”',
      },
      {
        type: 'exercise',
        id: 'describe',
        title: 'What kind of value is it?',
        prompt: 'Return `"bool"` for `True` / `False`, `"number"` for an `int` or `float`, `"text"` for a `str`, `"nothing"` for `None`, and `"other"` for anything else. Use `isinstance` and `is`. Careful: `bool` is a kind of `int` in Python, so the order of the checks matters.',
        starter: `def describe(x):
    # your code here
    pass`,
        tests: `assert describe(True) == "bool"
assert describe(False) == "bool"
assert describe(3) == "number"
assert describe(2.5) == "number"
assert describe("hi") == "text"
assert describe(None) == "nothing"
assert describe([1]) == "other"`,
        hint: 'Check `isinstance(x, bool)` **before** `isinstance(x, (int, float))`, and use `x is None` for None.',
        solution: `def describe(x):
    if isinstance(x, bool):
        return "bool"
    elif isinstance(x, (int, float)):
        return "number"
    elif isinstance(x, str):
        return "text"
    elif x is None:
        return "nothing"
    else:
        return "other"`,
      },
      {
        type: 'exercise',
        id: 'same-or-equal',
        title: 'Same object or just equal?',
        prompt: 'Return `"same object"` when `a` and `b` are one object, `"equal"` when they are two objects with equal values, and `"different"` otherwise.',
        starter: `def same_or_equal(a, b):
    # your code here
    pass`,
        tests: `x = [1, 2]
assert same_or_equal(x, x) == "same object"
assert same_or_equal(x, [1, 2]) == "equal"
assert same_or_equal(x, [2, 1]) == "different"
assert same_or_equal("a", "b") == "different"`,
        hint: '`is` first (same object), then `==` (equal values).',
        solution: `def same_or_equal(a, b):
    if a is b:
        return "same object"
    elif a == b:
        return "equal"
    else:
        return "different"`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What are the two stages when CPython runs a file?', answer: 'It compiles the source to bytecode, then the Python virtual machine interprets the bytecode one instruction at a time.' },
          { question: 'Does the type hint `x: int` stop `double("ab")` from running?', answer: 'No. Python ignores type hints at runtime; tools like mypy use them before running.' },
          { question: 'When is an object freed in CPython?', answer: 'When its reference count drops to 0 (at once). Reference cycles are freed later by the cycle garbage collector.' },
          { question: 'Why is `sum(nums)` faster than a `for` loop that adds numbers?', answer: 'The loop inside `sum` runs in C; the Python loop pays the virtual machine’s cost for every step.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python glossary: bytecode', url: `${PY}/glossary.html#term-bytecode` },
      { label: 'Python docs: dis — bytecode disassembler', url: `${PY}/library/dis.html` },
      { label: 'Python reference: Objects, values and types', url: `${PY}/reference/datamodel.html#objects-values-and-types` },
      { label: 'Python FAQ: How does Python manage memory?', url: `${PY}/faq/design.html#how-does-python-manage-memory` },
      { label: 'Python glossary: global interpreter lock', url: `${PY}/glossary.html#term-global-interpreter-lock` },
      { label: 'PEP 703: making the GIL optional', url: 'https://peps.python.org/pep-0703/' },
    ],
  },
  {
    id: 'py-real-world',
    title: 'Python in the real world, and vs other languages',
    summary:
      'Where Python is used at work, how it compares with JavaScript, Java, C++, Go and Rust (types, speed, memory, parallel work), what it is great and bad at, and why it is the best language for coding interviews.',
    minutes: 30,
    videos: [yt('Fireship: Python in 100 Seconds', 'x7X9w_GIm1s'), yt('Neural Download: Why Python is 100x slower than C', 'JXrPfI08euE')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## What Python is used for at work',
          '- **Backend web and APIs**: Django, Flask and FastAPI. Instagram’s backend is built on Django.',
          '- **Data, AI and machine learning**: pandas, NumPy, scikit-learn, PyTorch. Almost every AI team writes Python, while the heavy math runs in C++ / CUDA underneath.',
          '- **Automation and scripts**: build tools, cloud tools (the AWS command-line tool is written in Python), test scripts, data cleaning, small jobs that run every night.',
          '- **Coding interviews**: short code and strong built-ins let you spend your time on the algorithm, not on typing.',
          '',
          'Python is usually **not** the first choice for phone apps, code that runs inside the web browser, game engines, operating systems or programs that need answers within microseconds.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Python next to other languages',
          '| | Python | JavaScript / TypeScript | Java | C++ | Go | Rust |',
          '|---|---|---|---|---|---|---|',
          '| Types | dynamic | dynamic / static (TS) | static | static | static | static |',
          '| How it runs | bytecode + interpreter | JIT (V8) | bytecode + JIT | machine code | machine code | machine code |',
          '| Speed (CPU work) | slow | fast | fast | fastest | fast | fastest |',
          '| Memory | ref counting + GC | GC | GC | manual / RAII | GC | ownership, no GC |',
          '| Parallel work | GIL: 1 thread runs Python | 1 thread + event loop | real threads | real threads | goroutines | real threads |',
          '| Typical use | AI, data, backend, scripts | web front-end, Node backend | big company backends, Android | games, browsers, trading | cloud services, tools | systems, safe fast code |',
          '',
          'No language wins every row. Each one chooses a [[trade-off]]: Python trades speed for **short, readable code and a huge set of libraries**.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Numbers: Python ints never overflow',
          'In Java, C and Go an `int` has a fixed size (often 32 or 64 bits). When a result is too big, it [[overflow|overflows]]: it wraps around to a wrong (often negative) number, with **no error**. Python ints have [[arbitrary precision]]: they grow as big as memory allows.',
          '',
          'Integer division is also different: Python’s `//` rounds **down** (towards minus infinity), while Java, C and Go round **towards zero**. So `-7 // 2` is `-4` in Python but `-7 / 2` is `-3` in Java.',
        ),
      },
      {
        type: 'code',
        id: 'big-ints',
        caption: 'to_int32 copies what a 32-bit int in Java or C would store.',
        code: `print(2 ** 64)          # 18446744073709551616 — exact, no overflow
print(-7 // 2)          # -4 (rounds down; Java and C give -3)

def to_int32(n):
    n = n % 2 ** 32           # keep the lowest 32 bits
    if n >= 2 ** 31:          # the top bit means "negative"
        n -= 2 ** 32
    return n

print(to_int32(2 ** 31 - 1))   # 2147483647  (the largest Java int)
print(to_int32(2 ** 31))       # -2147483648 (one more: it wrapped around)`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'In **Java**, `Integer.MAX_VALUE + 1` is `-2147483648` with no error; you need `long` or `BigInteger` for big values. In **C**, signed overflow is even “undefined behaviour”. In **JavaScript**, all normal numbers are 64-bit floats: integers are exact only up to 2⁵³, after that use `BigInt`. In interviews this is why Java solutions to “Reverse Integer” or “Sum of Two Integers” need extra care, and Python ones need `to_int32`-style tricks.',
      },
      {
        type: 'text',
        md: md(
          '## The same task in four languages',
          'Count how many numbers in a list are even:',
          '',
          '```python',
          'count = sum(1 for n in nums if n % 2 == 0)',
          '```',
          '',
          '```javascript',
          'const count = nums.filter((n) => n % 2 === 0).length;',
          '```',
          '',
          '```java',
          'int count = 0;',
          'for (int n : nums) {',
          '    if (n % 2 == 0) count++;',
          '}',
          '```',
          '',
          '```go',
          'count := 0',
          'for _, n := range nums {',
          '    if n%2 == 0 {',
          '        count++',
          '    }',
          '}',
          '```',
          '',
          'Python and JavaScript are short; Java and Go write every step and every type, which is longer but very clear and fast.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Strengths and weaknesses',
          '**Strengths**',
          '- Short, readable code: fast to write, easy to review.',
          '- “Batteries included”: a big standard library (`collections`, `heapq`, `itertools`…) plus the largest set of data and AI libraries.',
          '- Runs everywhere, easy to try things out.',
          '',
          '**Weaknesses**',
          '- Slow for pure CPU work, and one thread runs Python at a time (the [[gil|GIL]]).',
          '- Uses more memory per value.',
          '- Many mistakes are found only when the code runs (dynamic typing), so tests matter more.',
          '- Not native in browsers or on phones.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Most Big Tech interviews let you choose the language, and Python is the most popular choice because the code is short. But interviewers expect you to **know the cost of the built-ins** you use: `x in list` is O(n), `x in set` is O(1), `sorted` is O(n log n), `list.pop(0)` is O(n). If they ask “how would this work in Java?”, mention fixed-size ints, `HashMap`, `ArrayList` and `PriorityQueue`.',
      },
      {
        type: 'exercise',
        id: 'to-int32',
        title: 'Store it like Java would',
        prompt: 'Return what a 32-bit signed `int` in Java or C would hold after storing `n`: keep `n` modulo 2³², and turn values of 2³¹ or more into negatives. The result must be between −2³¹ and 2³¹ − 1.',
        starter: `def to_int32(n):
    # your code here
    pass`,
        tests: `assert to_int32(5) == 5
assert to_int32(-1) == -1
assert to_int32(2 ** 31 - 1) == 2 ** 31 - 1
assert to_int32(2 ** 31) == -2 ** 31
assert to_int32(2 ** 32 + 7) == 7
assert to_int32(-2 ** 31 - 1) == 2 ** 31 - 1`,
        hint: '`n % 2 ** 32` gives a value from 0 to 2³² − 1 (also for negative n). Then subtract 2³² if it is 2³¹ or more.',
        solution: `def to_int32(n):
    n = n % 2 ** 32
    if n >= 2 ** 31:
        n -= 2 ** 32
    return n`,
      },
      {
        type: 'exercise',
        id: 'big-factorial',
        title: 'A factorial too big for Java',
        prompt: 'Return `n!` (1 × 2 × … × n) using a loop. Java’s 64-bit `long` overflows after 20!, but Python ints just grow.',
        starter: `def factorial(n):
    # your code here
    pass`,
        tests: `assert factorial(0) == 1
assert factorial(5) == 120
assert factorial(20) == 2432902008176640000
assert factorial(25) == 15511210043330985984000000`,
        hint: 'Start with `result = 1` and multiply by every number from 2 to n.',
        solution: `def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Name two jobs where Python is a top choice, and two where it is not.', answer: 'Top: AI / data, backend APIs, scripts. Not: phone apps, browser front-end, game engines, ultra-low-latency systems.' },
          { question: 'What does `-7 // 2` give in Python, and `-7 / 2` (ints) in Java?', answer: 'Python: -4 (rounds down). Java: -3 (rounds towards zero).' },
          { question: 'Which language in the table has no garbage collector and no manual free?', answer: 'Rust: the compiler frees memory from ownership rules.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python FAQ: What is Python good for?', url: `${PY}/faq/general.html#what-is-python-good-for` },
      { label: 'Java spec §4.2.2: integer operations (overflow)', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.2' },
      { label: 'The Rust Book: What is ownership?', url: 'https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html' },
      { label: 'A Tour of Go: goroutines', url: 'https://go.dev/tour/concurrency/1' },
      { label: 'MDN: JavaScript execution model', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model' },
      { label: 'NumPy: What is NumPy?', url: 'https://numpy.org/doc/stable/user/whatisnumpy.html' },
    ],
  },
]
