import type { ChoiceQuestion, LessonTest } from '../types'
import { PRINT, choice } from './helpers'

// Day tests for the Week 0 syntax lessons (Monday–Wednesday). Same shape as tests/python.ts;
// the second question of every concept is in PYTHON_SYNTAX_VARIANTS below.

function alt(concept: string, question: string, options: string[], explain: string, code?: string): ChoiceQuestion {
  return { id: `${concept}-b`, concept, question, options, answer: 0, explain, code }
}

export const PYTHON_SYNTAX_TESTS: Record<string, LessonTest> = {
  'py-syntax-if': {
    choice: [
      choice('compile-first', 'A file starts with `print("start")`, and line 5 is `if x > 0` (the colon is missing). What happens when you run it?',
        ['Nothing is printed: Python reports a `SyntaxError` before it runs any line', '`start` is printed, then a `SyntaxError` at line 5', '`start` is printed and line 5 is skipped', 'Python adds the colon and runs the file'],
        'Python first compiles the **whole file**, and a missing colon is a syntax error. So the program never starts and line 1 never runs.'),
      choice('indent-block', PRINT, ['b', 'a\nb', 'a', 'nothing is printed'],
        '`print("a")` is indented, so it belongs to the `if` block, which is skipped because `x > 0` is false. `print("b")` is back at the left edge: it is outside the block and always runs.',
        'x = -1\nif x > 0:\n    print("a")\nprint("b")'),
      choice('elif-first', PRINT, ['big', 'bigger', 'big\nbigger', 'small'],
        'In an `if / elif / else` chain only the **first** true branch runs. `x > 5` is already true, so `elif x > 10` is never even checked. Put the most specific condition first.',
        'x = 15\nif x > 5:\n    print("big")\nelif x > 10:\n    print("bigger")\nelse:\n    print("small")'),
      choice('falsy-values', PRINT, ['False True False True', 'False False False False', 'False False False True', 'True True False True'],
        'Only **empty** or zero values are [[falsy]]. `"0"` is a string with one character and `[0]` is a list with one item, so both are [[truthy]].',
        'print(bool(""), bool("0"), bool([]), bool([0]))'),
      choice('zero-valid', PRINT, ['not found', 'found at 0', 'found at 1', 'None'],
        '`find` returns `0` — a valid index — but `if i:` treats `0` as false. When `0` or `""` can be a real answer, write `if i is not None:`.',
        'def find(nums, t):\n    return nums.index(t) if t in nums else None\n\ni = find([7, 8], 7)\nif i:\n    print("found at", i)\nelse:\n    print("not found")'),
      choice('and-or-value', PRINT, ['x 4 []', 'True True False', 'x 3 []', '0 4 []'],
        '`and` / `or` give back **one of their values**, not always a bool. `0 or "x"`: `0` is falsy → `"x"`. `3 and 4`: `3` is truthy → `4`. `[] or []`: the first is falsy → the second.',
        'print(0 or "x", 3 and 4, [] or [])'),
      choice('short-circuit', PRINT, ['False', 'f ran\nFalse', 'f ran\nTrue', 'True'],
        '`False and …` is false whatever comes next, so Python never calls `f()` — this is [[short-circuit evaluation]]. `and` gives back the first falsy value, `False`.',
        'def f():\n    print("f ran")\n    return True\n\nprint(False and f())'),
      choice('or-bug', PRINT, ['yes', 'no', 'SyntaxError', 'TypeError'],
        'Python reads `x == 1 or 2` as `(x == 1) or 2`. `x == 1` is False, so the result is `2`, which is truthy. The condition is **always** true. Write `x in (1, 2)`.',
        'x = 5\nif x == 1 or 2:\n    print("yes")\nelse:\n    print("no")'),
      choice('chained', PRINT, ['True True False', 'True False False', 'SyntaxError', 'True True True'],
        '`a < b < c` means `a < b and b < c`. So `1 < x > 3` is `1 < 5 and 5 > 3` (True), and `10 > x < 2` is `10 > 5 and 5 < 2` (False).',
        'x = 5\nprint(1 < x < 10, 1 < x > 3, 10 > x < 2)'),
      choice('precedence', PRINT, ['True True', 'False True', 'True False', 'False False'],
        '`not` is done first, then `and`, then `or`. So the first is `True or (False and False)` → True, and the second is `(not True) or True` → True.',
        'print(True or False and False, not True or True)'),
      choice('cond-expr', PRINT, ['zero', 'pos', 'neg', 'SyntaxError'],
        'Conditional expressions can be chained: `a if c1 else b if c2 else d`. `n > 0` is false, `n < 0` is false, so the last value is used. Keep it to two levels — after that, `if / elif` reads better.',
        'n = 0\nprint("pos" if n > 0 else "neg" if n < 0 else "zero")'),
    ],
    code: [
      {
        id: 'clamp',
        title: 'Clamp a value',
        prompt: 'Return `x` limited to the range `[lo, hi]`: below `lo` gives `lo`, above `hi` gives `hi`, otherwise `x`. Use `if / elif / else` (no `min` / `max`).',
        starter: `def clamp(x, lo, hi):
    # your code here
    pass`,
        tests: `assert clamp(5, 0, 10) == 5
assert clamp(-3, 0, 10) == 0
assert clamp(42, 0, 10) == 10
assert clamp(0, 0, 10) == 0
assert clamp(10, 0, 10) == 10`,
        hint: 'Two checks and an `else`: `if x < lo`, `elif x > hi`, `else`.',
        solution: `def clamp(x, lo, hi):
    if x < lo:
        return lo
    elif x > hi:
        return hi
    else:
        return x`,
      },
      {
        id: 'ticket-price',
        title: 'Ticket price',
        prompt: 'Return the ticket price: under 3 years old → `0` (always free); under 12 → `5`; 65 or older → `6`; everyone else → `10`. On a weekend, add `2` to every ticket that is not free. Think about the order of the checks first.',
        starter: `def ticket_price(age, is_weekend):
    # your code here
    pass`,
        tests: `assert ticket_price(2, True) == 0
assert ticket_price(2, False) == 0
assert ticket_price(3, False) == 5
assert ticket_price(11, True) == 7
assert ticket_price(12, False) == 10
assert ticket_price(64, True) == 12
assert ticket_price(65, False) == 6
assert ticket_price(80, True) == 8`,
        hint: 'Return `0` early for babies. Then choose the base price with `if / elif / else`, and add 2 with a separate `if is_weekend:`.',
        solution: `def ticket_price(age, is_weekend):
    if age < 3:
        return 0
    if age < 12:
        price = 5
    elif age >= 65:
        price = 6
    else:
        price = 10
    if is_weekend:
        price += 2
    return price`,
      },
    ],
    explain: [
      {
        id: 'truthiness',
        question: 'What does `if x:` really check in Python? List the falsy values, show where this style is useful, and give one case where `if x:` is a bug.',
        points: [
          'Python calls `bool(x)`: the value does not need to be True / False',
          'Falsy: `False`, `None`, `0`, `0.0`, empty `""`, `[]`, `{}`, `set()`, `()`',
          'Everything else is truthy, including `"0"`, `[0]` and `" "`',
          'Useful: `if nums:` / `while queue:` mean “not empty”',
          'Bug: when 0 or "" is a valid value (index 0, score 0) → use `is not None`',
        ],
        answer: '`if x:` asks Python for `bool(x)`, so any value can be a condition. False, None, zero (0, 0.0) and every empty collection — "", [], {}, set(), () — are falsy; everything else is truthy, even "0", [0] or a string with one space. This makes code short: `if nums:` means “the list is not empty” and `while queue:` means “there is still work”. The bug appears when a falsy value is a real answer: a search that returns index 0, or a score of 0. `if index:` would treat “found at 0” as “not found”, so there I write `if index is not None:`.',
      },
      {
        id: 'and-or-explain',
        question: 'Explain how `and` and `or` are evaluated in Python: what they return, when the right side is skipped, how this protects code from errors, and why `if x == 1 or 2:` is always true.',
        points: [
          '`a and b`: if `a` is falsy return `a` and skip `b`, else return `b`',
          '`a or b`: if `a` is truthy return `a` and skip `b`, else return `b`',
          'They return one of the operands, not always a bool (`name or "guest"`)',
          'Guard pattern: `i < len(nums) and nums[i] > 0` — no IndexError',
          '`x == 1 or 2` is `(x == 1) or 2`; `2` is truthy → always true; use `x in (1, 2)`',
        ],
        answer: '`and` and `or` stop as soon as the answer is known. `a and b` returns `a` if `a` is falsy — without running `b` — and otherwise returns `b`. `a or b` returns `a` if it is truthy, otherwise `b`. So they return one of the two values, which is why `name or "guest"` gives a default. Because the right side may never run, I can guard it: in `i < len(nums) and nums[i] > 0` the index is only read when it is in range, so there is no IndexError. The classic bug `if x == 1 or 2:` is read as `(x == 1) or 2`; when the comparison is False the result is `2`, which is truthy, so the branch always runs. The fix is `if x in (1, 2):`.',
      },
    ],
  },

  'py-for-loops': {
    choice: [
      choice('iter-protocol', 'What does a `for` loop do with the list before the first round, and how does it know when to stop?',
        ['It calls `iter()` once, then `next()` before every round, until `next()` raises `StopIteration`', 'It reads `len()` and counts an index from 0', 'It copies the list and pops items from the copy', 'It calls `next()` on the list itself until it returns `None`'],
        'This is the iterator protocol. The list only makes an [[iterator]]; the iterator gives one item per `next()` call and raises `StopIteration` at the end, which the `for` loop catches quietly.'),
      choice('loop-var-assign', PRINT, ['[1, 2, 3]', '[11, 12, 13]', '[1, 2, 13]', 'TypeError'],
        'Every round does `x = next(it)`. `x += 10` makes a new int and moves only the name `x`; the list still holds the old numbers. Use `nums[i] += 10` or a comprehension.',
        'nums = [1, 2, 3]\nfor x in nums:\n    x += 10\nprint(nums)'),
      choice('range-stop', PRINT, ['[2, 4, 6] [3, 2, 1]', '[2, 4, 6, 8] [3, 2, 1, 0]', '[2, 4, 6] [2, 1, 0]', '[2, 4, 6, 8] []'],
        '`stop` is never included, in either direction. `range(2, 8, 2)` stops before 8; `range(3, 0, -1)` stops before 0. To count down to 0, write `range(3, -1, -1)`.',
        'print(list(range(2, 8, 2)), list(range(3, 0, -1)))'),
      choice('range-once', PRINT, ['6', '3', 'It never ends', '4'],
        '`range(len(nums))` is evaluated **once**, when the loop starts: it is `range(3)`. Appending inside the body does not make the loop longer, so it runs 3 times and adds 3 zeros.',
        'nums = [1, 2, 3]\nfor i in range(len(nums)):\n    nums.append(0)\nprint(len(nums))'),
      choice('used-up', PRINT, ['2 0', '2 2', '0 0', 'TypeError'],
        '`zip` returns an [[iterator]]. The first `list(z)` uses it up; the second gets nothing. Save `list(zip(...))` if you need the pairs twice.',
        'z = zip([1, 2], "ab")\nprint(len(list(z)), len(list(z)))'),
      choice('remove-while', PRINT, ['[1, 2, 3]', '[2, 3]', '[1, 1, 2, 3]', 'RuntimeError'],
        'The iterator keeps an index. Round 1 (index 0) removes the first `1`, and everything moves left. Round 2 reads index 1 — that is now `2`, so the second `1` is skipped. Build a new list instead: `[x for x in nums if x != 1]`.',
        'nums = [1, 1, 2, 3]\nfor x in nums:\n    if x == 1:\n        nums.remove(x)\nprint(nums)'),
      choice('break-inner', PRINT, ['0 0|1 0|2 0|', '0 0|', '0 0|0 1|', '0 0|1 0|1 1|2 0|'],
        '`break` leaves only the **inner** loop. Every outer round prints `j = 0`, breaks at `j = 1`, and the outer loop goes on.',
        'for i in range(3):\n    for j in range(3):\n        if j == 1:\n            break\n        print(i, j, end="|")'),
      choice('for-else', PRINT, ['all odd', 'nothing is printed', '7', 'SyntaxError'],
        'The loop `else` runs when the iterator was used up without a `break`. No even number was found, so there was no `break`.',
        'for n in [3, 5, 7]:\n    if n % 2 == 0:\n        break\nelse:\n    print("all odd")'),
      choice('unpack-target', PRINT, ['a,bb,', 'a1,b2,', '1,2,', 'ValueError'],
        '`d.items()` gives `(key, value)` tuples, and `for k, v in …` [[unpacking|unpacks]] each one. `"a" * 1` is `"a"`, `"b" * 2` is `"bb"`.',
        'd = {"a": 1, "b": 2}\nfor k, v in d.items():\n    print(k * v, end=",")'),
      choice('nested-cost', 'The outer loop goes over `n` items, and the inner loop goes over all `m` items each time. How many times does the inner body run?',
        ['n × m', 'n + m', 'max(n, m)', 'n'],
        'The inner loop runs **completely** for every outer round: m rounds, n times. With n = m that is n² — the reason a brute-force pair search is O(n²).'),
    ],
    code: [
      {
        id: 'chunks',
        title: 'Split into chunks',
        prompt: 'Split a list into pieces of size `k` (the last piece can be shorter): `chunks([1, 2, 3, 4, 5], 2)` → `[[1, 2], [3, 4], [5]]`. Use `range` with a step.',
        starter: `def chunks(items, k):
    # your code here
    pass`,
        tests: `assert chunks([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]
assert chunks([1, 2, 3], 3) == [[1, 2, 3]]
assert chunks([], 4) == []
assert chunks([1, 2, 3], 5) == [[1, 2, 3]]`,
        hint: '`for start in range(0, len(items), k):` gives 0, k, 2k … Slice `items[start:start + k]`.',
        solution: `def chunks(items, k):
    out = []
    for start in range(0, len(items), k):
        out.append(items[start:start + k])
    return out`,
      },
      {
        id: 'my-zip',
        title: 'Write your own zip',
        prompt: 'Return a list of pairs from two [[iterable|iterables]], stopping at the shorter one — like `list(zip(a, b))`, but without `zip`. Use `iter()` and `next()`, and stop when **either** side raises `StopIteration`.',
        starter: `def my_zip(a, b):
    # your code here
    pass`,
        tests: `assert my_zip([1, 2, 3], "ab") == [(1, "a"), (2, "b")]
assert my_zip([], [1]) == []
assert my_zip(range(3), range(10, 13)) == [(0, 10), (1, 11), (2, 12)]
assert my_zip((x for x in [1, 2]), [5, 6, 7]) == [(1, 5), (2, 6)]`,
        hint: 'Make two iterators, then `while True:` with `try: x = next(ia); y = next(ib)` and `except StopIteration: break`.',
        solution: `def my_zip(a, b):
    ia, ib = iter(a), iter(b)
    out = []
    while True:
        try:
            x = next(ia)
            y = next(ib)
        except StopIteration:
            break
        out.append((x, y))
    return out`,
      },
    ],
    explain: [
      {
        id: 'for-protocol',
        question: 'Explain step by step what Python does when it runs `for x in nums:`. Then use that to explain why removing items from `nums` inside the loop skips some of them.',
        points: [
          '`iter(nums)` is called once and gives an iterator',
          'Every round: `x = next(it)`, then the body runs',
          '`StopIteration` ends the loop (and the `else` block runs if there was no `break`)',
          'The `x` is just an assignment: changing `x` does not change the list',
          'A list iterator keeps an index; removing an item shifts the rest left, so the next one is skipped',
        ],
        answer: 'First Python calls `iter(nums)` once to get an iterator, an object that remembers the position. Then, every round, it calls `next()` on it, assigns the result to `x` and runs the body. When `next()` raises `StopIteration` the loop ends quietly, and the loop’s `else` runs if no `break` happened. Because `x` is only assigned, `x = x * 2` changes the name, not the list. A list iterator works by index: after giving index 0 it will give index 1. If the body removes the item at index 0, every item moves one place left, so the item that was at index 1 is now at index 0 and is never visited. That is why I build a new list (or loop over a copy) instead of removing while looping.',
      },
      {
        id: 'iterable-iterator',
        question: 'What is the difference between an iterable and an iterator? Why can you loop over a list twice but not over the result of `zip()`?',
        points: [
          'Iterable: something you can call `iter()` on (list, str, dict, range)',
          'Iterator: the object `iter()` returns; it has `__next__` and remembers its position',
          'A list gives a fresh iterator for every `for`, so it can be looped many times',
          '`zip`, `map`, `enumerate`, files and generators are iterators themselves: used up after one pass',
          'Fix: keep the values with `list(...)` if you need them twice',
        ],
        answer: 'An iterable is anything you can loop over: Python can call `iter()` on it — a list, a string, a dict, a range. An iterator is the object that `iter()` returns: it gives the next item on every `next()` call and remembers where it is. A list is an iterable but not an iterator, so every `for` loop asks it for a new iterator that starts from the beginning — you can loop over it as many times as you like. `zip`, `map`, `enumerate`, file objects and generators are iterators themselves: `iter()` on them returns the same object, so after one full pass they are empty. If I need the pairs twice, I store them with `pairs = list(zip(a, b))`.',
      },
    ],
  },

  'py-while-loops': {
    choice: [
      choice('check-at-top', PRINT, ['6', 'nothing is printed', '6\n11', '1'],
        'The condition is checked only at the top. `n < 3` is true, so the **whole** body runs: `n` becomes 6 and is printed. Then the check fails and the loop ends.',
        'n = 1\nwhile n < 3:\n    n += 5\n    print(n)'),
      choice('count-rounds', PRINT, ['6', '7', '5', '50'],
        '100 → 50 → 25 → 12 → 6 → 3 → 1: six halvings. Halving until 1 takes about log₂(n) rounds — this is why binary search is O(log n).',
        'n, steps = 100, 0\nwhile n > 1:\n    n //= 2\n    steps += 1\nprint(steps)'),
      choice('continue-trap', 'What happens when this code runs?',
        ['It never ends: at `i == 2`, `continue` skips `i += 1`', 'It stops with `i == 5`', 'It stops with `i == 2`', '`SyntaxError`'],
        '`continue` jumps straight back to the condition. At `i == 2` the step `i += 1` is skipped, `i` stays 2 and the condition stays true forever — an [[infinite loop]]. Move the step before `continue`.',
        'i = 0\nwhile i < 5:\n    if i == 2:\n        continue\n    i += 1'),
      choice('while-else', PRINT, ['done 3', 'nothing is printed', 'done 2', 'done 4'],
        'The loop ends because the condition became false (no `break`), so the `else` block runs. At that moment `n` is 3.',
        'n = 0\nwhile n < 3:\n    n += 1\nelse:\n    print("done", n)'),
      choice('while-true', 'Python has no `do … while`. How do you write a loop that always runs at least once and checks its exit in the middle of the body?',
        ['`while True:` with `if …: break` where the check belongs', '`while False:`', '`for _ in range(1):`', '`while None:`'],
        '`while True` always enters the body; the `break` sits exactly where the exit decision is made (after reading the input, for example).'),
      choice('truthy-condition', PRINT, ['6 []', '3 [1, 2]', '0 [1, 2, 3]', 'IndexError'],
        '`while stack:` means “while the list is not empty”. Each round pops one item, so the loop ends after 3 rounds with an empty list — no `IndexError`.',
        'stack = [1, 2, 3]\ntotal = 0\nwhile stack:\n    total += stack.pop()\nprint(total, stack)'),
      choice('float-condition', 'Why can `x = 0.0` followed by `while x != 1.0: x += 0.1` run forever?',
        ['`0.1` is not exact in binary, so `x` jumps over `1.0` and is never exactly equal to it', 'Floats cannot be compared with `!=`', '`+=` does not work on floats', '`while` does not accept float conditions'],
        'After ten steps `x` is `0.9999999999999999`, then `1.0999999999999999`: it never hits `1.0` exactly. Use `<` or count with an int.'),
      choice('walrus', PRINT, ['3,2,', '3,2,0,', '3,2,0,5,', 'SyntaxError'],
        'The [[walrus operator]] stores `data[i]` in `x` and gives the value to `!=`. When `x` is 0 the condition is false and the loop ends before printing it.',
        'data = [3, 2, 0, 5]\ni = 0\nwhile (x := data[i]) != 0:\n    print(x, end=",")\n    i += 1'),
      choice('bs-progress', 'In binary search with `while lo <= hi`, why are the updates `lo = mid + 1` and `hi = mid - 1`, not `lo = mid` and `hi = mid`?',
        ['So the range gets smaller every round; with `lo = mid` it can stop shrinking and loop forever', 'Only to make the code a little faster', 'Because `mid` can be a float', 'So the loop always runs exactly log n + 1 times'],
        '`mid` was already checked, so it can be dropped. With `lo = hi = 3`, `mid` is 3, and `lo = mid` changes nothing — the same round repeats forever.'),
      choice('for-vs-while', 'Which task is the most natural fit for `while` rather than `for`?',
        ['Two pointers moving toward each other until they meet', 'Printing every item of a list', 'Adding up `range(100)`', 'Building a list of squares'],
        '`while` is for “repeat until a condition changes” when the step depends on the data. Walking over every item is what `for` does best.'),
    ],
    code: [
      {
        id: 'digital-root',
        title: 'Digital root',
        prompt: 'Add up the digits of `n`, then the digits of the result, and so on, until one digit is left: `38 → 3 + 8 = 11 → 1 + 1 = 2`. Use two `while` loops (one for “until one digit”, one for “sum the digits”) and no strings.',
        starter: `def digital_root(n):
    # your code here
    pass`,
        tests: `assert digital_root(38) == 2
assert digital_root(0) == 0
assert digital_root(7) == 7
assert digital_root(99999) == 9
assert digital_root(123456789) == 9`,
        hint: 'Outer: `while n >= 10:`. Inner: `total = 0; while n > 0: total += n % 10; n //= 10`, then `n = total`.',
        solution: `def digital_root(n):
    while n >= 10:
        total = 0
        while n > 0:
            total += n % 10
            n //= 10
        n = total
    return n`,
      },
      {
        id: 'happy-number',
        title: 'Happy number',
        prompt: 'Replace `n` by the sum of the squares of its digits, again and again. `n` is happy if this reaches `1`. If it never reaches 1, the numbers repeat in a cycle — so stop when you see a number for the second time. Return `True` or `False`.',
        starter: `def is_happy(n):
    # your code here
    pass`,
        tests: `assert is_happy(19) is True
assert is_happy(1) is True
assert is_happy(2) is False
assert is_happy(7) is True
assert is_happy(4) is False`,
        hint: '`seen = set()`; `while n != 1 and n not in seen:` add `n` to `seen`, then compute the next `n` with a digit loop. Return `n == 1`.',
        solution: `def is_happy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        total = 0
        while n > 0:
            d = n % 10
            total += d * d
            n //= 10
        n = total
    return n == 1`,
      },
    ],
    explain: [
      {
        id: 'loop-ends',
        question: 'You wrote a `while` loop in an interview. How do you show the interviewer that it always ends and that its answer is right? Use binary search as the example.',
        points: [
          'Name what gets smaller every round (a counter, `hi - lo`, the length of a list)',
          'It is a whole number that cannot go below a limit, so the loop must stop',
          'Name the invariant: the rule that is true before and after every round',
          'Binary search: range `[lo, hi]` shrinks because `mid` is dropped (`mid ± 1`); the target, if present, is always inside it',
          'Check edge cases: empty input, one or two elements, the condition false at the start',
        ],
        answer: 'I name two things. First, progress: something that gets smaller every round and cannot go below a limit. In binary search that is the size of the range `hi - lo + 1`: each round either returns or sets `lo = mid + 1` or `hi = mid - 1`, so the range loses at least one element and the loop must stop. Second, the invariant: a rule that is true before every round. Here it is “if the target is in the list, it is inside `[lo, hi]`”, which stays true because I only drop halves that cannot contain it. When the loop stops with `lo > hi`, the range is empty, so returning -1 is correct. Then I quickly trace the edge cases — an empty list and two elements — because that is where `lo = mid` style bugs loop forever.',
      },
      {
        id: 'choose-loop',
        question: 'How do `for` and `while` differ in the way they run? When do you choose each one, and what bugs are typical for each?',
        points: [
          '`for` asks an iterator for the next item; it stops by itself at `StopIteration`',
          '`while` only re-checks a condition at the top of each round; you must change the state yourself',
          'Use `for` to walk over a collection or a known count',
          'Use `while` when the stop depends on a condition / the step depends on the data (two pointers, binary search, digits, BFS)',
          'Typical bugs: `for` — changing the list while looping; `while` — forgetting the step or `continue` skipping it (infinite loop)',
        ],
        answer: 'A `for` loop gets an iterator once and calls `next()` every round; it ends by itself when the iterator raises StopIteration, so it cannot forget a step. A `while` loop knows nothing about collections: it checks its condition at the top of each round and repeats while it is truthy, so I am responsible for changing the variables it depends on. I use `for` when I walk over every item or a known number of steps, and `while` when I stop on a condition and the step depends on the data — two pointers, binary search, peeling digits with `n //= 10`, or `while queue:` in BFS. The typical `for` bug is changing the list I am looping over; the typical `while` bug is an infinite loop, from a missing step or a `continue` that jumps over it.',
      },
    ],
  },
}

export const PYTHON_SYNTAX_VARIANTS: Record<string, ChoiceQuestion[]> = {
  'py-syntax-if': [
    alt('compile-first', 'Line 1 is `print("start")`, and line 5 is `print(totl)` (a typo for `total`). What happens when you run the file?',
      ['`start` is printed, then a `NameError` when line 5 runs', 'Nothing is printed: the `NameError` is found before anything runs', 'A `SyntaxError` before anything runs', 'Line 5 prints `None`'],
      'A typo in a name is still valid syntax, so the file compiles. A `NameError` only happens when Python **reaches** that line — unlike a `SyntaxError`, which stops the file before line 1.'),
    alt('indent-block', PRINT, ['in 0\nin 1\nout', 'in 0\nout\nin 1\nout', 'in 0\nin 1', 'out'],
      'Only the indented line belongs to the loop. `print("out")` is back at the left edge, so it runs once, after the loop.',
      'for i in range(2):\n    print("in", i)\nprint("out")'),
    alt('elif-first', PRINT, ['big\nbigger', 'big', 'bigger', 'nothing is printed'],
      'Two separate `if` statements are checked **independently**, so both can run. Only an `elif` chain stops after the first true branch.',
      'x = 15\nif x > 5:\n    print("big")\nif x > 10:\n    print("bigger")'),
    alt('falsy-values', 'Which of these values is truthy?',
      ['`" "` (a string with one space)', '`0.0`', '`{}`', '`None`'],
      'A string is falsy only when it is **empty**. One space is a character, so `" "` is truthy. `0.0`, an empty dict and `None` are all [[falsy]].'),
    alt('zero-valid', 'A function returns an index, or `None` when nothing is found. Which check is correct?',
      ['`if i is not None:`', '`if i:`', '`if i == True:`', '`if i > 0:`'],
      'Index `0` is a valid answer but it is falsy, so `if i:` and `if i > 0:` both miss it. `is not None` only rejects the real “not found” value.'),
    alt('and-or-value', PRINT, ['guest 5', 'True 1', 'guest 0', 'False 5'],
      '`""` is falsy, so `name or "guest"` gives back `"guest"` — a string, not a bool. Its length is 5.',
      'name = ""\nprint(name or "guest", len(name or "guest"))'),
    alt('short-circuit', PRINT, ['False', 'IndexError', 'True', 'None'],
      '`len(nums) > 0` is False, so `and` stops there and `nums[0]` is never read. This guard is the standard way to avoid an `IndexError`.',
      'nums = []\nprint(len(nums) > 0 and nums[0] > 5)'),
    alt('or-bug', 'Which line correctly checks that `x` is 1 or 2?',
      ['`if x in (1, 2):`', '`if x == 1 or 2:`', '`if x == (1 or 2):`', '`if x == 1 and x == 2:`'],
      '`x == 1 or 2` is always true. `(1 or 2)` is just `1`, so the third line only checks for 1. `x` cannot be 1 and 2 at once. `in` with a tuple says exactly what you mean.'),
    alt('chained', 'What does `0 <= i < n` mean in Python?',
      ['`0 <= i and i < n`, with `i` worked out only once', '`(0 <= i) < n`: a bool compared with `n`', 'It is a `SyntaxError`', '`0 <= i or i < n`'],
      'Comparisons chain like in maths. It is the clean way to check that an index is inside a list of length `n`.'),
    alt('precedence', PRINT, ['True', 'False', 'TypeError', '-1'],
      '`==` is done before `not`, so this is `not (1 == 2)` → `not False` → `True`.',
      'print(not 1 == 2)'),
    alt('cond-expr', PRINT, ['5', 'f ran\n5', '1', 'f ran\n1'],
      'In `a if cond else b`, only the chosen side runs. The condition is True, so `f()` is never called.',
      'def f():\n    print("f ran")\n    return 1\n\nx = 5 if True else f()\nprint(x)'),
  ],
  'py-for-loops': [
    alt('iter-protocol', PRINT, ['a b done', 'a b None', 'StopIteration', 'a b b'],
      '`next(it, default)` returns the default instead of raising `StopIteration` when the iterator is empty. The third call has nothing left, so it gives `"done"`.',
      'it = iter("ab")\nprint(next(it), next(it), next(it, "done"))'),
    alt('loop-var-assign', PRINT, ['[[1, 0], [2, 0]]', '[[1], [2]]', '[[1], [2], 0]', '[[1, 0], [2]]'],
      '`row` is a name for the **same** inner list, and `append` changes that list in place — so here the change is visible. Assigning to the loop variable (`row = …`) would not be.',
      'rows = [[1], [2]]\nfor row in rows:\n    row.append(0)\nprint(rows)'),
    alt('range-stop', PRINT, ['[] 4', '[5, 4, 3, 2] 4', '[] 3', '[5, 4, 3, 2] 3'],
      'With the default step `+1`, `range(5, 1)` cannot go from 5 up to 1, so it is empty. `range(0, 10, 3)` is `0, 3, 6, 9`: 4 numbers.',
      'print(list(range(5, 1)), len(range(0, 10, 3)))'),
    alt('range-once', 'Why does `for i in range(10**12): break` run instantly and use almost no memory?',
      ['`range` stores only start, stop and step and computes each value when asked', 'Python keeps big ranges in a cache', 'The loop is skipped because the number is too big', '`range` builds the list in another thread'],
      'A `range` is a small object, not a list. It works out each number on demand, so its size does not depend on its length.'),
    alt('used-up', PRINT, ['[1, 2, 3] []', '[1, 2, 3] [2, 1, 3]', '[3, 2, 1] []', '[1, 2, 3] [1, 2, 3]'],
      '`reversed()` returns an [[iterator]]. `sorted(r)` reads it to the end, so `list(r)` afterwards is empty.',
      'nums = [3, 1, 2]\nr = reversed(nums)\nprint(sorted(r), list(r))'),
    alt('remove-while', 'You loop over a dict with `for k in d:` and delete keys inside the body. What happens?',
      ['`RuntimeError: dictionary changed size during iteration`', 'The deleted keys are skipped safely', 'Python loops over a copy automatically', 'It works, but the order is reversed'],
      'Dicts and sets check their size during a loop and stop you. Loop over a copy, `for k in list(d):`, or build a new dict with a comprehension.'),
    alt('break-inner', 'A search with two nested loops has found the answer. How do you stop **both** loops?',
      ['Put the loops in a function and `return`', 'Write `break` twice in the inner loop', 'Use `continue` in the outer loop', 'Use `break 2`'],
      '`break` only leaves the innermost loop, and the second `break` is never reached. Python has no `break 2`. `return` leaves the whole function at once.'),
    alt('for-else', PRINT, ['else', 'loop\nelse', 'nothing is printed', 'loop'],
      'The list is empty, so the body never runs. The iterator ended without a `break`, so the `else` block runs.',
      'for n in []:\n    print("loop")\nelse:\n    print("else")'),
    alt('unpack-target', PRINT, ['yx,wz,', 'xy,zw,', 'ValueError', 'yz,xw,'],
      'Each item is a 2-letter string, so `a, b` unpacks its two letters. `b + a` swaps them.',
      'for a, b in ["xy", "zw"]:\n    print(b + a, end=",")'),
    alt('nested-cost', 'The inner loop is `for j in range(i + 1, n)` inside `for i in range(n)`. What is the time complexity?',
      ['O(n²) — about n²/2 rounds', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
      'The rounds are (n−1) + (n−2) + … + 1 ≈ n²/2. Halving does not change the Big O: it is still O(n²).'),
  ],
  'py-while-loops': [
    alt('check-at-top', PRINT, ['10', '5', '11', 'nothing is printed'],
      'The condition `10 < 5` is false at the start, so the body runs **zero** times and `x` stays 10.',
      'x = 10\nwhile x < 5:\n    x += 1\nprint(x)'),
    alt('count-rounds', PRINT, ['12', '9', '10', '3'],
      '`i` goes 0 → 3 → 6 → 9 → 12. At 9 the condition is still true, so one more round runs and `i` passes 10. A `while` stops **after** the condition fails, not at the limit.',
      'i = 0\nwhile i < 10:\n    i += 3\nprint(i)'),
    alt('continue-trap', PRINT, ['[1, 3, 4, 5]', '[0, 1, 3, 4]', '[1, 2, 3, 4, 5]', '[1]'],
      'Here the step `i += 1` comes **before** `continue`, so the loop always moves forward. `continue` only skips appending 2.',
      'i, out = 0, []\nwhile i < 5:\n    i += 1\n    if i == 2:\n        continue\n    out.append(i)\nprint(out)'),
    alt('while-else', PRINT, ['2', 'done\n2', 'done\n3', '3'],
      'The loop is left with `break` at `n == 2`, so the `else` block does **not** run.',
      'n = 0\nwhile n < 3:\n    n += 1\n    if n == 2:\n        break\nelse:\n    print("done")\nprint(n)'),
    alt('while-true', PRINT, ['-2', '2', '0', '6'],
      '`n` goes 10 → 6 → 2 → −2. The check comes **after** the subtraction, so the loop stops only once `n` is already below 0.',
      'n = 10\nwhile True:\n    n -= 4\n    if n < 0:\n        break\nprint(n)'),
    alt('truthy-condition', PRINT, ['2,1,0,', '3,2,1,', '2,1,', '2,1,0,-1,'],
      '`while s:` runs while the string is not empty. The last round makes `s` empty and still prints `0`; then the check fails.',
      's = "abc"\nwhile s:\n    s = s[1:]\n    print(len(s), end=",")'),
    alt('float-condition', PRINT, ['11', '10', '9', 'It never ends'],
      'Ten times `0.1` is `0.9999999999999999`, which is still `< 1.0`, so one more round runs. Even `<` gives surprises with floats — count with an int when the number of steps matters.',
      'x = 0.0\nsteps = 0\nwhile x < 1.0:\n    x += 0.1\n    steps += 1\nprint(steps)'),
    alt('walrus', 'What does `(n := len(items)) > 10` do?',
      ['Stores `len(items)` in `n` and compares it with 10, in one expression', 'Compares `n` with `len(items)`', '`SyntaxError`: `:=` is not Python', 'Checks whether `n` points to `items`'],
      'The [[walrus operator]] (Python 3.8+) assigns and gives the value at the same time, so `n` can be used later without calling `len` again.'),
    alt('bs-progress', PRINT, ['3 3', '3 2', '2 3', '3 4'],
      'Round 1: mid 1 (3 < 7) → lo = 2. Round 2: mid 2 (5 < 7) → lo = 3. Round 3: mid 3 finds 7. The range shrinks every round, so the loop must end.',
      'nums = [1, 3, 5, 7]\nlo, hi, rounds = 0, len(nums) - 1, 0\nwhile lo <= hi:\n    rounds += 1\n    mid = (lo + hi) // 2\n    if nums[mid] == 7:\n        break\n    elif nums[mid] < 7:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(mid, rounds)'),
    alt('for-vs-while', 'You wrote `i = 0`, `while i < len(nums): print(nums[i]); i += 1`. What is better?',
      ['`for x in nums: print(x)` — shorter, and it cannot forget the step', '`while True:` with a `break`', 'Recursion', 'Nothing: `while` is always faster'],
      'A step of exactly 1 over every item is the job of `for`. It removes the index, the `+= 1` and the chance of an infinite loop.'),
  ],
}
