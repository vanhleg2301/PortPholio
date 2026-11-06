import type { LessonTest } from '../types'
import { PRINT, choice } from './helpers'

export const PYTHON_TESTS: Record<string, LessonTest> = {
  'py-variables': {
    choice: [
      choice('floor-neg', PRINT, ['-4 1', '-3 -1', '-3 1', '-4 -1'],
        '`//` is [[floor division]]: it always rounds **down**, so −3.5 becomes −4. Python then picks `%` so that `(a // b) * b + a % b == a`: `-4 * 2 + 1 == -7`. In C or Java the answer would be `-3 -1`, so be careful when you translate code.',
        'print(-7 // 2, -7 % 2)'),
      choice('rebind', PRINT, ['[1, 2]', '[1, 2, 3]', '[3]', 'TypeError'],
        '`a + [3]` builds a **new** list, and then the name `a` points to that new list. `b` still points to the old one. Assignment never changes the object a name pointed to before.',
        'a = [1, 2]\nb = a\na = a + [3]\nprint(b)'),
      choice('inplace', PRINT, ['[1, 2, 3]', '[1, 2]', '[3]', 'TypeError'],
        'For a list, `+=` changes the list **in place** (like `extend`). `a` and `b` are two names for the same list, so `b` sees the change. Compare it with the question about `a = a + [3]`: the result is different.',
        'a = [1, 2]\nb = a\na += [3]\nprint(b)'),
      choice('int-immutable', PRINT, ['10', '11', 'None', 'NameError'],
        'An `int` is [[immutable]]. `x += 1` cannot change the object `10`, so Python makes a new object `11` and moves the name `x` to it. `y` still points to `10`.',
        'x = 10\ny = x\nx += 1\nprint(y)'),
      choice('float-sum', PRINT, ['0.30000000000000004', '0.3', '0.30000000000000001', '0.2999999999999999'],
        'Floats are stored in binary. 0.1 and 0.2 have no exact binary form, just like 1/3 has no exact decimal form. The small errors add up, and Python shows the real stored value.',
        'print(0.1 + 0.2)'),
      choice('float-compare', 'Which is the safest way to check that two floats `a` and `b` are equal?',
        ['`abs(a - b) < 1e-9` (or `math.isclose(a, b)`)', '`a == b`', '`round(a) == round(b)`', '`int(a) == int(b)`'],
        'Compare with a small [[tolerance]]. `round` and `int` throw away too much: `round(0.4) == round(0.1)` is True, but the numbers are very different.'),
      choice('true-division', PRINT, ["<class 'float'>", "<class 'int'>", "<class 'bool'>", 'ZeroDivisionError'],
        '`/` **always** returns a float, even when the result is a whole number (`7 / 7 == 1.0`). Use `//` when you need an int, for example for an index: `mid = (lo + hi) // 2`.',
        'print(type(7 / 7))'),
      choice('big-int', 'What happens when you run `x = 2 ** 100` in Python?',
        ['It works: a Python `int` can be as big as memory allows', 'It raises `OverflowError`', 'It wraps around to a negative number', 'It becomes a float automatically'],
        'Python ints have [[arbitrary precision]]. In Java or C++, a 64-bit integer [[overflow|overflows]] after about 9.2 × 10¹⁸. Interviewers like it when you mention this.'),
      choice('int-of-str', 'What happens with `int("3.5")`?',
        ['`ValueError`: the text is not a whole number', 'It returns `3`', 'It returns `4`', 'It returns `3.5`'],
        '`int()` on a string only accepts whole-number text like `"42"`. For `"3.5"` you need `int(float("3.5"))`, which gives `3`.'),
      choice('truncate-vs-floor', PRINT, ['-3 -4.0', '-4 -4.0', '-3 -3.0', '-4 -3.0'],
        '`int()` cuts off the decimal part — it moves **toward zero** (−3.7 → −3). `//` rounds **down** (−3.7 → −4.0). For positive numbers they agree. For negative numbers they do not. With a float, `//` gives a float.',
        'print(int(-3.7), -3.7 // 1)'),
      choice('is-none', 'Why do Python programmers write `if x is None:` and not `if x == None:`?',
        ['There is only one `None` object, so `is` (same object) is exact and fast; `==` can be changed by a class', '`==` does not work with `None`', '`is` compares values and `==` compares types', 'There is no difference, it is only style'],
        '`is` checks **identity** (the same object). `==` checks **value**, and a class can define `==` in strange ways. `None` is a single object, so `is None` is always correct.'),
      choice('bool-int', PRINT, ['2', 'True', 'TrueTrue', 'TypeError'],
        '`bool` is a kind of `int`: `True` is 1 and `False` is 0. This is useful: `sum(x > 0 for x in nums)` counts the positive numbers.',
        'print(True + True)'),
    ],
    code: [
      {
        id: 'reverse-int',
        title: 'Reverse an integer',
        prompt: 'Return the digits of `n` in reverse order, and keep the sign: `123 → 321`, `-120 → -21`. Do not use strings — use `%` and `//`. Be careful: `%` and `//` act differently with negative numbers.',
        starter: `def reverse_int(n):
    # your code here
    pass`,
        tests: `assert reverse_int(123) == 321
assert reverse_int(-123) == -321
assert reverse_int(-120) == -21
assert reverse_int(0) == 0
assert reverse_int(5) == 5`,
        hint: 'Save the sign, work with `abs(n)`, and build the result with `r = r * 10 + n % 10`.',
        solution: `def reverse_int(n):
    sign = -1 if n < 0 else 1
    n = abs(n)
    r = 0
    while n > 0:
        r = r * 10 + n % 10
        n //= 10
    return sign * r`,
      },
      {
        id: 'digit-count',
        title: 'Count the digits',
        prompt: 'Return how many digits an integer has: `2026 → 4`, `0 → 1`, `-15 → 2`. Do not use strings — use `//`. Think about the special cases first: 0 and negative numbers.',
        starter: `def digit_count(n):
    # your code here
    pass`,
        tests: `assert digit_count(2026) == 4
assert digit_count(0) == 1
assert digit_count(-15) == 2
assert digit_count(10 ** 18) == 19
assert digit_count(9) == 1`,
        hint: 'Handle `0` first (it has 1 digit). Then use `abs(n)` and count how many times you can do `n //= 10` before `n` becomes 0.',
        solution: `def digit_count(n):
    if n == 0:
        return 1
    n = abs(n)
    count = 0
    while n > 0:
        n //= 10
        count += 1
    return count`,
      },
    ],
    explain: [
      {
        id: 'aliasing',
        question: 'An interviewer asks: “You wrote `b = a` and then changed `b`. Sometimes `a` changes too, sometimes it does not. Why?” Explain it with examples.',
        points: [
          'A variable is a name that points to an object; `b = a` copies the pointer, not the object',
          'Mutable objects (list, dict, set) can change in place, so both names see the change',
          'Immutable objects (int, str, tuple) cannot change; “changing” them makes a new object',
          'In-place operations (`append`, `+=` on a list) change the object; `b = b + [x]` makes a new one',
          'To copy: `a[:]` / `list(a)` (shallow) or `copy.deepcopy(a)` for nested lists',
        ],
        answer: 'In Python a variable is only a name that points to an object. `b = a` does not copy anything — now two names point to the same object. If the object is mutable, like a list, `b.append(4)` changes that one object, so `a` shows the change too. If the object is immutable, like an int or a string, it can never change: `b += 1` makes a new object and moves only `b` to it, so `a` stays the same. The same thing is true for lists when I rebind: `b = b + [4]` builds a new list. When I really need an independent copy, I use `a[:]` or `list(a)`, and `copy.deepcopy` if the list contains other lists.',
      },
      {
        id: 'floats',
        question: 'Why is `0.1 + 0.2 == 0.3` False in Python (and in almost every language)? How do you compare floats, and how would you store money?',
        points: [
          'Floats are binary (IEEE 754, 64 bits); 0.1 has no exact binary form',
          'Small rounding errors appear and add up',
          'Compare with a tolerance: `abs(a - b) < 1e-9` or `math.isclose`',
          'Store money as integer cents, or use `decimal.Decimal`',
        ],
        answer: 'A float is stored in binary with a fixed number of bits (IEEE 754 double). Many decimal numbers, like 0.1, have no exact binary form — like 1/3 in decimal — so the computer stores the closest value. The tiny errors in 0.1 and 0.2 add up to 0.30000000000000004. So I never compare floats with `==`; I check that the difference is very small, with `abs(a - b) < 1e-9` or `math.isclose`. For money, rounding errors are not acceptable, so I store whole cents in an int, or I use `decimal.Decimal`.',
      },
    ],
  },

  'py-strings': {
    choice: [
      choice('slice-basic', PRINT, ['ter iew', 'nte iew', 'ter view', 'terv ew'],
        '`s[2:5]` takes indexes 2, 3 and 4 — the stop index 5 is **not** included. `s[-3:]` starts 3 characters from the end and goes to the end.',
        's = "interview"\nprint(s[2:5], s[-3:])'),
      choice('slice-step', PRINT, ['cba ace', 'cba bdf', 'abc ace', 'cba ac'],
        'A step of `-1` walks backwards, so `[::-1]` reverses. A step of `2` takes every second character, starting at index 0: a, c, e.',
        'print("abc"[::-1], "abcdef"[::2])'),
      choice('split-sep', PRINT, ["['a', 'b', '', 'c']", "['a', 'b', 'c']", "['a,b,,c']", "['a', 'b', ',', 'c']"],
        'With a separator, `split` keeps **empty** pieces: there is nothing between the two commas, so you get `\'\'`. This matters when you read CSV data.',
        'print("a,b,,c".split(","))'),
      choice('split-none', PRINT, ["['a', 'b']", "['', 'a', '', 'b', '']", "[' a', ' b ']", "['a', '', 'b']"],
        '`split()` with **no** argument is special: it splits on any run of whitespace and drops empty pieces. That is why it is the best way to get the words of a sentence.',
        'print(" a  b ".split())'),
      choice('immutable-method', PRINT, ['hello', 'HELLO', 'None', 'Hello'],
        'String methods never change the string — strings are [[immutable]]. `s.upper()` returns a new string, and here nobody keeps it. You need `s = s.upper()`.',
        's = "hello"\ns.upper()\nprint(s)'),
      choice('concat-loop', 'Why can `s += ch` inside a loop of n steps cost O(n²)?',
        ['Each `+=` may copy the whole string into a new one, and the copies get longer and longer', 'Strings are stored as linked lists', 'Python checks the whole string for errors on every `+=`', 'It is O(n); `+=` is always cheap'],
        'Because strings are immutable, adding to a string can mean copying everything so far: 1 + 2 + … + n = O(n²) characters. CPython sometimes optimises this case, but you should not depend on it. Collect pieces in a list and call `"".join(parts)` once: O(n).'),
      choice('ord-diff', PRINT, ['3', '4', '100', "'d'"],
        '`ord` gives the character code: `a` is 97 and `d` is 100, so the difference is 3. `ord(ch) - ord("a")` turns `a…z` into `0…25` — the index for a 26-letter count list.',
        'print(ord("d") - ord("a"))'),
      choice('compare-str', PRINT, ['True True', 'False False', 'True False', 'False True'],
        'Strings are compared **character by character** by their codes. `"A"` (65) is smaller than `"a"` (97). `"10" < "9"` is True because `"1"` is smaller than `"9"` — the length does not matter. So never compare numbers as strings.',
        'print("Abc" < "abc", "10" < "9")'),
      choice('repeat', PRINT, ['pypypy 0', 'py3 0', "['py', 'py', 'py'] 0", 'pypypy 1'],
        '`*` repeats a sequence. An empty string has length 0.',
        'print("py" * 3, len(""))'),
      choice('find-index', 'Text `s` does not contain `"x"`. What do `s.find("x")` and `s.index("x")` do?',
        ['`find` returns `-1`; `index` raises `ValueError`', 'Both return `-1`', 'Both raise `ValueError`', '`find` returns `None`; `index` returns `-1`'],
        'Use `find` when “not found” is normal and you want to check `-1`. Use `index` when it should always be there and a missing value is a bug.'),
      choice('slice-out', 'What happens with `"Hello"[10:]` and with `"Hello"[10]`?',
        ['The slice gives `""`; the index raises `IndexError`', 'Both raise `IndexError`', 'Both give `""`', 'The slice raises `IndexError`; the index gives `""`'],
        'Slicing is forgiving: if the range is outside the string, you just get an empty string. Indexing one position outside the string is an error. This is why slices are handy at the edges of arrays.'),
      choice('join-cost', 'You have a list of pieces with total length n. What is the cost of `"".join(parts)`?',
        ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
        '`join` first adds up the lengths, makes the result once, and copies each piece one time. So the cost is O(n) for n characters in total.'),
    ],
    code: [
      {
        id: 'compress',
        title: 'String compression',
        prompt: 'Compress runs of the same character: `"aaabcccdd"` → `"a3b1c3d2"`. If the result is **not shorter** than the input, return the input. Build the result with a list and `join`.',
        starter: `def compress(s):
    # your code here
    pass`,
        tests: `assert compress("aaabcccdd") == "a3b1c3d2"
assert compress("abc") == "abc"
assert compress("") == ""
assert compress("aaaaaaaaaaaa") == "a12"`,
        hint: 'Walk with an index `i`. Move `j` forward while `s[j] == s[i]`. Add `s[i] + str(j - i)`, then set `i = j`.',
        solution: `def compress(s):
    parts, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        parts.append(s[i] + str(j - i))
        i = j
    out = "".join(parts)
    return out if len(out) < len(s) else s`,
      },
      {
        id: 'common-prefix',
        title: 'Longest common prefix',
        prompt: 'Return the longest [[prefix]] that all words share, or `""` if there is none (LeetCode 14).',
        starter: `def longest_common_prefix(words):
    # your code here
    pass`,
        tests: `assert longest_common_prefix(["flower", "flow", "flight"]) == "fl"
assert longest_common_prefix(["dog", "racecar", "car"]) == ""
assert longest_common_prefix(["alone"]) == "alone"
assert longest_common_prefix(["ab", "a"]) == "a"`,
        hint: 'Take the first word as the prefix. For each other word, make the prefix shorter until the word starts with it.',
        solution: `def longest_common_prefix(words):
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
    return prefix`,
      },
    ],
    explain: [
      {
        id: 'why-immutable',
        question: 'Why are strings immutable in Python? Give two benefits and one cost, and say how you deal with the cost.',
        points: [
          'Safe to share: two names can point to one string and nobody can change it',
          'Hashable: strings can be dict keys and set items (the hash never changes)',
          'Cost: every change makes a new string (copying)',
          'Fix: collect pieces in a list and `"".join` once; or use a list of characters and join at the end',
        ],
        answer: 'Because a string can never change, it is safe to share: many names can point to the same string, and nobody can break it by accident. It also means the hash of a string never changes, so strings can be dict keys and set items, and Python can store the hash and reuse it. The cost is that every “change” — `replace`, `upper`, `+=` — creates a new string and copies characters. In a loop that can become O(n²). So I collect the pieces in a list and call `"".join(parts)` once, or I turn the string into a list of characters, edit the list, and join it at the end.',
      },
      {
        id: 'palindrome-o1',
        question: 'Walk the interviewer through your Valid Palindrome solution: what does each step do, what is the time, and how much extra memory does it use? Where could it be improved?',
        points: [
          'Clean the string: keep only letters and digits (`isalnum`) and make them lower case',
          'Build the clean string with `"".join(...)`, not `+=` in a loop',
          'Compare it with its reverse `clean[::-1]`',
          'Time O(n): each step walks the string once',
          'Extra memory O(n): the clean string and its reverse are new strings — it could be reduced by comparing from both ends without building them',
        ],
        answer: 'First I clean the input: I keep only the characters where `isalnum()` is True and turn them into lower case, and I build the result with `"".join(...)` so it stays O(n). Then I compare the clean string with its reverse, `clean[::-1]`. If they are equal, it is a palindrome. Each step walks the string once, so the time is O(n). The extra memory is also O(n), because the clean string and its reversed copy are new strings — strings are immutable, so every change makes a new one. To use less memory, I could compare characters from both ends of the original string and skip the ones that are not letters or digits, without building any new string.',
      },
    ],
  },

  'py-lists': {
    choice: [
      choice('grid-trap', PRINT, ['[[1, 0], [1, 0]]', '[[1, 0], [0, 0]]', '[[1, 1], [0, 0]]', 'TypeError'],
        '`[[0] * 2] * 2` puts the **same** inner list in two places ([[aliasing]]). Changing `grid[0]` also changes `grid[1]`. Build grids with a comprehension: `[[0] * 2 for _ in range(2)]`.',
        'grid = [[0] * 2] * 2\ngrid[0][0] = 1\nprint(grid)'),
      choice('sort-none', PRINT, ['None', '[1, 2, 3]', '[3, 1, 2]', 'True'],
        '`list.sort()` sorts the list itself and returns `None`. This shows that it changes data in place. Use `sorted(a)` when you want a new list back.',
        'a = [3, 1, 2]\nb = a.sort()\nprint(b)'),
      choice('neg-slice', PRINT, ['3 [1, 2]', '1 [2, 3]', '3 [1, 2, 3]', '3 [3]'],
        '`a[-1]` is the last item. `a[:-1]` is everything **except** the last item.',
        'a = [1, 2, 3]\nprint(a[-1], a[:-1])'),
      choice('remove-while-loop', PRINT, ['[4, 8]', '[]', '[2, 4, 6, 8]', '[6, 8]'],
        'Removing items while you loop over the same list moves the other items left, so the loop **skips** the next one. Here 4 and 8 are skipped. Build a new list instead: `[x for x in nums if x % 2]`.',
        'nums = [2, 4, 6, 8]\nfor x in nums:\n    if x % 2 == 0:\n        nums.remove(x)\nprint(nums)'),
      choice('insert-front', 'What is the cost of `a.insert(0, x)` on a list with n items?',
        ['O(n): all items move one place to the right', 'O(1): Python keeps free space at the front', 'O(log n)', 'O(1) amortized, like append'],
        'A list only keeps free space at the **end**. Inserting at the front moves every item. For a queue, use `collections.deque`, which is O(1) at both ends.'),
      choice('amortized', 'Why is `append` O(1) “amortized” and not simply O(1)?',
        ['Sometimes the list is full and must copy everything into a bigger array, but this is rare, so the average cost per append stays O(1)', 'Python sorts the list after each append', 'The first append is O(n) and the rest are O(1)', 'Because of the garbage collector'],
        'When there is no free slot, Python allocates a bigger array (about 1.125× bigger plus a bit) and copies all items: O(n) for that one append. Because the size grows by a factor, n appends cause only O(n) copying in total, so the [[amortized]] cost is O(1).'),
      choice('tuple-mutable-inside', PRINT, ['(1, [2, 3, 4])', 'TypeError', '(1, [2, 3])', '(1, 2, 3, 4)'],
        'A tuple cannot change **which objects** it holds. But the list inside it is still mutable, so the list can grow. Because of this, `(1, [2, 3])` is **not** [[hashable]] and cannot be a dict key.',
        't = (1, [2, 3])\nt[1].append(4)\nprint(t)'),
      choice('stable-sort', PRINT, ["[('c', 1), ('b', 2), ('a', 2)]", "[('c', 1), ('a', 2), ('b', 2)]", "[('a', 2), ('b', 2), ('c', 1)]", "[('b', 2), ('a', 2), ('c', 1)]"],
        'Python’s sort is [[stable sort|stable]]: items with an equal key (`b` and `a` both have 2) keep their old order. You can sort by one field and then another, and the first order is kept for ties.',
        'pairs = [("b", 2), ("a", 2), ("c", 1)]\nprint(sorted(pairs, key=lambda p: p[1]))'),
      choice('shallow-copy', PRINT, ['[[1, 9], [2]]', '[[1], [2]]', '[[9], [2]]', '[[1, 9], [2, 9]]'],
        '`a[:]` is a **shallow** copy: a new outer list, but the inner lists are the same objects. Changing an inner list is visible through both. Use `copy.deepcopy(a)` to copy everything.',
        'a = [[1], [2]]\nb = a[:]\nb[0].append(9)\nprint(a)'),
      choice('membership', 'You must check 1,000,000 times whether a number is in a list of 100,000 numbers. What should you do?',
        ['Turn the list into a set once, then use `x in s` (O(1) on average each time)', 'Sort the list before each check', 'Use `x in list`; it is fast enough', 'Use `list.index(x)` inside try/except'],
        '`x in list` is O(n), so this would be about 10¹¹ steps. Building a set costs O(n) one time, and then each check is O(1) on average.'),
      choice('zip-short', PRINT, ["[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (3, None)]", 'ValueError', "[(1, 'a'), (2, 'b'), (3, '')]"],
        '`zip` stops at the **shortest** input. It does not raise an error, so a length mismatch can hide a bug. Python 3.10+ has `zip(a, b, strict=True)` to catch it.',
        'print(list(zip([1, 2, 3], "ab")))'),
    ],
    code: [
      {
        id: 'merge-sorted',
        title: 'Merge two sorted lists',
        prompt: 'Both lists are sorted. Return one sorted list with all items in **O(n + m)** — do not call `sort`. This is the merge step of merge sort.',
        starter: `def merge_sorted(a, b):
    # your code here
    pass`,
        tests: `assert merge_sorted([1, 4, 7], [2, 3, 9]) == [1, 2, 3, 4, 7, 9]
assert merge_sorted([], [1, 2]) == [1, 2]
assert merge_sorted([1, 1], [1]) == [1, 1, 1]
assert merge_sorted([5], []) == [5]`,
        hint: 'Two indexes `i` and `j`. Each step, append the smaller of `a[i]` and `b[j]`. At the end, add what is left with slices.',
        solution: `def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    return out + a[i:] + b[j:]`,
      },
      {
        id: 'dedupe-in-place',
        title: 'Remove duplicates in place',
        prompt: '`nums` is sorted. Change it **in place** so that the first `k` items are the unique values in order, and return `k` (LeetCode 26). Use O(1) extra memory — no new list, no set.',
        starter: `def remove_duplicates(nums):
    # your code here
    pass`,
        tests: `nums = [1, 1, 2, 3, 3, 3, 4]
k = remove_duplicates(nums)
assert k == 4 and nums[:k] == [1, 2, 3, 4], (k, nums)
empty = []
assert remove_duplicates(empty) == 0
one = [7]
assert remove_duplicates(one) == 1 and one == [7]`,
        hint: 'A “write” index `k` starts at 1. Walk `i` from 1: when `nums[i] != nums[k - 1]`, copy it to `nums[k]` and increase `k`.',
        solution: `def remove_duplicates(nums):
    if not nums:
        return 0
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return k`,
      },
    ],
    explain: [
      {
        id: 'list-growth',
        question: 'Explain how a Python list stores its items and what happens when you call `append`. Why is `append` O(1) amortized, while `insert(0, x)` and `x in list` are O(n)?',
        points: [
          'A list is a dynamic array: references stored next to each other in memory',
          'Index access is O(1) because the address can be computed',
          'There is spare space at the end; append writes into it',
          'When full, a bigger array is allocated and items are copied; growth by a factor makes the average O(1)',
          'Insert at the front shifts every item; `in` checks items one by one',
        ],
        answer: 'A list is a dynamic array: it stores references to its items next to each other in one block of memory. Because of that, `a[i]` is O(1) — Python can compute where item i is. The block has some free space at the end, so `append` usually just writes into the next free slot. When the block is full, Python allocates a bigger block and copies all references, which is O(n) for that one append. But the size grows by a factor, so this happens rarely, and the total cost of n appends is O(n) — O(1) amortized per append. `insert(0, x)` must move every item one place to the right, so it is O(n). And `x in list` has no index to use, so it compares items one by one: O(n).',
      },
      {
        id: 'tuple-vs-list',
        question: 'When would you choose a tuple instead of a list? Give real examples from interview problems or real work.',
        points: [
          'For fixed groups of values (records): a point `(x, y)`, an interval `(start, end)`',
          'To return several values from a function',
          'As dict keys or set items (if everything inside is hashable), e.g. a grid cell `(r, c)` in a visited set',
          'It cannot be changed by accident; slightly less memory',
        ],
        answer: 'I use a tuple when the group of values is fixed and has a meaning, like a record: a point `(x, y)`, an interval `(start, end)`, or `(value, index)` pairs. Functions return tuples for several results, like `divmod`. The most important case in interviews is keys: a tuple of hashable items is hashable, so I can put `(row, col)` in a `visited` set for grid BFS, or use a tuple of 26 counts as a dict key in Group Anagrams. A list cannot do this. Tuples are also safer, because nobody can change them by accident, and they use a little less memory. When the collection must grow or change, I use a list.',
      },
    ],
  },

  'py-dicts-sets': {
    choice: [
      choice('get-default', PRINT, ['None 0', 'KeyError', '0 0', 'None None'],
        '`get` never raises an error. Without a default it returns `None`; with a default it returns the default. `d["b"]` would raise `KeyError`.',
        'd = {"a": 1}\nprint(d.get("b"), d.get("b", 0))'),
      choice('list-key', 'What happens with `d = {[1, 2]: "x"}`?',
        ["`TypeError: unhashable type: 'list'`", 'It works, the key is the list', 'Python turns the list into a tuple', 'The key becomes `"[1, 2]"`'],
        'Dict keys must be [[hashable]]. A list can change, so its hash could change, and Python would look in the wrong slot. Use a tuple: `{(1, 2): "x"}`.'),
      choice('set-basics', PRINT, ['True 2', 'True 3', 'False 2', '1 2'],
        'A set keeps only one copy of each value, so `{1, 1, 2}` has 2 items. `in` on a set is O(1) on average.',
        's = {3, 1, 2}\nprint(1 in s, len({1, 1, 2}))'),
      choice('worst-case', '`x in my_set` is O(1) on average. When can it become O(n)?',
        ['When many keys have the same hash slot (collisions)', 'When the set has more than 1,000 items', 'When the values are strings', 'Never; it is always O(1)'],
        'If many keys land in the same slot ([[collision|collisions]]), Python must compare them one by one. With a good hash function this is very rare, so we say O(1) **average**, O(n) worst case. In an interview, saying this shows you really understand hash tables.'),
      choice('set-ops', PRINT, ['{2, 3} {1, 2, 5}', '{1, 2, 3, 4} {2}', '{2, 3} {1, 5}', '{1, 4} {1, 2, 5}'],
        '`&` is the intersection (items in both), `|` is the union (items in either).',
        'print({1, 2, 3} & {2, 3, 4}, {1, 2} | {2, 5})'),
      choice('count-pattern', PRINT, ["{'a': 2, 'b': 1}", "{'a': 1, 'b': 1}", 'KeyError', "{'b': 1, 'a': 2}"],
        '`counts.get(w, 0) + 1` is the classic counting pattern. A dict keeps keys in the order they were **first** added, so `a` comes first.',
        'counts = {}\nfor w in ["a", "b", "a"]:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)'),
      choice('two-sum-order', 'In Two Sum, why do we check `target - x in seen` **before** we add `x` to `seen`?',
        ['So that a number cannot pair with itself (for example `[3]` with target 6)', 'Because adding first is slower', 'Because the dict would lose the order', 'There is no reason; both orders always work'],
        'If you store `x` first, then `x = 3, target = 6` finds `3` — itself — and returns the same index twice. Checking first means `seen` only holds numbers **before** the current one. And `[3, 3]` still works, because the second 3 finds the first.'),
      choice('equal-keys', PRINT, ["{'a': 2} 1", "{'a': 1, 'a': 2} 2", "{'a': 1} 1", 'SyntaxError'],
        'A key can appear only once. When the same key is written twice, the **last** value wins.',
        'd = {"a": 1, "a": 2}\nprint(d, len(d))'),
      choice('mutate-while-iterating', 'What happens if you add new keys to a dict while you loop over it with `for k in d:`?',
        ['`RuntimeError: dictionary changed size during iteration`', 'The loop also visits the new keys', 'The new keys are ignored', 'Python makes a copy automatically'],
        'Loop over a copy instead: `for k in list(d):`. The same rule is true for sets.'),
      choice('no-extra-memory', 'Contains Duplicate, but you must use O(1) extra memory. What is the best approach?',
        ['Sort the list, then compare neighbours: O(n log n) time', 'Use a set: O(n) time', 'Two nested loops are the only way', 'Use a dict instead of a set'],
        'A set needs O(n) memory. Sorting in place puts equal values next to each other, so one pass finds them. Nested loops also use O(1) memory but cost O(n²). This is the classic time vs memory [[trade-off]].'),
      choice('hashable-rule', 'What must be true for an object to be a good dict key?',
        ['Its hash never changes, and equal objects have equal hashes', 'It must be a string or an int', 'It must be smaller than 64 bytes', 'It must be sortable'],
        'Python finds the slot with the hash and confirms the key with `==`. If the hash changed after insert, or equal keys had different hashes, lookups would fail.'),
    ],
    code: [
      {
        id: 'isomorphic',
        title: 'Isomorphic strings',
        prompt: 'Two strings are [[isomorphic]] if you can replace each character of `s` to get `t`, using one fixed mapping: every `a` becomes the same character, and two different characters never become the same one. `"egg"`/`"add"` → True, `"foo"`/`"bar"` → False, `"badc"`/`"baba"` → False.',
        starter: `def is_isomorphic(s, t):
    # your code here
    pass`,
        tests: `assert is_isomorphic("egg", "add") is True
assert is_isomorphic("foo", "bar") is False
assert is_isomorphic("paper", "title") is True
assert is_isomorphic("badc", "baba") is False
assert is_isomorphic("ab", "aa") is False`,
        hint: 'Keep **two** dicts: `s → t` and `t → s`. If a character already has a mapping and it is different, return False.',
        solution: `def is_isomorphic(s, t):
    if len(s) != len(t):
        return False
    s_to_t, t_to_s = {}, {}
    for a, b in zip(s, t):
        if s_to_t.get(a, b) != b or t_to_s.get(b, a) != a:
            return False
        s_to_t[a] = b
        t_to_s[b] = a
    return True`,
      },
      {
        id: 'intersect',
        title: 'Intersection with counts',
        prompt: 'Return the values that appear in both lists, **as many times as they appear in both** (LeetCode 350). Return them sorted. Use a dict of counts, not nested loops.',
        starter: `def intersect(a, b):
    # your code here
    pass`,
        tests: `assert intersect([1, 2, 2, 1], [2, 2]) == [2, 2]
assert intersect([4, 9, 5], [9, 4, 9, 8, 4]) == [4, 9]
assert intersect([1, 2], [3]) == []`,
        hint: 'Count `a` in a dict. Walk `b`: if the count of `x` is above 0, add `x` and lower the count.',
        solution: `def intersect(a, b):
    counts = {}
    for x in a:
        counts[x] = counts.get(x, 0) + 1
    out = []
    for x in b:
        if counts.get(x, 0) > 0:
            out.append(x)
            counts[x] -= 1
    return sorted(out)`,
      },
    ],
    explain: [
      {
        id: 'hash-table',
        question: 'Explain step by step what happens inside Python when you run `d["apple"] = 5` and later `d["apple"]`. What is a collision, and how does it affect speed?',
        points: [
          '`hash("apple")` gives a number; the number (mod the table size) picks a slot',
          'The slot stores the key, its hash and the value',
          'Lookup hashes again, goes to the slot and checks the key with `==`',
          'Collision: two keys want the same slot; Python tries other slots (open addressing)',
          'The table grows when it gets about 2/3 full, so collisions stay rare: O(1) average, O(n) worst case',
        ],
        answer: 'First Python calls `hash("apple")`, which gives a big integer. It uses part of that number to choose a slot in an internal table, and stores the key, the hash and the value there. On lookup it does the same: hash the key, go to that slot, and confirm with `==` that the key there is really "apple", then return 5. A collision happens when two different keys want the same slot. CPython then tries other slots in a fixed order (open addressing) until it finds the key or an empty slot. If many keys collide, a lookup has to check many slots, so the worst case is O(n). To keep collisions rare, the table is resized when it gets about two-thirds full, so the average cost stays O(1).',
      },
      {
        id: 'mutable-keys',
        question: 'Why must dict keys be hashable? Describe exactly what would go wrong if Python allowed a list as a key and you then changed the list.',
        points: [
          'The slot is chosen from the hash at insert time',
          'If the key changes, its hash changes',
          'A later lookup goes to a different slot and cannot find the entry (or finds the wrong one)',
          'The entry is “lost” in the table; so Python only allows immutable / hashable keys',
          'Tuples work if everything inside them is hashable',
        ],
        answer: 'A dict puts each entry in a slot chosen from the key’s hash when the key is inserted. Imagine I could use `[1, 2]` as a key, and later I append 3 to that list. Its hash would now be different, so when I look up `[1, 2, 3]` Python goes to a different slot and does not find it; and looking up `[1, 2]` goes to the right slot but the stored key is no longer equal. The entry is still in the table, but I cannot reach it. That is why keys must be hashable: their hash must never change, and equal objects must have equal hashes. So Python only accepts immutable types like str, int and tuple — and a tuple only if everything inside it is hashable too.',
      },
    ],
  },

  'py-loops-functions': {
    choice: [
      choice('mutable-default', PRINT, ['1 2 3', '1 1 1', '3 3 3', 'TypeError'],
        'The default list is created **once**, when Python runs the `def` line. Every call without `acc` uses the same list, so it keeps growing. Fix: `acc=None`, then `if acc is None: acc = []` inside.',
        'def f(x, acc=[]):\n    acc.append(x)\n    return len(acc)\n\nprint(f(1), f(2), f(3))'),
      choice('break-continue', PRINT, ['0,2,', '0,1,2,', '0,2,3,4,', '0,'],
        '`continue` skips the rest of this round (so 1 is not printed). `break` leaves the loop completely (so nothing after 3 is printed).',
        'for x in range(5):\n    if x == 3:\n        break\n    if x == 1:\n        continue\n    print(x, end=",")'),
      choice('comp-filter', PRINT, ['[2, 6]', '[0, 4, 8]', '[2, 4, 6, 8]', '[1, 3]'],
        '`if x % 2` keeps odd numbers (1 and 3, because 1 is truthy). Then each one is doubled.',
        'print([x * 2 for x in range(5) if x % 2])'),
      choice('loop-var', PRINT, ['2', '3', 'NameError', '0'],
        'In Python, a `for` loop does not make a new [[scope]]. The loop variable still exists after the loop and keeps its last value.',
        'for i in range(3):\n    pass\nprint(i)'),
      choice('no-return', PRINT, ['None', '0', "''", 'Error'],
        'A function that ends without `return` gives back `None`. A common bug: `result = my_list.sort()` — `result` is `None`.',
        'def f():\n    pass\n\nprint(f())'),
      choice('local-scope', PRINT, ['5', '10', 'NameError', 'UnboundLocalError'],
        'Assigning `x = 10` inside `g` creates a new [[local variable|local]] `x`. The global `x` does not change.',
        'x = 5\n\ndef g():\n    x = 10\n\ng()\nprint(x)'),
      choice('unbound-local', 'What happens when this code runs?',
        ['`UnboundLocalError`: `count` is local in `inc`, but it is read before it has a value', 'It prints nothing and `count` becomes 1', '`NameError: count is not defined`', '`count` becomes 1 and then 2'],
        'Because `inc` assigns to `count`, Python treats `count` as local in the whole function. `count += 1` first reads it — but the local one has no value yet. Use `global count` (or `nonlocal` inside a nested function), or better, return the new value.',
        'count = 0\n\ndef inc():\n    count += 1\n\ninc()'),
      choice('for-else', PRINT, ['not found', 'nothing is printed', 'SyntaxError', '3'],
        'The `else` of a loop runs when the loop finished **without** `break`. It is a clean way to write “search, and do something if not found”.',
        'for x in [1, 2, 3]:\n    if x == 5:\n        break\nelse:\n    print("not found")'),
      choice('recursion-limit', 'What happens with this call, `depth(5000)`?',
        ['`RecursionError`: Python allows about 1,000 nested calls by default', 'It returns 5000', 'It runs forever', 'Python turns it into a loop automatically'],
        'Every call waits on the [[call stack]]. Python does not optimise tail calls, and the default limit is about 1,000. For deep inputs, write a loop or use your own stack.',
        'def depth(n):\n    return 0 if n == 0 else 1 + depth(n - 1)'),
      choice('enumerate-start', PRINT, ["[(1, 'a'), (2, 'b')]", "[(0, 'a'), (1, 'b')]", "[('a', 1), ('b', 2)]", "['a', 'b']"],
        '`enumerate` gives `(index, value)` pairs, and `start=` changes the first index.',
        'print(list(enumerate("ab", start=1)))'),
      choice('recursion-space', 'What is the extra memory of a recursive `factorial(n)`?',
        ['O(n): n calls wait on the call stack at the same time', 'O(1): it only uses one number', 'O(log n)', 'O(n²)'],
        'Many people forget this: recursion is not free. Each waiting call keeps its own frame. The loop version uses O(1) memory.'),
      choice('set-comp', PRINT, ['{0, 1, 2}', '[0, 1, 2]', '{0, 1, 2, 0, 1, 2, 0, 1, 2, 0}', '{1, 2, 3}'],
        'Curly brackets make a **set comprehension**, so the repeated remainders appear only once.',
        'print({x % 3 for x in range(10)})'),
    ],
    code: [
      {
        id: 'flatten',
        title: 'Flatten a nested list',
        prompt: 'Return all numbers from a list that can contain lists inside lists, at any depth: `[1, [2, [3, 4]], 5]` → `[1, 2, 3, 4, 5]`. Use [[recursion]]. Think first: what is the [[base case]]? (`isinstance(item, list)` tells you if an item is a list.)',
        starter: `def flatten(items):
    # your code here
    pass`,
        tests: `assert flatten([1, [2, [3, 4]], 5]) == [1, 2, 3, 4, 5]
assert flatten([]) == []
assert flatten([[[]]]) == []
assert flatten([[1], [[2]], 3]) == [1, 2, 3]`,
        hint: 'For each item: if `isinstance(item, list)`, add everything from `flatten(item)` (with `out += flatten(item)`); otherwise `out.append(item)`.',
        solution: `def flatten(items):
    out = []
    for item in items:
        if isinstance(item, list):
            out.extend(flatten(item))
        else:
            out.append(item)
    return out`,
      },
      {
        id: 'climb-stairs',
        title: 'Climbing stairs with memo',
        prompt: 'You can climb 1 or 2 steps at a time. Return how many different ways there are to reach step `n`. Plain recursion is O(2ⁿ) and too slow for `n = 80`. Save answers you already know in a dict ([[memoization]]).',
        starter: `def climb_stairs(n, memo=None):
    # your code here
    pass`,
        tests: `assert climb_stairs(1) == 1
assert climb_stairs(2) == 2
assert climb_stairs(5) == 8
assert climb_stairs(80) == 37889062373143906`,
        hint: 'Ways(n) = ways(n − 1) + ways(n − 2). Use `memo=None` and create the dict inside (remember the mutable default trap).',
        solution: `def climb_stairs(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 2:
        return n
    if n not in memo:
        memo[n] = climb_stairs(n - 1, memo) + climb_stairs(n - 2, memo)
    return memo[n]`,
      },
    ],
    explain: [
      {
        id: 'default-bug',
        question: 'Explain the mutable default argument bug: what you see, why it happens, and the standard fix. Where could this bug appear in real code?',
        points: [
          'Symptom: data from earlier calls appears in later calls',
          'Default values are created once, when the `def` line runs, not on every call',
          'A mutable default (list, dict, set) is shared by all calls that do not pass the argument',
          'Fix: `param=None`, then create the object inside the function',
          'Real code: caches, config dicts, request handlers that keep data between requests',
        ],
        answer: 'The symptom is that a function “remembers” data from earlier calls: `add(1)` returns `[1]`, and then `add(2)` returns `[1, 2]`. This happens because Python creates default values only once, when it runs the `def` line. So a default list is one object that every call shares, and `append` changes it in place. The fix is to use `None` as the default and create a new list inside: `if items is None: items = []`. In real code this bug is dangerous in things like web request handlers or helper functions with a default dict of options — data from one user or one request can leak into the next.',
      },
      {
        id: 'recursion-vs-loop',
        question: 'Recursion or a loop? Explain what each recursive call costs, why every recursive function needs a base case, and when you would change a recursive solution into a loop.',
        points: [
          'Each call adds a frame to the call stack (memory, and some time)',
          'The base case stops the calls; without it you get infinite recursion / RecursionError',
          'Recursion depth = extra memory, e.g. O(n) for a linked list, O(h) for a tree of height h',
          'Python’s limit is about 1,000 and it has no tail-call optimisation',
          'Use a loop (or your own stack) for deep or very long inputs; recursion is clearer for trees and backtracking',
        ],
        answer: 'Every recursive call pushes a new frame on the call stack with its own local variables, so it costs memory and some time. The base case is the small input that the function answers directly — without it, calls never stop and Python raises RecursionError. The depth of the recursion is the extra memory: O(n) for a list or a linked list, O(h) for a tree of height h. Python stops at about 1,000 levels and does not optimise tail calls. So for problems that can be very deep — a long linked list, a path in a big grid — I write a loop or keep my own stack. For trees, DFS and backtracking, recursion is usually shorter and clearer, and the depth is fine.',
      },
    ],
  },

  'py-toolkit': {
    choice: [
      choice('counter-missing', PRINT, ['2', '3', 'KeyError', '0'],
        'Reading a missing key from a `Counter` returns 0 but **does not add** the key. So the length stays 2.',
        'from collections import Counter\nc = Counter("aab")\nc["z"]\nprint(len(c))'),
      choice('defaultdict-missing', PRINT, ['1', '0', 'KeyError', 'None'],
        'With a `defaultdict`, **just reading** a missing key creates it (here with `int()` = 0). Be careful: checking `d[k]` in a loop can fill the dict with empty keys. Use `k in d` to check.',
        'from collections import defaultdict\nd = defaultdict(int)\nd["z"]\nprint(len(d))'),
      choice('heap-not-sorted', PRINT, ['[1, 5, 4]', '[1, 4, 5]', '[5, 4, 1]', '[4, 1, 5]'],
        'A [[heap]] is **not** a sorted list. It only promises that `h[0]` is the smallest, and every parent is ≤ its children. Never read `h[-1]` and think it is the largest.',
        'import heapq\nh = [5, 1, 4]\nheapq.heapify(h)\nprint(h)'),
      choice('heapify-cost', 'What is the cost of `heapq.heapify` on a list of n items?',
        ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
        'Building a heap from a list is O(n) (most nodes are near the bottom and move only a little). Pushing n items one by one would be O(n log n).'),
      choice('k-largest-cost', 'You keep the k largest of n numbers with a min-heap of size k. What is the time?',
        ['O(n log k)', 'O(n log n)', 'O(k log n)', 'O(n + k)'],
        'Each of the n items does at most one push and one pop on a heap of size k, and each costs O(log k). When k is much smaller than n, this is better than sorting.'),
      choice('multi-key-sort', PRINT, ["['ccc', 'bb', 'dd', 'a']", "['a', 'bb', 'dd', 'ccc']", "['ccc', 'dd', 'bb', 'a']", "['a', 'bb', 'ccc', 'dd']"],
        'The key is a tuple: first `-len(w)` (longest first), and for equal lengths `w` (A to Z). Negating a number is the easy way to sort one field in reverse.',
        'print(sorted(["bb", "a", "ccc", "dd"], key=lambda w: (-len(w), w)))'),
      choice('deque-why', 'Why is `deque.popleft()` better than `list.pop(0)` in BFS?',
        ['`popleft` is O(1); `pop(0)` is O(n) because all items move', '`deque` uses less memory', '`list.pop(0)` returns the wrong item', 'There is no difference'],
        'A [[deque]] is built for fast work at both ends. With `list.pop(0)`, BFS on a big graph becomes O(n²).'),
      choice('anagram-cost', 'For two strings of length n, which is faster: `Counter(s) == Counter(t)` or `sorted(s) == sorted(t)`?',
        ['Counter: O(n) vs O(n log n) for sorting', 'Sorting: O(n) vs O(n log n) for Counter', 'Both are O(n²)', 'Both are O(1)'],
        'Counting is one pass. Sorting is O(n log n), but it uses less extra memory if you can sort in place. Say both in an interview.'),
      choice('most-common', PRINT, ['[(1, 2)]', '[1]', '(1, 2)', '[2]'],
        '`most_common(k)` returns a **list of (value, count) tuples**, most frequent first.',
        'from collections import Counter\nprint(Counter([1, 1, 2]).most_common(1))'),
      choice('max-heap', 'Python only has a min-heap. How do you use it as a max-heap of numbers?',
        ['Push `-x` and read `-h[0]`', 'Call `heapq.heapify(h, reverse=True)`', 'Read `h[-1]`', 'Sort the heap after each push'],
        'Making each number negative turns the smallest into the largest. For tuples you can negate the first field: `(-count, word)`.'),
      choice('deque-maxlen', PRINT, ['[2, 3, 4]', '[1, 2, 3]', '[1, 2, 3, 4]', 'IndexError'],
        'With `maxlen`, adding to a full deque drops an item from the **other** end. Handy for “the last N items” or a moving average.',
        'from collections import deque\nq = deque([1, 2, 3], maxlen=3)\nq.append(4)\nprint(list(q))'),
      choice('nlargest', PRINT, ['[8, 5]', '[5, 8]', '[8]', '[1, 3]'],
        '`heapq.nlargest(k, items)` returns the k largest items, largest first. Good for small k.',
        'import heapq\nprint(heapq.nlargest(2, [5, 1, 8, 3]))'),
    ],
    code: [
      {
        id: 'k-closest',
        title: 'K closest points to the origin',
        prompt: 'Return the `k` points closest to `(0, 0)`, in any order (NeetCode: *K Closest Points to Origin*). Use a heap. You do not need the square root: compare `x*x + y*y`.',
        starter: `import heapq

def k_closest(points, k):
    # your code here
    pass`,
        tests: `assert sorted(k_closest([[1, 3], [-2, 2]], 1)) == [[-2, 2]]
assert sorted(k_closest([[3, 3], [5, -1], [-2, 4]], 2)) == [[-2, 4], [3, 3]]
assert sorted(k_closest([[0, 1], [1, 0]], 2)) == [[0, 1], [1, 0]]`,
        hint: '`heapq.nsmallest(k, points, key=lambda p: p[0] ** 2 + p[1] ** 2)` — or push `(-dist, x, y)` into a heap of size k.',
        solution: `import heapq

def k_closest(points, k):
    return heapq.nsmallest(k, points, key=lambda p: p[0] ** 2 + p[1] ** 2)`,
      },
      {
        id: 'merge-k',
        title: 'Merge k sorted lists',
        prompt: 'Merge `k` sorted lists into one sorted list in **O(N log k)**, where N is the total number of items. Keep one item from each list in a min-heap.',
        starter: `import heapq

def merge_k(lists):
    # your code here
    pass`,
        tests: `assert merge_k([[1, 4, 5], [1, 3, 4], [2, 6]]) == [1, 1, 2, 3, 4, 4, 5, 6]
assert merge_k([]) == []
assert merge_k([[], [1]]) == [1]`,
        hint: 'Push `(value, list_index, item_index)` for the first item of each list. Pop the smallest, add it, then push the next item from the same list.',
        solution: `import heapq

def merge_k(lists):
    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(h)
    out = []
    while h:
        value, i, j = heapq.heappop(h)
        out.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return out`,
      },
    ],
    explain: [
      {
        id: 'heap-inside',
        question: 'What is a heap and how is it stored? Explain how `heappush` and `heappop` keep the smallest item at `h[0]`, and why both are O(log n).',
        points: [
          'A complete binary tree stored in a list; every parent ≤ its children',
          'Children of index i are 2i + 1 and 2i + 2; the parent is (i − 1) // 2',
          'Push: add at the end, then swap upwards with the parent while it is smaller (sift up)',
          'Pop: take h[0], move the last item to the top, then swap downwards with the smaller child (sift down)',
          'The tree height is log n, so each operation does at most log n swaps',
        ],
        answer: 'A heap is a complete binary tree where every parent is smaller than or equal to its children, so the smallest item is always the root. Python stores it in a plain list: the children of index i are at 2i + 1 and 2i + 2, and the parent of i is at (i − 1) // 2. `heappush` appends the new item at the end and then “sifts it up”: while it is smaller than its parent, they swap. `heappop` removes the root, moves the last item to index 0 and “sifts it down”: it swaps with its smaller child until the order is correct again. Because the tree is complete, its height is about log₂ n, so each push or pop does at most log n swaps — O(log n).',
      },
      {
        id: 'top-k-compare',
        question: 'Explain when you would use `Counter`, `defaultdict`, `deque` and `heapq`. Give one real interview problem (or real work task) for each, and the key cost that makes it the right tool.',
        points: [
          '`Counter`: counting things — anagrams, top-k frequent, word counts; counting is O(n)',
          '`defaultdict(list)`: grouping without checking for missing keys — group anagrams, adjacency lists for graphs',
          '`deque`: a queue — BFS, the last N items (`maxlen`); `append`/`popleft` are O(1), unlike `list.pop(0)`',
          '`heapq`: always get the smallest item fast — k-th largest, top k, merge sorted lists, scheduling; push/pop O(log n)',
          'Say the cost out loud: that is the reason for choosing the tool',
        ],
        answer: 'I use `Counter` whenever the question is about how often things appear: checking anagrams, finding the top k frequent values, or counting words in logs — it counts in one O(n) pass. I use `defaultdict(list)` to group things without first checking if a key exists, for example grouping anagrams by their sorted letters or building the adjacency list of a graph. I use `deque` for queues: BFS, or keeping the last N events with `maxlen`, because `append` and `popleft` are O(1) while `list.pop(0)` is O(n). And I use `heapq` when I repeatedly need the smallest (or, with negative numbers, the largest) item: the k-th largest value, the top k items, merging sorted lists or scheduling jobs — push and pop are O(log n), and a heap of size k keeps the work at O(n log k).',
      },
    ],
  },
}
