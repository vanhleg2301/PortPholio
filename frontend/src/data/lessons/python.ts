import type { Lesson } from './types'

const PY = 'https://docs.python.org/3'
const md = (...lines: string[]) => lines.join('\n')
const CODDY = { label: 'Coddy — extra practice', url: 'https://coddy.tech/' }
const yt = (label: string, id: string) => ({ label, url: `https://www.youtube.com/watch?v=${id}` })

export const PYTHON_LESSONS: Lesson[] = [
  {
    id: 'py-variables',
    title: 'Variables, numbers and types',
    summary: 'A variable is a name that points to an object, and the object knows its own type. Learn the four basic types, how Python does maths, and one rule about shared objects that causes many beginner bugs.',
    minutes: 35,
    videos: [yt('Corey Schafer: Integers and Floats (20 min)', 'khKv-8q7YmY')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Names point at objects',
          'In Python, a variable is **a name that points to an [[object]]**. It is not a box with a value inside. `x = 5` makes an `int` object and puts the label `x` on it.',
          '',
          'The **type belongs to the object**, not to the name. So the same name can point to a string later. We say Python is [[dynamically typed]].',
          '',
          'You will use these four basic types every day:',
          '',
          '| Type | Example | Notes |',
          '| --- | --- | --- |',
          '| `int` | `42`, `-7`, `10**18` | whole numbers, **never [[overflow]]** |',
          '| `float` | `3.14`, `1e-9` | decimal numbers, *not exact* |',
          '| `str` | `"hello"` | text, [[immutable]] |',
          '| `bool` | `True`, `False` | the result of a comparison |',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'In **Java and C**, an `int` variable holds the number itself in a fixed-size box, and only objects are held by reference. In Python **every** name is a reference to an object, even for `5`. That is why `b = a` never copies a list, in Python *and* in Java or JavaScript (arrays and objects are references there too). **C++** is different: `vector<int> b = a;` makes a real copy unless you use a reference `&`.',
      },
      {
        type: 'code',
        id: 'types',
        caption: 'Run it. Then change the values and run it again.',
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
          '## Maths you will use in interviews',
          '- `/` always gives a float. `//` is [[floor division]]: it rounds **down**, also for negative numbers.',
          '- `%` gives the [[remainder]]. `n % 2 == 0` checks for even numbers. `n % 10` is the last digit.',
          '- `divmod(a, b)` gives `(a // b, a % b)` in one step.',
          '- Never compare floats with `==`. Check that the difference is very small instead (`abs(a - b) < 1e-9`). This small number is called a [[tolerance]].',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Overflow:** Java / C / Go ints have a fixed size and wrap around silently (`Integer.MAX_VALUE + 1` is negative); Python ints never [[overflow]]. **Division:** Python’s `//` rounds down (`-7 // 2 == -4`), Java and C round towards zero (`-7 / 2 == -3`), and `%` differs too (`-7 % 2` is `1` in Python, `-1` in Java). **JavaScript** has one number type (64-bit floats): `7 / 2` is `3.5`, use `Math.floor` or `Math.trunc` for integer division, and integers are exact only up to 2⁵³.',
      },
      {
        type: 'visual',
        visual: 'aliasing',
        caption: 'Choose what line 3 does, then press play: which changes reach a?',
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
        type: 'text',
        md: md(
          '## `is` or `==`?',
          '- `==` asks: **do they have the same value?**',
          '- `is` asks: **are they the same object?** Use it mainly for `x is None`.',
          '',
          'Two names for one object is called [[aliasing]]. It is safe with immutable objects, because nobody can change them. It is risky with [[mutable]] objects.',
        ),
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Mutable objects (`list`, `dict`, `set`) can change **in place**, so every name that points to them sees the change. Immutable objects (`int`, `float`, `str`, `tuple`) cannot change. When you “change” them, Python makes a new object.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'A Python `int` has [[arbitrary precision]]: `2 ** 100` just works. In Java or C++ the same code would overflow. Say this when an interviewer asks about integer limits.',
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
        hint: 'Hours = how many full 60s fit in the number. Minutes = what is left.',
        solution: `def minutes_to_hm(total):
    return divmod(total, 60)`,
      },
      {
        type: 'exercise',
        id: 'last-digit-sum',
        title: 'Sum of digits',
        prompt: 'Return the sum of the digits of a non-negative integer. Use `% 10` and `// 10` (no strings).',
        starter: `def digit_sum(n):
    # your code here
    pass`,
        tests: `assert digit_sum(0) == 0
assert digit_sum(7) == 7
assert digit_sum(1234) == 10
assert digit_sum(10 ** 20) == 1`,
        hint: 'Loop while n > 0: add n % 10, then remove the last digit with n //= 10.',
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
          { question: 'Why is `0.1 + 0.2 == 0.3` False?', answer: 'Floats are stored in binary, so they are not exact. Compare with a tolerance instead.' },
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
    summary: 'A string is an immutable sequence of characters. Indexing, slicing and about ten methods solve most string problems. And join() is much faster than adding strings in a loop.',
    minutes: 35,
    videos: [yt('Corey Schafer: Strings (22 min)', 'k9TUPpGqYTo')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Indexing and slicing',
          'A string is a [[sequence]]. Every character has an [[index]] that starts at `0`. Negative indexes count from the end.',
          '',
          '| `s = "python"` | p | y | t | h | o | n |',
          '| --- | --- | --- | --- | --- | --- | --- |',
          '| index | 0 | 1 | 2 | 3 | 4 | 5 |',
          '| negative | -6 | -5 | -4 | -3 | -2 | -1 |',
          '',
          '[[slicing|Slice]] with `s[start:stop:step]`. It takes characters from `start` up to `stop`, **but `stop` is not included**. If you leave a part out, Python uses the start, the end and `1`. `s[::-1]` gives the string backwards.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Strings are [[immutable]] in **Java, JavaScript and C#** too; **C++** `std::string` can be changed in place. Negative indexes and slices are a Python luxury: Java writes `s.substring(1, 4)` and `s.charAt(s.length() - 1)`; JavaScript has `s.slice(1, 4)` and, since 2022, `s.at(-1)`. To build a long string, Java uses `StringBuilder` and Python uses `"".join(parts)` — never `+=` in a big loop in either language.',
      },
      {
        type: 'code',
        id: 'slicing',
        code: `s = "python"
print(s[0], s[-1], s[1:4], s[:2], s[2:], s[::-1])   # p n yth py thon nohtyp
print(len(s), "th" in s, s.find("th"), s.find("x"))  # 6 True 2 -1`,
      },
      {
        type: 'visual',
        visual: 'slicing',
        caption: 'Change start, stop and step — try a negative step.',
      },
      {
        type: 'text',
        md: md(
          '## Methods that solve most problems',
          '- Cleaning: `strip()`, `lower()`, `upper()`, `replace(a, b)`',
          '- Splitting and joining: `"a b c".split()` gives a list, `" ".join(words)` gives a string',
          '- Checks: `isalnum()` (letter or digit), `isdigit()`, `isalpha()`, `startswith()`, `endswith()`',
          '- Characters and numbers: `ord("a") == 97`, `chr(97) == "a"`. This is useful for counting 26 letters.',
          '- Formatting: [[f-string|f-strings]], `f"{name} has {n} items"`',
          '- Searching: `s.find(x)` gives the first position or `-1`; `s.index(x)` is the same but raises `ValueError` when `x` is missing; `s.rfind(x)` searches from the end; `s.count(x)` counts matches.',
          '- Repeating: `"ab" * 3` is `"ababab"`.',
          '- Comparing: `<` and `>` compare strings **character by character** using their codes. Upper case comes before lower case (`"Z" < "a"`), and `"10" < "9"`, because `"1"` comes before `"9"`. Never compare numbers stored as strings.',
          '',
          'Every method **returns a new string**. The old string never changes, because strings are [[immutable]].',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Same tools, other names: Java `s.split(",")` takes a **regular expression** (so `split(".")` does not do what you think), JavaScript `s.split(",")` takes plain text; `strip` is `trim()` in Java and JavaScript; `str.join(list)` is `String.join(",", list)` in Java and `arr.join(",")` in JavaScript (the method is on the array, not on the separator).',
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
        md: 'Strings are immutable, so `s += "x"` builds a **brand-new string** every time. In a loop this can cost O(n²) ([[big o|Big O]]). Put the pieces in a list and call `"".join(parts)` once at the end.',
      },
      {
        type: 'exercise',
        id: 'valid-palindrome',
        title: 'Valid palindrome',
        prompt: 'Return `True` if `s` is a [[palindrome]] — it reads the same forwards and backwards. **Ignore case and every character that is not a letter or digit.** (This is NeetCode’s *Valid Palindrome*.)',
        starter: `def is_palindrome(s):
    # your code here
    pass`,
        tests: `assert is_palindrome("A man, a plan, a canal: Panama") is True
assert is_palindrome("race a car") is False
assert is_palindrome(" ") is True
assert is_palindrome("0P") is False`,
        hint: 'Build a clean string with `"".join(ch.lower() for ch in s if ch.isalnum())`, then compare it with its reverse.',
        solution: `def is_palindrome(s):
    clean = "".join(ch.lower() for ch in s if ch.isalnum())
    return clean == clean[::-1]`,
      },
      {
        type: 'exercise',
        id: 'reverse-words',
        title: 'Reverse the words',
        prompt: 'Return the words of `s` in reverse order, with one space between them. Remove extra spaces.',
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
        prompt: 'Return a list of 26 counts: how many times each letter `a`–`z` appears in a lowercase string. Use `ord()`.',
        starter: `def letter_counts(s):
    # your code here
    pass`,
        tests: `counts = letter_counts("banana")
assert len(counts) == 26
assert counts[0] == 3 and counts[1] == 1 and counts[13] == 2, counts
assert sum(letter_counts("")) == 0`,
        hint: 'Start with `[0] * 26`. Add 1 at index `ord(ch) - ord("a")`.',
        solution: `def letter_counts(s):
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord("a")] += 1
    return counts`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What is `"python"[1:4]`?', answer: '`"yth"`: from index 1 up to 4, but 4 is not included.' },
          { question: 'Can you write `s[0] = "P"`?', answer: 'No — strings are immutable. Build a new one: `"P" + s[1:]`.' },
          { question: 'What is the fastest way to build a long string from many pieces?', answer: 'Add the pieces to a list and call `"".join(parts)` once.' },
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
    summary: 'A list is an array that can grow. It is fast at the end and slow at the front. A tuple is a fixed group of values: you can unpack it and use it as a dict key.',
    minutes: 40,
    videos: [yt('Corey Schafer: Lists, Tuples, and Sets (30 min)', 'W8KRzm-HUcc')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## A list is a dynamic array',
          'A list is a [[dynamic array]]. It keeps [[reference|references]] to its items next to each other in memory, with some free space at the end. This one fact explains every cost you need to know:',
          '',
          '| Operation | Cost | Why |',
          '| --- | --- | --- |',
          '| `a[i]`, `a[i] = x` | O(1) | jump straight to the slot |',
          '| `a.append(x)`, `a.pop()` | O(1)* | work at the end (*[[amortized]]) |',
          '| `a.insert(0, x)`, `a.pop(0)` | O(n) | every item must move |',
          '| `x in a` | O(n) | checks items one by one |',
          '| `a.remove(x)` | O(n) | finds the first `x`, then moves the items after it |',
          '| `a.sort()` | O(n log n) | Python uses [[timsort|Timsort]] |',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Python `list` = Java `ArrayList` = C++ `vector` = JavaScript `Array`: all are [[dynamic array|dynamic arrays]] with O(1) amortized append. Plain arrays in **C and Java** (`int[] a = new int[10]`) have a fixed size but store the numbers themselves, packed tightly — faster and smaller. A Python list stores [[reference|references]] to objects, so it can mix types but uses more memory; for big numeric data people use NumPy arrays, which store raw numbers like C.',
      },
      {
        type: 'visual',
        visual: 'dynamic-array',
        caption: 'Copying happens rarely, so the average work per append stays small.',
      },
      {
        type: 'code',
        id: 'list-ops',
        code: `nums = [5, 3, 8]
nums.append(1)
nums.insert(0, 9)
print(nums)                            # [9, 5, 3, 8, 1]
last = nums.pop()
print(last, nums)                      # 1 [9, 5, 3, 8]

print(sorted(nums), nums)              # [3, 5, 8, 9] [9, 5, 3, 8]  (sorted() makes a copy)
nums.sort(reverse=True)
print(nums)                            # [9, 8, 5, 3]  (sort() changes the list itself)

words = ["kiwi", "fig", "banana"]
print(sorted(words, key=len))          # ['fig', 'kiwi', 'banana']
for i, w in enumerate(words):
    print(i, w)`,
      },
      {
        type: 'text',
        md: md(
          '## Tuples and unpacking',
          'A tuple is a list that cannot change: `point = (3, 4)`. Use it for small fixed groups of values, to return several values from a function, and as dict keys (a list cannot be a key).',
          '',
          '[[Unpacking]] gives several names at once: `x, y = point`. To swap two values you do not need a temporary variable: `a, b = b, a`.',
          '',
          'Python’s sort is [[stable sort|stable]]: items with the same key keep their old order. `zip` stops at the **shortest** sequence.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Java has no tuples (use a small `record`, e.g. `record Point(int x, int y)`); C++ has `std::pair` / `std::tuple`; Go returns several values directly (`q, r := divmod(a, b)`); JavaScript uses arrays and destructuring: `[a, b] = [b, a]` swaps like Python’s `a, b = b, a`.',
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
        md: md(
          '`grid = [[0] * 3] * 3` makes **three references to the same row**. Change one row and all three change. Use `[[0] * 3 for _ in range(3)]` for a real 2-D grid.',
          '',
          '`a[:]` is a **shallow** copy: a new outer list, but inner lists are shared. Use `copy.deepcopy(a)` to copy nested lists too.',
          '',
          'Do not add or remove items while you loop over the **same** list — the loop skips items. Build a new list instead.',
        ),
      },
      {
        type: 'exercise',
        id: 'running-sum',
        title: 'Running sum',
        prompt: 'Return a new list where item `i` is the sum of `nums[0..i]`. This [[prefix sum]] trick appears in many array problems.',
        starter: `def running_sum(nums):
    # your code here
    pass`,
        tests: `assert running_sum([1, 2, 3, 4]) == [1, 3, 6, 10]
assert running_sum([]) == []
assert running_sum([5]) == [5]
assert running_sum([3, -1, 2]) == [3, 2, 4]`,
        hint: 'Keep a running `total`. Add each number to it, then append the total.',
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
        prompt: 'Return a new list moved right by `k` steps: `[1, 2, 3, 4, 5]`, `k = 2` → `[4, 5, 1, 2, 3]`. `k` can be bigger than the length.',
        starter: `def rotate_right(nums, k):
    # your code here
    pass`,
        tests: `assert rotate_right([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3]
assert rotate_right([1, 2, 3], 3) == [1, 2, 3]
assert rotate_right([1, 2, 3], 4) == [3, 1, 2]
assert rotate_right([], 5) == []`,
        hint: 'Make k smaller with `k % len(nums)` (be careful with an empty list). Then join two slices.',
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
        prompt: 'Return the second largest **different** value, or `None` if there is none. Do it in one pass, without sorting.',
        starter: `def second_largest(nums):
    # your code here
    pass`,
        tests: `assert second_largest([3, 1, 4, 4, 2]) == 3
assert second_largest([7, 7]) is None
assert second_largest([]) is None
assert second_largest([-1, -5, -3]) == -3`,
        hint: 'Keep `first` and `second` (start with `None`). Skip numbers that are equal to `first`.',
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
          { question: 'Why is `nums.pop(0)` slow on a long list?', answer: 'Every other item must move one slot left: O(n). Use `collections.deque` for queues.' },
          { question: '`sorted(a)` or `a.sort()`?', answer: '`sorted` returns a new list and does not change `a`. `a.sort()` changes `a` itself and returns `None`.' },
          { question: 'Why can a tuple be a dict key, but a list cannot?', answer: 'Keys must be hashable (they never change). Tuples are immutable; lists are not.' },
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
    summary: 'Hash tables find things in O(1) time on average. Most “make it faster” answers in interviews use a dict or a set.',
    minutes: 40,
    videos: [yt('Corey Schafer: Dictionaries (10 min)', 'daefaLgNkw0'), yt('NeetCode: Contains Duplicate', '3OamzN90kPg'), yt('NeetCode: Two Sum', 'KLlXCFG5TnA')],
    blocks: [
      {
        type: 'text',
        md: md(
          '## How a hash table finds things',
          'A dict and a set are [[hash table|hash tables]]. `hash(key)` turns the key into a number, and that number chooses a slot. So Python jumps straight to the slot. It does not check items one by one. That is why `key in d` is O(1) on average, but `x in some_list` is O(n).',
          '',
          'Keys must be [[hashable]], which means they can never change: `str`, `int` and `tuple` work; `list`, `dict` and `set` do not.',
          '',
          'Sometimes two keys get the same slot. This is a [[collision]]. Python handles it for you, but many collisions make lookups slower. That is why we say O(1) **on average**, not always.',
          '',
          'A key appears only once: `d["a"] = 2` replaces the old value. And do not add or delete keys while you loop over the same dict — Python raises `RuntimeError`. Loop over a copy instead: `for k in list(d):`.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Same [[hash table]], other names: Java `HashMap` / `HashSet`, C++ `unordered_map` / `unordered_set`, JavaScript `Map` / `Set`, Go `map`. Differences that bite: Java `HashMap` and Go `map` give **no order** when you loop (Go even randomises it on purpose), while a Python `dict` keeps insertion order (3.7+). C++ `std::map` is a sorted tree — O(log n), not O(1). A plain JavaScript object turns every key into a **string** (`obj[1]` and `obj["1"]` are the same key); use `Map` for real keys. Java finds keys with `hashCode()` + `equals()`, Python with `__hash__` + `__eq__`.',
      },
      {
        type: 'visual',
        visual: 'hash-table',
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
        md: 'Say the [[trade-off]] out loud: “Brute force checks every pair, so it is O(n²). A hash map makes it O(n), but it uses O(n) extra memory.”',
      },
      {
        type: 'exercise',
        id: 'contains-duplicate',
        title: 'Contains duplicate',
        prompt: 'Return `True` if any value appears two or more times. Aim for O(n). (NeetCode’s *Contains Duplicate*.)',
        starter: `def contains_duplicate(nums):
    # your code here
    pass`,
        tests: `assert contains_duplicate([1, 2, 3, 1]) is True
assert contains_duplicate([1, 2, 3, 4]) is False
assert contains_duplicate([]) is False`,
        hint: 'Keep a `seen` set. Or compare `len(set(nums))` with `len(nums)`.',
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
        prompt: 'Return the index of the first character that appears only once in `s`, or `-1`.',
        starter: `def first_unique(s):
    # your code here
    pass`,
        tests: `assert first_unique("leetcode") == 0
assert first_unique("loveleetcode") == 2
assert first_unique("aabb") == -1`,
        hint: 'Two passes: count every character, then find the first one with count 1.',
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
        prompt: 'Return the indexes `[i, j]` of two numbers that add up to `target` (there is exactly one answer, `i < j`). Use one pass with a dict. (NeetCode’s *Two Sum*.)',
        starter: `def two_sum(nums, target):
    # your code here
    pass`,
        tests: `assert two_sum([2, 7, 11, 15], 9) == [0, 1]
assert two_sum([3, 2, 4], 6) == [1, 2]
assert two_sum([3, 3], 6) == [0, 1]`,
        hint: 'For each `x`, check if `target - x` is already in a dict of value → index. Check first, then store.',
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
          { question: 'Cost of `x in my_set` and of `x in my_list`?', answer: 'O(1) on average for the set, O(n) for the list.' },
          { question: 'What does `d.get(k, 0)` do that `d[k]` does not?', answer: 'It returns 0 when the key is missing. `d[k]` raises `KeyError`.' },
          { question: 'Do dicts keep the order you added things?', answer: 'Yes, since Python 3.7. Sets have no order.' },
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
    summary: 'Write loops the Python way (enumerate, zip, comprehensions). Write functions that are easy to test, and avoid the mutable default trap.',
    minutes: 40,
    videos: [
      yt('Corey Schafer: Loops and Iterations (11 min)', '6iF8Xb7Z3wQ'),
      yt('Corey Schafer: Functions (22 min)', '9Os0o3wzS_I'),
      yt('Corey Schafer: Comprehensions (13 min)', '3dt4OGnU5sM'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Loops',
          '- `for x in items:` walks over any [[iterable]]. `range(n)` gives `0 … n-1`.',
          '- `enumerate(items)` gives `(index, value)` pairs (`start=1` makes it count from 1). `zip(a, b)` puts two sequences side by side.',
          '- Use `while condition:` when you do not know the number of steps (two pointers, binary search).',
          '- `break` leaves the loop. `continue` jumps to the next round.',
          '- A loop can have an `else` block: it runs only when the loop ends **without** `break` — handy for “search, and do something if not found”.',
          '- The loop variable still exists after a `for` loop and keeps its last value.',
          '',
          'A [[comprehension]] builds a collection in one line: `[x * x for x in nums if x > 0]`. The same shape works for sets `{…}` and dicts `{k: v …}`.',
        ),
      },
      {
        type: 'code',
        id: 'loops',
        code: `nums = [3, -1, 4, -1, 5]
squares = [x * x for x in nums if x > 0]
print(squares)                                  # [9, 16, 25]

index_of = {x: i for i, x in enumerate(nums)}   # the last index wins
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
          '`def name(params):` … `return value`. A function with no `return` gives back `None`.',
          '',
          '- Default values: `def greet(name, greeting="Hi")`.',
          '- **Python creates default values only once**, when it reads the `def` line. So a mutable default (`[]`, `{}`) is **shared by all calls**.',
          '- A variable you assign inside a function is [[local variable|local]]. Use `nonlocal` to change a variable of the outer function (you will see this in [[recursion|recursive]] helpers).',
          '- `lambda x: x[1]` is a small function with no name ([[lambda]]). We use it mostly as `key=` when sorting.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Arguments are passed as [[reference|references]] to objects in Python, Java (for objects) and JavaScript: a function can change a list you pass, but cannot rebind your variable. C++ chooses per parameter (copy, `&` reference, or pointer). The mutable-default trap is Python-only: JavaScript evaluates a default value **on every call**, and Java has no default arguments at all (it uses overloading).',
      },
      {
        type: 'code',
        id: 'mutable-default',
        caption: 'Run this and see the trap. Then compare it with the fixed version.',
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
        type: 'visual',
        visual: 'call-stack',
        caption: 'Each call waits on the stack until the smaller call returns.',
      },
      {
        type: 'text',
        md: md(
          '## Recursion in one minute',
          'A [[recursion|recursive]] function calls itself on a smaller problem. It needs a [[base case]] — a small case it answers directly — or it never stops. Every waiting call uses memory on the [[call stack]]. Python stops at about 1,000 levels with `RecursionError`, so a loop is often safer for long inputs.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Python stops deep recursion at about 1,000 calls (`RecursionError`). Java’s limit depends on the thread’s stack size, usually thousands of calls; C and C++ just crash with a stack overflow. Python, Java and (in practice) JavaScript do **not** turn tail calls into loops, unlike Scheme or Scala’s `@tailrec`. In interviews, if the input can be 10⁵ deep, write the loop with your own stack.',
      },
      {
        type: 'exercise',
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        prompt: 'Return a list of strings for `1..n`: `"Fizz"` for multiples of 3, `"Buzz"` for multiples of 5, `"FizzBuzz"` for both, and the number as a string for the rest.',
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
        prompt: 'Return the [[transpose]] of a rectangular matrix (rows become columns). Use a comprehension.',
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
        prompt: 'Return the n-th Fibonacci number (`fib(0) = 0`, `fib(1) = 1`). Use a loop and two variables: O(n) time, O(1) memory.',
        starter: `def fib(n):
    # your code here
    pass`,
        tests: `assert [fib(i) for i in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13]
assert fib(50) == 12586269025`,
        hint: 'Start with `a, b = 0, 1` and do `a, b = b, a + b` n times.',
        solution: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What does a function with no `return` give back?', answer: '`None`.' },
          { question: 'Why is `def f(x, acc=[])` dangerous?', answer: 'Python creates the default list once, and every call shares it. Use `None` and create the list inside.' },
          { question: 'Write `out = []; for x in a: if x % 2: out.append(x)` in one line.', answer: '`out = [x for x in a if x % 2]`' },
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
    videos: [
      yt('NeetCode: Python for Coding Interviews', '0K_eZGS5NsU'),
      yt('Corey Schafer: Sorting Lists, Tuples, and Objects (10 min)', 'D3JvDWO-BY4'),
      yt('NeetCode: Valid Anagram', '9UtInBqnCgA'),
    ],
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
        type: 'text',
        md: md(
          '## Five tools',
          '- `Counter`: a dict that counts things. A missing key counts as `0`.',
          '- `defaultdict(list)`: a dict that makes an empty list the first time you use a key. Good for grouping.',
          '- `deque`: a [[deque|double-ended queue]]. Adding or removing at **both ends** is O(1). `deque(maxlen=k)` keeps only the last k items.',
          '- `heapq`: a [[heap|min-heap]]. The smallest item is always at `h[0]`. Push and pop are O(log n). `heapq.nsmallest(k, items)` and `heapq.nlargest(k, items)` give the k smallest / largest.',
          '- `sorted(items, key=…)`: sort by any rule you want.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Java: `HashMap` for counting (`merge(k, 1, Integer::sum)`), `ArrayDeque` for a [[deque]], `PriorityQueue` — a **min**-[[heap]] by default, like `heapq`. C++: `std::priority_queue` is a **max**-heap by default (opposite of Python!). JavaScript has **no** built-in heap or deque: in a JS interview you write a heap yourself, and `arr.shift()` is O(n). This is one reason Python is popular for interviews.',
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
        type: 'visual',
        visual: 'heap',
        caption: 'Push some numbers, then pop: watch them sift up and down.',
      },
      {
        type: 'text',
        md: md(
          '## Sorting with a key',
          '`sorted(items, key=…)` sorts by whatever the key function returns. Python’s sort is [[stable sort|stable]]: equal items keep their old order. To sort by several fields, return a tuple: `key=lambda p: (-p[1], p[0])` means “score from high to low, then name from A to Z”.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'Java sorts with a `Comparator` (`list.sort(Comparator.comparing(s -> s.length()))`), C++ with a compare function, JavaScript with `(a, b) => a - b`. JavaScript’s trap: `[10, 9, 1].sort()` gives `[1, 10, 9]`, because without a function it compares as **strings**. Python’s `sorted` and Java’s object sort are both [[stable sort|stable]].',
      },
      {
        type: 'callout',
        tone: 'tip',
        md: '`heapq` is a **min**-heap. For a max-heap, push `-x` and read `-h[0]`. To keep the k largest items, use a **min**-heap of size k, and pop when it has more than k items.',
      },
      {
        type: 'exercise',
        id: 'is-anagram',
        title: 'Valid anagram',
        prompt: 'Return `True` if `t` is an [[anagram]] of `s`. (NeetCode’s *Valid Anagram*.)',
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
        prompt: 'Return the `k` most frequent values, the most frequent first. (In the tests, no two counts are equal.)',
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
        prompt: 'Return the k-th largest value. Use a **min-heap of size k**: O(n log k).',
        starter: `import heapq

def kth_largest(nums, k):
    # your code here
    pass`,
        tests: `assert kth_largest([3, 2, 1, 5, 6, 4], 2) == 5
assert kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
assert kth_largest([1], 1) == 1`,
        hint: 'Push every number. When the heap has more than k items, pop the smallest. The answer is `h[0]`.',
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
          { question: 'Why use `deque` and not a list for a BFS queue?', answer: '`popleft()` is O(1). `list.pop(0)` is O(n).' },
          { question: 'Why a MIN-heap to keep the k LARGEST items?', answer: 'Its smallest item is on top — exactly the one to remove when a bigger one arrives.' },
          { question: 'What does `Counter("abca")["z"]` return?', answer: '`0` — a missing key counts as zero (and it is not added).' },
        ],
      },
    ],
    furtherReading: [
      { label: 'collections — Container datatypes', url: `${PY}/library/collections.html` },
      { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
      { label: 'Sorting HOW TO', url: `${PY}/howto/sorting.html` },
    ],
  },
]
