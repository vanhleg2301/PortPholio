import type { Lesson } from './types'

const PY = 'https://docs.python.org/3'
const md = (...lines: string[]) => lines.join('\n')
const CODDY = { label: 'Coddy — extra practice', url: 'https://coddy.tech/' }

export const PYTHON_LESSONS: Lesson[] = [
  {
    id: 'py-variables',
    title: 'Variables, numbers and types',
    summary: 'Names point at objects; objects carry their type. Learn the four basic types, Python’s arithmetic and the aliasing rule that causes half of all beginner bugs.',
    minutes: 35,
    blocks: [
      {
        type: 'text',
        md: md(
          '## Names point at objects',
          'In Python a variable is **a name bound to an object**, not a box that contains a value. `x = 5` creates an `int` object and sticks the label `x` on it.',
          '',
          'The **type belongs to the object**, not to the name. That is why the same name can later point at a string — Python is *dynamically typed*.',
          '',
          'The four basic types you will use every day:',
          '',
          '| Type | Example | Notes |',
          '| --- | --- | --- |',
          '| `int` | `42`, `-7`, `10**18` | whole numbers, **never overflow** |',
          '| `float` | `3.14`, `1e-9` | decimals, *approximate* |',
          '| `str` | `"hello"` | text, immutable |',
          '| `bool` | `True`, `False` | result of comparisons |',
        ),
      },
      {
        type: 'code',
        id: 'types',
        caption: 'Run it, then change the values and run again.',
        code: `x = 5
price = 19.99
name = "An"
is_ready = True
print(type(x), type(price), type(name), type(is_ready))

print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)          # 3.5 3 1 1024
print(-7 // 2, -7 % 2)                          # -4 1  (floor division rounds down)
print(0.1 + 0.2 == 0.3, abs(0.1 + 0.2 - 0.3) < 1e-9)   # False True
print(int("42") + 1, str(42) + "!", float("3.5"))      # 43 42! 3.5`,
      },
      {
        type: 'text',
        md: md(
          '## Arithmetic you will use in interviews',
          '- `/` always gives a float; `//` is **floor** division (rounds down, even for negatives).',
          '- `%` is the remainder: `n % 2 == 0` tests even numbers, `n % 10` is the last digit.',
          '- `divmod(a, b)` returns `(a // b, a % b)` in one go.',
          '- Never compare floats with `==` — compare with a tolerance (`abs(a - b) < 1e-9`).',
        ),
      },
      {
        type: 'diagram',
        caption: 'Two names, one list: changing it through b is visible through a.',
        mermaid: `flowchart LR
  a([a]) --> L["list object: [1, 2, 3, 4]"]
  b([b]) --> L
  c([c]) --> C["another list: [1, 2, 3]"]`,
      },
      {
        type: 'code',
        id: 'aliasing',
        code: `a = [1, 2, 3]
b = a            # b points at the SAME list
c = a[:]         # c is a copy
b.append(4)
print(a)         # [1, 2, 3, 4]
print(c)         # [1, 2, 3]
print(a is b, a is c, a == c + [4])   # True False True`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Mutable objects (`list`, `dict`, `set`) can change in place, so every name pointing at them sees the change. Immutable ones (`int`, `float`, `str`, `tuple`) can’t — “changing” them creates a new object.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Python `int` has arbitrary precision: `2 ** 100` just works. In Java/C++ the same code overflows — mention it when an interviewer asks about integer limits.',
      },
      {
        type: 'exercise',
        id: 'minutes-to-hm',
        title: 'Minutes to hours and minutes',
        prompt: 'Return a tuple `(hours, minutes)` for a number of minutes. Use `//` and `%` (or `divmod`).',
        starter: `def minutes_to_hm(total):
    # your code here
    pass`,
        tests: `assert minutes_to_hm(135) == (2, 15), minutes_to_hm(135)
assert minutes_to_hm(0) == (0, 0)
assert minutes_to_hm(59) == (0, 59)
assert minutes_to_hm(600) == (10, 0)`,
        hint: 'Hours are how many whole 60s fit; minutes are what is left over.',
        solution: `def minutes_to_hm(total):
    return divmod(total, 60)`,
      },
      {
        type: 'exercise',
        id: 'last-digit-sum',
        title: 'Sum of digits',
        prompt: 'Return the sum of the digits of a non-negative integer, using `% 10` and `// 10` (no strings).',
        starter: `def digit_sum(n):
    # your code here
    pass`,
        tests: `assert digit_sum(0) == 0
assert digit_sum(7) == 7
assert digit_sum(1234) == 10
assert digit_sum(10 ** 20) == 1`,
        hint: 'Loop while n > 0: add n % 10, then drop the last digit with n //= 10.',
        solution: `def digit_sum(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What do `7 // 2` and `-7 // 2` give?', answer: '`3` and `-4`: floor division always rounds down.' },
          { question: '`a = [1]; b = a; b.append(2)` — what is `a`?', answer: '`[1, 2]`: `a` and `b` are two names for the same list.' },
          { question: 'Why is `0.1 + 0.2 == 0.3` False?', answer: 'Floats are stored in binary and are approximate; compare with a tolerance instead.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §3.1.1: Numbers', url: `${PY}/tutorial/introduction.html#numbers` },
      { label: 'Python Tutorial §3: An Informal Introduction', url: `${PY}/tutorial/introduction.html` },
      CODDY,
    ],
  },
  {
    id: 'py-strings',
    title: 'Strings',
    summary: 'Strings are immutable sequences of characters. Indexing, slicing and a dozen methods solve most string problems — and joining beats concatenating in loops.',
    minutes: 35,
    blocks: [
      {
        type: 'text',
        md: md(
          '## Indexing and slicing',
          'A string is a sequence: every character has an index from `0`, and negative indexes count from the end.',
          '',
          '| `s = "python"` | p | y | t | h | o | n |',
          '| --- | --- | --- | --- | --- | --- | --- |',
          '| index | 0 | 1 | 2 | 3 | 4 | 5 |',
          '| negative | -6 | -5 | -4 | -3 | -2 | -1 |',
          '',
          '`s[start:stop:step]` takes characters from `start` up to **but not including** `stop`. Missing parts default to the beginning, the end and `1`. `s[::-1]` reverses.',
        ),
      },
      {
        type: 'code',
        id: 'slicing',
        code: `s = "python"
print(s[0], s[-1], s[1:4], s[:2], s[2:], s[::-1])   # p n yth py thon nohtyp
print(len(s), "th" in s, s.find("th"), s.find("x"))  # 6 True 2 -1`,
      },
      {
        type: 'text',
        md: md(
          '## Methods that solve most problems',
          '- Cleaning: `strip()`, `lower()`, `upper()`, `replace(a, b)`',
          '- Splitting and joining: `"a b c".split()` → list, `" ".join(words)` → string',
          '- Checks: `isalnum()`, `isdigit()`, `isalpha()`, `startswith()`, `endswith()`',
          '- Characters ↔ numbers: `ord("a") == 97`, `chr(97) == "a"` (handy for 26-letter counts)',
          '- Formatting: f-strings, `f"{name} has {n} items"`',
        ),
      },
      {
        type: 'code',
        id: 'methods',
        code: `text = "  Hello, Big Tech!  "
clean = text.strip().lower()
print(clean)                                  # hello, big tech!
words = clean.replace(",", "").replace("!", "").split()
print(words, "-".join(words))                 # ['hello', 'big', 'tech'] hello-big-tech
print(ord("c") - ord("a"), chr(ord("a") + 2)) # 2 c
name, n = "An", 3
print(f"{name} solved {n} problems")          # An solved 3 problems`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Strings are immutable: `s += "x"` builds a brand-new string each time, so doing it in a loop can be O(n²). Collect pieces in a list and call `"".join(parts)` once.',
      },
      {
        type: 'exercise',
        id: 'valid-palindrome',
        title: 'Valid palindrome',
        prompt: 'Return `True` if `s` reads the same forwards and backwards, **ignoring case and every character that is not a letter or digit**. (This is NeetCode’s *Valid Palindrome*.)',
        starter: `def is_palindrome(s):
    # your code here
    pass`,
        tests: `assert is_palindrome("A man, a plan, a canal: Panama") is True
assert is_palindrome("race a car") is False
assert is_palindrome(" ") is True
assert is_palindrome("0P") is False`,
        hint: 'Build a cleaned string with `"".join(ch.lower() for ch in s if ch.isalnum())`, then compare it with its reverse.',
        solution: `def is_palindrome(s):
    clean = "".join(ch.lower() for ch in s if ch.isalnum())
    return clean == clean[::-1]`,
      },
      {
        type: 'exercise',
        id: 'reverse-words',
        title: 'Reverse the words',
        prompt: 'Return the words of `s` in reverse order, separated by single spaces (extra spaces anywhere are dropped).',
        starter: `def reverse_words(s):
    # your code here
    pass`,
        tests: `assert reverse_words("the sky is blue") == "blue is sky the"
assert reverse_words("  hello world  ") == "world hello"
assert reverse_words("a good   example") == "example good a"`,
        hint: '`split()` with no argument already ignores extra spaces.',
        solution: `def reverse_words(s):
    return " ".join(reversed(s.split()))`,
      },
      {
        type: 'exercise',
        id: 'letter-counts',
        title: '26-letter counts',
        prompt: 'Return a list of 26 counts — how many times each letter `a`–`z` appears in a lowercase string. Use `ord()`.',
        starter: `def letter_counts(s):
    # your code here
    pass`,
        tests: `counts = letter_counts("banana")
assert len(counts) == 26
assert counts[0] == 3 and counts[1] == 1 and counts[13] == 2, counts
assert sum(letter_counts("")) == 0`,
        hint: 'Start with `[0] * 26`, then add 1 at index `ord(ch) - ord("a")`.',
        solution: `def letter_counts(s):
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord("a")] += 1
    return counts`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What is `"python"[1:4]`?', answer: '`"yth"`: from index 1 up to, but not including, 4.' },
          { question: 'Can you do `s[0] = "P"`?', answer: 'No — strings are immutable. Build a new one: `"P" + s[1:]`.' },
          { question: 'Fastest way to build a long string from many pieces?', answer: 'Append the pieces to a list and call `"".join(parts)` once.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §3.1.2: Text', url: `${PY}/tutorial/introduction.html#text` },
      { label: 'String methods (reference)', url: `${PY}/library/stdtypes.html#string-methods` },
      CODDY,
    ],
  },
  {
    id: 'py-lists',
    title: 'Lists and tuples',
    summary: 'Lists are resizable arrays — fast at the end, slow at the front. Tuples are fixed records you can unpack and use as dict keys.',
    minutes: 40,
    blocks: [
      {
        type: 'text',
        md: md(
          '## A list is a dynamic array',
          'A list stores references side by side in memory with spare room at the end. That layout explains every cost you need to know:',
          '',
          '| Operation | Cost | Why |',
          '| --- | --- | --- |',
          '| `a[i]`, `a[i] = x` | O(1) | jump straight to the slot |',
          '| `a.append(x)`, `a.pop()` | O(1)* | work at the end (*amortised) |',
          '| `a.insert(0, x)`, `a.pop(0)` | O(n) | every item shifts |',
          '| `x in a` | O(n) | scans one by one |',
          '| `a.sort()` | O(n log n) | Timsort |',
        ),
      },
      {
        type: 'diagram',
        caption: 'Why append is O(1) on average: copying happens rarely, and the capacity grows geometrically.',
        mermaid: `flowchart TD
  A["append(x)"] --> B{"spare room left?"}
  B -- yes --> C["write x into the next slot: O(1)"]
  B -- no --> D["allocate a bigger array"]
  D --> E["copy all items once: O(n)"]
  E --> C`,
      },
      {
        type: 'code',
        id: 'list-ops',
        code: `nums = [5, 3, 8]
nums.append(1)
nums.insert(0, 9)
print(nums)                            # [9, 5, 3, 8, 1]
print(nums.pop(), nums)                # 1 [9, 5, 3, 8]

print(sorted(nums), nums)              # [3, 5, 8, 9] [9, 5, 3, 8]  (sorted() copies)
nums.sort(reverse=True)
print(nums)                            # [9, 8, 5, 3]  (sort() changes in place)

words = ["kiwi", "fig", "banana"]
print(sorted(words, key=len))          # ['fig', 'kiwi', 'banana']
for i, w in enumerate(words):
    print(i, w)`,
      },
      {
        type: 'text',
        md: md(
          '## Tuples and unpacking',
          'A tuple is an immutable list: `point = (3, 4)`. Use it for small fixed records, for returning several values, and as dict keys (lists can’t be keys).',
          '',
          'Unpacking assigns several names at once: `x, y = point`, and swapping needs no temp variable: `a, b = b, a`.',
        ),
      },
      {
        type: 'code',
        id: 'tuples',
        code: `point = (3, 4)
x, y = point
print(x * x + y * y)                   # 25

a, b = 1, 2
a, b = b, a
print(a, b)                            # 2 1

pairs = [("an", 25), ("binh", 19), ("chi", 31)]
print(sorted(pairs, key=lambda p: p[1]))     # [('binh', 19), ('an', 25), ('chi', 31)]
print(list(zip([1, 2, 3], "abc")))           # [(1, 'a'), (2, 'b'), (3, 'c')]`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: '`grid = [[0] * 3] * 3` creates **three references to the same row**. Use `[[0] * 3 for _ in range(3)]` for a real 2-D grid.',
      },
      {
        type: 'exercise',
        id: 'running-sum',
        title: 'Running sum',
        prompt: 'Return a new list where item `i` is the sum of `nums[0..i]`. This “prefix sum” trick appears in many array problems.',
        starter: `def running_sum(nums):
    # your code here
    pass`,
        tests: `assert running_sum([1, 2, 3, 4]) == [1, 3, 6, 10]
assert running_sum([]) == []
assert running_sum([5]) == [5]
assert running_sum([3, -1, 2]) == [3, 2, 4]`,
        hint: 'Keep a running `total` and append it after adding each number.',
        solution: `def running_sum(nums):
    out, total = [], 0
    for x in nums:
        total += x
        out.append(total)
    return out`,
      },
      {
        type: 'exercise',
        id: 'rotate-right',
        title: 'Rotate right by k',
        prompt: 'Return a new list rotated right by `k` steps: `[1, 2, 3, 4, 5]`, `k = 2` → `[4, 5, 1, 2, 3]`. `k` may be larger than the length.',
        starter: `def rotate_right(nums, k):
    # your code here
    pass`,
        tests: `assert rotate_right([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3]
assert rotate_right([1, 2, 3], 3) == [1, 2, 3]
assert rotate_right([1, 2, 3], 4) == [3, 1, 2]
assert rotate_right([], 5) == []`,
        hint: 'Reduce k with `k % len(nums)` (careful with an empty list), then glue two slices.',
        solution: `def rotate_right(nums, k):
    if not nums:
        return []
    k %= len(nums)
    return nums[-k:] + nums[:-k] if k else nums[:]`,
      },
      {
        type: 'exercise',
        id: 'second-largest',
        title: 'Second largest distinct value',
        prompt: 'Return the second largest **distinct** value, or `None` if there isn’t one. Do it in one pass, without sorting.',
        starter: `def second_largest(nums):
    # your code here
    pass`,
        tests: `assert second_largest([3, 1, 4, 4, 2]) == 3
assert second_largest([7, 7]) is None
assert second_largest([]) is None
assert second_largest([-1, -5, -3]) == -3`,
        hint: 'Track `first` and `second` (start at `None`). Skip numbers equal to `first`.',
        solution: `def second_largest(nums):
    first = second = None
    for x in nums:
        if first is None or x > first:
            first, second = x, first
        elif x != first and (second is None or x > second):
            second = x
    return second`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why is `nums.pop(0)` slow on a long list?', answer: 'Every remaining item shifts one slot left: O(n). Use `collections.deque` for queues.' },
          { question: '`sorted(a)` vs `a.sort()`?', answer: '`sorted` returns a new list and leaves `a` alone; `a.sort()` sorts in place and returns `None`.' },
          { question: 'Why can a tuple be a dict key but a list can’t?', answer: 'Keys must be hashable (unchangeable). Tuples are immutable; lists are not.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §5.1: More on lists', url: `${PY}/tutorial/datastructures.html#more-on-lists` },
      { label: 'Python wiki: TimeComplexity', url: 'https://wiki.python.org/moin/TimeComplexity' },
      CODDY,
    ],
  },
  {
    id: 'py-dicts-sets',
    title: 'Dicts and sets',
    summary: 'Hash tables give O(1) average lookups. Most “make it faster” interview answers are a dict or a set.',
    minutes: 40,
    blocks: [
      {
        type: 'text',
        md: md(
          '## How a hash table finds things',
          '`hash(key)` turns the key into a number that picks a slot, so Python jumps straight to it instead of scanning. That is why `key in d` is O(1) on average while `x in some_list` is O(n).',
          '',
          'Keys must be **hashable** — they can never change: `str`, `int`, `tuple` work; `list`, `dict`, `set` don’t.',
        ),
      },
      {
        type: 'diagram',
        caption: 'Lookup in a dict: hash the key, go to the slot, done.',
        mermaid: `flowchart LR
  K["key: 'apple'"] --> H["hash('apple')"]
  H --> S["slot 3"]
  S --> V["value: 5"]`,
      },
      {
        type: 'code',
        id: 'dict-basics',
        code: `stock = {"apple": 5, "kiwi": 2}
stock["fig"] = 7                       # add or update
print(stock.get("pear", 0), "kiwi" in stock)   # 0 True
for fruit, qty in stock.items():
    print(fruit, qty)

counts = {}
for ch in "banana":
    counts[ch] = counts.get(ch, 0) + 1
print(counts)                          # {'b': 1, 'a': 3, 'n': 2}`,
      },
      {
        type: 'code',
        id: 'set-basics',
        code: `seen = set()
for x in [3, 1, 3, 2, 1]:
    if x in seen:
        print("duplicate:", x)
    seen.add(x)

a, b = {1, 2, 3}, {2, 3, 4}
print(a | b, a & b, a - b)             # {1, 2, 3, 4} {2, 3} {1}`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Say the trade-off out loud: “Brute force checks every pair in O(n²). A hash map makes it O(n) at the cost of O(n) extra memory.”',
      },
      {
        type: 'exercise',
        id: 'contains-duplicate',
        title: 'Contains duplicate',
        prompt: 'Return `True` if any value appears at least twice. Aim for O(n). (NeetCode’s *Contains Duplicate*.)',
        starter: `def contains_duplicate(nums):
    # your code here
    pass`,
        tests: `assert contains_duplicate([1, 2, 3, 1]) is True
assert contains_duplicate([1, 2, 3, 4]) is False
assert contains_duplicate([]) is False`,
        hint: 'Keep a `seen` set; or compare `len(set(nums))` with `len(nums)`.',
        solution: `def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      },
      {
        type: 'exercise',
        id: 'first-unique',
        title: 'First unique character',
        prompt: 'Return the index of the first character that appears exactly once in `s`, or `-1`.',
        starter: `def first_unique(s):
    # your code here
    pass`,
        tests: `assert first_unique("leetcode") == 0
assert first_unique("loveleetcode") == 2
assert first_unique("aabb") == -1`,
        hint: 'Two passes: count every character, then find the first with count 1.',
        solution: `def first_unique(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1`,
      },
      {
        type: 'exercise',
        id: 'two-sum',
        title: 'Two Sum',
        prompt: 'Return the indexes `[i, j]` of two numbers that add up to `target` (exactly one answer exists, `i < j`). One pass with a dict. (NeetCode’s *Two Sum*.)',
        starter: `def two_sum(nums, target):
    # your code here
    pass`,
        tests: `assert two_sum([2, 7, 11, 15], 9) == [0, 1]
assert two_sum([3, 2, 4], 6) == [1, 2]
assert two_sum([3, 3], 6) == [0, 1]`,
        hint: 'For each `x`, check whether `target - x` is already in a dict of value → index. Check before you store.',
        solution: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Cost of `x in my_set` vs `x in my_list`?', answer: 'O(1) on average for the set, O(n) for the list.' },
          { question: 'What does `d.get(k, 0)` do that `d[k]` doesn’t?', answer: 'Returns 0 when the key is missing instead of raising `KeyError`.' },
          { question: 'Do dicts keep insertion order?', answer: 'Yes, guaranteed since Python 3.7. Sets have no order.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §5.5: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
      { label: 'Python Tutorial §5.4: Sets', url: `${PY}/tutorial/datastructures.html#sets` },
      CODDY,
    ],
  },
  {
    id: 'py-loops-functions',
    title: 'Loops, comprehensions and functions',
    summary: 'Write loops the Pythonic way (enumerate, zip, comprehensions) and functions that are easy to test — while avoiding the mutable-default trap.',
    minutes: 40,
    blocks: [
      {
        type: 'text',
        md: md(
          '## Loops',
          '- `for x in items:` walks any iterable; `range(n)` gives `0 … n-1`.',
          '- `enumerate(items)` gives `(index, value)`; `zip(a, b)` pairs two sequences.',
          '- `while condition:` when you don’t know the number of steps (two pointers, binary search).',
          '- `break` leaves the loop, `continue` skips to the next round.',
          '',
          'A **comprehension** builds a collection in one expression: `[x * x for x in nums if x > 0]`. The same shape works for sets `{…}` and dicts `{k: v …}`.',
        ),
      },
      {
        type: 'code',
        id: 'loops',
        code: `nums = [3, -1, 4, -1, 5]
squares = [x * x for x in nums if x > 0]
print(squares)                                  # [9, 16, 25]

index_of = {x: i for i, x in enumerate(nums)}   # last index wins
print(index_of)                                 # {3: 0, -1: 3, 4: 2, 5: 4}

for name, score in zip(["an", "binh"], [9, 7]):
    print(name, score)

matrix = [[1, 2], [3, 4]]
print([v for row in matrix for v in row])       # [1, 2, 3, 4]`,
      },
      {
        type: 'text',
        md: md(
          '## Functions',
          '`def name(params):` … `return value`. A function without `return` returns `None`.',
          '',
          '- Default values: `def greet(name, greeting="Hi")`.',
          '- **Defaults are created once**, when the function is defined — so a mutable default (`[]`, `{}`) is shared between calls.',
          '- Variables assigned inside a function are local. Use `nonlocal` to update a variable of an enclosing function (common in recursive helpers).',
          '- `lambda x: x[1]` is a tiny unnamed function, mostly used as a `key=` for sorting.',
        ),
      },
      {
        type: 'code',
        id: 'mutable-default',
        caption: 'Run this and see the trap, then compare with the fixed version.',
        code: `def add_bad(x, items=[]):
    items.append(x)
    return items

print(add_bad(1), add_bad(2))          # [1, 2] [1, 2]  <- shared list!

def add_good(x, items=None):
    if items is None:
        items = []
    items.append(x)
    return items

print(add_good(1), add_good(2))        # [1] [2]`,
      },
      {
        type: 'diagram',
        caption: 'Recursion: each call waits for the smaller call, then combines.',
        mermaid: `flowchart TD
  A["factorial(3)"] --> B["3 * factorial(2)"]
  B --> C["2 * factorial(1)"]
  C --> D["base case: 1"]
  D --> E["2 * 1 = 2"]
  E --> F["3 * 2 = 6"]`,
      },
      {
        type: 'exercise',
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        prompt: 'Return a list of strings for `1..n`: `"Fizz"` for multiples of 3, `"Buzz"` for 5, `"FizzBuzz"` for both, otherwise the number as a string.',
        starter: `def fizzbuzz(n):
    # your code here
    pass`,
        tests: `assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]
assert fizzbuzz(15)[-1] == "FizzBuzz"
assert fizzbuzz(0) == []`,
        hint: 'Check 15 (or both conditions) first.',
        solution: `def fizzbuzz(n):
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out`,
      },
      {
        type: 'exercise',
        id: 'transpose',
        title: 'Transpose a matrix',
        prompt: 'Return the transpose of a rectangular matrix (rows become columns) using a comprehension.',
        starter: `def transpose(matrix):
    # your code here
    pass`,
        tests: `assert transpose([[1, 2, 3], [4, 5, 6]]) == [[1, 4], [2, 5], [3, 6]]
assert transpose([[7]]) == [[7]]`,
        hint: 'For each column index `c`, build `[row[c] for row in matrix]`.',
        solution: `def transpose(matrix):
    return [[row[c] for row in matrix] for c in range(len(matrix[0]))]`,
      },
      {
        type: 'exercise',
        id: 'fib',
        title: 'Fibonacci without recursion',
        prompt: 'Return the n-th Fibonacci number (`fib(0) = 0`, `fib(1) = 1`) with a loop and two variables — O(n) time, O(1) memory.',
        starter: `def fib(n):
    # your code here
    pass`,
        tests: `assert [fib(i) for i in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13]
assert fib(50) == 12586269025`,
        hint: 'Keep `a, b = 0, 1` and update `a, b = b, a + b` n times.',
        solution: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What does a function without `return` return?', answer: '`None`.' },
          { question: 'Why is `def f(x, acc=[])` dangerous?', answer: 'The default list is created once and shared by every call. Use `None` and create the list inside.' },
          { question: 'Rewrite `out = []; for x in a: if x % 2: out.append(x)` as one line.', answer: '`out = [x for x in a if x % 2]`' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python Tutorial §4: More Control Flow Tools', url: `${PY}/tutorial/controlflow.html` },
      { label: 'Python Tutorial §5.1.3: List comprehensions', url: `${PY}/tutorial/datastructures.html#list-comprehensions` },
      CODDY,
    ],
  },
  {
    id: 'py-toolkit',
    title: 'Interview toolkit: collections, heapq, sorted',
    summary: 'Counter, defaultdict, deque, heapq and sorted(key=…) turn many medium problems into a few lines. Learn which tool fits which problem.',
    minutes: 45,
    blocks: [
      {
        type: 'diagram',
        caption: 'Which tool for which kind of problem.',
        mermaid: `mindmap
  root((Python toolkit))
    Counter
      frequencies
      anagrams
      top k frequent
    defaultdict
      grouping
      adjacency lists
    deque
      BFS queue
      sliding window
    heapq
      top k / k-th largest
      merge sorted lists
      scheduling
    sorted with key
      intervals
      custom order`,
      },
      {
        type: 'code',
        id: 'counter-defaultdict',
        code: `from collections import Counter, defaultdict

c = Counter("banana")
print(c, c["z"], c.most_common(1))     # Counter({'a': 3, 'n': 2, 'b': 1}) 0 [('a', 3)]
print(Counter("listen") == Counter("silent"))   # True

groups = defaultdict(list)
for word in ["eat", "tea", "tan", "nat"]:
    groups["".join(sorted(word))].append(word)
print(dict(groups))                    # {'aet': ['eat', 'tea'], 'ant': ['tan', 'nat']}`,
      },
      {
        type: 'code',
        id: 'deque-heapq',
        code: `from collections import deque
import heapq

q = deque([1, 2])
q.append(3)
q.appendleft(0)
print(q.popleft(), q.pop(), list(q))   # 0 3 [1, 2]

h = []
for x in [5, 1, 8, 3]:
    heapq.heappush(h, x)
print(h[0], heapq.heappop(h), heapq.nsmallest(2, h))   # 1 1 [3, 5]

max_heap = [-x for x in [5, 1, 8, 3]]
heapq.heapify(max_heap)
print(-max_heap[0])                    # 8`,
      },
      {
        type: 'text',
        md: md(
          '## Sorting with a key',
          '`sorted(items, key=…)` sorts by whatever the key returns, and Python’s sort is **stable** (ties keep their order). Sort by several fields with a tuple: `key=lambda p: (-p[1], p[0])` means “score descending, then name ascending”.',
        ),
      },
      {
        type: 'callout',
        tone: 'tip',
        md: '`heapq` is a **min**-heap. For a max-heap push `-x` and read `-h[0]`. To keep the k largest items, use a **min**-heap of size k and pop whenever it grows past k.',
      },
      {
        type: 'exercise',
        id: 'is-anagram',
        title: 'Valid anagram',
        prompt: 'Return `True` if `t` is an anagram of `s`. (NeetCode’s *Valid Anagram*.)',
        starter: `def is_anagram(s, t):
    # your code here
    pass`,
        tests: `assert is_anagram("anagram", "nagaram") is True
assert is_anagram("rat", "car") is False
assert is_anagram("ab", "a") is False`,
        hint: 'Compare two `Counter`s.',
        solution: `from collections import Counter

def is_anagram(s, t):
    return Counter(s) == Counter(t)`,
      },
      {
        type: 'exercise',
        id: 'top-k-frequent',
        title: 'Top k frequent elements',
        prompt: 'Return the `k` most frequent values, most frequent first. (Counts in the tests have no ties.)',
        starter: `def top_k_frequent(nums, k):
    # your code here
    pass`,
        tests: `assert top_k_frequent([1, 1, 1, 2, 2, 3], 2) == [1, 2]
assert top_k_frequent([4], 1) == [4]
assert top_k_frequent([5, 5, 6, 6, 6, 7], 1) == [6]`,
        hint: '`Counter(nums).most_common(k)` gives `(value, count)` pairs.',
        solution: `from collections import Counter

def top_k_frequent(nums, k):
    return [x for x, _ in Counter(nums).most_common(k)]`,
      },
      {
        type: 'exercise',
        id: 'k-largest',
        title: 'k-th largest with a heap',
        prompt: 'Return the k-th largest value using a **min-heap of size k** — O(n log k).',
        starter: `import heapq

def kth_largest(nums, k):
    # your code here
    pass`,
        tests: `assert kth_largest([3, 2, 1, 5, 6, 4], 2) == 5
assert kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
assert kth_largest([1], 1) == 1`,
        hint: 'Push every number; whenever the heap holds more than k items, pop the smallest. The answer is `h[0]`.',
        solution: `import heapq

def kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return h[0]`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why `deque` instead of a list for a BFS queue?', answer: '`popleft()` is O(1); `list.pop(0)` is O(n).' },
          { question: 'Why a MIN-heap to keep the k LARGEST items?', answer: 'Its smallest item is at the top — exactly the one to evict when something bigger arrives.' },
          { question: 'What does `Counter("abca")["z"]` return?', answer: '`0` — a missing key counts as zero (and is not added).' },
        ],
      },
    ],
    furtherReading: [
      { label: 'collections — Container datatypes', url: `${PY}/library/collections.html` },
      { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
      { label: 'Sorting HOW TO', url: `${PY}/howto/sorting.html` },
      { label: 'Video: Python for Coding Interviews (NeetCode)', url: 'https://www.youtube.com/watch?v=0K_eZGS5NsU' },
    ],
  },
]
