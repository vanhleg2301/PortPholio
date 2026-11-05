import type { TaskReference } from './types'

const PY = 'https://docs.python.org/3'
const TIH = 'https://www.techinterviewhandbook.org/algorithms'

// ── Python basics (Week 0) ────────────────
const PY_WIKI_COMPLEXITY = { label: 'Python wiki: TimeComplexity', url: 'https://wiki.python.org/moin/TimeComplexity' }

export const PYTHON_REFERENCES = {
  basics: {
    title: 'Variables, strings and lists',
    summary:
      'A variable is a name tag stuck on an object, not a box that holds it. Strings are immutable sequences of characters; lists are mutable, resizable arrays of references.',
    points: [
      '`x = [1, 2]` creates a list object and sticks the name `x` on it. `y = x` sticks a second name on the same object — nothing is copied.',
      'Immutable objects (`int`, `str`, `tuple`) never change. "Changing" one builds a new object: `s = s + "a"` makes a brand-new string and moves the name `s` to it.',
      'A list is a contiguous array of references with spare room at the end, so `append` is usually instant. When it is full, Python allocates a bigger array and copies everything once — that is why append is O(1) amortised.',
      'Indexes start at 0; negative indexes count from the end (`a[-1]` is the last item). A slice `a[i:j]` returns a new copy of items i to j-1.',
      '`==` compares values, `is` compares identity (the very same object). Use `is` only for `None`: `if x is None`.',
    ],
    complexity: [
      { op: '`a[i]`, `a[i] = x`', cost: 'O(1)' },
      { op: '`a.append(x)`, `a.pop()`', cost: 'O(1)', note: 'amortised' },
      { op: '`a.insert(0, x)`, `a.pop(0)`', cost: 'O(n)', note: 'every item shifts' },
      { op: '`x in a`', cost: 'O(n)', note: 'linear scan' },
      { op: '`a[i:j]`', cost: 'O(j − i)', note: 'copies' },
      { op: '`a.sort()`, `sorted(a)`', cost: 'O(n log n)' },
      { op: '`s + t` (strings)', cost: 'O(len s + len t)', note: 'new string' },
      { op: '`"".join(parts)`', cost: 'O(total length)' },
    ],
    example: `a = [1, 2, 3]
b = a                 # same list, two names
b.append(4)
print(a)              # [1, 2, 3, 4]

c = a[:]              # a real (shallow) copy
c.append(5)
print(a, c)           # [1, 2, 3, 4] [1, 2, 3, 4, 5]

words = "  hello   big tech ".split()   # ['hello', 'big', 'tech']
print(" ".join(reversed(words)))       # tech big hello
print("racecar" == "racecar"[::-1])    # True`,
    pitfalls: [
      { title: '`b = a` is not a copy', fix: 'Use `a[:]`, `list(a)` or `a.copy()`. Nested lists need `copy.deepcopy(a)`.' },
      { title: '`grid = [[0] * 3] * 3`', fix: 'The three rows are the same list, so one change shows up three times. Write `[[0] * 3 for _ in range(3)]`.' },
      { title: 'Building a string with `+=` in a loop', fix: 'Each step may copy the whole string (O(n²) total). Append pieces to a list and call `"".join(parts)` once.' },
      { title: 'Removing items while looping over the same list', fix: 'Items get skipped. Build a new list: `[x for x in a if keep(x)]`.' },
    ],
    interview: {
      when: 'Arrays and strings are the input of most problems. Know slicing, reversing, `split`/`join` and walking with two indexes without thinking.',
      problems: ['valid-anagram', 'valid-palindrome', 'encode-and-decode-strings', 'product-of-array-except-self'],
    },
    quiz: [
      { question: '`a = [1]; b = a; b.append(2)` — what is `a` now?', answer: '`[1, 2]`. `b = a` put a second name on the same list; nothing was copied.' },
      {
        question: 'Why is `s += ch` inside a loop slow for long strings?',
        answer: 'Strings are immutable, so each `+=` can build a new string and copy everything so far: O(n²) overall. Collect pieces in a list and `"".join(parts)` once: O(n).',
      },
      {
        question: 'Cost of `nums.pop(0)` vs `nums.pop()`?',
        answer: '`pop(0)` is O(n) because every remaining item shifts left; `pop()` is O(1). For fast pops from the front use `collections.deque`.',
      },
    ],
    source: { label: 'Python Tutorial §3: An Informal Introduction', url: `${PY}/tutorial/introduction.html` },
    inWork: [
      'Parsing log or CSV lines with `split` and building output with `join`',
      'Pagination by slicing: `items[offset:offset + limit]`',
      'Bugs from a list shared between functions or requests — copy when a caller must not see changes',
    ],
    extraSource: PY_WIKI_COMPLEXITY,
  },
  collections: {
    title: 'Dicts, sets, loops and functions',
    summary:
      'dict and set are hash tables: they find a key in O(1) on average by jumping straight to the slot its hash points to, instead of scanning.',
    points: [
      '`hash(key)` turns the key into a number that picks a slot. Lookup, insert and delete are O(1) on average; O(n) only in the rare worst case where many keys collide.',
      'Keys must be hashable — their hash can never change — so `str`, `int`, `tuple` work and `list`, `dict`, `set` do not. Need a list as a key? Use `tuple(lst)`.',
      'A dict remembers insertion order (guaranteed since Python 3.7). A set has no order and no duplicates.',
      '`for` walks any iterable: `enumerate(a)` gives `(index, value)`, `zip(a, b)` pairs items, `d.items()` gives `(key, value)`.',
      'Default argument values are evaluated once, when the function is defined — not on every call.',
      'Comprehensions build a whole collection in one expression: `{x: i for i, x in enumerate(nums)}`.',
    ],
    complexity: [
      { op: '`d[k]`, `d[k] = v`, `k in d`, `del d[k]`', cost: 'O(1)', note: 'average' },
      { op: '`s.add(x)`, `x in s`, `s.remove(x)`', cost: 'O(1)', note: 'average' },
      { op: 'loop over a dict / set', cost: 'O(n)' },
      { op: '`a | b` (union)', cost: 'O(len a + len b)' },
      { op: '`a & b` (intersection)', cost: 'O(min(len a, len b))' },
      { op: '`len(x)`', cost: 'O(1)' },
    ],
    example: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)           # missing key -> new empty list
    for w in words:
        key = "".join(sorted(w))         # 'eat' -> 'aet'
        groups[key].append(w)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat']]

counts = {}
for ch in "banana":
    counts[ch] = counts.get(ch, 0) + 1   # {'b': 1, 'a': 3, 'n': 2}`,
    pitfalls: [
      { title: '`def f(x, seen=[])`', fix: 'The same list is shared by every call, so items pile up. Use `seen=None`, then `if seen is None: seen = []` inside.' },
      { title: '`d[k]` on a missing key', fix: 'Raises `KeyError`. Use `d.get(k, default)`, `k in d`, or a `defaultdict`.' },
      { title: 'A list as a dict key or set item', fix: '`TypeError: unhashable type: list`. Convert it: `tuple(lst)`.' },
      { title: 'Adding or deleting keys while looping over a dict', fix: '`RuntimeError`. Loop over a snapshot: `for k in list(d):`.' },
    ],
    interview: {
      when: 'Whenever you hear "have I seen…", "count…", "group by…", or need to find something fast, reach for a dict or a set.',
      problems: ['contains-duplicate', 'two-sum', 'group-anagrams', 'top-k-frequent-elements', 'longest-consecutive-sequence'],
    },
    quiz: [
      {
        question: 'Why can a tuple be a dict key but a list cannot?',
        answer: 'Keys must be hashable: their hash must never change. A list can change after insertion, so it is unhashable; a tuple cannot change.',
      },
      {
        question: 'How does a dict make Two Sum O(n) instead of O(n²)?',
        answer: 'Walk the array once. For each `x`, check whether `target - x` is already in the dict (O(1)); if not, store `x -> index`. No need to try every pair.',
      },
      {
        question: 'What goes wrong with `def add(x, acc=[])`?',
        answer: 'The default list is created once and shared by every call, so values from earlier calls stay in it. Use `acc=None` and create the list inside.',
      },
    ],
    source: { label: 'Python Tutorial §5: Data Structures', url: `${PY}/tutorial/datastructures.html` },
    inWork: [
      'Lookups by ID (`users_by_id[uid]`), caches and deduplication',
      'Counting events per key for metrics and reports',
      'JSON objects map one-to-one to dicts in API code',
    ],
    extraSource: { label: 'Python Tutorial §4: More Control Flow Tools', url: `${PY}/tutorial/controlflow.html` },
  },
  interviewToolkit: {
    title: 'Interview toolkit: collections and heapq',
    summary:
      'Five standard-library tools turn many medium problems into a few lines: `Counter`, `defaultdict`, `deque`, `heapq` and `sorted(key=...)`.',
    points: [
      '`Counter(items)` is a dict of counts. A missing key reads as 0, `most_common(k)` gives the top k, and `Counter(a) == Counter(b)` checks anagrams.',
      '`defaultdict(factory)` creates the value the first time a key is read: `defaultdict(list)` for grouping, `defaultdict(int)` for counting.',
      '`deque` is a double-ended queue: O(1) append and pop at both ends. It is the BFS queue; `deque(maxlen=k)` keeps only the last k items.',
      '`heapq` keeps a binary min-heap inside a plain list: `h[0]` is always the smallest, push/pop are O(log n), `heapify` is O(n). Tuples compare item by item, so push `(priority, value)`.',
      '`sorted(items, key=..., reverse=...)` is a stable O(n log n) sort. Sort by several fields with a tuple key: `key=lambda p: (-p[1], p[0])`.',
    ],
    complexity: [
      { op: '`Counter(items)`', cost: 'O(n)' },
      { op: '`c.most_common(k)`', cost: 'O(n log k)' },
      { op: '`append`, `appendleft`, `pop`, `popleft` (deque)', cost: 'O(1)' },
      { op: '`dq[i]` in the middle', cost: 'O(n)' },
      { op: '`heappush`, `heappop`', cost: 'O(log n)' },
      { op: '`heapify(list)`', cost: 'O(n)' },
      { op: '`h[0]` (peek smallest)', cost: 'O(1)' },
      { op: '`sorted(items)`', cost: 'O(n log n)' },
    ],
    example: `from collections import Counter, deque
import heapq

nums = [1, 1, 1, 2, 2, 3]
print(Counter(nums).most_common(2))     # [(1, 3), (2, 2)]

h = []
for x in [5, 1, 8, 3]:
    heapq.heappush(h, -x)               # negate -> max-heap
print(-h[0])                            # 8, the largest

q = deque(["start"])                    # BFS queue
q.append("a")
print(q.popleft())                      # start  (O(1), unlike list.pop(0))

people = [("an", 25), ("binh", 19), ("chi", 25)]
print(sorted(people, key=lambda p: (-p[1], p[0])))
# [('an', 25), ('chi', 25), ('binh', 19)]`,
    pitfalls: [
      { title: 'Expecting a max-heap', fix: '`heapq` is min-only. Push `-x` and read `-h[0]`; for tuples negate the priority field.' },
      { title: 'Reading `h[-1]` as the largest', fix: 'Only `h[0]` has a guaranteed meaning in a heap; the rest is only partially ordered.' },
      { title: 'Ties on objects that cannot be compared', fix: 'Pushing `(dist, node)` crashes when two dists tie and nodes have no `<`. Add a counter: `(dist, i, node)`.' },
      { title: 'Reading `d[k]` on a defaultdict to "check" a key', fix: 'Reading creates the key. Check with `k in d` instead.' },
    ],
    interview: {
      when: 'Top-K, "k closest", merging sorted lists and scheduling → heap. BFS or a window that drops from the left → deque. Frequency questions → Counter.',
      problems: ['top-k-frequent-elements', 'kth-largest-element-in-an-array', 'merge-k-sorted-lists', 'task-scheduler', 'number-of-islands'],
    },
    quiz: [
      { question: 'Where is the smallest item of a heap list `h`, and what does reading it cost?', answer: '`h[0]`, O(1). Removing it with `heappop(h)` costs O(log n).' },
      { question: 'How do you get a max-heap in Python?', answer: '`heapq` is min-only: push `-x` and read `-h[0]`. With tuples, negate the priority part.' },
      { question: 'Why use `deque` instead of a list for BFS?', answer: '`popleft()` is O(1). `list.pop(0)` shifts every item (O(n)), which can turn BFS into O(n²).' },
    ],
    source: { label: 'collections — Container datatypes', url: `${PY}/library/collections.html` },
    inWork: [
      'Job schedulers and priority queues (heapq)',
      'Work queues and crawlers that process items in order (deque)',
      'Top-N reports and analytics (Counter, nlargest)',
    ],
    extraSource: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
  },
} satisfies Record<string, TaskReference>

// ── NeetCode categories: the pattern behind each group ──
const CATEGORY_NOTES: Record<string, Omit<TaskReference, 'title'>> = {
  'Arrays & Hashing': {
    summary:
      "Trade memory for time: remember what you've already seen in a hash map, so each new element is answered in O(1) instead of rescanning the array.",
    recognize: [
      'Find a pair, a duplicate or a complement ("two numbers that add up to…")',
      'Count, frequency, "most common"',
      'Group items that share a property (anagrams, same digits)',
      'Your first idea is two nested loops over the same array',
    ],
    points: [
      'Brute force compares every pair: O(n²). A hash map lets you ask "have I already seen what I need?" in O(1), so a single pass is enough — O(n) time for O(n) extra memory.',
      'The real decision is the key: the value itself (a "seen" set), the complement (`target - x`), or a canonical form for grouping (sorted letters, a tuple of letter counts).',
      'Prefix/suffix accumulation: precompute running products or sums from the left and from the right, so "everything except index i" costs O(1) per index — no division needed.',
      'Sorting first (O(n log n), little extra memory) is the alternative when memory is tight or order matters.',
    ],
    complexity: [
      { op: 'Check every pair', cost: 'O(n²)', note: 'O(1) space' },
      { op: 'One pass with a dict / set', cost: 'O(n)', note: 'O(n) space' },
      { op: 'Sort, then scan', cost: 'O(n log n)', note: 'O(1)–O(n) space' },
      { op: 'Group by sorted-word key', cost: 'O(n · k log k)', note: 'k = word length' },
    ],
    example: `def two_sum(nums, target):
    seen = {}                        # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:             # O(1) lookup
            return [seen[need], i]
        seen[x] = i                  # store AFTER checking: no self-match
    return []

def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):               # out[i] = product of items left of i
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):   # ... times product of items right of i
        out[i] *= right
        right *= nums[i]
    return out

print(two_sum([2, 7, 11, 15], 9))          # [0, 1]
print(product_except_self([1, 2, 3, 4]))   # [24, 12, 8, 6]`,
    pitfalls: [
      { title: 'Storing before checking in Two Sum', fix: 'An element pairs with itself when `target == 2 * x`. Check `need in seen` first, then store.' },
      { title: 'A list as the group key', fix: 'Unhashable. Use `tuple(sorted(word))`, `"".join(sorted(word))`, or a 26-count tuple.' },
      { title: 'Longest Consecutive Sequence counting from every number', fix: "That is O(n²). Only start counting at `x` when `x - 1` is not in the set." },
      { title: 'Ignoring the memory cost', fix: 'Expect the follow-up "can you do it in O(1) extra space?" — have the sort-based answer ready.' },
    ],
    interview: {
      when: 'Your first optimisation for almost any array problem. Say the trade-off out loud: "brute force is O(n²); a hash map makes it O(n) at the cost of O(n) memory."',
      problems: ['contains-duplicate', 'two-sum', 'group-anagrams', 'top-k-frequent-elements', 'product-of-array-except-self', 'longest-consecutive-sequence'],
    },
    inWork: [
      'Deduplicating records or events by ID before processing them',
      'Joining two datasets in memory (a hash join) instead of nested loops',
      'Caching / memoising results by key',
      'Counting metrics: requests per user, errors per endpoint',
    ],
    quiz: [
      { question: 'Two Sum: why check `need in seen` before `seen[x] = i`?', answer: 'So an element cannot pair with itself (target 6 with a single 3), and the earlier index is kept.' },
      {
        question: 'How do anagrams end up under the same dict key?',
        answer: 'Use a canonical form: `"".join(sorted(w))` (O(k log k) per word) or a tuple of 26 letter counts (O(k) per word).',
      },
      {
        question: 'Longest Consecutive Sequence in O(n) — what is the trick?',
        answer: 'Put every number in a set and only start walking from `x` when `x - 1` is missing. Each sequence is then walked exactly once.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Hash table', url: `${TIH}/hash-table/` },
    extraSource: { label: 'Python Tutorial: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
  },
  'Two Pointers': {
    summary:
      'Two indexes walk the data in a coordinated way, so one pass replaces checking every pair. It works when the input is sorted or the answer depends on both ends.',
    recognize: [
      'Sorted array + "pair or triplet with sum X"',
      'Palindromes, or anything compared from both ends',
      '"In place" or "O(1) extra space"',
      'Maximise a width or area between two positions',
    ],
    points: [
      'Opposite ends: `l = 0`, `r = n - 1`. Each step moves the pointer whose move can improve the answer, discarding a whole row of pairs at once — that is why one pass is correct, not lucky.',
      'Why sorted input matters: if `nums[l] + nums[r]` is too small, pairing `l` with anything left of `r` is also too small, so `l += 1` is safe.',
      'Same direction (read/write): one pointer scans, the other marks where the next kept item goes — in-place filtering with O(1) memory.',
      '3Sum = sort, fix one index, run two pointers on the rest: O(n²), the best known approach. Skip equal values to avoid duplicate triplets.',
    ],
    complexity: [
      { op: 'Check every pair', cost: 'O(n²)' },
      { op: 'Two pointers on sorted input', cost: 'O(n)', note: '+ O(n log n) to sort' },
      { op: '3Sum (sort + two pointers)', cost: 'O(n²)' },
      { op: 'Extra memory', cost: 'O(1)' },
    ],
    example: `def two_sum_sorted(nums, target):       # nums is sorted
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1                      # need a bigger sum
        else:
            r -= 1                      # need a smaller sum
    return []

def max_area(heights):                  # Container With Most Water
    l, r, best = 0, len(heights) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(heights[l], heights[r]))
        if heights[l] < heights[r]:     # the shorter wall limits the area,
            l += 1                      # so moving the taller one cannot help
        else:
            r -= 1
    return best

print(two_sum_sorted([1, 3, 4, 6, 9], 10))       # [0, 4]
print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))     # 49`,
    pitfalls: [
      { title: 'Two pointers on unsorted input', fix: 'Sum logic breaks. Sort first, or use a hash map if the original indexes must be returned.' },
      { title: 'Duplicate triplets in 3Sum', fix: 'Skip equal `nums[i]` for the fixed index, and move `l` past equal values after a match.' },
      { title: '`while l <= r` for pairs', fix: 'A pair needs two different indexes: use `l < r`.' },
      { title: 'Inner skip loops without a bound', fix: 'When skipping non-letters in Valid Palindrome, keep `l < r` inside those loops too.' },
    ],
    interview: {
      when: 'When you see "sorted" or "in place", try two pointers before reaching for extra memory. Explain why moving a pointer never skips the answer — that argument is what interviewers listen for.',
      problems: ['valid-palindrome', 'two-sum-ii-input-array-is-sorted', '3sum', 'container-with-most-water', 'trapping-rain-water'],
    },
    inWork: [
      'Merging two sorted lists or streams (merge sort, merge-join in databases)',
      'Diffing two sorted ID lists to find what was added or removed',
      'In-place compaction of arrays and buffers',
    ],
    quiz: [
      {
        question: 'Container With Most Water: why move the shorter wall?',
        answer: 'The area is capped by the shorter wall. Moving the taller one only shrinks the width without raising that cap, so it can never give a better area.',
      },
      { question: 'Why is 3Sum O(n²) even though it sorts?', answer: 'Sorting is O(n log n); then each of the n fixed indexes runs an O(n) two-pointer scan: n × n dominates.' },
      {
        question: 'Unsorted array, return the original indexes of a pair: two pointers or hash map?',
        answer: 'Hash map, O(n). Sorting loses the original indexes (or needs extra bookkeeping) and costs O(n log n).',
      },
    ],
    source: { label: 'Tech Interview Handbook: Array', url: `${TIH}/array/` },
    extraSource: { label: 'Python Sorting HOW TO', url: `${PY}/howto/sorting.html` },
  },
  'Sliding Window': {
    summary:
      'Keep a contiguous window [left, right] and update its state as it slides, instead of recomputing every subarray from scratch.',
    recognize: [
      '"Longest / shortest substring or subarray" with a condition',
      '"Contains all of…", "at most k distinct", "at most k replacements"',
      'Contiguous elements — not subsequences',
      'A fixed window: max or average of every k items',
    ],
    points: [
      'Brute force checks every subarray: O(n²) or worse. A window adds the new right element and removes the left one, so each index enters and leaves once: O(n).',
      'Variable window template: grow `right` every step; while the window breaks the rule, shrink from `left`; record the answer once it is valid again.',
      'Window state is a count dict, a set or a running sum — chosen so adding and removing are O(1).',
      '"Longest with at most k changes": the window is valid while `length - most_frequent_count <= k`.',
      'A monotonic deque keeps the window maximum available in O(1) (Sliding Window Maximum).',
    ],
    complexity: [
      { op: 'Check every subarray', cost: 'O(n²)', note: 'or worse' },
      { op: 'Sliding window', cost: 'O(n)', note: 'each index moves ≤ 2 times' },
      { op: 'Window state', cost: 'O(k) or O(alphabet)', note: 'space' },
      { op: 'Window maximum with a deque', cost: 'O(n)' },
    ],
    example: `def longest_unique_substring(s):
    last = {}                        # char -> last index seen
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1      # jump past the repeated char
        last[ch] = right
        best = max(best, right - left + 1)
    return best

def character_replacement(s, k):     # longest window fixable with k changes
    count, left, top, best = {}, 0, 0, 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        top = max(top, count[ch])
        while (right - left + 1) - top > k:   # too many to replace
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_unique_substring("abcabcbb"))   # 3  ("abc")
print(character_replacement("AABABBA", 1))    # 4`,
    pitfalls: [
      { title: 'Subsequences, or sums with negative numbers', fix: 'Shrinking no longer reliably helps, so the window idea breaks. Use prefix sums + a hash map, or Kadane for max sum.' },
      { title: 'Off-by-one window length', fix: 'The length is `right - left + 1`.' },
      { title: 'Recording the answer while the window is invalid', fix: 'Update the answer after the shrink loop, when the invariant holds again.' },
      { title: 'Comparing whole count dicts every step', fix: 'In Minimum Window Substring track a `have/need` counter so each step stays O(1).' },
    ],
    interview: {
      when: 'Any "longest / shortest contiguous…" question. State the invariant ("after the inner loop the window is valid") and the O(n) argument ("each index moves at most twice").',
      problems: [
        'best-time-to-buy-and-sell-stock',
        'longest-substring-without-repeating-characters',
        'longest-repeating-character-replacement',
        'permutation-in-string',
        'minimum-window-substring',
      ],
    },
    inWork: [
      'Rate limiting: requests per user in the last 60 seconds',
      'Rolling metrics: moving averages, p95 latency over the last N minutes',
      "Streaming analytics, and TCP's congestion window",
    ],
    quiz: [
      {
        question: 'Why is a sliding window O(n) even with a nested `while` loop?',
        answer: '`left` only moves forward and never past `right`, so over the whole run it moves at most n times. Total work is O(n), not O(n²).',
      },
      { question: 'Max subarray sum with negative numbers — sliding window?', answer: "No: shrinking doesn't reliably improve the sum. Use Kadane's algorithm." },
      {
        question: 'Best Time to Buy and Sell Stock as a window: what are left and right?',
        answer: 'left = cheapest day so far (buy), right = today (sell). Move left to right whenever today is cheaper.',
      },
    ],
    source: { label: 'Tech Interview Handbook: String', url: `${TIH}/string/` },
    extraSource: { label: 'Tech Interview Handbook: Array', url: `${TIH}/array/` },
  },
  Stack: {
    summary:
      'Last in, first out: a stack remembers unfinished things so the most recent one is resolved first — matching brackets, undo, and "next greater element".',
    recognize: [
      'Matching pairs: brackets, tags, start/end markers',
      '"Next greater / smaller element", "days until a warmer day"',
      'Evaluating expressions or nested structures',
      'Undo, or going back to the most recent state',
    ],
    points: [
      'A Python list is a stack: `append` pushes, `pop()` pops, `stack[-1]` peeks — all O(1).',
      'Matching: push openers; on a closer, the top must be its partner, otherwise invalid; at the end the stack must be empty.',
      'Monotonic stack: keep indexes whose values are decreasing. When a bigger value arrives, pop everything smaller — each popped index has just found its "next greater". Every index is pushed and popped once, so the whole pass is O(n).',
      'Recursion is an implicit stack (the call stack). Any recursive DFS can be rewritten with an explicit stack to avoid recursion limits.',
    ],
    complexity: [
      { op: 'push, pop, peek', cost: 'O(1)' },
      { op: 'Monotonic stack over n items', cost: 'O(n)', note: 'amortised' },
      { op: 'Python recursion depth', cost: '≈ 1000', note: 'default limit' },
    ],
    example: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack                    # leftovers = never closed

def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                          # indexes, temps decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j           # warmer day found for day j
        stack.append(i)
    return answer

print(is_valid("([]{})"), is_valid("(]"))   # True False
print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]`,
    pitfalls: [
      { title: 'Popping an empty stack', fix: '`IndexError`. Check `if stack` before `pop()` or `stack[-1]`.' },
      { title: 'Forgetting the final emptiness check', fix: 'Without `return not stack`, `"(("` is accepted as valid.' },
      { title: 'Storing values instead of indexes', fix: 'When the answer is a distance (days, width), the monotonic stack must hold indexes.' },
      { title: 'Min Stack with one global minimum', fix: 'It breaks after pops. Store the current minimum alongside each element.' },
    ],
    interview: {
      when: 'Anything nested, or "nearest previous / next bigger" → stack. Name the monotonic stack and give the amortised O(n) argument.',
      problems: ['valid-parentheses', 'min-stack', 'evaluate-reverse-polish-notation', 'daily-temperatures', 'largest-rectangle-in-histogram'],
    },
    inWork: [
      'Undo / redo in editors',
      'Parsers: JSON, HTML tags, expression evaluators, compilers',
      'The call stack itself — reading stack traces, avoiding very deep recursion',
      'Browser back-button history',
    ],
    quiz: [
      { question: 'Why is the monotonic stack O(n) despite its inner loop?', answer: 'Each index is pushed once and popped at most once, so all pops across the run add up to at most n.' },
      { question: 'Min Stack with O(1) `getMin`: how?', answer: 'Push pairs `(value, min_so_far)`. The top always holds the current minimum, and popping restores the previous one automatically.' },
      {
        question: 'Why can recursive DFS crash on a 100,000-node path in Python, and what is the fix?',
        answer: 'The default recursion limit (~1000) raises `RecursionError`. Use an explicit stack (iterative DFS).',
      },
    ],
    source: { label: 'Tech Interview Handbook: Stack', url: `${TIH}/stack/` },
    extraSource: { label: 'Python Tutorial: Using Lists as Stacks', url: `${PY}/tutorial/datastructures.html#using-lists-as-stacks` },
  },
  'Binary Search': {
    summary:
      'Halve the search space every step by asking a yes/no question whose answer is monotonic — O(log n) instead of O(n).',
    recognize: [
      'Sorted, or rotated sorted, array',
      '"Find the minimum / maximum value that works" (search on the answer)',
      'Huge ranges (up to 10⁹) instead of an explicit array',
      'An expected time of O(log n)',
    ],
    points: [
      'It works on anything monotonic: a predicate that is False … False True … True. The task is to find the first True.',
      'Write the invariant before coding, e.g. "the answer is always in [lo, hi]". The loop condition and the updates follow from it, and off-by-one bugs disappear.',
      'Search on the answer: when you can check "is speed k enough?" in O(n), binary search k over its range — O(n log range).',
      'Rotated array: one half around `mid` is always sorted; check whether the target lies inside that half.',
      'In real code use `bisect.bisect_left(a, x)`: the first index with `a[i] >= x`.',
    ],
    complexity: [
      { op: 'Linear search', cost: 'O(n)' },
      { op: 'Binary search', cost: 'O(log n)', note: '≈ 30 steps for 10⁹' },
      { op: 'Search on the answer', cost: 'O(check × log range)' },
      { op: '`bisect_left` / `bisect_right`', cost: 'O(log n)' },
    ],
    example: `def first_true(lo, hi, ok):        # smallest x in [lo, hi] with ok(x)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                   # mid works: answer is mid or left
        else:
            lo = mid + 1               # mid fails: answer is right of mid
    return lo

def min_eating_speed(piles, h):        # Koko Eating Bananas
    hours = lambda k: sum((p + k - 1) // k for p in piles)   # ceil(p / k)
    return first_true(1, max(piles), lambda k: hours(k) <= h)

print(min_eating_speed([3, 6, 7, 11], 8))   # 4

import bisect
a = [1, 3, 3, 5, 8]
print(bisect.bisect_left(a, 3), bisect.bisect_right(a, 3))   # 1 3`,
    pitfalls: [
      { title: 'Infinite loop with `lo = mid`', fix: 'With `mid = (lo + hi) // 2` and `hi = lo + 1`, `lo = mid` never moves. Pair floor-mid with `lo = mid + 1`.' },
      { title: 'Mixing templates', fix: 'Pick one invariant (`lo < hi` with `hi = mid`, or `lo <= hi` with `hi = mid - 1`) and stick to it.' },
      { title: 'Wrong answer range', fix: 'The lower bound must be valid: speeds start at 1, not 0 (division by zero).' },
      { title: '`x in sorted_list`', fix: 'That is O(n). Use `bisect` for O(log n).' },
    ],
    interview: {
      when: 'Look for monotonic yes/no questions, not just sorted arrays. Saying the invariant out loud is the difference between a clean solution and off-by-one debugging.',
      problems: [
        'binary-search',
        'search-a-2d-matrix',
        'koko-eating-bananas',
        'find-minimum-in-rotated-sorted-array',
        'search-in-rotated-sorted-array',
        'time-based-key-value-store',
      ],
    },
    inWork: [
      '`git bisect` to find the commit that introduced a bug',
      'Database B-tree indexes and lookups in sorted files',
      'Finding a limit: the largest load or smallest timeout that still passes',
      'Finding the first bad version in a release history',
    ],
    quiz: [
      { question: 'How many steps does binary search need for one billion items?', answer: 'About 30, because 2³⁰ ≈ 1.07 billion.' },
      {
        question: 'Why is Koko Eating Bananas a binary-search problem without a sorted array?',
        answer: 'The predicate "speed k finishes within h hours" is monotonic: once true, it stays true for every bigger k. So binary search the smallest k.',
      },
      { question: 'In a rotated sorted array, how do you know which half is sorted?', answer: 'If `nums[lo] <= nums[mid]`, the left half is sorted; otherwise the right half is.' },
    ],
    source: { label: 'Tech Interview Handbook: Sorting and searching', url: `${TIH}/sorting-searching/` },
    extraSource: { label: 'bisect — Array bisection algorithm', url: `${PY}/library/bisect.html` },
  },
  'Linked List': {
    summary:
      'Nodes connected by pointers: O(1) insert and delete when you hold the node, but O(n) to reach the k-th item. Problems test rewiring pointers without losing references.',
    recognize: [
      'The input is a `ListNode` head',
      'Reverse, reorder or merge lists',
      'Detect a cycle or find the middle',
      'An LRU cache, or O(1) removal from the middle',
    ],
    points: [
      'Each node holds `val` and `next`. Changing `next` rewires the list; losing the last reference to a node loses everything after it.',
      'Dummy head: `dummy = ListNode(0, head)` removes the special cases when the head changes; return `dummy.next`.',
      'Fast/slow pointers: fast moves 2, slow moves 1. Fast reaches the end → slow is at the middle. They meet → there is a cycle (Floyd).',
      'Reverse in place with `prev`, `cur`, `nxt`: always save `nxt` before rewiring.',
      'Doubly linked list + hash map = O(1) LRU cache: move a node to the front on access, evict from the tail.',
    ],
    complexity: [
      { op: 'Reach the k-th node', cost: 'O(n)' },
      { op: 'Insert / delete with the node in hand', cost: 'O(1)' },
      { op: 'Reverse, find middle, detect cycle', cost: 'O(n)', note: 'O(1) space' },
      { op: 'Merge k sorted lists with a heap', cost: 'O(N log k)', note: 'N = total nodes' },
    ],
    example: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def reverse(head):
    prev = None
    while head:
        nxt = head.next            # 1. save the rest
        head.next = prev           # 2. point backwards
        prev, head = head, nxt     # 3. move on
    return prev

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

def build(vals):
    dummy = tail = ListNode()
    for v in vals:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

node, out = reverse(build([1, 2, 3])), []
while node:
    out.append(node.val)
    node = node.next
print(out, has_cycle(build([1, 2])))   # [3, 2, 1] False`,
    pitfalls: [
      { title: 'Rewiring before saving `next`', fix: 'The rest of the list is lost. Save `nxt = head.next` first.' },
      { title: '`while fast.next` without checking `fast`', fix: '`AttributeError` on `None`. Use `while fast and fast.next`.' },
      { title: 'Removing the N-th node from the end', fix: 'Move one pointer n steps ahead and start both from a dummy, so removing the head is not a special case.' },
      { title: 'Comparing nodes with `==`', fix: 'You mean the same node: use `is`.' },
    ],
    interview: {
      when: 'Draw boxes and arrows before coding and narrate each pointer move. Use a dummy node by default — it removes most edge cases.',
      problems: ['reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle', 'reorder-list', 'remove-nth-node-from-end-of-list', 'lru-cache'],
    },
    inWork: [
      'LRU caches (`OrderedDict`, cache eviction in Redis-like systems)',
      'Undo history, playlists, tab history',
      'Free lists in memory allocators and OS schedulers',
      'Append-only logs and blockchains where each record points to the previous one',
    ],
    quiz: [
      { question: 'Why use a dummy head node?', answer: 'Inserting or deleting at the head stops being a special case; at the end you return `dummy.next`.' },
      {
        question: "How does Floyd's algorithm find a cycle with O(1) memory?",
        answer: 'Fast moves 2 steps, slow 1. Inside a cycle fast gains one step per move and must land on slow; without a cycle fast reaches `None`.',
      },
      {
        question: 'LRU cache with O(1) get and put: which structures?',
        answer: 'A hash map from key to node, plus a doubly linked list ordered by recency: move a node to the front on access, evict the tail when full.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Linked list', url: `${TIH}/linked-list/` },
    extraSource: { label: 'collections.OrderedDict (LRU building block)', url: `${PY}/library/collections.html#collections.OrderedDict` },
  },
  Trees: {
    source: { label: 'collections.deque (for BFS)', url: `${PY}/library/collections.html#collections.deque` },
    points: [
      'Most tree problems are recursion: solve for left, solve for right, combine at the node.',
      'DFS (recursive) for depth/paths; BFS with a deque for level-by-level.',
      'BST: left < node < right, so an in-order traversal is sorted.',
    ],
    example: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
  },
  Tries: {
    source: { label: 'Python Tutorial: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
    points: [
      'Each node is a dict of children plus an "end of word" flag.',
      'Insert/search cost O(length of word), independent of how many words are stored.',
      'Great for prefix search and for pruning DFS over a grid of letters.',
    ],
    example: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True`,
  },
  Heap: {
    source: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
    points: [
      '`heapq` is a min-heap: push/pop O(log n), smallest item at `h[0]`.',
      'Max-heap: push negative values.',
      'Top K: keep a heap of size k → O(n log k). Two heaps give a running median.',
    ],
    example: `import heapq
def k_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return h`,
  },
  Backtracking: {
    source: { label: 'Python Tutorial §4.7: Defining Functions', url: `${PY}/tutorial/controlflow.html#defining-functions` },
    points: [
      'Template: choose → recurse → un-choose. Builds every candidate step by step.',
      'Prune early when the partial answer can no longer be valid.',
      'Copy the path when saving it (`path[:]`), because the list keeps changing.',
    ],
    example: `def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums):
            res.append(path[:]); return
        path.append(nums[i]); dfs(i + 1)   # choose
        path.pop(); dfs(i + 1)             # skip
    dfs(0)
    return res`,
  },
  Graphs: {
    source: { label: 'collections.defaultdict', url: `${PY}/library/collections.html#collections.defaultdict` },
    points: [
      'Build an adjacency list with `defaultdict(list)`; keep a `visited` set.',
      'Grid = graph: neighbours are up/down/left/right.',
      'Topological sort (course schedule) and union-find (connected components) are the two big extras.',
    ],
    example: `def num_islands(grid):
    rows, cols, seen = len(grid), len(grid[0]), set()
    def dfs(r, c):
        if (r, c) in seen or not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == "0":
            return
        seen.add((r, c))
        for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
            dfs(r + dr, c + dc)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                dfs(r, c); count += 1
    return count`,
  },
  'Advanced Graphs': {
    source: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
    points: [
      'Dijkstra: shortest path with non-negative weights, using a min-heap of (distance, node).',
      "Prim's algorithm (minimum spanning tree) uses the same heap idea.",
      'Bellman-Ford handles "at most K edges" by relaxing K times.',
    ],
    example: `import heapq
def dijkstra(graph, start):          # graph[u] = [(v, w), ...]
    dist, h = {}, [(0, start)]
    while h:
        d, u = heapq.heappop(h)
        if u in dist: continue
        dist[u] = d
        for v, w in graph[u]:
            if v not in dist:
                heapq.heappush(h, (d + w, v))
    return dist`,
  },
  '1-D DP': {
    source: { label: 'functools.cache (memoization)', url: `${PY}/library/functools.html#functools.cache` },
    points: [
      'Define `dp[i]` in one sentence, write the recurrence, set the base cases, pick the order.',
      'Start top-down with `@cache` on a recursive function, then convert to a bottom-up array.',
      'Often only the last 1–2 values are needed → O(1) space.',
    ],
    example: `def climb_stairs(n):
    a, b = 1, 1          # ways to reach step 0 and 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
  },
  '2-D DP': {
    source: { label: 'functools.cache (memoization)', url: `${PY}/library/functools.html#functools.cache` },
    points: [
      'State has two indexes: a grid cell (r, c) or positions in two strings (i, j).',
      'Fill a table row by row; each cell depends on top/left/diagonal neighbours.',
      'Keep only the previous row to cut space to O(n).',
    ],
    example: `def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(b) - 1, -1, -1):
            dp[i][j] = 1 + dp[i+1][j+1] if a[i] == b[j] else max(dp[i+1][j], dp[i][j+1])
    return dp[0][0]`,
  },
  Greedy: {
    source: { label: 'Python Sorting HOW TO', url: `${PY}/howto/sorting.html` },
    points: [
      'Make the locally best choice and never revisit it — only correct when you can argue why.',
      'Often starts with sorting by the right key.',
      "Kadane's algorithm: reset the running sum when it goes negative.",
    ],
    example: `def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
  },
  Intervals: {
    source: { label: 'Python Sorting HOW TO', url: `${PY}/howto/sorting.html` },
    points: [
      'Sort by start time first; then overlaps are always with the previous interval.',
      'Two intervals overlap when `a.start <= b.end and b.start <= a.end`.',
      'Count rooms needed with a min-heap of end times.',
    ],
    example: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    out = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
  },
  'Math & Geometry': {
    source: { label: 'math — Mathematical functions', url: `${PY}/library/math.html` },
    points: [
      'Matrix tricks: rotate = transpose + reverse each row; walk a spiral with four boundaries.',
      'Fast power: square the base and halve the exponent → O(log n).',
      'Digit problems: `n % 10` gives the last digit, `n // 10` drops it.',
    ],
    example: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
  },
  'Bit Manipulation': {
    source: { label: 'Python reference: Binary bitwise operations', url: `${PY}/reference/expressions.html#binary-bitwise-operations` },
    points: [
      '`&`, `|`, `^`, `<<`, `>>`. XOR cancels pairs: `x ^ x == 0`.',
      '`n & (n - 1)` clears the lowest set bit — counts bits fast.',
      'Python ints are unbounded; mask with `0xFFFFFFFF` to simulate 32-bit.',
    ],
    example: `def single_number(nums):
    res = 0
    for x in nums:
        res ^= x
    return res`,
  },
}

export const CATEGORY_REFERENCES: Record<string, TaskReference> = Object.fromEntries(
  Object.entries(CATEGORY_NOTES).map(([category, ref]) => [category, { title: `${category}: the pattern`, ...ref }])
)
