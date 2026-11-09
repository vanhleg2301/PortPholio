// Python quick reference: the built-ins and standard-library tools used in interviews and daily
// work, to look up while solving a problem. Every example was run in Python 3 and each `print`
// line's comment is its exact output (checked by scripts/check-lessons.ts).

export type ReferenceModule =
  | 'Built-in functions'
  | 'str methods'
  | 'list methods'
  | 'dict methods'
  | 'set methods'
  | 'collections'
  | 'heapq'
  | 'bisect'
  | 'itertools'
  | 'functools'
  | 'math'

export interface ReferenceItem {
  id: string
  module: ReferenceModule
  name: string
  signature: string
  // What it does, in plain English.
  what: string
  example: string
  // Time cost, n = size of the input.
  cost?: string
  gotcha?: string
  // The same thing in other languages.
  other?: string
  // Path on docs.python.org/3, with its #anchor.
  doc: string
  // Extra words people search for ("sort" finds sorted and list.sort).
  aliases?: string
}

const DOCS = 'https://docs.python.org/3/'
export const referenceDocUrl = (item: ReferenceItem) => `${DOCS}${item.doc}`

type Extra = Pick<ReferenceItem, 'cost' | 'gotcha' | 'other' | 'aliases'>

function item(module: ReferenceModule, name: string, signature: string, what: string, example: string, doc: string, extra: Extra = {}): ReferenceItem {
  return { id: `ref:${module}:${name}`, module, name, signature, what, example, doc, ...extra }
}

const F = 'library/functions.html#'
const S = 'library/stdtypes.html#'

// range, str, list, set, dict and tuple are classes: their docs anchor is "func-<name>".
const CLASS_ANCHOR = new Set(['range', 'str', 'list', 'set', 'dict', 'tuple'])
const builtins = (name: string, signature: string, what: string, example: string, extra?: Extra) =>
  item('Built-in functions', `${name}()`, signature, what, example, `${F}${CLASS_ANCHOR.has(name) ? 'func-' : ''}${name}`, extra)

export const PYTHON_REFERENCE: ReferenceItem[] = [
  // ── Built-in functions ───────────────────────────────
  builtins('len', 'len(x)', 'Number of items in a list, string, dict, set or tuple.', `print(len([3, 1, 4]))      # 3
print(len("hello"))         # 5
print(len({"a": 1, "b": 2}))  # 2`, { cost: 'O(1)', other: 'JavaScript `arr.length`, Java `list.size()` / `str.length()`, C++ `v.size()`', aliases: 'length size count' }),
  builtins('range', 'range(stop) · range(start, stop[, step])', 'A sequence of numbers from start up to stop (stop is not included). It does not build a list in memory.', `print(list(range(5)))         # [0, 1, 2, 3, 4]
print(list(range(2, 10, 3)))  # [2, 5, 8]
print(list(range(5, 0, -1)))  # [5, 4, 3, 2, 1]`, { cost: 'O(1) to create; O(1) memory', gotcha: '`range(1, 5)` stops at 4. To count down, use a negative step.', other: 'C / Java `for (int i = 0; i < n; i++)`' }),
  builtins('enumerate', 'enumerate(iterable, start=0)', 'Loop over items and get their index too.', `for i, ch in enumerate("abc"):
    print(i, ch)
# 0 a
# 1 b
# 2 c
print(list(enumerate(["x", "y"], start=1)))  # [(1, 'x'), (2, 'y')]`, { gotcha: 'Prefer it to `for i in range(len(a))` when you need both index and value.', aliases: 'index loop' }),
  builtins('zip', 'zip(*iterables, strict=False)', 'Walk several sequences side by side, as tuples. Stops at the shortest one.', `names = ["An", "Binh"]
ages = [25, 31]
print(list(zip(names, ages)))   # [('An', 25), ('Binh', 31)]
print(dict(zip(names, ages)))   # {'An': 25, 'Binh': 31}
print(list(zip(*[(1, 2), (3, 4)])))  # [(1, 3), (2, 4)]`, { gotcha: 'Different lengths are cut silently; pass `strict=True` to get an error instead. `zip(*grid)` transposes a grid.', aliases: 'pair transpose' }),
  builtins('sorted', 'sorted(iterable, *, key=None, reverse=False)', 'Returns a NEW sorted list. Works on any iterable (list, string, dict keys, set).', `print(sorted([3, 1, 2]))                  # [1, 2, 3]
print(sorted("bca"))                       # ['a', 'b', 'c']
words = ["pear", "fig", "apple"]
print(sorted(words, key=len))              # ['fig', 'pear', 'apple']
print(sorted(words, key=lambda w: (-len(w), w)))  # ['apple', 'pear', 'fig']`, { cost: 'O(n log n); stable', gotcha: 'It returns a new list; `list.sort()` sorts in place and returns `None`. For several keys, return a tuple from `key`.', other: 'JavaScript `arr.sort()` changes the array and compares as strings by default; Java `Collections.sort` / `Arrays.sort`.', aliases: 'sort order' }),
  builtins('reversed', 'reversed(sequence)', 'An iterator over the items from last to first.', `print(list(reversed([1, 2, 3])))  # [3, 2, 1]
print("".join(reversed("abc")))    # cba`, { cost: 'O(1) to create', gotcha: 'It is an iterator: use it once, or wrap it in `list()`. `s[::-1]` also reverses and makes a copy.', aliases: 'reverse backwards' }),
  builtins('min', 'min(iterable, *, key=None, default) · min(a, b, ...)', 'Smallest item. With `key`, smallest by that value.', `print(min([4, 2, 8]))                # 2
print(min(3, 7))                      # 3
print(min(["pear", "fig"], key=len))  # fig
print(min([], default=0))             # 0`, { cost: 'O(n)', gotcha: '`min([])` raises `ValueError`; give `default=`.', aliases: 'minimum smallest' }),
  builtins('max', 'max(iterable, *, key=None, default) · max(a, b, ...)', 'Largest item. With `key`, largest by that value.', `print(max([4, 2, 8]))                # 8
counts = {"a": 3, "b": 5}
print(max(counts, key=counts.get))    # b`, { cost: 'O(n)', gotcha: '`max(d)` compares the keys; use `key=d.get` to compare values.', aliases: 'maximum largest' }),
  builtins('sum', 'sum(iterable, start=0)', 'Adds up numbers.', `print(sum([1, 2, 3]))        # 6
print(sum(x * x for x in range(4)))  # 14
print(sum([0.1] * 3))         # 0.30000000000000004`, { cost: 'O(n)', gotcha: 'Floats add up with tiny errors; use `math.fsum` when it matters. Do not use `sum` to join strings — use `"".join`.', aliases: 'total add' }),
  builtins('abs', 'abs(x)', 'Distance from zero.', `print(abs(-7))     # 7
print(abs(3 - 10))  # 7`, { cost: 'O(1)' }),
  builtins('divmod', 'divmod(a, b)', 'Floor division and remainder in one step: `(a // b, a % b)`.', `print(divmod(17, 5))   # (3, 2)
print(divmod(-7, 2))   # (-4, 1)`, { gotcha: 'Python rounds down (towards minus infinity): `-7 // 2` is -4, not -3 like C or Java.', aliases: 'quotient remainder modulo' }),
  builtins('pow', 'pow(base, exp, mod=None)', 'Power; with `mod`, a fast modular power.', `print(pow(2, 10))          # 1024
print(pow(3, 200, 1000))   # 1`, { cost: 'O(log exp) with mod', other: 'Java `BigInteger.modPow`; C++ needs your own fast power.' }),
  builtins('round', 'round(number, ndigits=None)', 'Round to the nearest whole number (or to `ndigits` decimals).', `print(round(2.5))       # 2
print(round(3.5))       # 4
print(round(3.14159, 2))  # 3.14`, { gotcha: 'Ties go to the even number ("banker’s rounding"): `round(2.5)` is 2.' }),
  builtins('any', 'any(iterable)', 'True if at least one item is truthy. Stops at the first one.', `nums = [3, 8, 11]
print(any(n > 10 for n in nums))  # True
print(any([]))                     # False`, { cost: 'O(n), stops early' }),
  builtins('all', 'all(iterable)', 'True if every item is truthy. Stops at the first falsy one.', `nums = [3, 8, 11]
print(all(n > 0 for n in nums))  # True
print(all([]))                    # True`, { cost: 'O(n), stops early', gotcha: '`all([])` is True (nothing failed).' }),
  builtins('map', 'map(function, iterable, ...)', 'Apply a function to every item (lazily).', `print(list(map(int, ["1", "2", "3"])))  # [1, 2, 3]
print(list(map(str.upper, ["a", "b"])))  # ['A', 'B']`, { gotcha: 'Often clearer as a comprehension: `[int(s) for s in parts]`.' }),
  builtins('filter', 'filter(function, iterable)', 'Keep the items for which the function returns truthy (lazily).', `print(list(filter(lambda n: n % 2 == 0, range(7))))  # [0, 2, 4, 6]
print(list(filter(None, [0, 1, "", "a"])))           # [1, 'a']`, { gotcha: 'A comprehension is usually clearer: `[n for n in nums if n % 2 == 0]`.' }),
  builtins('isinstance', 'isinstance(obj, type_or_tuple)', 'Is this object of that type (or a subclass)?', `print(isinstance(3, int))            # True
print(isinstance("a", (int, float)))  # False
print(isinstance(True, int))          # True`, { gotcha: '`bool` is a subclass of `int`, so `isinstance(True, int)` is True.', aliases: 'type check' }),
  builtins('type', 'type(obj)', 'The type (class) of an object.', `print(type(3))          # <class 'int'>
print(type([]) is list)  # True`, { gotcha: 'To check a type, `isinstance` is usually better (it accepts subclasses).' }),
  builtins('int', 'int(x=0) · int(text, base=10)', 'Make an integer: from a string, a float (cuts the decimals) or another base.', `print(int("42"))        # 42
print(int(3.99))        # 3
print(int("ff", 16))    # 255
print(int("101", 2))    # 5`, { gotcha: '`int(-3.9)` is -3 (towards zero); `-3.9 // 1` is -4.0.', aliases: 'convert parse number' }),
  builtins('str', 'str(obj)', 'Text form of an object.', `print(str(42) + "!")   # 42!
print(str([1, 2]))     # [1, 2]`, { aliases: 'convert to string' }),
  builtins('ord', 'ord(char)', 'The Unicode number of one character.', `print(ord("a"))              # 97
print(ord("c") - ord("a"))   # 2`, { other: 'Java / C: a `char` is already a number: `\'c\' - \'a\'`.', aliases: 'ascii code' }),
  builtins('chr', 'chr(code)', 'The character for a Unicode number.', `print(chr(97))                 # a
print(chr(ord("a") + 25))      # z`, { aliases: 'ascii letter' }),
  builtins('bin', 'bin(n)', 'Binary text of an integer, with a `0b` prefix.', `print(bin(5))                 # 0b101
print(bin(13).count("1"))      # 3`, { gotcha: 'Python 3.10+ also has `n.bit_count()` for the number of 1 bits.', aliases: 'binary bits' }),
  builtins('hash', 'hash(obj)', 'The hash number used by dicts and sets. Only for hashable (unchangeable) objects.', `print(hash((1, 2)) == hash((1, 2)))  # True
try:
    hash([1, 2])
except TypeError as e:
    print(e)                           # unhashable type: 'list'`, { gotcha: 'String hashes change between program runs, so never store them.' }),
  builtins('id', 'id(obj)', 'A number that identifies the object while it lives (in CPython, its memory address).', `a = [1]
b = a
print(id(a) == id(b))   # True
print(a is b)           # True`, { gotcha: '`a is b` is the same as `id(a) == id(b)`.' }),
  builtins('input', 'input(prompt="")', 'Read one line typed by the user, as a string (without the newline).', `# name = input("Your name: ")
# n = int(input())           # convert numbers yourself
print("input() always returns a str")  # input() always returns a str`, { gotcha: 'In coding tests, reading many lines is faster with `sys.stdin.readline`.' }),
  builtins('print', 'print(*values, sep=" ", end="\\n")', 'Write values as text, separated by `sep`, ending with `end`.', `print(1, 2, 3, sep=", ")   # 1, 2, 3
print("a", end="")
print("b")                  # ab`, {}),
  builtins('list', 'list(iterable=())', 'Make a new list (a shallow copy, or from any iterable).', `print(list("abc"))         # ['a', 'b', 'c']
print(list({"x": 1}))      # ['x']`, { cost: 'O(n)', aliases: 'copy convert' }),
  builtins('set', 'set(iterable=())', 'Make a set: unique items, fast `in`.', `print(sorted(set([3, 1, 3, 2])))  # [1, 2, 3]
print(len(set("hello")))          # 4`, { cost: 'O(n) to build; `in` is O(1) average', aliases: 'unique distinct dedupe' }),
  builtins('dict', 'dict(pairs) · dict(key=value, ...)', 'Make a dict from pairs or keyword arguments.', `print(dict([("a", 1), ("b", 2)]))  # {'a': 1, 'b': 2}
print(dict(x=1, y=2))              # {'x': 1, 'y': 2}`, { aliases: 'map hashmap' }),
  builtins('tuple', 'tuple(iterable=())', 'Make a tuple: a fixed, hashable sequence (can be a dict key).', `print(tuple([1, 2]))         # (1, 2)
seen = {tuple(sorted("eat"))}
print(("a", "e", "t") in seen)   # True`, { aliases: 'hashable key' }),

  // ── str methods ───────────────────────────────
  item('str methods', 'str.split()', 's.split(sep=None, maxsplit=-1)', 'Cut a string into a list. With no `sep`, splits on any spaces and drops empty parts.', `print("a b  c".split())        # ['a', 'b', 'c']
print("a,b,,c".split(","))     # ['a', 'b', '', 'c']
print("k=v=w".split("=", 1))   # ['k', 'v=w']`, `${S}str.split`, { cost: 'O(n)', gotcha: '`split()` and `split(" ")` differ: the second keeps empty strings for double spaces.', other: 'JavaScript `s.split(",")`, Java `s.split(regex)` (takes a regex!).' }),
  item('str methods', 'str.join()', 'sep.join(iterable_of_strings)', 'Glue strings together with `sep` between them.', `print("-".join(["a", "b", "c"]))   # a-b-c
print("".join(reversed("abc")))     # cba
print(",".join(map(str, [1, 2])))   # 1,2`, `${S}str.join`, { cost: 'O(total length)', gotcha: 'All items must be strings: convert numbers first. Building a string with `+=` in a loop can be O(n²); collect parts and join once.', other: 'JavaScript `arr.join("-")`, Java `String.join("-", list)`.', aliases: 'concatenate' }),
  item('str methods', 'str.strip()', 's.strip(chars=None)', 'Remove spaces (or the given characters) from both ends. `lstrip` / `rstrip` do one side.', `print("  hi  ".strip())     # hi
print("xxhixx".strip("x"))   # hi
print("line\\n".rstrip())    # line`, `${S}str.strip`, { aliases: 'trim lstrip rstrip whitespace' }),
  item('str methods', 'str.replace()', 's.replace(old, new, count=-1)', 'A new string with `old` replaced by `new`.', `print("a-b-c".replace("-", ""))     # abc
print("aaa".replace("a", "b", 2))   # bba`, `${S}str.replace`, { cost: 'O(n)', gotcha: 'Strings are immutable: assign the result, `s = s.replace(...)`.' }),
  item('str methods', 'str.find()', 's.find(sub, start=0, end=len(s))', 'Index of the first `sub`, or -1 if missing. `rfind` searches from the right.', `print("hello".find("l"))    # 2
print("hello".find("z"))    # -1
print("hello".rfind("l"))   # 3`, `${S}str.find`, { cost: 'O(n·m) worst case', gotcha: '`s.index(sub)` is the same but raises `ValueError` when missing. To only test, write `sub in s`.', aliases: 'search index position' }),
  item('str methods', 'str.count()', 's.count(sub)', 'How many times `sub` appears (non-overlapping).', `print("banana".count("a"))    # 3
print("aaaa".count("aa"))      # 2`, `${S}str.count`, { cost: 'O(n)' }),
  item('str methods', 'str.startswith()', 's.startswith(prefix) · s.endswith(suffix)', 'Does the string start (or end) with this text? Also accepts a tuple of options.', `print("main.py".endswith(".py"))             # True
print("https://x".startswith(("http", "ftp")))  # True`, `${S}str.startswith`, { aliases: 'endswith prefix suffix' }),
  item('str methods', 'str.lower()', 's.lower() · s.upper() · s.title()', 'Change letter case.', `print("HeLLo".lower())   # hello
print("hello".upper())   # HELLO
print("big tech".title())  # Big Tech`, `${S}str.lower`, { aliases: 'upper case casefold' }),
  item('str methods', 'str.isalnum()', 's.isalnum() · s.isalpha() · s.isdigit() · s.isspace()', 'Is every character a letter or digit (or only letters, only digits, only spaces)?', `print("a1".isalnum())   # True
print("a!".isalnum())   # False
print("42".isdigit())   # True
print("".isalpha())     # False`, `${S}str.isalnum`, { gotcha: 'An empty string gives False for all of them. Valid Palindrome uses `ch.isalnum()`.', aliases: 'isalpha isdigit letter digit' }),
  item('str methods', 'str.format / f-string', 'f"{value:spec}"', 'Put values into text, with formatting like decimals, width or thousands separators.', `x, name = 3.14159, "An"
print(f"{name}: {x:.2f}")      # An: 3.14
print(f"{1234567:,}")          # 1,234,567
print(f"{7:03d}|{'ab':>4}|")   # 007|  ab|`, 'reference/lexical_analysis.html#f-strings', { other: 'JavaScript template strings `${x}`; Java `String.format("%.2f", x)`.', aliases: 'fstring format template' }),
  item('str methods', 'str slicing', 's[start:stop:step]', 'Take part of a string (or list). Missing parts mean "from the start" / "to the end".', `s = "abcdef"
print(s[1:4])    # bcd
print(s[:2])     # ab
print(s[-2:])    # ef
print(s[::-1])   # fedcba`, 'library/stdtypes.html#common-sequence-operations', { cost: 'O(k) — makes a copy of k items', gotcha: 'Out-of-range slices do not raise errors: `"abc"[5:]` is `""`.', aliases: 'substring slice reverse' }),

  // ── list methods ───────────────────────────────
  item('list methods', 'list.append()', 'a.append(x)', 'Add one item at the end.', `a = [1, 2]
a.append(3)
print(a)   # [1, 2, 3]`, `${S}list.append`, { cost: 'O(1) amortized', other: 'JavaScript `arr.push(x)`, Java `list.add(x)`, C++ `v.push_back(x)`.', aliases: 'add push' }),
  item('list methods', 'list.extend()', 'a.extend(iterable)', 'Add all items of another iterable at the end.', `a = [1]
a.extend([2, 3])
print(a)   # [1, 2, 3]
a.append([4])
print(a)   # [1, 2, 3, [4]]`, `${S}list.extend`, { cost: 'O(k)', gotcha: '`append(list)` adds ONE item (a nested list); `extend` adds each item.' }),
  item('list methods', 'list.pop()', 'a.pop(i=-1)', 'Remove and return the item at index `i` (the last one by default).', `a = [1, 2, 3]
print(a.pop())    # 3
print(a.pop(0))   # 1
print(a)          # [2]`, `${S}list.pop`, { cost: 'O(1) at the end, O(n) at the front', gotcha: '`pop(0)` shifts every item; for a queue use `collections.deque.popleft()`.' }),
  item('list methods', 'list.insert()', 'a.insert(i, x)', 'Put `x` before index `i`.', `a = [1, 3]
a.insert(1, 2)
print(a)   # [1, 2, 3]`, `${S}list.insert`, { cost: 'O(n)' }),
  item('list methods', 'list.remove()', 'a.remove(x)', 'Delete the first item equal to `x`.', `a = [1, 2, 1]
a.remove(1)
print(a)   # [2, 1]`, `${S}list.remove`, { cost: 'O(n)', gotcha: 'Raises `ValueError` if `x` is missing. To remove by index use `del a[i]` or `pop(i)`.', aliases: 'delete' }),
  item('list methods', 'list.index()', 'a.index(x, start=0)', 'Index of the first item equal to `x`.', `print([5, 7, 5].index(5))   # 0
print(7 in [5, 7, 5])        # True`, `${S}list.index`, { cost: 'O(n)', gotcha: 'Raises `ValueError` if missing; check with `x in a` first.', aliases: 'find position' }),
  item('list methods', 'list.count()', 'a.count(x)', 'How many items equal `x`.', `print([1, 2, 1, 1].count(1))   # 3`, `${S}list.count`, { cost: 'O(n)', gotcha: 'Counting many different values? Use `collections.Counter` once instead of `count` in a loop (O(n²)).' }),
  item('list methods', 'list.sort()', 'a.sort(*, key=None, reverse=False)', 'Sort the list in place. Returns `None`.', `a = [3, 1, 2]
a.sort(reverse=True)
print(a)          # [3, 2, 1]
print(a.sort())   # None`, `${S}list.sort`, { cost: 'O(n log n); stable', gotcha: '`a = a.sort()` sets `a` to None. Use `sorted(a)` for a new list.', aliases: 'sort order in place' }),
  item('list methods', 'list.reverse()', 'a.reverse()', 'Reverse the list in place.', `a = [1, 2, 3]
a.reverse()
print(a)   # [3, 2, 1]`, `${S}list.reverse`, { cost: 'O(n)' }),
  item('list methods', 'list.copy()', 'a.copy() · a[:] · list(a)', 'A shallow copy: a new list holding the same items.', `a = [[1], [2]]
b = a.copy()
b.append([3])
b[0].append(9)
print(a)   # [[1, 9], [2]]`, `${S}list.copy`, { cost: 'O(n)', gotcha: 'Shallow: inner lists are shared. Use `copy.deepcopy` for nested data.', aliases: 'clone duplicate' }),
  item('list methods', 'list comprehension', '[expr for x in iterable if condition]', 'Build a list from a loop in one line. Same idea for sets `{...}` and dicts `{k: v ...}`.', `print([x * x for x in range(5)])           # [0, 1, 4, 9, 16]
print([x for x in range(10) if x % 3 == 0])  # [0, 3, 6, 9]
print({w: len(w) for w in ["hi", "yo!"]})    # {'hi': 2, 'yo!': 3}`, 'tutorial/datastructures.html#list-comprehensions', { other: 'JavaScript `arr.map(...).filter(...)`, Java streams.', aliases: 'comprehension map filter' }),
  item('list methods', '2-D list (grid)', '[[0] * cols for _ in range(rows)]', 'Make a grid where every row is its own list.', `grid = [[0] * 3 for _ in range(2)]
grid[0][0] = 1
print(grid)   # [[1, 0, 0], [0, 0, 0]]
bad = [[0] * 3] * 2
bad[0][0] = 1
print(bad)    # [[1, 0, 0], [1, 0, 0]]`, 'faq/programming.html#how-do-i-create-a-multidimensional-list', { gotcha: '`[[0] * 3] * 2` repeats the SAME row object.', aliases: 'matrix 2d array' }),

  // ── dict methods ───────────────────────────────
  item('dict methods', 'dict.get()', 'd.get(key, default=None)', 'The value for `key`, or `default` when the key is missing (no error).', `count = {}
for ch in "aab":
    count[ch] = count.get(ch, 0) + 1
print(count)   # {'a': 2, 'b': 1}`, `${S}dict.get`, { cost: 'O(1) average', gotcha: '`d[key]` raises `KeyError` when missing; `get` does not.', other: 'Java `map.getOrDefault(k, 0)`; JavaScript `obj[k] ?? 0`.', aliases: 'getordefault default' }),
  item('dict methods', 'dict.items()', 'd.items() · d.keys() · d.values()', 'Views of the pairs, keys or values, for looping.', `d = {"a": 1, "b": 2}
for k, v in d.items():
    print(k, v)
# a 1
# b 2
print(list(d.values()))   # [1, 2]`, `${S}dict.items`, { gotcha: 'Dicts keep insertion order (Python 3.7+). Do not add or delete keys while looping; loop over `list(d)`.', aliases: 'keys values loop' }),
  item('dict methods', 'dict.setdefault()', 'd.setdefault(key, default)', 'Return d[key]; if missing, first set it to `default`.', `groups = {}
for w in ["eat", "tea", "tan"]:
    groups.setdefault("".join(sorted(w)), []).append(w)
print(groups)   # {'aet': ['eat', 'tea'], 'ant': ['tan']}`, `${S}dict.setdefault`, { gotcha: '`collections.defaultdict(list)` is often cleaner.', aliases: 'group anagram' }),
  item('dict methods', 'dict.pop()', 'd.pop(key, default)', 'Remove a key and return its value.', `d = {"a": 1}
print(d.pop("a"))      # 1
print(d.pop("z", 0))   # 0`, `${S}dict.pop`, { cost: 'O(1) average', gotcha: 'Without `default`, a missing key raises `KeyError`. `del d[k]` deletes without returning.', aliases: 'delete remove' }),
  item('dict methods', 'dict.update() / |', 'd.update(other) · d1 | d2', 'Add or overwrite keys from another dict. `|` makes a new merged dict (3.9+).', `a = {"x": 1, "y": 2}
b = {"y": 9}
print(a | b)   # {'x': 1, 'y': 9}
a.update(b)
print(a)       # {'x': 1, 'y': 9}`, `${S}dict.update`, { aliases: 'merge combine' }),
  item('dict methods', 'key in dict', 'key in d', 'Is this key in the dict? Checks keys, not values.', `d = {"a": 1}
print("a" in d)   # True
print(1 in d)     # False`, 'library/stdtypes.html#typesmapping', { cost: 'O(1) average', other: 'Java `map.containsKey(k)`; JavaScript `k in obj` or `map.has(k)`.', aliases: 'contains has haskey' }),

  // ── set methods ───────────────────────────────
  item('set methods', 'set.add()', 's.add(x) · s.discard(x) · s.remove(x)', 'Add one item; remove one item (`discard` is quiet if missing, `remove` raises).', `s = {1}
s.add(2)
s.discard(5)
print(sorted(s))   # [1, 2]`, `${S}set.add`, { cost: 'O(1) average', aliases: 'insert delete' }),
  item('set methods', 'set operations', 'a | b · a & b · a - b · a ^ b', 'Union, intersection, difference, symmetric difference.', `a, b = {1, 2, 3}, {2, 3, 4}
print(sorted(a | b))   # [1, 2, 3, 4]
print(sorted(a & b))   # [2, 3]
print(sorted(a - b))   # [1]
print(sorted(a ^ b))   # [1, 4]`, `${S}set.union`, { cost: 'O(len(a) + len(b))', aliases: 'union intersection difference' }),
  item('set methods', 'set.issubset()', 'a <= b · a.isdisjoint(b)', 'Is every item of `a` in `b`? Do they share nothing?', `print({1, 2} <= {1, 2, 3})        # True
print({1, 2}.isdisjoint({3, 4}))   # True`, `${S}set.issubset`, { aliases: 'subset superset disjoint' }),
  item('set methods', 'x in set', 'x in s', 'Membership test — the main reason to use a set.', `seen = set()
for n in [3, 1, 3]:
    if n in seen:
        print("duplicate", n)   # duplicate 3
    seen.add(n)`, 'library/stdtypes.html#set-types-set-frozenset', { cost: 'O(1) average (O(n) in a list)', other: 'Java `HashSet.contains`, JavaScript `Set.has`.', aliases: 'contains duplicate seen' }),

  // ── collections ───────────────────────────────
  item('collections', 'Counter', 'Counter(iterable)', 'A dict that counts items. Missing keys count as 0.', `from collections import Counter
c = Counter("banana")
print(c)                  # Counter({'a': 3, 'n': 2, 'b': 1})
print(c["z"])             # 0
print(c.most_common(1))   # [('a', 3)]
print(Counter("ab") == Counter("ba"))  # True`, 'library/collections.html#collections.Counter', { cost: 'O(n) to build', gotcha: '`most_common(k)` gives the top k (Top K Frequent Elements).', aliases: 'count frequency anagram most_common' }),
  item('collections', 'defaultdict', 'defaultdict(factory)', 'A dict that creates a default value (from `factory`) for a missing key.', `from collections import defaultdict
groups = defaultdict(list)
for w in ["eat", "tea", "tan"]:
    groups[tuple(sorted(w))].append(w)
print(list(groups.values()))   # [['eat', 'tea'], ['tan']]
graph = defaultdict(set)
graph[1].add(2)
print(dict(graph))             # {1: {2}}`, 'library/collections.html#collections.defaultdict', { gotcha: 'Just reading `d[k]` inserts the key. Use `k in d` to only check.', aliases: 'group graph adjacency' }),
  item('collections', 'deque', 'deque(iterable=(), maxlen=None)', 'A double-ended queue: fast add/remove at both ends. Used for BFS and sliding windows.', `from collections import deque
q = deque([1, 2])
q.append(3)
q.appendleft(0)
print(q.popleft())   # 0
print(q.pop())       # 3
print(q)             # deque([1, 2])
last3 = deque(maxlen=3)
for i in range(5):
    last3.append(i)
print(list(last3))   # [2, 3, 4]`, 'library/collections.html#collections.deque', { cost: 'O(1) at both ends; O(n) indexing in the middle', other: 'Java `ArrayDeque`, C++ `std::deque`. JavaScript has no built-in deque (`shift()` is O(n)).', aliases: 'queue bfs popleft appendleft' }),
  item('collections', 'OrderedDict', 'OrderedDict()', 'A dict with extra order tools: `move_to_end` and `popitem(last=False)`. Handy for an LRU cache.', `from collections import OrderedDict
cache = OrderedDict(a=1, b=2, c=3)
cache.move_to_end("a")
print(list(cache))                 # ['b', 'c', 'a']
print(cache.popitem(last=False))   # ('b', 2)`, 'library/collections.html#collections.OrderedDict', { cost: 'O(1)', aliases: 'lru cache order' }),
  item('collections', 'namedtuple', 'namedtuple(name, fields)', 'A tuple whose items also have names.', `from collections import namedtuple
Point = namedtuple("Point", "x y")
p = Point(2, 3)
print(p.x + p.y)   # 5
print(p)           # Point(x=2, y=3)`, 'library/collections.html#collections.namedtuple', { gotcha: 'For bigger records, `@dataclass` is more flexible.' }),

  // ── heapq ───────────────────────────────
  item('heapq', 'heappush / heappop', 'heapq.heappush(h, x) · heapq.heappop(h)', 'A min-heap kept in a normal list: the smallest item is always `h[0]`.', `import heapq
h = []
for x in [5, 1, 4]:
    heapq.heappush(h, x)
print(h[0])               # 1
print(heapq.heappop(h))   # 1
print(heapq.heappop(h))   # 4`, 'library/heapq.html#heapq.heappush', { cost: 'push/pop O(log n); peek h[0] O(1)', gotcha: 'Only a MIN-heap. For a max-heap push `-x`. For pairs, push tuples `(priority, item)`.', other: 'Java `PriorityQueue`, C++ `std::priority_queue` (a max-heap by default!).', aliases: 'priority queue min heap' }),
  item('heapq', 'heapify', 'heapq.heapify(list)', 'Turn a list into a heap in place.', `import heapq
h = [5, 3, 8, 1]
heapq.heapify(h)
print(h[0])   # 1`, 'library/heapq.html#heapq.heapify', { cost: 'O(n) — faster than n pushes' }),
  item('heapq', 'nlargest / nsmallest', 'heapq.nlargest(k, iterable, key=None)', 'The k largest (or smallest) items.', `import heapq
print(heapq.nlargest(2, [5, 1, 8, 3]))    # [8, 5]
print(heapq.nsmallest(2, [5, 1, 8, 3]))   # [1, 3]`, 'library/heapq.html#heapq.nlargest', { cost: 'O(n log k)', aliases: 'top k largest smallest' }),
  item('heapq', 'max-heap trick', 'heappush(h, -x)', 'Python has no max-heap: store negative numbers and flip the sign back.', `import heapq
h = []
for x in [5, 1, 8]:
    heapq.heappush(h, -x)
print(-heapq.heappop(h))   # 8`, 'library/heapq.html', { aliases: 'max heap' }),

  // ── bisect ───────────────────────────────
  item('bisect', 'bisect_left / bisect_right', 'bisect.bisect_left(a, x)', 'In a SORTED list, the index where `x` would go: left = before equal items, right = after them.', `import bisect
a = [1, 3, 3, 7]
print(bisect.bisect_left(a, 3))    # 1
print(bisect.bisect_right(a, 3))   # 3
print(bisect.bisect_left(a, 5))    # 3`, 'library/bisect.html#bisect.bisect_left', { cost: 'O(log n)', gotcha: 'The list must already be sorted. `bisect_right - bisect_left` = how many times x appears.', other: 'Java `Collections.binarySearch`, C++ `lower_bound` / `upper_bound`.', aliases: 'binary search lower bound upper bound' }),
  item('bisect', 'insort', 'bisect.insort(a, x)', 'Insert into a sorted list, keeping it sorted.', `import bisect
a = [1, 3, 7]
bisect.insort(a, 4)
print(a)   # [1, 3, 4, 7]`, 'library/bisect.html#bisect.insort', { cost: 'O(log n) to find + O(n) to insert' }),

  // ── itertools ───────────────────────────────
  item('itertools', 'accumulate', 'itertools.accumulate(iterable, func=add, initial=None)', 'Running totals (prefix sums), or running max/min with `func`.', `from itertools import accumulate
print(list(accumulate([1, 2, 3, 4])))             # [1, 3, 6, 10]
print(list(accumulate([1, 2, 3], initial=0)))     # [0, 1, 3, 6]
print(list(accumulate([3, 1, 5, 2], max)))        # [3, 3, 5, 5]`, 'library/itertools.html#itertools.accumulate', { cost: 'O(n)', aliases: 'prefix sum running total' }),
  item('itertools', 'combinations', 'itertools.combinations(iterable, r)', 'All groups of r items, order does not matter.', `from itertools import combinations
print(list(combinations([1, 2, 3], 2)))   # [(1, 2), (1, 3), (2, 3)]`, 'library/itertools.html#itertools.combinations', { cost: 'n! / (r!(n−r)!) results', aliases: 'subsets choose' }),
  item('itertools', 'permutations', 'itertools.permutations(iterable, r=None)', 'All orderings of r items.', `from itertools import permutations
print(list(permutations("ab")))   # [('a', 'b'), ('b', 'a')]
print(len(list(permutations(range(4)))))   # 24`, 'library/itertools.html#itertools.permutations', { cost: 'n! results for r = n', gotcha: 'In interviews you are usually asked to write the backtracking yourself.' }),
  item('itertools', 'product', 'itertools.product(*iterables, repeat=1)', 'Every combination of one item from each iterable (nested loops in one line).', `from itertools import product
print(list(product("ab", [0, 1])))   # [('a', 0), ('a', 1), ('b', 0), ('b', 1)]
print(len(list(product([0, 1], repeat=3))))   # 8`, 'library/itertools.html#itertools.product', { aliases: 'cartesian nested loops' }),
  item('itertools', 'groupby', 'itertools.groupby(iterable, key=None)', 'Group CONSECUTIVE equal items.', `from itertools import groupby
print([(k, len(list(g))) for k, g in groupby("aaabcc")])   # [('a', 3), ('b', 1), ('c', 2)]`, 'library/itertools.html#itertools.groupby', { gotcha: 'Only neighbours are grouped: sort first to group all equal items.', aliases: 'run length encoding' }),
  item('itertools', 'chain', 'itertools.chain(*iterables)', 'Loop over several iterables one after another.', `from itertools import chain
print(list(chain([1, 2], (3,), "ab")))   # [1, 2, 3, 'a', 'b']
print(list(chain.from_iterable([[1], [2, 3]])))   # [1, 2, 3]`, 'library/itertools.html#itertools.chain', { aliases: 'flatten concat' }),
  item('itertools', 'pairwise', 'itertools.pairwise(iterable)', 'Neighbouring pairs: (a0, a1), (a1, a2), … (Python 3.10+).', `from itertools import pairwise
print(list(pairwise([1, 4, 9])))   # [(1, 4), (4, 9)]
print([b - a for a, b in pairwise([1, 4, 9])])   # [3, 5]`, 'library/itertools.html#itertools.pairwise', { aliases: 'adjacent neighbours differences' }),

  // ── functools ───────────────────────────────
  item('functools', 'cache', '@functools.cache', 'Remember the result for each set of arguments (memoization).', `from functools import cache
@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(80))   # 23416728348467685`, 'library/functools.html#functools.cache', { cost: 'each distinct call is computed once', gotcha: 'Arguments must be hashable (no lists). Deep recursion can still hit the recursion limit. `lru_cache(maxsize=None)` is the same on older Pythons.', aliases: 'memoization lru_cache dp' }),
  item('functools', 'reduce', 'functools.reduce(function, iterable, initial)', 'Combine all items into one value, step by step.', `from functools import reduce
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))   # 24
print(reduce(lambda a, b: a ^ b, [4, 1, 2, 1, 2]))   # 4`, 'library/functools.html#functools.reduce', { gotcha: 'A plain loop is often easier to read. For products, `math.prod` exists.', other: 'JavaScript `arr.reduce(fn, init)`.', aliases: 'fold' }),
  item('functools', 'cmp_to_key', 'functools.cmp_to_key(compare)', 'Sort with a compare function that returns negative, zero or positive.', `from functools import cmp_to_key
nums = ["3", "30", "34"]
nums.sort(key=cmp_to_key(lambda a, b: -1 if a + b > b + a else 1))
print("".join(nums))   # 34330`, 'library/functools.html#functools.cmp_to_key', { other: 'Java `Comparator`, JavaScript `arr.sort((a, b) => ...)`.', aliases: 'comparator custom sort largest number' }),

  // ── math ───────────────────────────────
  item('math', 'math.inf', 'math.inf · float("inf")', 'Infinity: larger than every number. A good start value for a minimum.', `import math
best = math.inf
for x in [7, 3, 9]:
    best = min(best, x)
print(best)              # 3
print(-math.inf < -10**100)  # True`, 'library/math.html#math.inf', { other: 'Java `Integer.MAX_VALUE` (a real number that can overflow).', aliases: 'infinity max value' }),
  item('math', 'math.gcd', 'math.gcd(*integers) · math.lcm(*integers)', 'Greatest common divisor / least common multiple.', `import math
print(math.gcd(12, 18))   # 6
print(math.lcm(4, 6))     # 12`, 'library/math.html#math.gcd', { cost: 'O(log min(a, b))', aliases: 'lcm divisor' }),
  item('math', 'math.sqrt / isqrt', 'math.sqrt(x) · math.isqrt(n)', 'Square root as a float; `isqrt` gives the exact integer square root.', `import math
print(math.sqrt(16))     # 4.0
print(math.isqrt(17))    # 4
print(math.isqrt(10**20 + 1) == 10**10)   # True`, 'library/math.html#math.isqrt', { gotcha: 'For big integers, `sqrt` loses precision; use `isqrt`.', aliases: 'square root' }),
  item('math', 'math.ceil / floor', 'math.ceil(x) · math.floor(x)', 'Round up / round down to a whole number.', `import math
print(math.ceil(7 / 2))    # 4
print(math.floor(-1.5))    # -2
print(-(-7 // 2))          # 4`, 'library/math.html#math.ceil', { gotcha: 'Integer ceiling without floats: `-(-a // b)` (used in Koko Eating Bananas).', aliases: 'round up round down' }),
  item('math', 'math.comb', 'math.comb(n, k) · math.perm(n, k) · math.factorial(n)', 'Number of ways to choose k of n (order ignored / counted), and n!.', `import math
print(math.comb(5, 2))       # 10
print(math.perm(5, 2))       # 20
print(math.factorial(5))     # 120`, 'library/math.html#math.comb', { aliases: 'binomial choose factorial' }),
]

export const REFERENCE_MODULES: ReferenceModule[] = [
  'Built-in functions',
  'str methods',
  'list methods',
  'dict methods',
  'set methods',
  'collections',
  'heapq',
  'bisect',
  'itertools',
  'functools',
  'math',
]
