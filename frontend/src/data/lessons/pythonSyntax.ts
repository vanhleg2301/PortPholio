import type { Lesson } from './types'

// Week 0, Monday–Wednesday: the syntax under everything else — how Python reads a file,
// how `if` decides, and what `for` and `while` really do on every round.

const PY = 'https://docs.python.org/3'
const md = (...lines: string[]) => lines.join('\n')
const CODDY = { label: 'Coddy — extra practice', url: 'https://coddy.tech/' }
const yt = (label: string, id: string) => ({ label, url: `https://www.youtube.com/watch?v=${id}` })

export const PYTHON_SYNTAX_LESSONS: Lesson[] = [
  {
    id: 'py-syntax-if',
    title: 'How Python reads code: blocks and if / else',
    summary: 'Indentation is part of the syntax, `if` asks one question — “is this truthy?” — and the first true branch wins. Learn what `and` / `or` really return and the classic `x == 1 or 2` bug.',
    minutes: 40,
    blocks: [
      {
        type: 'text',
        md: md(
          '## Statements, expressions and blocks',
          'A Python file is a list of [[statement|statements]]. Python runs them **from top to bottom, one at a time**.',
          '',
          '- An [[expression]] **gives a value**: `2 + 3`, `x > 0`, `len(s)`, `name.upper()`.',
          '- A statement **does something**: `x = 5`, `if …:`, `for …:`, `return x`, `import math`.',
          '',
          'A line that ends with a colon `:` (`if`, `elif`, `else`, `for`, `while`, `def`) opens a **block**. The block is every line under it with **more** [[indentation]]. The block ends when the indentation goes back. There are no `{ }` brackets: the spaces **are** the syntax. Use 4 spaces and never mix tabs and spaces.',
          '',
          'Before line 1 runs, Python first reads (compiles) the **whole file**. So a `SyntaxError` on line 50 stops the program before line 1 prints anything. A `NameError` or `TypeError` is different: it happens only when Python reaches that line.',
        ),
      },
      {
        type: 'code',
        id: 'blocks',
        caption: 'The last print is outside the if block, so it always runs. Change x to -1 and run again.',
        code: `x = 7
if x > 0:
    print("positive")      # inside the if block
    print("still inside")  # same indentation = same block
print("always runs")       # indentation went back: block ended

# An empty block is not allowed. Use pass as a placeholder.
if x > 100:
    pass

# Python compiles the whole file first: one syntax error and nothing runs.
source = "print('line 1 runs?')\\nif x > 0\\n    print('hi')"
try:
    compile(source, "demo.py", "exec")
except SyntaxError as e:
    print("SyntaxError on line", e.lineno, "- line 1 never ran")`,
      },
      {
        type: 'text',
        md: md(
          '## if / elif / else: the first true branch wins',
          'Python checks the conditions **from top to bottom**. It runs the block of the **first** condition that is true and then **jumps past the whole chain**. The conditions below it are not even checked. `else` runs only when no condition was true.',
          '',
          'So the order matters. Put the **most specific** case first: `score >= 90` before `score >= 80`, and `n % 15 == 0` before `n % 3 == 0` in FizzBuzz.',
          '',
          'Many `if` lines (without `elif`) are different: each one is checked separately, so more than one block can run.',
        ),
      },
      {
        type: 'diagram',
        caption: 'One if / elif / else chain: exactly one block runs (or none, when there is no else).',
        mermaid: `flowchart TD
  A{"if cond1"} -- truthy --> B["run block 1"]
  A -- falsy --> C{"elif cond2"}
  C -- truthy --> D["run block 2"]
  C -- falsy --> E["else: run block 3"]
  B --> F["next line after the chain"]
  D --> F
  E --> F`,
      },
      {
        type: 'code',
        id: 'elif-order',
        code: `def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:      # only checked when score < 90
        return "B"
    elif score >= 50:
        return "C"
    else:
        return "F"

print(grade(95), grade(85), grade(60), grade(10))   # A B C F

# Wrong order: the first condition catches everything >= 50.
def grade_bad(score):
    if score >= 50:
        return "C"
    elif score >= 90:      # never reached for 95
        return "A"
    return "F"

print(grade_bad(95))        # C

# Separate ifs: every one is checked.
n = 15
if n % 3 == 0:
    print("divisible by 3")
if n % 5 == 0:
    print("divisible by 5")`,
      },
      {
        type: 'text',
        md: md(
          '## Truthiness: what `if x:` really asks',
          'The condition does not have to be `True` or `False`. Python calls `bool(x)` on it. Values that count as false are called [[falsy]]; everything else is [[truthy]].',
          '',
          '| Falsy values | Why |',
          '| --- | --- |',
          '| `False`, `None` | “no” and “nothing” |',
          '| `0`, `0.0` | zero |',
          '| `""`, `[]`, `{}`, `set()`, `()`, `range(0)` | empty collections |',
          '',
          'So `if nums:` means **“if the list is not empty”**, and `while queue:` means “while there is still work”. This is the normal Python style.',
          '',
          'Be careful when `0` or `""` is a **valid** value: `if index:` is false for index `0`. Write `if index is not None:` instead.',
        ),
      },
      {
        type: 'code',
        id: 'truthiness',
        code: `for value in [0, 1, -3, "", "0", [], [0], None, {}, " "]:
    print(repr(value), "->", bool(value))
# "0" and [0] and " " are truthy: they are not empty!

nums = []
if not nums:
    print("empty list")

index = 0                    # a valid position
if index:
    print("found")           # does NOT print: 0 is falsy
if index is not None:
    print("found at", index) # correct check`,
      },
      {
        type: 'text',
        md: md(
          '## Comparisons and `and` / `or` / `not`',
          '- A comparison (`==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `is`) gives `True` or `False`.',
          '- Comparisons can be **chained**: `0 <= i < n` means `0 <= i and i < n`. This is the clean way to check that an index is inside a list.',
          '- `not` is done first, then `and`, then `or`. Use brackets when you mix them.',
          '',
          '`and` and `or` use [[short-circuit evaluation]]: they stop as soon as the answer is known, and they **return one of the two values**, not always `True` / `False`:',
          '',
          '| Expression | Gives back |',
          '| --- | --- |',
          '| `a and b` | `a` if `a` is falsy (and `b` is **never run**), otherwise `b` |',
          '| `a or b` | `a` if `a` is truthy (and `b` is **never run**), otherwise `b` |',
          '',
          'This is why `if i < len(nums) and nums[i] > 0:` is safe: when `i` is too big, `nums[i]` is never run, so there is no `IndexError`.',
        ),
      },
      {
        type: 'code',
        id: 'short-circuit',
        code: `def check(label, value):
    print("checking", label)
    return value

print(check("A", False) and check("B", True))   # B is never checked
print(check("C", True) or check("D", True))     # D is never checked

print(0 or "default", "" or None, [1] and "ok")  # default None ok
name = ""
print(name or "guest")                          # guest

nums = [5, 8]
i = 5
print(i < len(nums) and nums[i] > 0)            # False, no IndexError
print(0 <= i < len(nums))                       # chained: False`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: '`if x == 1 or 2:` is **always true**. Python reads it as `(x == 1) or 2`, and `2` is truthy. Write `if x == 1 or x == 2:` or, better, `if x in (1, 2):`.',
      },
      {
        type: 'text',
        md: md(
          '## Conditional expression and `match`',
          '`if` is a statement, but `a if condition else b` is an **expression**: it gives a value, so you can use it inside other code: `sign = -1 if n < 0 else 1`. Only the chosen side is run.',
          '',
          'Python 3.10+ also has `match`. It compares one value against **patterns** from top to bottom; the first one that fits wins, and `case _:` catches everything else. It is useful for commands and shapes of data, but in interviews `if / elif` is enough.',
        ),
      },
      {
        type: 'code',
        id: 'cond-expr-match',
        code: `n = -12
sign = -1 if n < 0 else 1
print(sign, "even" if n % 2 == 0 else "odd")   # -1 even

def describe(command):
    match command.split():
        case ["go", direction]:
            return "moving " + direction
        case ["quit"] | ["exit"]:
            return "bye"
        case _:
            return "unknown command"

print(describe("go north"), "|", describe("exit"), "|", describe("dance"))`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Use the [[short-circuit evaluation|short-circuit]] rule out loud in interviews: “I check `r < rows` **before** `grid[r][c]`, so the index is never out of range.” In grid and two-pointer problems the order of the conditions is what makes the code safe.',
      },
      {
        type: 'exercise',
        id: 'leap-year',
        title: 'Leap year',
        prompt: 'Return `True` if `year` is a leap year. The rule: divisible by 4, **except** years divisible by 100, **unless** they are also divisible by 400 (2000 is a leap year, 1900 is not). Use `if / elif / else` and think about the order.',
        starter: `def is_leap(year):
    # your code here
    pass`,
        tests: `assert is_leap(2024) is True
assert is_leap(2023) is False
assert is_leap(1900) is False
assert is_leap(2000) is True
assert is_leap(2100) is False`,
        hint: 'Check the most specific rule first: `% 400`, then `% 100`, then `% 4`.',
        solution: `def is_leap(year):
    if year % 400 == 0:
        return True
    elif year % 100 == 0:
        return False
    elif year % 4 == 0:
        return True
    else:
        return False`,
      },
      {
        type: 'exercise',
        id: 'safe-get',
        title: 'Safe value from a grid',
        prompt: 'Return `grid[r][c]`, or `default` when `(r, c)` is outside the grid (negative indexes count as outside too). Do it in **one** `return` line with a chained comparison and `and` — the short-circuit must stop before an `IndexError`.',
        starter: `def safe_get(grid, r, c, default=0):
    # your code here
    pass`,
        tests: `g = [[1, 2], [3, 4]]
assert safe_get(g, 0, 1) == 2
assert safe_get(g, 1, 0) == 3
assert safe_get(g, 2, 0) == 0
assert safe_get(g, 0, -1) == 0
assert safe_get(g, -1, 0, "x") == "x"`,
        hint: 'Check `0 <= r < len(grid) and 0 <= c < len(grid[0])` first; put the result in a conditional expression.',
        solution: `def safe_get(grid, r, c, default=0):
    return grid[r][c] if 0 <= r < len(grid) and 0 <= c < len(grid[0]) else default`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'A file has a SyntaxError on its last line. Does line 1 run?', answer: 'No. Python compiles the whole file before running anything.' },
          { question: 'What does `[] or "empty"` give?', answer: '`"empty"`: `[]` is falsy, so `or` gives back the second value.' },
          { question: 'In an `if / elif` chain, can two blocks run?', answer: 'No. Only the first true branch runs; the rest is skipped.' },
          { question: 'Why is `if x == 1 or 2:` a bug?', answer: 'It means `(x == 1) or 2`, and `2` is truthy, so it is always true. Use `x in (1, 2)`.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §4.1: if statements', url: `${PY}/tutorial/controlflow.html#if-statements` },
      { label: 'Python docs: Truth value testing', url: `${PY}/library/stdtypes.html#truth-value-testing` },
      { label: 'Python reference: Boolean operations', url: `${PY}/reference/expressions.html#boolean-operations` },
      { label: 'Python Tutorial §4.7: match statements', url: `${PY}/tutorial/controlflow.html#match-statements` },
      CODDY,
    ],
  },
  {
    id: 'py-for-loops',
    title: 'for loops: how iteration really works',
    summary: '`for` is not a counter: it asks an iterator for the next item until there is none. Once you see this, the classic bugs — changing the loop variable, removing items while looping, a used-up zip — make sense.',
    minutes: 45,
    videos: [yt('Corey Schafer: Loops and Iterations (11 min)', '6iF8Xb7Z3wQ'), yt('Corey Schafer: Iterators and Iterables (13 min)', 'jTYiNjvnHZY')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## What `for` really does',
          'In C or Java, `for` counts with an index. In Python, `for x in items:` works on any [[iterable]] — a list, a string, a dict, a file, a `range` — and it never uses an index. Underneath, it does this:',
          '',
          '1. Call `iter(items)` **once** to get an [[iterator]]: an object that remembers where it is.',
          '2. Call `next()` on it. The result is **assigned** to `x`, then the body runs.',
          '3. Repeat step 2. When `next()` has nothing left, it raises `StopIteration`, and the loop ends quietly.',
          '',
          'This is called the **iterator protocol**. A list does not know about loops; it only knows how to make an iterator.',
        ),
      },
      {
        type: 'code',
        id: 'iter-next',
        caption: 'The while loop at the bottom is what `for` does for you.',
        code: `nums = [10, 20, 30]
it = iter(nums)
print(next(it), next(it), next(it))   # 10 20 30
try:
    next(it)
except StopIteration:
    print("StopIteration: nothing left")

# for x in nums: print(x)   is the same as:
it = iter(nums)
while True:
    try:
        x = next(it)
    except StopIteration:
        break
    print(x)`,
      },
      {
        type: 'diagram',
        caption: 'One for loop: one iter() call, then next() before every round.',
        mermaid: `flowchart TD
  A["it = iter(items)<br/>(once)"] --> B{"next(it)"}
  B -- "gives a value" --> C["x = value"]
  C --> D["run the body"]
  D --> B
  B -- "raises StopIteration" --> E["loop ends<br/>(else block runs if there was no break)"]`,
      },
      {
        type: 'text',
        md: md(
          '## The loop variable is just an assignment',
          'Every round does `x = next(it)`. So `x` is only a name for the current item. Changing `x` in the body (`x = x * 2`) moves the name — **the list does not change**, and the next round overwrites `x` anyway.',
          '',
          'To change the list, write to it by index (`nums[i] = …`) or build a new list with a [[comprehension]].',
          '',
          'The target can [[unpacking|unpack]]: `for k, v in d.items():`, `for i, (a, b) in enumerate(pairs):`. It is the same unpacking as `a, b = pair`.',
        ),
      },
      {
        type: 'code',
        id: 'loop-var',
        code: `nums = [1, 2, 3]
for x in nums:
    x = x * 10          # only moves the name x
print(nums)             # [1, 2, 3]  unchanged

for i in range(len(nums)):
    nums[i] *= 10       # writes into the list
print(nums)             # [10, 20, 30]

scores = {"an": 9, "binh": 7}
for name, score in scores.items():      # each item is a (key, value) tuple
    print(name, score)

for i, (a, b) in enumerate([(1, 2), (3, 4)]):
    print(i, a + b)`,
      },
      {
        type: 'text',
        md: md(
          '## `range` does not build a list',
          '`range(start, stop, step)` gives `start, start + step, …` and stops **before** `stop`. `range(5)` is `0 … 4`. For backwards: `range(n - 1, -1, -1)`.',
          '',
          'A `range` object only stores three numbers and computes each value when asked. So `range(10**12)` uses almost no memory, and `x in range(…)` is O(1) for ints.',
          '',
          'The `range(len(nums))` expression is evaluated **once**, at the start. If the body appends to `nums`, the loop still runs only the original number of times.',
        ),
      },
      {
        type: 'code',
        id: 'range',
        code: `print(list(range(5)), list(range(2, 10, 3)), list(range(4, -1, -1)))
big = range(10**12)
print(len(big), 999_999 in big)          # instant, no huge list

nums = [1, 2]
for i in range(len(nums)):               # range(2) is fixed now
    nums.append(nums[i] * 10)
print(nums)                              # [1, 2, 10, 20]`,
      },
      {
        type: 'text',
        md: md(
          '## An iterator can be used only once',
          'A **list** is iterable: each `for` asks it for a **new** iterator, so you can loop over it many times. But `zip`, `map`, `filter`, `enumerate`, `reversed` and file objects **are** iterators: they remember their position and, once they reach the end, they stay empty.',
          '',
          'If you need the values twice, keep them in a list: `pairs = list(zip(a, b))`.',
        ),
      },
      {
        type: 'code',
        id: 'used-up',
        code: `pairs = zip("ab", [1, 2])
print(list(pairs))     # [('a', 1), ('b', 2)]
print(list(pairs))     # []  the iterator is used up

nums = [1, 2, 3]
print(sum(nums), sum(nums))       # 6 6  a list gives a fresh iterator every time
it = iter(nums)
print(sum(it), sum(it))           # 6 0`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Never add or remove items in the list you are looping over. The iterator only keeps an **index**: when you remove an item, everything moves one place left, and the next item is skipped. For a dict or set, Python stops you with `RuntimeError: … changed size during iteration`. Loop over a copy (`for x in nums[:]`) or, better, build a new list.',
      },
      {
        type: 'code',
        id: 'remove-while-looping',
        code: `nums = [2, 4, 6, 7]
for x in nums:
    if x % 2 == 0:
        nums.remove(x)
print(nums)            # [4, 7]  4 was skipped!

nums = [2, 4, 6, 7]
nums = [x for x in nums if x % 2 != 0]
print(nums)            # [7]  correct

counts = {"a": 1, "b": 0}
try:
    for k in counts:
        if counts[k] == 0:
            del counts[k]
except RuntimeError as e:
    print("RuntimeError:", e)`,
      },
      {
        type: 'text',
        md: md(
          '## Nested loops, `break` and `else`',
          '- The inner loop runs **completely** for every round of the outer loop: `n × m` rounds in total, O(n·m) time.',
          '- `break` leaves **only the innermost** loop. `continue` jumps to the next round of the innermost loop.',
          '- The `else` of a loop runs when the iterator was used up — that is, **no `break`** happened.',
          '- To leave two loops at once, put them in a function and `return`.',
        ),
      },
      {
        type: 'code',
        id: 'nested',
        code: `def find(grid, target):
    for r, row in enumerate(grid):
        for c, value in enumerate(row):
            if value == target:
                return (r, c)       # leaves both loops
    return None

grid = [[1, 2], [3, 4]]
print(find(grid, 3), find(grid, 9))     # (1, 0) None

for row in grid:
    for value in row:
        if value == 2:
            break                       # only the inner loop stops
    print("row done:", row)             # still runs for every row

for n in [4, 6, 8]:
    if n % 2:
        print("found an odd number")
        break
else:
    print("no odd number")              # no break happened`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'If you are asked “how does a for loop work in Python?”, answer with the iterator protocol: `iter()` once, `next()` every round, `StopIteration` at the end. Then add the consequence: that is why modifying a list while looping over it skips items.',
      },
      {
        type: 'exercise',
        id: 'manual-sum',
        title: 'A for loop without for',
        prompt: 'Return the sum of any [[iterable]] **without** `for` and without `sum()`. Use `iter()`, `next()` and a `while` loop, and stop on `StopIteration` — exactly what `for` does inside.',
        starter: `def manual_sum(items):
    # your code here
    pass`,
        tests: `assert manual_sum([1, 2, 3]) == 6
assert manual_sum([]) == 0
assert manual_sum(range(101)) == 5050
assert manual_sum(x * 2 for x in [1, 2]) == 6`,
        hint: '`it = iter(items)`, then `while True:` with `try: x = next(it)` and `except StopIteration: break`.',
        solution: `def manual_sum(items):
    total = 0
    it = iter(items)
    while True:
        try:
            x = next(it)
        except StopIteration:
            break
        total += x
    return total`,
      },
      {
        type: 'exercise',
        id: 'double-in-place',
        title: 'Double every number, in place',
        prompt: 'Double every number of the list **in place** (the same list object must change) and return nothing. Remember: `x = x * 2` on the loop variable does not change the list.',
        starter: `def double_in_place(nums):
    for x in nums:
        x = x * 2`,
        tests: `a = [1, 2, 3]
b = a
assert double_in_place(a) is None
assert a == [2, 4, 6] and b is a
c = []
double_in_place(c)
assert c == []`,
        hint: 'Loop over `range(len(nums))` (or `enumerate`) and write `nums[i] = …`.',
        solution: `def double_in_place(nums):
    for i in range(len(nums)):
        nums[i] *= 2`,
      },
      {
        type: 'exercise',
        id: 'count-pairs',
        title: 'Count pairs with a sum',
        prompt: 'Return how many pairs of positions `i < j` have `nums[i] + nums[j] == target`. Use two nested loops: the inner one starts at `i + 1`, so no pair is counted twice. What is the time complexity?',
        starter: `def count_pairs(nums, target):
    # your code here
    pass`,
        tests: `assert count_pairs([1, 2, 3, 4], 5) == 2
assert count_pairs([1, 1, 1], 2) == 3
assert count_pairs([], 3) == 0
assert count_pairs([5], 10) == 0`,
        hint: '`for i in range(len(nums)):` then `for j in range(i + 1, len(nums)):`. It is O(n²) — later you will do it in O(n) with a hash map.',
        solution: `def count_pairs(nums, target):
    count = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                count += 1
    return count`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What three steps does `for x in items` do?', answer: '`iter(items)` once, then `x = next(it)` and the body every round, until `next` raises `StopIteration`.' },
          { question: 'Why does `for x in nums: x += 1` not change `nums`?', answer: '`x` is just a name for the current item. Assigning to it moves the name; the list is never touched.' },
          { question: 'Why is the second `list(z)` empty after `z = zip(a, b); list(z)`?', answer: '`zip` returns an iterator, and an iterator is used up after one pass.' },
          { question: 'Does `break` in an inner loop stop the outer loop?', answer: 'No, only the innermost loop. Use a function and `return` to leave both.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §4.2: for statements', url: `${PY}/tutorial/controlflow.html#for-statements` },
      { label: 'Python Tutorial §9.8: Iterators', url: `${PY}/tutorial/classes.html#iterators` },
      { label: 'Python reference: The for statement', url: `${PY}/reference/compound_stmts.html#the-for-statement` },
      { label: 'Python docs: range', url: `${PY}/library/stdtypes.html#ranges` },
      CODDY,
    ],
  },
  {
    id: 'py-while-loops',
    title: 'while loops: conditions, progress and loop control',
    summary: '`while` checks its condition before every round — never in the middle. Learn how to make sure a loop ends, the `while True` + `break` pattern, and when `while` beats `for` (two pointers, binary search, digits).',
    minutes: 40,
    videos: [yt('Corey Schafer: Loops and Iterations (11 min)', '6iF8Xb7Z3wQ')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## How `while` runs',
          '`while condition:` repeats three steps:',
          '',
          '1. Check the condition (with the same [[truthy]] rule as `if`).',
          '2. If it is falsy, leave the loop and go to the line after it.',
          '3. Otherwise run the **whole** body, then go back to step 1.',
          '',
          'Two facts follow. The condition is checked **only at the top**: if it becomes false in the middle of the body, the rest of the body still runs. And if the condition is false at the start, the body runs **zero** times.',
          '',
          'Unlike `for`, `while` does not walk over anything. **You** must change the variables the condition depends on.',
        ),
      },
      {
        type: 'code',
        id: 'while-basics',
        code: `n = 3
while n > 0:
    print("round with n =", n)
    n -= 1
    print("  n is now", n)       # runs even when n just became 0
print("after the loop, n =", n)

m = 0
while m > 0:
    print("never printed")       # condition false at the start: 0 rounds

queue = [1, 2, 3]
while queue:                     # truthiness: "while not empty"
    print("processing", queue.pop())`,
      },
      {
        type: 'diagram',
        caption: 'The condition is checked before every round, never in the middle of the body.',
        mermaid: `flowchart TD
  A{"condition truthy?"} -- yes --> B["run the whole body"]
  B --> A
  A -- no --> C["else block (if any)"]
  C --> D["next line"]
  B -- "break" --> D`,
      },
      {
        type: 'text',
        md: md(
          '## Every loop must make progress',
          'If nothing in the body moves the condition toward false, you get an [[infinite loop]]. Before you write a `while`, answer two questions:',
          '',
          '1. **What gets closer to the end every round?** A number that gets smaller (`n //= 10`), a gap that shrinks (`hi - lo`), a list that gets shorter.',
          '2. **What stays true every round?** This rule is the loop [[invariant]], and it is why the answer is correct when the loop stops.',
          '',
          'The classic bugs: forgetting `i += 1`, and `continue` **before** the `i += 1` — `continue` jumps straight back to the condition, so the step is skipped forever.',
        ),
      },
      {
        type: 'code',
        id: 'progress',
        caption: 'The bad version is stopped after 10 rounds so it cannot hang.',
        code: `nums = [3, -1, 4]

# Bug: continue skips i += 1, so i stays 1 forever.
i, rounds = 0, 0
while i < len(nums) and rounds < 10:      # guard only for this demo
    rounds += 1
    if nums[i] < 0:
        continue
    i += 1
print("stuck at i =", i, "after", rounds, "rounds")

# Fix: move forward before continue (or use a for loop).
i, total = 0, 0
while i < len(nums):
    x = nums[i]
    i += 1
    if x < 0:
        continue
    total += x
print("total =", total)                   # 7`,
      },
      {
        type: 'text',
        md: md(
          '## `while True` + `break`',
          'Python has no `do … while` loop. When the exit check belongs **in the middle** of the round — read, then check, then use — write `while True:` and `break` at the right place.',
          '',
          '`while` can also have an `else` block. Like `for … else`, it runs only when the loop ended because the condition became false, **not** because of `break`.',
          '',
          'The [[walrus operator]] `:=` assigns **and** gives the value, so it can sit inside the condition: `while (line := read()) != "":`.',
        ),
      },
      {
        type: 'code',
        id: 'while-true',
        code: `inputs = iter(["", "abc", "42", "7"])

while True:
    text = next(inputs)           # 1. read
    if text.isdigit():            # 2. check in the middle
        break
    print("not a number:", repr(text))
print("got", int(text))           # 42

data = iter(["a", "b", ""])
while (item := next(data)) != "":
    print("item", item)

n = 7
while n > 1:
    if n % 2 == 0:
        print("even found")
        break
    n -= 2
else:
    print("ended without break, n =", n)`,
      },
      {
        type: 'text',
        md: md(
          '## `for` or `while`?',
          '| Use | When | Example |',
          '| --- | --- | --- |',
          '| `for` | you walk over a collection or a known number of steps | every item of a list, `range(n)` |',
          '| `while` | you stop when a **condition** changes, and the step size depends on the data | [[two pointers]], binary search, digits of a number, `while queue:` in BFS |',
          '',
          'If you write `i = 0 … while i < len(nums): … i += 1` with a step of exactly 1, a `for` loop is shorter and cannot forget the step.',
        ),
      },
      {
        type: 'code',
        id: 'while-patterns',
        code: `def gcd(a, b):                 # Euclid: b gets smaller every round
    while b:
        a, b = b, a % b
    return a

def is_palindrome(s):          # two pointers move toward each other
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if s[lo] != s[hi]:
            return False
        lo += 1
        hi -= 1
    return True

def binary_search(nums, target):   # the gap hi - lo shrinks every round
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(gcd(48, 18), is_palindrome("racecar"), is_palindrome("ab"))   # 6 True False
print(binary_search([1, 3, 5, 7, 9], 7), binary_search([1, 3], 4))  # 3 -1`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Do not stop a loop with `!=` on floats: `x = 0.0; while x != 1.0: x += 0.1` never ends, because `0.1` is not exact and `x` jumps over `1.0`. Use `while x < 1.0`, or count with an int.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'In binary search, say why the loop ends: “`lo = mid + 1` or `hi = mid - 1` makes the range smaller every round, so it stops.” Writing `lo = mid` with `while lo < hi` and `mid = (lo + hi) // 2` can get stuck when `hi = lo + 1` — check the two-element case before you say you are done.',
      },
      {
        type: 'exercise',
        id: 'collatz',
        title: 'Collatz steps',
        prompt: 'Start with `n ≥ 1`. While `n` is not 1: if `n` is even, `n //= 2`, otherwise `n = 3 * n + 1`. Return the number of steps until `n` becomes 1. You cannot know the count in advance — that is a job for `while`.',
        starter: `def collatz_steps(n):
    # your code here
    pass`,
        tests: `assert collatz_steps(1) == 0
assert collatz_steps(2) == 1
assert collatz_steps(6) == 8
assert collatz_steps(27) == 111`,
        hint: '`steps = 0`, then `while n != 1:` change `n` and add 1 to `steps`.',
        solution: `def collatz_steps(n):
    steps = 0
    while n != 1:
        if n % 2 == 0:
            n //= 2
        else:
            n = 3 * n + 1
        steps += 1
    return steps`,
      },
      {
        type: 'exercise',
        id: 'binary-digits',
        title: 'Number to binary',
        prompt: 'Return the binary form of a non-negative int as a string, without `bin()` or `format()`: `10 → "1010"`, `0 → "0"`. Take the last bit with `% 2`, remove it with `//= 2`, and repeat while there is something left.',
        starter: `def to_binary(n):
    # your code here
    pass`,
        tests: `assert to_binary(0) == "0"
assert to_binary(1) == "1"
assert to_binary(10) == "1010"
assert to_binary(255) == "11111111"
assert to_binary(2 ** 40) == "1" + "0" * 40`,
        hint: 'Handle 0 first. Collect the bits in a list, then reverse it and `"".join` it at the end.',
        solution: `def to_binary(n):
    if n == 0:
        return "0"
    bits = []
    while n > 0:
        bits.append(str(n % 2))
        n //= 2
    return "".join(reversed(bits))`,
      },
      {
        type: 'exercise',
        id: 'first-repeat',
        title: 'First value seen twice',
        prompt: 'Read values from an [[iterator]] one by one with `next()` and return the **first** value that appears a second time. If the iterator ends without a repeat, return `None`. Use `while True` + `break` (or `return`).',
        starter: `def first_repeat(it):
    # your code here
    pass`,
        tests: `assert first_repeat(iter([3, 1, 4, 1, 5, 3])) == 1
assert first_repeat(iter([1, 2, 3])) is None
assert first_repeat(iter([])) is None
assert first_repeat(iter("abca")) == "a"`,
        hint: 'Keep a `seen` set. Inside `while True:`, get the next value with `try / except StopIteration: return None`.',
        solution: `def first_repeat(it):
    seen = set()
    while True:
        try:
            x = next(it)
        except StopIteration:
            return None
        if x in seen:
            return x
        seen.add(x)`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'The condition becomes false in the middle of the body. Does the rest of the body run?', answer: 'Yes. `while` checks the condition only at the top of each round.' },
          { question: 'Why can `continue` cause an infinite loop in a `while`?', answer: 'It jumps back to the condition, so a `i += 1` written after it is skipped.' },
          { question: 'When does the `else` of a `while` run?', answer: 'When the condition became false — not when the loop was left with `break`.' },
          { question: 'Name two problems where `while` is the natural choice.', answer: 'Two pointers, binary search, digit loops (`n //= 10`), Euclid’s gcd, BFS with `while queue:`.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python reference: The while statement', url: `${PY}/reference/compound_stmts.html#the-while-statement` },
      { label: 'Python Tutorial §4.4: break, continue and else on loops', url: `${PY}/tutorial/controlflow.html#break-and-continue-statements` },
      { label: 'Python reference: Assignment expressions (:=)', url: `${PY}/reference/expressions.html#assignment-expressions` },
      CODDY,
    ],
  },
]
