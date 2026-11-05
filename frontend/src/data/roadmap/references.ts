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
    summary:
      'A tree is recursion made visible: solve the problem for the left subtree, solve it for the right subtree, and combine the two answers at the node.',
    recognize: [
      'The input is a `TreeNode` root',
      'Depth, height, diameter, path sums',
      '"Level by level", "right side view"',
      'BST: "k-th smallest", "validate", anything about sorted order',
    ],
    points: [
      'Most tree problems are one DFS in which each call returns something about its subtree (height, sum, is-balanced) and the parent combines the results — O(n), every node visited once.',
      'Decide what the function returns versus what you track globally. Diameter: return the height, but update `best = left + right` on the side.',
      'BFS with a deque walks level by level: `for _ in range(len(q))` processes exactly one level.',
      'BST invariant: everything in the left subtree < node < everything in the right subtree, so an in-order traversal is sorted. Validate with (low, high) bounds, not only against the parent.',
      'Recursion depth equals the tree height: O(log n) when balanced, O(n) for a skewed tree — mind Python’s recursion limit.',
    ],
    complexity: [
      { op: 'DFS or BFS over the tree', cost: 'O(n)' },
      { op: 'DFS memory', cost: 'O(h)', note: 'h = height' },
      { op: 'BFS memory', cost: 'O(w)', note: 'w = widest level' },
      { op: 'BST search / insert', cost: 'O(h)', note: 'O(log n) balanced, O(n) skewed' },
    ],
    example: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def diameter(root):
    best = 0
    def height(node):                  # returns height, updates best
        nonlocal best
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)        # longest path through this node
        return 1 + max(l, r)
    height(root)
    return best

def level_order(root):
    out, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):        # exactly one level per outer loop
            node = q.popleft()
            level.append(node.val)
            q.extend(c for c in (node.left, node.right) if c)
        out.append(level)
    return out

def is_bst(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return is_bst(node.left, low, node.val) and is_bst(node.right, node.val, high)

#      4
#    2   6
#   1 3    7
root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))
print(diameter(root), level_order(root), is_bst(root))
# 4 [[4], [2, 6], [1, 3, 7]] True`,
    pitfalls: [
      { title: 'Validating a BST against the parent only', fix: 'A node deep in the left subtree can still be bigger than the root. Pass (low, high) bounds down.' },
      { title: 'Mixing the return value and the answer', fix: 'In Diameter the function returns height; the answer lives in a separate variable.' },
      { title: 'No `None` base case', fix: '`AttributeError` on `None.left`. Handle the empty node first.' },
      { title: 'Deep, skewed trees in Python', fix: '`RecursionError` past ~1000 levels. Use an explicit stack.' },
    ],
    interview: {
      when: 'Before coding, say "each call returns …". Interviewers watch whether you separate the returned value from the global answer and handle `None` first.',
      problems: [
        'invert-binary-tree',
        'maximum-depth-of-binary-tree',
        'diameter-of-binary-tree',
        'binary-tree-level-order-traversal',
        'validate-binary-search-tree',
        'lowest-common-ancestor-of-a-binary-search-tree',
      ],
    },
    inWork: [
      'File systems: folder sizes are a recursive sum',
      'DOM and React component trees; JSON and syntax trees in compilers and linters',
      'Org charts, nested categories, comment threads',
      'Database indexes are B-trees',
    ],
    quiz: [
      { question: 'Why is DFS over a tree O(n)?', answer: 'Every node is visited exactly once and does O(1) work apart from its recursive calls.' },
      {
        question: 'Validate BST: why is comparing with the parent not enough?',
        answer: 'A value deep in the left subtree must be smaller than every ancestor where you went left, not just its parent. (low, high) bounds carry that constraint down.',
      },
      { question: 'When BFS instead of DFS on a tree?', answer: 'When the question is about levels or the fewest steps from the root: level order, right side view, minimum depth.' },
    ],
    source: { label: 'Tech Interview Handbook: Tree', url: `${TIH}/tree/` },
    extraSource: { label: 'collections.deque (BFS queue)', url: `${PY}/library/collections.html#collections.deque` },
  },
  Tries: {
    summary:
      'A prefix tree: each edge is a character, so words that share a prefix share a path. Prefix lookups cost the length of the word, not the number of words stored.',
    recognize: ['"Starts with", "prefix"', 'Autocomplete or search suggestions', 'Many words searched at once (Word Search II)', 'Wildcard `.` matching'],
    points: [
      'A node is a dict of children plus an end-of-word flag. Insert and search walk one node per character: O(L).',
      'A hash set also answers "is this exact word present?" in O(L). A trie wins when you need prefix queries or want to stop a search early.',
      'Word Search II: put every word in a trie, then DFS the grid once and abandon a path as soon as it is not a prefix of any word — instead of searching each word separately.',
      'Wildcards: at a `.` branch into every child, which turns the lookup into a small DFS.',
    ],
    complexity: [
      { op: '`insert`, `search`, `starts_with`', cost: 'O(L)', note: 'L = word length' },
      { op: 'Memory', cost: 'O(total characters)' },
      { op: 'Word Search II', cost: 'one grid DFS', note: 'pruned by the trie' },
    ],
    example: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})   # create the path if missing
        node["$"] = True                      # end-of-word marker

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

t = Trie()
for w in ["app", "apple", "apt"]:
    t.insert(w)
print(t.search("app"), t.search("ap"), t.starts_with("ap"))   # True False True`,
    pitfalls: [
      { title: 'No end-of-word marker', fix: '"ap" would be reported as a word just because "app" exists.' },
      { title: 'A trie where a set is enough', fix: 'Only exact lookups? A `set` is simpler and just as fast.' },
      { title: 'Word Search II timing out', fix: 'Prune paths that are not prefixes, remove words once found, and restore visited cells after the DFS.' },
      { title: 'Heavy node objects', fix: 'A dict of dicts is the pragmatic Python representation; a class per node is fine but heavier.' },
    ],
    interview: {
      when: 'Reach for a trie when the problem says "prefix" or searches many words together. Explain the pruning win in Word Search II.',
      problems: ['implement-trie-prefix-tree', 'design-add-and-search-words-data-structure', 'word-search-ii'],
    },
    inWork: ['Autocomplete and search suggestions', 'IP routing: longest-prefix match', 'Spell checkers and URL routers that match path segments'],
    quiz: [
      { question: 'Trie or hash set for checking exact words?', answer: 'Both are O(L); a set is simpler. A trie earns its place with prefix queries or early pruning.' },
      { question: 'Why does a trie make Word Search II fast?', answer: 'One grid DFS checks all words at once, and a path stops the moment no word starts with it.' },
      { question: 'What does `starts_with(prefix)` cost?', answer: 'O(length of the prefix), no matter how many words are stored.' },
    ],
    source: { label: 'Tech Interview Handbook: Trie', url: `${TIH}/trie/` },
    extraSource: { label: 'Python Tutorial: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
  },
  Heap: {
    summary:
      'A heap always hands you the smallest (or largest) item in O(1) and re-orders in O(log n) — the tool for "top k", "next best" and anything processed by priority.',
    recognize: ['"k largest", "k smallest", "k closest"', 'Median of a stream', 'Merge k sorted lists', 'Repeatedly take the best item: scheduling by priority or time'],
    points: [
      'A binary heap lives in an array: children of index i are 2i+1 and 2i+2. Only the root is guaranteed to be the minimum.',
      'Top-k largest: keep a MIN-heap of size k; push every item and pop when the size exceeds k. The root is the k-th largest. O(n log k) time, O(k) memory, and it works on streams.',
      'Running median: a max-heap for the lower half and a min-heap for the upper half, sizes differing by at most one.',
      'Merge k sorted lists: the heap holds the current head of each list — O(N log k).',
    ],
    complexity: [
      { op: 'push, pop', cost: 'O(log n)' },
      { op: 'peek the top', cost: 'O(1)' },
      { op: '`heapify` a list', cost: 'O(n)' },
      { op: 'Top-k with a size-k heap', cost: 'O(n log k)', note: 'vs O(n log n) sorting' },
    ],
    example: `import heapq

def k_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)            # drop the smallest of the k + 1
    return sorted(h, reverse=True)

class MedianFinder:
    def __init__(self):
        self.low, self.high = [], []    # low: max-heap (negated), high: min-heap

    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move low's max up
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

print(k_largest([3, 2, 1, 5, 6, 4], 2))   # [6, 5]
m = MedianFinder()
for x in [5, 15, 1, 3]:
    m.add(x)
print(m.median())                          # 4.0`,
    pitfalls: [
      { title: 'Sorting everything for top-k', fix: 'O(n log n) and needs all data in memory. A size-k heap is O(n log k) and streams.' },
      { title: 'Max-heap for the k largest', fix: 'Use a MIN-heap of size k: its root is the one to evict.' },
      { title: 'Ties on incomparable items', fix: 'Add a counter: push `(priority, i, item)`.' },
      { title: '`h[-1]` as the maximum', fix: 'Only `h[0]` is meaningful in a heap.' },
    ],
    interview: {
      when: 'For top-k say "size-k heap, O(n log k)" and mention `heapq.nlargest` for real code. Two heaps is the expected answer for a running median.',
      problems: [
        'kth-largest-element-in-a-stream',
        'last-stone-weight',
        'k-closest-points-to-origin',
        'kth-largest-element-in-an-array',
        'task-scheduler',
        'find-median-from-data-stream',
      ],
    },
    inWork: [
      'Task schedulers and job queues ordered by priority or deadline',
      'Dijkstra in maps and network routing',
      'Top-N dashboards over streaming data',
      'k-way merge of sorted log files or database runs',
    ],
    quiz: [
      { question: 'Why a MIN-heap to keep the k LARGEST items?', answer: 'Its root is the smallest of the current top k — exactly the item to evict when something bigger arrives.' },
      { question: '`heapify` vs n pushes?', answer: '`heapify` is O(n); n separate pushes cost O(n log n).' },
      {
        question: 'Running median with O(log n) per insert: how?',
        answer: 'Two heaps — a max-heap for the lower half and a min-heap for the upper half, sizes within one. The median sits at the tops.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Heap', url: `${TIH}/heap/` },
    extraSource: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
  },
  Backtracking: {
    summary:
      'Build a solution one choice at a time; when a partial solution cannot work, undo the last choice and try the next one — a DFS over the tree of decisions.',
    recognize: ['"All subsets / permutations / combinations"', '"Generate every valid …"', 'N-Queens, Sudoku, a word in a grid', 'Small n (≤ 20) and an output that is exponential in size'],
    points: [
      'Template: choose → recurse → un-choose. The `path` list is shared, so undo with `path.pop()` right after the call.',
      'Picture the decision tree: depth = number of decisions, branching = options per decision. Counting its leaves gives the complexity (2ⁿ subsets, n! permutations).',
      'Prune early: abandon a branch the moment it breaks a constraint (sum too large, queen attacked). Pruning is what makes these solutions pass.',
      'Duplicate results: sort the input and skip `nums[i] == nums[i - 1]` at the same depth.',
      'Save a copy when recording a result: `res.append(path[:])`.',
    ],
    complexity: [
      { op: 'All subsets', cost: 'O(n · 2ⁿ)' },
      { op: 'All permutations', cost: 'O(n · n!)' },
      { op: 'Combination sum', cost: 'exponential', note: 'bounded by pruning' },
      { op: 'Memory', cost: 'O(n)', note: 'recursion depth' },
    ],
    example: `def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums):
            res.append(path[:])              # copy: path keeps changing
            return
        path.append(nums[i]); dfs(i + 1)     # choose nums[i]
        path.pop();           dfs(i + 1)     # un-choose: skip it
    dfs(0)
    return res

def combination_sum(candidates, target):
    res, path = [], []
    candidates.sort()
    def dfs(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break                        # prune: the rest are even bigger
            path.append(c)
            dfs(i, remaining - c)            # i, not i + 1: c can be reused
            path.pop()
    dfs(0, target)
    return res

print(subsets([1, 2]))                       # [[1, 2], [1], [2], []]
print(combination_sum([2, 3, 6, 7], 7))      # [[2, 2, 3], [7]]`,
    pitfalls: [
      { title: '`res.append(path)` without a copy', fix: 'Every saved result is the same list, which ends up empty. Append `path[:]`.' },
      { title: 'Forgetting to undo', fix: 'Missing `path.pop()` or not un-marking a visited cell leaks state into sibling branches.' },
      { title: 'Duplicates from repeated input values', fix: 'Sort, then skip a value equal to the previous one at the same depth.' },
      { title: 'No pruning', fix: 'Exponential blow-up and time-outs. Cut a branch as soon as it cannot succeed.' },
    ],
    interview: {
      when: 'State the decision tree and its size (2ⁿ, n!) before coding. Exponential time is expected here — show you know it and point out where you prune.',
      problems: ['subsets', 'combination-sum', 'permutations', 'subsets-ii', 'word-search', 'n-queens'],
    },
    inWork: [
      'Constraint solvers: timetables, seat and room allocation',
      'Generating every configuration for tests',
      'Regex engines and parsers backtrack internally',
      'Puzzle and game solvers (Sudoku, path search)',
    ],
    quiz: [
      {
        question: 'Why `res.append(path[:])` instead of `res.append(path)`?',
        answer: '`path` is one shared list that keeps changing. Without a copy every saved result points to the same list, which ends up empty.',
      },
      { question: 'Time complexity of generating all subsets?', answer: '2ⁿ subsets, each up to n items to copy: O(n · 2ⁿ).' },
      { question: 'How do you avoid duplicate subsets when the input has repeats?', answer: 'Sort it, and at the same recursion depth skip a value equal to the previous one.' },
    ],
    source: { label: 'Tech Interview Handbook: Recursion', url: `${TIH}/recursion/` },
    extraSource: { label: 'Python Tutorial §4: Defining Functions', url: `${PY}/tutorial/controlflow.html#defining-functions` },
  },
  Graphs: {
    summary:
      'Things connected to things. Model the problem as nodes and edges and it is almost always BFS, DFS, topological sort or union-find.',
    recognize: [
      'A grid of cells: islands, regions, flood fill',
      'Dependencies, prerequisites, build order',
      'Fewest steps (every move costs the same)',
      'Connected components, "is it a valid tree", the redundant edge',
    ],
    points: [
      'Build an adjacency list with `defaultdict(list)`; in a grid the neighbours are the 4 directions. Always keep a `visited` set — graphs have cycles.',
      'DFS goes deep (components, cycle detection). BFS expands in rings from the start, so the first time it reaches a node is the shortest path in an unweighted graph.',
      'Multi-source BFS: start the queue with every source at once (Rotting Oranges, Walls and Gates).',
      'Topological sort (Kahn): repeatedly take nodes with in-degree 0. If not every node gets taken, there is a cycle (Course Schedule).',
      'Union-find merges sets and answers "same component?" in near O(1) — Redundant Connection, number of components.',
    ],
    complexity: [
      { op: 'BFS / DFS', cost: 'O(V + E)' },
      { op: 'Grid traversal', cost: 'O(rows × cols)' },
      { op: 'Topological sort', cost: 'O(V + E)' },
      { op: 'Union-find (path compression + rank)', cost: '≈ O(1)', note: 'per operation' },
    ],
    example: `from collections import deque, defaultdict

def num_islands(grid):
    rows, cols, seen, count = len(grid), len(grid[0]), set(), 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1
                q = deque([(r, c)])
                seen.add((r, c))                  # mark when pushing
                while q:                          # BFS flood fill
                    y, x = q.popleft()
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < rows and 0 <= nx < cols \\
                                and grid[ny][nx] == "1" and (ny, nx) not in seen:
                            seen.add((ny, nx))
                            q.append((ny, nx))
    return count

def course_order(n, prereqs):                     # Kahn's algorithm
    graph, indeg = defaultdict(list), [0] * n
    for course, pre in prereqs:
        graph[pre].append(course)
        indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == n else []       # [] means a cycle

print(num_islands(["1100", "1100", "0010", "0001"]))       # 3
print(course_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))  # [0, 1, 2, 3]`,
    pitfalls: [
      { title: 'Marking visited when popping (BFS)', fix: 'The same node gets queued many times. Mark it when you push it.' },
      { title: 'Ignoring cycles', fix: 'Infinite recursion. Directed cycle detection needs "visiting" vs "done" states — or use Kahn.' },
      { title: 'Recursive DFS on a 1000 × 1000 grid', fix: '`RecursionError` in Python. Use BFS or an explicit stack.' },
      { title: 'Union-find without optimisations', fix: 'Add path compression and union by rank, or it degrades on big inputs.' },
    ],
    interview: {
      when: 'First say how you model it ("cells are nodes, neighbours are edges"), then name the algorithm and O(V + E). Choosing BFS for fewest steps and topological sort for dependencies is what is being tested.',
      problems: ['number-of-islands', 'clone-graph', 'rotting-oranges', 'pacific-atlantic-water-flow', 'course-schedule', 'redundant-connection'],
    },
    inWork: [
      'Dependency resolution in package managers, build systems and task pipelines (topological sort)',
      'Social features: "friends of friends" is BFS',
      'Detecting circular imports or deadlocks (cycle detection)',
      'Network reachability and permission inheritance',
    ],
    quiz: [
      {
        question: 'Why does BFS give the shortest path in an unweighted graph?',
        answer: 'It visits nodes ring by ring in order of distance, so the first time a node is reached is via the fewest edges.',
      },
      { question: "How does Kahn's algorithm detect a cycle?", answer: 'Nodes on a cycle never reach in-degree 0, so fewer than V nodes end up in the output.' },
      {
        question: 'When union-find instead of DFS?',
        answer: 'When edges arrive one by one and you keep asking "are these connected?", or must find the edge that creates a cycle.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Graph', url: `${TIH}/graph/` },
    extraSource: { label: 'collections.defaultdict', url: `${PY}/library/collections.html#collections.defaultdict` },
  },
  'Advanced Graphs': {
    summary:
      'When edges have weights, "shortest" means cheapest, not fewest steps: replace the plain queue with a priority queue (Dijkstra) or relax edges round by round (Bellman-Ford).',
    recognize: [
      'Weighted edges: time, cost, distance',
      '"Minimum cost to connect all points" (spanning tree)',
      '"Cheapest path with at most k stops"',
      '"How long until the signal reaches every node?"',
    ],
    points: [
      'Dijkstra: always expand the closest unfinished node from a min-heap of `(distance, node)` and skip stale entries. Correct only with non-negative weights.',
      "Minimum spanning tree: Prim grows one tree, always adding the cheapest edge that leaves it (heap). Kruskal sorts all edges and adds one if union-find says it joins two components.",
      'Bellman-Ford relaxes every edge in rounds. It handles negative weights, and running exactly k + 1 rounds limits a path to k stops.',
      'Plain BFS on a weighted graph finds the fewest edges, which is generally not the cheapest path.',
    ],
    complexity: [
      { op: 'Dijkstra with a heap', cost: 'O((V + E) log V)' },
      { op: 'Prim with a heap', cost: 'O(E log V)' },
      { op: 'Kruskal', cost: 'O(E log E)' },
      { op: 'Bellman-Ford', cost: 'O(V · E)', note: 'O(k · E) for k stops' },
    ],
    example: `import heapq
from collections import defaultdict

def network_delay(times, n, start):              # Dijkstra
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
    dist, h = {}, [(0, start)]
    while h:
        d, node = heapq.heappop(h)
        if node in dist:
            continue                             # stale entry: already final
        dist[node] = d
        for nxt, w in graph[node]:
            if nxt not in dist:
                heapq.heappush(h, (d + w, nxt))
    return max(dist.values()) if len(dist) == n else -1

def cheapest_with_k_stops(n, flights, src, dst, k):   # Bellman-Ford
    cost = [float("inf")] * n
    cost[src] = 0
    for _ in range(k + 1):                       # each round adds one edge
        nxt = cost[:]                            # read last round's values only
        for u, v, price in flights:
            if cost[u] + price < nxt[v]:
                nxt[v] = cost[u] + price
        cost = nxt
    return -1 if cost[dst] == float("inf") else cost[dst]

print(network_delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))   # 2
flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
print(cheapest_with_k_stops(4, flights, 0, 3, 1))              # 700`,
    pitfalls: [
      { title: 'Dijkstra with negative edges', fix: 'Wrong answers: a node is finalised too early. Use Bellman-Ford.' },
      { title: 'Finalising a node when it is pushed', fix: 'Finalise when popped, and skip stale heap entries.' },
      { title: 'Updating the cost array in place (k stops)', fix: 'One round could chain several edges and exceed k stops. Copy the array each round.' },
      { title: 'BFS on weighted edges', fix: 'It minimises edge count, not cost.' },
    ],
    interview: {
      when: 'Say why plain BFS fails (weights) and why Dijkstra needs non-negative weights. Picking correctly between Dijkstra, Bellman-Ford and an MST is the signal.',
      problems: ['network-delay-time', 'min-cost-to-connect-all-points', 'cheapest-flights-within-k-stops', 'swim-in-rising-water', 'reconstruct-itinerary'],
    },
    inWork: [
      'Maps and routing; link-state routing protocols such as OSPF use Dijkstra',
      'Cheapest or fastest flight and delivery search',
      'Network design: connecting sites with the least cable (minimum spanning tree)',
      'Latency-aware request routing between services',
    ],
    quiz: [
      {
        question: 'Why does Dijkstra fail with negative edges?',
        answer: 'It treats a node as final when popped, assuming no later path can be cheaper. A negative edge can make a later path cheaper.',
      },
      {
        question: 'Why copy the cost array each round in "cheapest flights within k stops"?',
        answer: 'So each round extends paths by exactly one edge. Updating in place lets one round use several edges and exceed k stops.',
      },
      {
        question: 'Prim or Kruskal?',
        answer: 'Prim grows one tree with a heap (handy with an adjacency list or a dense graph); Kruskal sorts edges and uses union-find (handy with an edge list).',
      },
    ],
    source: { label: 'Tech Interview Handbook: Graph', url: `${TIH}/graph/` },
    extraSource: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
  },
  '1-D DP': {
    summary:
      'Dynamic programming is recursion with memory: define the answer for a smaller prefix, build it from earlier answers, and compute each one only once.',
    recognize: ['"Count the ways"', '"Minimum / maximum cost to reach the end"', '"Can you reach / partition / build …?"', 'Each choice limits later choices (rob this house or skip it)'],
    points: [
      'Four steps: (1) the state in one sentence — "`dp[i]` = most money from houses 0..i"; (2) the recurrence from smaller states; (3) base cases; (4) the order to compute them.',
      'Top-down: write the plain recursion and add `@cache` so each state is solved once. Bottom-up: fill a table from the base cases; easier to make memory-light.',
      'Complexity = number of states × work per state.',
      'Often only the last one or two values are needed, so memory drops to O(1) (House Robber, Climbing Stairs).',
      'If a greedy choice has a counterexample (coins 1, 3, 4 and amount 6), it is a DP problem.',
    ],
    complexity: [
      { op: 'Plain recursion', cost: 'often O(2ⁿ)' },
      { op: 'Memoised or bottom-up', cost: 'O(states × transition)' },
      { op: 'Coin Change', cost: 'O(amount × coins)' },
      { op: 'Longest Increasing Subsequence', cost: 'O(n²)', note: 'O(n log n) with bisect' },
    ],
    example: `from functools import cache

def rob(nums):
    prev, cur = 0, 0                         # best up to i-2, best up to i-1
    for x in nums:
        prev, cur = cur, max(cur, prev + x)  # skip x, or take x + best up to i-2
    return cur

def coin_change(coins, amount):
    @cache
    def best(rem):                           # fewest coins that make rem
        if rem == 0:
            return 0
        if rem < 0:
            return float("inf")
        return 1 + min(best(rem - c) for c in coins)
    ans = best(amount)
    return -1 if ans == float("inf") else ans

print(rob([2, 7, 9, 3, 1]))                  # 12  (2 + 9 + 1)
print(coin_change([1, 3, 4], 6))             # 2   (3 + 3; greedy 4 + 1 + 1 needs 3)`,
    pitfalls: [
      { title: 'A vague state', fix: 'Write `dp[i] = …` as a sentence before the recurrence; most wrong DPs start here.' },
      { title: 'A greedy that "looks right"', fix: 'Test a small counterexample — coin change is the classic trap.' },
      { title: 'Deep top-down recursion', fix: '`@cache` recursion on amount 10⁴ hits Python’s limit. Switch to a bottom-up table.' },
      { title: 'Off-by-one base cases', fix: 'Be explicit about what `dp[0]` means (often "empty prefix").' },
    ],
    interview: {
      when: 'Narrate the four steps: state, recurrence, base case, order. If stuck, start with memoised recursion, then convert to bottom-up and mention the O(1)-space version.',
      problems: ['climbing-stairs', 'house-robber', 'coin-change', 'decode-ways', 'word-break', 'longest-increasing-subsequence'],
    },
    inWork: [
      'Caching expensive recursive computations with `functools.cache`',
      'Pricing, packing and budget optimisation (knapsack-style)',
      'Text segmentation and tokenisation (Word Break)',
      'Decoding the most likely sequence in speech and routing (Viterbi)',
    ],
    quiz: [
      {
        question: 'Which two properties make DP applicable?',
        answer: 'Overlapping subproblems (the same state comes up again) and optimal substructure (the best answer is built from best answers to smaller states).',
      },
      { question: 'Why does greedy fail for coins [1, 3, 4] and amount 6?', answer: 'Greedy takes 4 + 1 + 1 = 3 coins; the optimum is 3 + 3 = 2 coins.' },
      { question: 'How does House Robber get to O(1) memory?', answer: '`dp[i]` depends only on `dp[i-1]` and `dp[i-2]`, so two variables are enough.' },
    ],
    source: { label: 'Tech Interview Handbook: Dynamic programming', url: `${TIH}/dynamic-programming/` },
    extraSource: { label: 'functools.cache (memoisation)', url: `${PY}/library/functools.html#functools.cache` },
  },
  '2-D DP': {
    summary:
      'The same DP thinking with two indexes: a cell in a grid, or positions i and j in two strings. Each cell is built from its neighbours above, to the left or on the diagonal.',
    recognize: [
      'Two strings: common subsequence, edit distance, interleaving',
      'Counting paths in a grid',
      'Knapsack: items × capacity (Target Sum, Coin Change II)',
      'The state needs two numbers to describe',
    ],
    points: [
      'State: `dp[i][j]` = answer for prefixes `a[:i]` and `b[:j]` (or for grid cell (i, j)). Draw the table for a tiny example before coding.',
      'Strings: when the characters match, take the diagonal + 1; otherwise take the best of dropping one character (up or left). Edit distance adds the cost of insert / delete / replace.',
      'Counting combinations (Coin Change II): loop coins outside and amounts inside so each combination is counted once.',
      'Each row usually needs only the previous row, so memory drops to O(n).',
    ],
    complexity: [
      { op: 'LCS, edit distance', cost: 'O(m × n)', note: 'O(min(m, n)) space possible' },
      { op: 'Unique paths in a grid', cost: 'O(rows × cols)' },
      { op: 'Knapsack', cost: 'O(items × capacity)' },
    ],
    example: `def lcs(a, b):                               # longest common subsequence
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i][j]: a[:i] vs b[:j]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # match: extend the diagonal
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

def edit_distance(a, b):
    prev = list(range(len(b) + 1))           # row for the empty prefix of a
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:                            # delete, insert, replace
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[-1]

print(lcs("abcde", "ace"))                   # 3
print(edit_distance("horse", "ros"))         # 3`,
    pitfalls: [
      { title: '`[[0] * n] * m`', fix: 'All rows are the same list. Build rows with a comprehension.' },
      { title: 'Index shift between the string and the table', fix: 'The table has an extra empty row and column: `dp[i][j]` uses `a[i - 1]` and `b[j - 1]`.' },
      { title: 'Loop order in Coin Change II', fix: 'Amounts outside counts orderings (permutations). Put coins in the outer loop.' },
      { title: 'Rolling rows that overwrite needed values', fix: 'Keep `prev` and `cur` rows, or iterate in the order that preserves what you still need.' },
    ],
    interview: {
      when: 'Draw a small table for an example and fill a few cells out loud — that proves the recurrence. Then offer the rolling-row O(n) memory optimisation.',
      problems: ['unique-paths', 'longest-common-subsequence', 'coin-change-ii', 'target-sum', 'interleaving-string', 'edit-distance'],
    },
    inWork: [
      '`git diff`, diff tools and spell checkers (LCS, edit distance)',
      'Fuzzy search and duplicate-record matching',
      'DNA and sequence alignment',
      'Budget and resource allocation (knapsack)',
    ],
    quiz: [
      { question: 'In LCS, what happens when the characters differ?', answer: 'Take the best of skipping one character: `max(dp[i-1][j], dp[i][j-1])`.' },
      {
        question: 'Why does loop order matter in Coin Change II?',
        answer: 'Coins outside and amounts inside counts each combination once; amounts outside counts every ordering, i.e. permutations.',
      },
      { question: 'How do you cut LCS or edit distance memory?', answer: 'Each row depends only on the previous one, so two rows are enough: O(n) space.' },
    ],
    source: { label: 'Tech Interview Handbook: Dynamic programming', url: `${TIH}/dynamic-programming/` },
    extraSource: { label: 'Tech Interview Handbook: Matrix', url: `${TIH}/matrix/` },
  },
  Greedy: {
    summary:
      'Make the locally best choice and never look back. Fast and simple — but only correct when you can argue that no better option is thrown away.',
    recognize: ['Maximum subarray', '"Can you reach the end?", "fewest jumps"', 'Choose the most non-overlapping items', 'One pass with a running best feels like it should be enough'],
    points: [
      'Greedy runs in O(n) or O(n log n) but needs a reason it is safe — usually an exchange argument: swapping the greedy choice into an optimal solution never makes it worse.',
      "Kadane: keep the best sum ending at the current index; once it drops below zero, restart — a negative prefix can only hurt what follows.",
      'Jump Game: track the farthest reachable index. If the current index is beyond it, you are stuck.',
      'Sorting first often sets up the greedy choice (by end time, by size).',
      'If you cannot argue it, look for a small counterexample. If you find one, switch to DP.',
    ],
    complexity: [
      { op: 'Single greedy pass', cost: 'O(n)' },
      { op: 'Greedy after sorting', cost: 'O(n log n)' },
      { op: 'Extra memory', cost: 'usually O(1)' },
    ],
    example: `def max_subarray(nums):                      # Kadane
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)                # extend, or restart at x
        best = max(best, cur)
    return best

def can_jump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False                     # cannot even get to i
        reach = max(reach, i + step)
    return True

def jump_count(nums):                        # Jump Game II: fewest jumps
    jumps = end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == end:                         # this jump's range is used up
            jumps, end = jumps + 1, farthest
    return jumps

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))           # 6
print(can_jump([3, 2, 1, 0, 4]), jump_count([2, 3, 1, 1, 4]))   # False 2`,
    pitfalls: [
      { title: 'Greedy without an argument', fix: 'Coin change with unusual coins is the classic failure. Prove it or test a counterexample.' },
      { title: 'Kadane starting from 0', fix: 'All-negative arrays then return 0. Start from `nums[0]`.' },
      { title: 'Gas Station brute force', fix: 'If total gas < total cost there is no answer; otherwise restart the start index after any point where the tank goes negative.' },
      { title: 'Sorting by the wrong key', fix: 'Interval greedy usually sorts by end time, not start time.' },
    ],
    interview: {
      when: 'Always add one sentence on why greedy is safe here. If you cannot, say so and switch to DP — that judgement is what is being tested.',
      problems: ['maximum-subarray', 'jump-game', 'jump-game-ii', 'gas-station', 'partition-labels'],
    },
    inWork: [
      'Scheduling and resource-allocation heuristics',
      'Load balancing: send work to the least-loaded server',
      'Huffman coding in compression',
      'Making change with standard currency denominations',
    ],
    quiz: [
      { question: 'Why can Kadane restart when the running sum is negative?', answer: 'Any subarray that continues a negative prefix gets better by dropping that prefix.' },
      { question: 'How do you tell a greedy problem from a DP problem?', answer: 'Try to prove the local choice is safe (exchange argument) or find a small counterexample; a counterexample means DP.' },
      {
        question: 'Gas Station: when is there no answer, and where do you start otherwise?',
        answer: 'No answer when total gas < total cost. Otherwise start right after the last point where the running tank went negative.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Array', url: `${TIH}/array/` },
    extraSource: { label: 'Wikipedia: Greedy algorithm', url: 'https://en.wikipedia.org/wiki/Greedy_algorithm' },
  },
  Intervals: {
    summary: 'Sort intervals by start; then each new interval only has to be compared with the last one you kept.',
    recognize: ['Meetings, bookings, time ranges', 'Merge or insert overlapping ranges', 'Minimum rooms, maximum overlap', 'Remove the fewest intervals to stop overlaps'],
    points: [
      '`[a, b]` and `[c, d]` overlap when `a <= d and c <= b`. After sorting by start this reduces to `c <= last_end`.',
      'Merge: sort by start, then either extend the last kept interval or append a new one — O(n log n).',
      'Most non-overlapping intervals: sort by END and keep the one that finishes first — it leaves the most room (provably optimal greedy).',
      'Meeting rooms: the answer is the maximum number of meetings at the same moment. Track it with a min-heap of end times (or a sweep over sorted starts and ends).',
    ],
    complexity: [
      { op: 'Sort', cost: 'O(n log n)' },
      { op: 'Merge pass', cost: 'O(n)' },
      { op: 'Meeting rooms with a heap', cost: 'O(n log n)' },
    ],
    example: `import heapq

def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    out = [intervals[0][:]]
    for start, end in intervals[1:]:
        if start <= out[-1][1]:                   # overlaps the last kept one
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out

def min_rooms(meetings):
    meetings.sort(key=lambda m: m[0])
    ends = []                                     # min-heap of rooms' end times
    for start, end in meetings:
        if ends and ends[0] <= start:
            heapq.heappop(ends)                   # reuse the room that freed up
        heapq.heappush(ends, end)
    return len(ends)

print(merge([[1, 3], [8, 10], [2, 6], [15, 18]]))   # [[1, 6], [8, 10], [15, 18]]
print(min_rooms([[0, 30], [5, 10], [15, 20]]))      # 2`,
    pitfalls: [
      { title: 'Not sorting first', fix: 'Every later step assumes sorted input.' },
      { title: 'Touching endpoints', fix: 'Do `[1, 2]` and `[2, 3]` overlap? Merge Intervals says yes; for meeting rooms a meeting ending at 2 frees the room. Ask.' },
      { title: 'Sorting by start for "remove the fewest"', fix: 'Sort by end time instead.' },
      { title: 'Mutating the caller’s lists', fix: 'Copy intervals before extending them if the input is reused.' },
    ],
    interview: {
      when: 'Ask about touching endpoints first. Then: sort by start to merge, sort by end to keep the most non-overlapping, count overlaps for rooms.',
      problems: ['insert-interval', 'merge-intervals', 'non-overlapping-intervals', 'meeting-rooms-ii', 'minimum-interval-to-include-each-query'],
    },
    inWork: [
      'Calendars and booking systems: free/busy slots, double-booking checks',
      'Merging IP ranges or incident time windows',
      'Timelines in video and subtitle editors',
      'Reserving rooms, servers or equipment over time',
    ],
    quiz: [
      {
        question: 'Why sort by end time to keep the most non-overlapping intervals?',
        answer: 'The interval that ends first leaves the most room for the rest; swapping it into any optimal solution never makes it worse.',
      },
      { question: 'After sorting by start, how do you test overlap with the last merged interval?', answer: '`start <= last_end`.' },
      { question: 'Minimum meeting rooms in one sentence?', answer: 'The maximum number of meetings happening at once — tracked with a min-heap of end times.' },
    ],
    source: { label: 'Tech Interview Handbook: Interval', url: `${TIH}/interval/` },
    extraSource: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
  },
  'Math & Geometry': {
    summary:
      'A handful of reusable tricks: transform matrices in place, walk boundaries, exponentiate by squaring, and handle digits and distances without floating-point traps.',
    recognize: ['Rotate, spiral or zero out a matrix', 'Power, or multiplying big numbers given as strings', 'Digits of a number, detecting a cycle (Happy Number)', 'Points and distances'],
    points: [
      'Rotate 90° clockwise in place = transpose, then reverse each row.',
      'Spiral order: shrink four boundaries (top, bottom, left, right) after walking each side.',
      'Fast power: xⁿ = (x^(n/2))² — halve the exponent each step, O(log n). Negative n: use 1/x.',
      'Digit loops: `n % 10` is the last digit, `n // 10` drops it. Repeating states mean a cycle — detect it with a set or fast/slow pointers.',
      'Compare squared distances instead of calling `sqrt`; avoid `==` on floats.',
    ],
    complexity: [
      { op: 'In-place matrix transforms', cost: 'O(rows × cols)', note: 'O(1) extra' },
      { op: 'Fast power', cost: 'O(log n)' },
      { op: 'Digit loop', cost: 'O(number of digits)' },
    ],
    example: `def rotate(matrix):                          # 90° clockwise, in place
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]   # transpose
    for row in matrix:
        row.reverse()

def spiral(matrix):
    out = []
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        out += [matrix[top][c] for c in range(left, right + 1)]
        top += 1
        out += [matrix[r][right] for r in range(top, bottom + 1)]
        right -= 1
        if top <= bottom:
            out += [matrix[bottom][c] for c in range(right, left - 1, -1)]
            bottom -= 1
        if left <= right:
            out += [matrix[r][left] for r in range(bottom, top - 1, -1)]
            left += 1
    return out

def fast_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    result = 1
    while n:
        if n & 1:
            result *= x                      # odd exponent: take one x
        x *= x                               # square the base
        n >>= 1                              # halve the exponent
    return result

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(spiral(m))                             # [1, 2, 3, 6, 9, 8, 7, 4, 5]
rotate(m)
print(m)                                     # [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
print(fast_pow(2, 10), fast_pow(2, -2))      # 1024 0.25`,
    pitfalls: [
      { title: 'Set Matrix Zeroes while scanning', fix: 'New zeros spread to the whole matrix. Record zero rows/columns first, or use the first row and column as markers.' },
      { title: 'Spiral on a non-square matrix', fix: 'Re-check the boundaries before the bottom and left passes.' },
      { title: 'Floating-point comparisons', fix: 'Compare squared integer distances; never `==` two floats.' },
      { title: 'Overflow questions', fix: 'Python ints never overflow, but interviewers may ask about 32-bit limits in other languages — mention them.' },
    ],
    interview: {
      when: 'These are about clean index handling. Name the trick (transpose + reverse, four boundaries, square-and-halve) and dry-run a 3 × 3 by hand.',
      problems: ['rotate-image', 'spiral-matrix', 'set-matrix-zeroes', 'happy-number', 'powx-n', 'multiply-strings'],
    },
    inWork: [
      'Rotating and flipping images is a matrix transform',
      'Cryptography uses fast modular exponentiation: `pow(x, n, mod)`',
      'Games and maps: collision and nearest-point checks with squared distances',
      'Grid layouts and pagination index arithmetic',
    ],
    quiz: [
      { question: 'Rotate an n × n matrix 90° clockwise in place?', answer: 'Transpose (swap across the main diagonal), then reverse every row.' },
      { question: 'Why is fast power O(log n)?', answer: 'Each step halves the exponent while squaring the base, so the number of steps is the number of bits in n.' },
      { question: 'Closest points without `sqrt`?', answer: 'Compare squared distances x² + y². `sqrt` preserves the order, so it is unnecessary.' },
    ],
    source: { label: 'Tech Interview Handbook: Matrix', url: `${TIH}/matrix/` },
    extraSource: { label: 'Tech Interview Handbook: Math', url: `${TIH}/math/` },
  },
  'Bit Manipulation': {
    summary:
      'Treat integers as rows of bits: XOR cancels pairs, masks test and set single bits, and shifts multiply or divide by two.',
    recognize: ['"Every element appears twice except one"', 'Count set bits, "power of two?"', 'Add two numbers without `+`', 'Enumerate subsets of a small set as bitmasks'],
    points: [
      'XOR: `x ^ x == 0`, `x ^ 0 == x`, and order does not matter — XOR everything and pairs cancel (Single Number, Missing Number).',
      '`n & (n - 1)` clears the lowest set bit: repeat it to count ones, and `n > 0 and n & (n - 1) == 0` tests for a power of two.',
      'Test bit i: `(n >> i) & 1`. Set it: `n | (1 << i)`. Clear it: `n & ~(1 << i)`.',
      '`x << 1` doubles, `x >> 1` halves (rounding down).',
      'Python ints are unbounded and negatives behave like infinite two’s complement. Mask with `0xFFFFFFFF` to simulate 32-bit (Sum of Two Integers, Reverse Bits).',
      '`for mask in range(1 << n)` enumerates all subsets of n ≤ 20 items.',
    ],
    complexity: [
      { op: 'One bit operation', cost: 'O(1)' },
      { op: 'Count set bits with `n & (n - 1)`', cost: 'O(number of ones)' },
      { op: 'All subsets as masks', cost: 'O(n · 2ⁿ)' },
    ],
    example: `def single_number(nums):
    res = 0
    for x in nums:
        res ^= x                             # pairs cancel out
    return res

def count_ones(n):
    count = 0
    while n:
        n &= n - 1                           # drop the lowest set bit
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0

def counting_bits(n):                        # set bits for every number 0..n
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)         # bits of i // 2, plus the last bit
    return dp

print(single_number([4, 1, 2, 1, 2]), count_ones(11), is_power_of_two(64))   # 4 3 True
print(counting_bits(5))                      # [0, 1, 1, 2, 1, 2]`,
    pitfalls: [
      { title: 'Precedence in other languages', fix: 'In C, Java and JavaScript `n & 1 == 0` means `n & (1 == 0)`. Python binds `&` tighter, but add parentheses anyway.' },
      { title: 'Shifting negative numbers in Python', fix: '`while n: n >>= 1` never ends for negative n (it stays -1). Mask with `0xFFFFFFFF` first.' },
      { title: '`~x` as a 32-bit flip', fix: 'In Python `~x == -x - 1`. Use `x ^ 0xFFFFFFFF` for a 32-bit flip.' },
      { title: 'Clever bit tricks in production code', fix: 'Prefer a readable expression unless performance really needs the trick — and comment it.' },
    ],
    interview: {
      when: 'Know the core identities by heart (XOR cancels, `n & (n - 1)`, test / set / clear a bit). Mention Python’s unbounded ints and the 32-bit mask when it matters.',
      problems: ['single-number', 'number-of-1-bits', 'counting-bits', 'missing-number', 'reverse-bits', 'sum-of-two-integers'],
    },
    inWork: [
      'Permissions and feature flags stored as bitmasks (Unix file modes like `0o755`)',
      'Subnetting: `ip & netmask`',
      'Compact sets: Bloom filters and bitmap indexes in databases',
      'Hash functions and checksums built from XOR and shifts',
    ],
    quiz: [
      { question: 'How does XOR find the single number?', answer: '`x ^ x == 0` and XOR ignores order, so every pair cancels and only the unpaired value is left.' },
      { question: 'What does `n & (n - 1)` do?', answer: 'Clears the lowest set bit. Repeating it counts the ones; a result of 0 for n > 0 means n is a power of two.' },
      {
        question: 'Why does `while n: n >>= 1` loop forever for a negative n in Python?',
        answer: 'Python ints are unbounded, so shifting a negative number right converges to -1, never 0. Mask with `0xFFFFFFFF` first.',
      },
    ],
    source: { label: 'Tech Interview Handbook: Binary', url: `${TIH}/binary/` },
    extraSource: { label: 'Python reference: Binary bitwise operations', url: `${PY}/reference/expressions.html#binary-bitwise-operations` },
  },
}

export const CATEGORY_REFERENCES: Record<string, TaskReference> = Object.fromEntries(
  Object.entries(CATEGORY_NOTES).map(([category, ref]) => [category, { title: `${category}: the pattern`, ...ref }])
)

// ── CS fundamentals (Phase 1): networking, operating systems, databases ──
const HPBN = 'https://hpbn.co'
const OSTEP = 'https://pages.cs.wisc.edu/~remzi/OSTEP'
const PG = 'https://www.postgresql.org/docs/current'
const NEED_IT = 'You need this when'

export const CS_REFERENCES: Record<string, TaskReference> = {
  latencyTcp: {
    title: 'Latency, bandwidth and TCP',
    summary:
      'Latency — how long one round trip takes — dominates most web performance, not bandwidth. TCP spends round trips setting up and ramping up before data flows fast.',
    recognizeTitle: NEED_IT,
    recognize: [
      'A page is slow even on fast Wi-Fi',
      'Interview: "what happens when you type a URL?"',
      'Choosing between many small requests and one batched request',
      'Debugging timeouts, retries and slow first requests',
    ],
    points: [
      'Latency = propagation (distance; light in fibre covers ~200,000 km/s) + transmission + processing + queuing. You cannot buy your way past the speed of light — only move servers closer (CDNs, regions).',
      'TCP opens with a three-way handshake (SYN, SYN-ACK, ACK): one full round trip before any data. TLS adds one more round trip with TLS 1.3, two with TLS 1.2.',
      'Flow control: the receiver advertises how much it can buffer, so a fast sender cannot overwhelm a slow receiver.',
      'Congestion control: a new connection starts with a small window (about 10 segments ≈ 14 KB) that roughly doubles every round trip (slow start). Fresh connections are slow, so reuse them.',
      'TCP delivers an ordered byte stream: one lost packet holds back everything behind it (head-of-line blocking) — the reason HTTP/3 moved to QUIC over UDP.',
    ],
    tableTitle: 'Numbers to know',
    complexity: [
      { op: 'Light in fibre', cost: '~5 µs per km', note: 'one way' },
      { op: 'Round trip in the same data centre', cost: '~0.5 ms' },
      { op: 'Round trip across continents', cost: '~100–200 ms' },
      { op: 'TCP handshake', cost: '1 RTT', note: 'before any data' },
      { op: 'TLS 1.3 / TLS 1.2 handshake', cost: '+1 RTT / +2 RTT' },
      { op: 'Initial congestion window', cost: '~14 KB', note: '10 segments' },
    ],
    exampleLang: 'bash',
    example: `# Where does the time go for one HTTPS request?
curl -o /dev/null -s -w "dns        %{time_namelookup}s
connect    %{time_connect}s
tls        %{time_appconnect}s
first byte %{time_starttransfer}s
total      %{time_total}s
" https://example.com`,
    pitfalls: [
      { title: '"Faster internet makes the page faster"', fix: 'More bandwidth barely helps small requests; round trips dominate. Cut round trips instead.' },
      { title: 'A new connection per request', fix: 'You pay the handshake and slow start every time. Reuse connections (keep-alive, connection pools).' },
      { title: 'Treating TCP as messages', fix: 'TCP is a byte stream. Frame your messages (length prefix or delimiter).' },
      { title: 'Chatty APIs', fix: 'N sequential calls cost N round trips. Batch them, or run them in parallel.' },
    ],
    interview: {
      when: 'For "what happens when you type a URL" and "why is this slow?", count round trips: DNS + TCP + TLS + request. Quantifying that is what separates a strong answer.',
      problems: [],
    },
    inWork: [
      'Connection pools in database drivers and HTTP clients',
      'Placing servers and CDNs close to users',
      'Batching API calls to cut round trips',
      'Reading the timing breakdown in browser DevTools',
    ],
    quiz: [
      {
        question: 'How many round trips before the first HTTP byte on a new HTTPS connection with TLS 1.3?',
        answer: 'About two: one for the TCP handshake and one for TLS 1.3, then the request goes out — plus a DNS lookup if the name is not cached.',
      },
      {
        question: 'Why is a brand-new TCP connection slow even on a fast link?',
        answer: 'Slow start: the congestion window begins around 14 KB and grows each round trip, so early transfers are limited by round trips, not bandwidth.',
      },
      { question: 'What is head-of-line blocking in TCP?', answer: 'One lost packet holds back all later data on that connection until it is retransmitted, because TCP delivers bytes in order.' },
    ],
    source: { label: 'HPBN: Primer on latency and bandwidth', url: `${HPBN}/primer-on-latency-and-bandwidth/` },
    extraSource: { label: 'HPBN: Building blocks of TCP', url: `${HPBN}/building-blocks-of-tcp/` },
  },
  udpTls: {
    title: 'UDP and TLS',
    summary:
      'UDP is transport without guarantees — no handshake, no ordering, no retransmission. TLS is the layer that makes a connection private and proves who the server is, using certificates.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Choosing a transport for calls, games, live video or DNS',
      'Explaining HTTPS — "is this connection secure?"',
      'Fixing certificate errors',
      'Interview: "TCP vs UDP?"',
    ],
    points: [
      'UDP sends independent datagrams: no setup, no ordering, no retransmission, no built-in congestion control. The application decides what to do about loss — ideal when late data is useless (voice, video, games) or for tiny request/response like DNS.',
      'QUIC (HTTP/3) builds reliability and TLS 1.3 on top of UDP to avoid TCP’s head-of-line blocking and extra handshakes.',
      'TLS provides encryption (privacy), authentication (the certificate proves the server’s identity) and integrity (tampering is detected).',
      'Handshake: the server sends its certificate chain; both sides run an ephemeral key exchange (ECDHE) to agree on a session key; then fast symmetric encryption (AES-GCM, ChaCha20) protects the data. Slow asymmetric crypto is only used to set things up.',
      'The client checks that the chain leads to a trusted CA, that the hostname matches and that the certificate has not expired. Ephemeral keys give forward secrecy: a stolen private key cannot decrypt past traffic.',
    ],
    tableTitle: 'Compare',
    complexity: [
      { op: 'TCP', cost: 'ordered, reliable', note: 'handshake, congestion control' },
      { op: 'UDP', cost: 'no guarantees', note: 'no setup, app handles loss' },
      { op: 'TLS 1.2 handshake', cost: '2 RTT' },
      { op: 'TLS 1.3 handshake', cost: '1 RTT', note: '0-RTT on resumption' },
      { op: 'Symmetric vs asymmetric crypto', cost: 'symmetric ≫ faster', note: 'used for the data' },
    ],
    exampleLang: 'bash',
    example: `# The certificate chain, TLS version and cipher a server negotiates
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | grep -E "subject=|issuer=|Protocol|Cipher"

# DNS: the classic UDP request/response (falls back to TCP for large answers)
dig example.com +short`,
    pitfalls: [
      { title: '"UDP is unreliable, so it is bad"', fix: 'It is a choice: you add exactly the reliability you need (QUIC, WebRTC).' },
      { title: '`verify=False` to make an error go away', fix: 'That removes authentication — anyone can impersonate the server. Fix the chain or hostname instead.' },
      { title: '"HTTPS hides everything"', fix: 'The domain still leaks through DNS and the TLS SNI field, and sizes/timing can reveal information.' },
      { title: 'Expired certificates', fix: 'A classic cause of outages. Automate renewal (Let’s Encrypt / ACME) and monitor expiry.' },
    ],
    interview: {
      when: 'For "TCP vs UDP" give one use case each and the trade-off. For HTTPS, walk the handshake: certificate check → key exchange → symmetric encryption, and note TLS 1.3 needs one round trip.',
      problems: [],
    },
    inWork: [
      'Setting up HTTPS certificates and auto-renewal on servers and load balancers',
      'WebRTC/UDP for calls versus HTTP for APIs',
      'Debugging "certificate has expired" and "hostname mismatch"',
      'Mutual TLS between internal services',
    ],
    quiz: [
      { question: 'Why are video calls usually built on UDP?', answer: 'A late packet is useless; waiting for TCP retransmission causes freezes. UDP lets the app skip or conceal losses.' },
      { question: 'Why does TLS use asymmetric crypto only during the handshake?', answer: 'It is slow. It authenticates the server and agrees on a shared key; fast symmetric encryption then protects the data.' },
      { question: 'What does forward secrecy protect against?', answer: 'With ephemeral key exchange, stealing the server’s private key later cannot decrypt sessions that were recorded earlier.' },
    ],
    source: { label: 'HPBN: Transport Layer Security', url: `${HPBN}/transport-layer-security-tls/` },
    extraSource: { label: 'HPBN: Building blocks of UDP', url: `${HPBN}/building-blocks-of-udp/` },
  },
  httpDns: {
    title: 'HTTP and DNS: what happens when you type a URL',
    summary:
      'A URL triggers DNS (name → IP), a TCP + TLS connection, then an HTTP request and response. HTTP/2 multiplexes many requests over one connection, and caching avoids requests altogether.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "what happens when you type a URL?"',
      'Designing REST APIs: methods, status codes, caching',
      'Pages that are slow or show stale content',
      'A DNS change that "does not work yet"',
    ],
    points: [
      'DNS: browser and OS caches → recursive resolver → root → TLD (`.com`) → authoritative server. Every answer is cached for its TTL — which is why changes take time to spread.',
      'An HTTP message is a method, path, headers and optional body. GET is safe and idempotent; PUT and DELETE are idempotent; POST is not — retrying it can create duplicates.',
      'Status codes: 2xx success, 3xx redirect, 4xx the client’s fault, 5xx the server’s fault.',
      'HTTP/1.1 reuses connections but sends one request at a time on each, so browsers open about 6 connections per host. HTTP/2 multiplexes many streams over one connection with compressed headers. HTTP/3 does the same over QUIC to avoid TCP head-of-line blocking.',
      'Caching: `Cache-Control: max-age` lets clients reuse a response; `ETag` + `If-None-Match` revalidates and returns `304 Not Modified`; CDNs cache at the edge near users.',
    ],
    tableTitle: 'Status codes worth knowing',
    complexity: [
      { op: '200 / 201 / 204', cost: 'OK / Created / No Content' },
      { op: '301 / 302 / 304', cost: 'Moved / Found / Not Modified' },
      { op: '400 / 401 / 403 / 404', cost: 'Bad request / Not authenticated / Not allowed / Not found' },
      { op: '409 / 422 / 429', cost: 'Conflict / Invalid data / Too many requests' },
      { op: '500 / 502 / 503 / 504', cost: 'Server error / Bad gateway / Unavailable / Gateway timeout' },
    ],
    exampleLang: 'bash',
    example: `dig +trace example.com                  # walk DNS: root -> .com -> authoritative
curl -sI https://example.com            # status line and headers only
curl -s -o /dev/null -w "%{http_version}\\n" https://www.google.com   # 2 = HTTP/2`,
    pitfalls: [
      { title: '401 vs 403', fix: '401: "who are you?" (not authenticated). 403: "I know you, but you are not allowed."' },
      { title: 'Side effects behind GET', fix: 'Crawlers and prefetchers will trigger them. Use POST, and give retried POSTs an idempotency key.' },
      { title: 'Lowering the DNS TTL at migration time', fix: 'Resolvers still hold the old TTL. Lower it days before the switch.' },
      { title: 'Caching private data in a shared cache', fix: 'Mark user-specific responses `Cache-Control: private` or `no-store`.' },
    ],
    interview: {
      when: 'The URL answer: DNS → TCP → TLS → HTTP request → server, app and database → response → render, with caching at every layer. For API questions add idempotency and the right status codes.',
      problems: [],
    },
    inWork: [
      'Designing REST APIs: methods, status codes, idempotency keys',
      'Cache headers and CDN rules',
      'DNS records for deployments (A, CNAME, TXT) and safe migrations',
      'Reading the network waterfall in DevTools',
    ],
    quiz: [
      { question: 'Why can a DNS change take hours to show up?', answer: 'Resolvers cache the old answer for the record’s TTL and keep serving it until that expires.' },
      {
        question: 'What does HTTP/2 multiplexing solve, and what remains?',
        answer: 'Many requests share one connection without queueing behind each other. TCP-level head-of-line blocking remains — HTTP/3 over QUIC removes it.',
      },
      { question: 'Which methods are idempotent, and why does it matter?', answer: 'GET, PUT, DELETE (and HEAD, OPTIONS). They are safe to retry; retrying a POST can create duplicates.' },
    ],
    source: { label: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
    extraSource: { label: 'HPBN: HTTP/2', url: `${HPBN}/http2/` },
  },
  processes: {
    title: 'Processes and the process API',
    summary:
      'A process is a running program with its own memory, registers and open files. The OS time-shares the CPU between processes by switching contexts, and creates them with fork + exec.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "process vs thread?"',
      'Running worker processes (gunicorn, Node cluster, multiprocessing)',
      'Zombie processes, or a container that will not stop cleanly',
      'Spawning commands from code or CI',
    ],
    points: [
      'A process = program + state: its address space (code, heap, stack), registers including the program counter, open file descriptors and a PID.',
      'Limited direct execution: your code runs directly on the CPU for speed, but privileged work goes through system calls that trap into the kernel, and a timer interrupt lets the OS take the CPU back.',
      'A context switch saves one process’s registers and loads another’s. The switch itself takes microseconds; the bigger cost is cold caches and TLB afterwards.',
      '`fork()` copies the process (copy-on-write keeps it cheap), `exec()` replaces the program, `wait()` collects the child’s exit status. A shell is literally fork + exec + wait.',
      'States: running, ready, blocked on I/O. A zombie has exited but has not been waited on yet.',
    ],
    tableTitle: 'Process vs thread',
    complexity: [
      { op: 'Memory', cost: 'process: private', note: 'thread: shared' },
      { op: 'A crash', cost: 'process: isolated', note: 'thread: takes the process down' },
      { op: 'Communication', cost: 'process: IPC, pipes, sockets', note: 'thread: shared variables + locks' },
      { op: 'Creation and switching', cost: 'process: heavier', note: 'thread: lighter' },
    ],
    example: `import os, subprocess, sys

print(os.getpid() > 0)                       # True: every process has a PID
child = subprocess.run([sys.executable, "-c", "print(6 * 7)"],
                       capture_output=True, text=True)   # spawn + wait
print(child.returncode, child.stdout.strip())  # 0 42`,
    pitfalls: [
      { title: 'Treating processes like threads', fix: 'Processes do not share memory; pass data through pipes, queues or sockets.' },
      { title: 'Never waiting on children', fix: 'They become zombies. `subprocess.run` waits for you; with `Popen`, call `wait()`.' },
      { title: 'Forking after starting threads', fix: 'Only the calling thread is copied and locks may be stuck held. Prefer the `spawn` start method.' },
      { title: 'Ignoring SIGTERM in containers', fix: 'Your app may be PID 1 and must shut down gracefully on SIGTERM, or it gets killed hard.' },
    ],
    interview: {
      when: 'Process vs thread is close to guaranteed: isolation and crash safety versus cheap sharing. Mention the context-switch cost and that Python uses processes to sidestep the GIL for CPU-bound work.',
      problems: [],
    },
    inWork: [
      'Web servers with worker processes (gunicorn, PHP-FPM, Node cluster)',
      '`multiprocessing` for CPU-bound Python jobs',
      'Shells, CI runners and cron spawning commands',
      'Graceful shutdown on SIGTERM in Docker and Kubernetes',
    ],
    quiz: [
      { question: 'What does `fork()` return?', answer: '0 in the child and the child’s PID in the parent (−1 on error): one call, two returns.' },
      { question: 'Why is a context switch not free?', answer: 'Saving registers is cheap, but the next process starts with cold caches and TLB entries, which slows it down.' },
      { question: 'What is a zombie process?', answer: 'A child that has exited but whose parent has not called `wait()` yet; its entry lingers until it is reaped.' },
    ],
    source: { label: 'OSTEP ch.4: The abstraction — the process', url: `${OSTEP}/cpu-intro.pdf` },
    extraSource: { label: 'OSTEP ch.5: Process API', url: `${OSTEP}/cpu-api.pdf` },
  },
  scheduling: {
    title: 'CPU scheduling',
    summary:
      'The scheduler decides which ready job runs next. Every policy trades turnaround time (finish fast) against response time (react fast) and fairness.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "how does the OS decide what runs?"',
      'Latency spikes on a busy server',
      'Choosing worker or thread-pool sizes',
      'Background jobs starving interactive work',
    ],
    points: [
      'Turnaround = completion − arrival; response = first run − arrival. Batch work cares about the first, users about the second.',
      'FIFO suffers the convoy effect: short jobs wait behind a long one. Shortest-job-first minimises turnaround but needs job lengths and can starve long jobs.',
      'Round robin gives every job a short time slice: great response time, worse turnaround. A shorter slice means more context-switch overhead.',
      'MLFQ learns from behaviour: a job that burns its whole slice drops in priority (CPU-bound); one that gives up the CPU for I/O stays high (interactive). A periodic boost prevents starvation.',
      'Proportional share (lottery, stride, Linux CFS) gives each job a fair fraction of CPU time.',
    ],
    tableTitle: 'Policies',
    complexity: [
      { op: 'FIFO', cost: 'simple', note: 'convoy effect' },
      { op: 'SJF / STCF', cost: 'best turnaround', note: 'needs lengths, starves long jobs' },
      { op: 'Round robin', cost: 'best response', note: 'worse turnaround' },
      { op: 'MLFQ', cost: 'learns job type', note: 'needs priority boosts' },
      { op: 'CFS (Linux)', cost: 'fair share', note: 'by virtual runtime' },
    ],
    example: `def avg_response_fifo(jobs):          # all jobs arrive at t = 0
    t = total = 0
    for length in jobs:
        total += t                    # a job responds when it first runs
        t += length
    return total / len(jobs)

def avg_response_round_robin(jobs, time_slice=1):
    return sum(i * time_slice for i in range(len(jobs))) / len(jobs)

jobs = [100, 10, 10]
print(avg_response_fifo(jobs), avg_response_round_robin(jobs))   # 70.0 1.0`,
    pitfalls: [
      { title: 'More threads = faster', fix: 'Beyond the number of cores, CPU-bound work only adds context switches. Size pools to cores for CPU work.' },
      { title: 'Optimising averages only', fix: 'Users feel the tail (p99). A policy with a good average can still have terrible worst cases.' },
      { title: 'Strict priorities without aging', fix: 'Low-priority work starves. Add aging or periodic boosts.' },
      { title: 'Extreme time slices', fix: 'Too short and overhead dominates; too long and the system feels sluggish.' },
    ],
    interview: {
      when: 'Explain the trade-off (turnaround vs response vs fairness) and why MLFQ approximates shortest-job-first without knowing job lengths.',
      problems: [],
    },
    inWork: [
      'Sizing worker and thread pools (≈ CPU cores for CPU-bound work)',
      '`nice` and priorities for batch jobs on shared machines',
      'Kubernetes CPU requests, limits and throttling',
      'Priority queues for background jobs',
    ],
    quiz: [
      { question: 'What is the convoy effect?', answer: 'Under FIFO, short jobs wait behind a long one, inflating average turnaround.' },
      { question: 'How does MLFQ guess that a job is interactive?', answer: 'It gives up the CPU before its slice ends (waiting for I/O), so it keeps a high priority.' },
      { question: 'Why does MLFQ periodically boost every job?', answer: 'To stop long jobs from starving and to let a job that became interactive climb back up.' },
    ],
    source: { label: 'OSTEP ch.7: Scheduling — introduction', url: `${OSTEP}/cpu-sched.pdf` },
    extraSource: { label: 'OSTEP ch.8: Multi-level feedback queue', url: `${OSTEP}/cpu-sched-mlfq.pdf` },
  },
  virtualMemory: {
    title: 'Virtual memory',
    summary:
      'Every process sees its own private address space. The OS and the hardware translate virtual addresses to physical memory page by page, which gives isolation and the illusion of more memory.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "what is virtual memory? a page fault?"',
      'Out-of-memory kills (OOMKilled pods), swap thrashing',
      'Why one process cannot read another’s memory',
      'Memory usage (RSS) creeping up in production',
    ],
    points: [
      'An address space holds code, a heap that grows up and a stack that grows down. Every address your program sees is virtual.',
      'Paging: memory is split into fixed-size pages (commonly 4 KB). A page table maps virtual pages to physical frames, and the MMU translates on every access.',
      'The TLB caches recent translations. A miss means walking the page table — programs with good locality stay fast.',
      'A page fault happens when a page is not in RAM: the OS loads it (from disk or swap) or zero-fills it. Disk is about 100,000× slower than RAM; constant faulting is thrashing.',
      'Each process has its own page table and permission bits (read/write/execute), so bugs cannot touch other processes; an invalid access becomes a segmentation fault.',
    ],
    tableTitle: 'Numbers to know',
    complexity: [
      { op: 'Typical page size', cost: '4 KB' },
      { op: 'Main memory access', cost: '~100 ns' },
      { op: 'SSD random read', cost: '~100 µs' },
      { op: 'Spinning disk seek', cost: '~10 ms' },
    ],
    example: `import mmap, sys

print(mmap.PAGESIZE)                          # 4096 on most machines
nums = list(range(1_000_000))
print(sys.getsizeof(nums) // 1024, "KB")      # 7812 KB: 8 bytes per pointer,
                                              # the int objects live elsewhere`,
    pitfalls: [
      { title: '"Virtual memory means swap"', fix: 'It means address translation per process; swap is only one thing it enables.' },
      { title: 'Ignoring locality', fix: 'Walking a big 2-D array column by column (in C or NumPy) misses caches and the TLB constantly.' },
      { title: 'Container limits below the working set', fix: 'The kernel OOM-kills the process. Measure real usage before setting limits.' },
      { title: '"Low free memory is a problem"', fix: 'The OS uses spare RAM as page cache. Look at available memory and swap activity instead.' },
    ],
    interview: {
      when: 'Explain translation (page table + TLB), page faults and why they are expensive, and how this isolates processes. Tie it to a real symptom: OOM kills or thrashing.',
      problems: [],
    },
    inWork: [
      'Debugging OOMKilled pods and choosing memory limits',
      'Reading RSS versus virtual size in `top`',
      'Cache-friendly data layouts (arrays, NumPy) for speed',
      'Segmentation faults in native extensions',
    ],
    quiz: [
      {
        question: 'What happens on a page fault?',
        answer: 'The CPU traps into the OS, which finds the page (disk, swap or a zero page), puts it in a frame, updates the page table and re-runs the instruction.',
      },
      { question: 'What is the TLB and why does it matter?', answer: 'A small cache of virtual→physical translations; hits avoid walking the page table on every memory access.' },
      { question: 'How does virtual memory isolate processes?', answer: 'Each process has its own page table, so its addresses map only to its own frames; touching anything else faults.' },
    ],
    source: { label: 'OSTEP ch.13: Address spaces', url: `${OSTEP}/vm-intro.pdf` },
    extraSource: { label: 'OSTEP ch.18: Paging', url: `${OSTEP}/vm-paging.pdf` },
  },
  threadsLocks: {
    title: 'Threads, locks and race conditions',
    summary:
      'Threads share one address space, so they communicate cheaply — and corrupt shared data unless a lock makes each critical section run as one indivisible step.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "what is a race condition and how do you fix it?"',
      'Counters or caches updated by many requests at once',
      'Python: threads vs asyncio vs multiprocessing',
      'Bugs that only appear under load',
    ],
    points: [
      'Threads in one process share the heap and globals; each has its own stack and registers.',
      'A race condition is a result that depends on timing. `count += 1` is load, add, store — two threads can interleave and lose an update.',
      'A critical section must run under mutual exclusion: `with lock:`. Locks are built on atomic hardware instructions (test-and-set, compare-and-swap).',
      'Granularity trade-off: one big lock is simple but serialises everything; fine-grained locks scale but invite deadlock.',
      'Python’s GIL lets one thread run bytecode at a time, so threads help I/O-bound work but not CPU-bound work — and the GIL does NOT make `+=` atomic.',
    ],
    tableTitle: 'Which tool in Python',
    complexity: [
      { op: 'Many slow network or DB calls', cost: 'threads or asyncio' },
      { op: 'CPU-heavy work', cost: 'processes', note: 'the GIL blocks thread speed-ups' },
      { op: 'Shared counter or cache', cost: 'lock, or a thread-safe structure' },
      { op: 'Hand work between threads', cost: '`queue.Queue`', note: 'locking built in' },
    ],
    example: `import threading

count = 0
lock = threading.Lock()

def add(n):
    global count
    for _ in range(n):
        with lock:                 # without the lock, updates can be lost
            count += 1             # read, add, write: three steps

threads = [threading.Thread(target=add, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(count)                       # 400000`,
    pitfalls: [
      { title: '"The GIL makes my code thread-safe"', fix: 'Threads switch between bytecodes, so multi-step operations still interleave. Use locks.' },
      { title: 'Doing I/O while holding a lock', fix: 'Everyone else waits. Keep critical sections tiny.' },
      { title: 'Releasing a lock manually', fix: 'An exception skips the release. Use `with lock:`.' },
      { title: 'Module-level mutable state in web apps', fix: 'Shared across requests and threads, and not shared across worker processes. Use a database or cache.' },
    ],
    interview: {
      when: 'Define a race condition with the `count += 1` example, fix it with a lock, then discuss lock granularity — and the GIL for Python roles.',
      problems: [],
    },
    inWork: [
      'Thread pools for I/O: HTTP calls, database queries',
      'Thread-safe caches and counters in services',
      'Choosing asyncio, threads or processes in Python',
      'Database row locks are the same idea at a larger scale',
    ],
    quiz: [
      { question: 'Why is `count += 1` not thread-safe?', answer: 'It is load, add, store; another thread can run in between, and one update overwrites the other.' },
      { question: 'Does the GIL remove the need for locks?', answer: 'No. It switches threads between bytecodes, so compound operations can still interleave.' },
      { question: 'Threads or processes for CPU-heavy Python work?', answer: 'Processes: the GIL lets only one thread execute Python bytecode at a time.' },
    ],
    source: { label: 'OSTEP ch.26: Concurrency — an introduction', url: `${OSTEP}/threads-intro.pdf` },
    extraSource: { label: 'OSTEP ch.28: Locks', url: `${OSTEP}/threads-locks.pdf` },
  },
  conditionDeadlock: {
    title: 'Condition variables, semaphores and deadlock',
    summary:
      'Locks protect data; condition variables and semaphores let threads wait for something to happen. Deadlock is threads waiting on each other in a circle.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Producer–consumer work queues',
      'Limiting concurrency (at most 10 database connections)',
      'Interview: "what is deadlock and how do you prevent it?"',
      'A service that freezes while using no CPU',
    ],
    points: [
      'A condition variable’s `wait()` releases the lock and sleeps; `notify()` wakes a waiter. Always wait inside a `while` loop that re-checks the condition.',
      'Producer–consumer (bounded buffer): producers wait while it is full, consumers wait while it is empty. In Python, `queue.Queue(maxsize=n)` does all of this for you.',
      'A semaphore is a counter: `acquire()` waits when it is 0. Start it at N to allow at most N concurrent users (a connection limit).',
      'Deadlock needs four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break one — usually circular wait, by always taking locks in one global order.',
      'Most other concurrency bugs are atomicity violations (a check-then-act that is not protected) and order violations (assuming one thread runs first).',
    ],
    tableTitle: 'Tools',
    complexity: [
      { op: 'Lock', cost: 'one thread at a time' },
      { op: 'Condition variable', cost: 'wait for a state change' },
      { op: 'Semaphore(N)', cost: 'at most N at once' },
      { op: '`queue.Queue(maxsize)`', cost: 'producer–consumer, built in' },
      { op: 'Deadlock prevention', cost: 'one lock order', note: 'or timeouts' },
    ],
    example: `import queue, threading

q = queue.Queue(maxsize=2)          # bounded buffer: put() waits when full
results = []

def producer():
    for i in range(5):
        q.put(i)
    q.put(None)                     # sentinel: no more work

def consumer():
    while (item := q.get()) is not None:
        results.append(item * item)

threads = [threading.Thread(target=producer), threading.Thread(target=consumer)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(results)                      # [0, 1, 4, 9, 16]`,
    pitfalls: [
      { title: '`if` instead of `while` around `wait()`', fix: 'You may act on a condition that is no longer true. Re-check it in a loop.' },
      { title: 'Two locks taken in different orders', fix: 'A classic deadlock. Define one order and always follow it.' },
      { title: 'Unbounded queues', fix: 'They hide overload until memory runs out. Bound them to get backpressure.' },
      { title: 'No stop signal', fix: 'Consumers block forever at shutdown. Send a sentinel or use a shutdown event.' },
    ],
    interview: {
      when: 'Name the four deadlock conditions and how you break circular wait (lock ordering). Sketch producer–consumer with a bounded queue.',
      problems: [],
    },
    inWork: [
      'Background job queues and worker pools',
      'Connection pools: a semaphore of N connections',
      'Backpressure in streaming pipelines',
      'Database deadlocks: two transactions locking rows in opposite order',
    ],
    quiz: [
      {
        question: 'Why wait on a condition variable inside a `while` loop?',
        answer: 'When you wake up, the condition may be false again (another thread got there first, or a spurious wake-up), so re-check before continuing.',
      },
      { question: 'The four conditions for deadlock?', answer: 'Mutual exclusion, hold-and-wait, no preemption and circular wait. Remove any one and deadlock cannot happen.' },
      { question: 'How do you cap an API client at 10 concurrent requests?', answer: 'A semaphore starting at 10: acquire before each request, release after it.' },
    ],
    source: { label: 'OSTEP ch.30: Condition variables', url: `${OSTEP}/threads-cv.pdf` },
    extraSource: { label: 'OSTEP ch.32: Common concurrency bugs', url: `${OSTEP}/threads-bugs.pdf` },
  },
  indexes: {
    title: 'Indexes and query plans',
    summary:
      'An index is a sorted structure (usually a B-tree) that lets the database jump straight to matching rows in O(log n) instead of scanning the whole table — paid for with slower writes and extra storage.',
    recognizeTitle: NEED_IT,
    recognize: [
      'A slow query whose plan shows a sequential scan',
      'Deciding which columns to index',
      'Interview: "how does an index work, and when should you not add one?"',
      'Pagination that gets slower as the table grows',
    ],
    points: [
      'A B-tree index keeps keys sorted in a balanced tree whose leaves point to rows: equality lookups and range scans (`BETWEEN`, `ORDER BY`) cost O(log n) plus the matches.',
      'Composite index (a, b) serves `WHERE a = ?` and `WHERE a = ? AND b = ?`, but not `WHERE b = ?` alone — the leftmost-prefix rule. Put equality columns first and the range column last.',
      'Wrapping the column in a function (`lower(email)`) or using a leading wildcard (`LIKE \'%x\'`) prevents a normal B-tree from being used. Index the expression instead.',
      'A covering index contains every column the query needs, so the database never visits the table (index-only scan).',
      'Every INSERT, UPDATE and DELETE must update every index; low-selectivity columns (booleans) rarely help.',
      '`EXPLAIN ANALYZE` shows the real plan: sequential vs index scan, estimated vs actual rows, and time.',
    ],
    complexity: [
      { op: 'Full table scan', cost: 'O(n)' },
      { op: 'B-tree lookup', cost: 'O(log n)' },
      { op: 'Range scan', cost: 'O(log n + k)', note: 'k = matching rows' },
      { op: 'Each extra index', cost: 'slower writes', note: '+ storage' },
    ],
    exampleLang: 'sql',
    example: `-- 1. Why is this slow?
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
-- Seq Scan on orders ...            (reads every row)

-- 2. Equality column first, sort column second
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);
-- Index Scan using orders_user_created_idx ...   (jumps to user 42, already sorted)`,
    pitfalls: [
      { title: 'Indexing every column', fix: 'Writes slow down and most indexes go unused. Index for the queries you actually run.' },
      { title: 'Wrong column order in a composite index', fix: 'A range column first makes the columns after it useless for filtering.' },
      { title: 'Functions or casts on an indexed column', fix: '`WHERE lower(email) = ?` skips a plain index. Create an index on `lower(email)`.' },
      { title: 'Deep `OFFSET` pagination', fix: 'The database still walks every skipped row. Use keyset pagination: `WHERE created_at < :last_seen`.' },
    ],
    interview: {
      when: 'Explain B-tree lookup cost, the leftmost-prefix rule and the write trade-off. Reading an EXPLAIN plan out loud is a strong practical signal.',
      problems: [],
    },
    inWork: [
      'Fixing slow API endpoints with the right index',
      'Postgres/Supabase: indexes on foreign keys and on columns used by RLS policies',
      'Keyset pagination for infinite scroll',
      'Unique indexes to enforce "no duplicates"',
    ],
    quiz: [
      {
        question: 'Index on (user_id, created_at): does `WHERE created_at > now() - interval \'1 day\'` use it well?',
        answer: 'No: `created_at` is the second column and the index is sorted by `user_id` first (leftmost-prefix rule).',
      },
      { question: 'Why can too many indexes hurt?', answer: 'Every write has to update each index, costing I/O and storage, while low-selectivity indexes barely help reads.' },
      { question: 'What is a covering index?', answer: 'An index containing every column the query needs, so the answer comes from the index alone without reading the table.' },
    ],
    source: { label: 'Use The Index, Luke: Anatomy of an index', url: 'https://use-the-index-luke.com/sql/anatomy' },
    extraSource: { label: 'PostgreSQL: Using EXPLAIN', url: `${PG}/using-explain.html` },
  },
  transactions: {
    title: 'Transactions, ACID and isolation levels',
    summary:
      'A transaction groups operations so they all happen or none do. Isolation levels decide which anomalies concurrent transactions may see, in exchange for speed.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Money, stock or bookings that must never double-spend',
      'Interview: "what is ACID? what are the isolation levels?"',
      'Two requests overwriting each other (lost update)',
      'Reports that do not add up while data is changing',
    ],
    points: [
      'ACID: Atomicity (all or nothing), Consistency (constraints always hold), Isolation (concurrent transactions do not interfere — to a chosen degree), Durability (a commit survives a crash).',
      'Anomalies: dirty read (seeing uncommitted data), non-repeatable read (a row changes between two reads), phantom (a query returns new rows), lost update (two read-modify-writes overwrite each other), write skew.',
      'Levels: Read Uncommitted, Read Committed (the Postgres default), Repeatable Read, Serializable. Postgres runs Repeatable Read as a snapshot, and Serializable aborts conflicting transactions — so you must retry.',
      'MVCC: a write creates a new row version and each reader keeps its snapshot, so readers do not block writers.',
      'Preventing lost updates: an atomic `UPDATE … SET qty = qty - 1 WHERE qty > 0`, `SELECT … FOR UPDATE`, a version column (optimistic locking), or Serializable plus retries.',
    ],
    tableTitle: 'Isolation levels (PostgreSQL)',
    complexity: [
      { op: 'Read Committed', cost: 'no dirty reads', note: 'the default' },
      { op: 'Repeatable Read', cost: 'one snapshot per transaction', note: 'no non-repeatable reads or phantoms' },
      { op: 'Serializable', cost: 'as if run one at a time', note: 'may abort → retry' },
    ],
    exampleLang: 'sql',
    example: `-- Lost update: two requests run this at the same moment
SELECT stock FROM products WHERE id = 1;        -- both read 1
UPDATE products SET stock = 0 WHERE id = 1;     -- both "sell" the last item

-- Safe: let the database check and change in one atomic statement
UPDATE products
SET stock = stock - 1
WHERE id = 1 AND stock > 0
RETURNING stock;                                -- no row returned = sold out`,
    pitfalls: [
      { title: 'Read-modify-write in application code', fix: 'Two requests interleave and one update is lost. Do it in one atomic statement or lock the row.' },
      { title: 'Serializable without retries', fix: 'Serialization failures are expected behaviour. Retry the whole transaction.' },
      { title: 'Long-running transactions', fix: 'They hold locks and old snapshots, causing blocking and table bloat. Keep them short.' },
      { title: 'Assuming the ORM wraps the request in a transaction', fix: 'Many default to autocommit per statement. Open a transaction explicitly.' },
    ],
    interview: {
      when: 'Give ACID in one line each, name the anomalies, and show a concrete fix for a lost update (atomic UPDATE or SELECT … FOR UPDATE).',
      problems: [],
    },
    inWork: [
      'Payments, inventory and seat booking',
      'Postgres functions (Supabase RPC) for atomic multi-step changes',
      'Retrying serialization failures in background jobs',
      'Idempotency keys plus unique constraints against double charges',
    ],
    quiz: [
      {
        question: 'What is a lost update, and one way to prevent it?',
        answer: 'Two transactions read the same value and both write back, one overwriting the other. Use an atomic conditional UPDATE, SELECT … FOR UPDATE, or a version check.',
      },
      {
        question: 'What does Postgres do at Serializable that it does not do at Repeatable Read?',
        answer: 'It detects transactions that could not have run in some serial order and aborts one of them — the application has to retry it.',
      },
      { question: 'Why don’t readers block writers in Postgres?', answer: 'MVCC: an update creates a new row version while readers keep reading the version from their snapshot.' },
    ],
    source: { label: 'PostgreSQL: Transaction isolation', url: `${PG}/transaction-iso.html` },
    extraSource: { label: 'CMU 15-445 Database Systems', url: 'https://15445.courses.cs.cmu.edu/' },
  },
  walReplication: {
    title: 'Storage, write-ahead logging and replication',
    summary:
      'Databases make commits durable by appending them to a write-ahead log first, then ship that log to replicas — the source of read scaling, failover and replication lag.',
    recognizeTitle: NEED_IT,
    recognize: [
      'Interview: "how does a database survive a crash?"',
      '"I just saved it but I cannot see it" with read replicas',
      'Backups and point-in-time recovery',
      'Scaling reads versus scaling writes',
    ],
    points: [
      'Data lives in fixed-size pages on disk (8 KB in Postgres), cached in a memory buffer pool. Rewriting random pages on every commit would be slow.',
      'Write-ahead log: before changing a data page, append a log record and flush it. After a crash, replay the log (redo). Sequential appends are fast, so commits are cheap and durable.',
      'Checkpoints write dirty pages to disk so the log needed for recovery stays short.',
      'Replication streams the log to standbys. Asynchronous is fast but can lose the latest commits on failover; synchronous loses nothing but every commit waits for a replica.',
      'Replicas scale reads, not writes, and they lag — so read-your-own-writes may fail. Read from the primary right after a write.',
      'B-tree engines update pages in place (good reads); LSM-tree engines (RocksDB, Cassandra) append and compact (good writes).',
    ],
    tableTitle: 'Trade-offs',
    complexity: [
      { op: 'Asynchronous replication', cost: 'fast commits', note: 'may lose recent commits on failover' },
      { op: 'Synchronous replication', cost: 'no loss', note: '+ one network round trip per commit' },
      { op: 'Read replicas', cost: 'scale reads', note: 'not writes; data may lag' },
      { op: 'Base backup + archived WAL', cost: 'point-in-time recovery' },
    ],
    exampleLang: 'sql',
    example: `-- On the primary: who is replicating, and how far behind?
SELECT client_addr, state, replay_lag
FROM pg_stat_replication;

-- On any server: am I a read replica?
SELECT pg_is_in_recovery();          -- true on a standby`,
    pitfalls: [
      { title: 'Reading from a replica right after writing', fix: 'You get stale data. Send those reads to the primary.' },
      { title: 'Treating replicas as backups', fix: 'A bad DELETE replicates instantly. Keep real backups with point-in-time recovery.' },
      { title: 'Turning off fsync for speed', fix: 'A crash can then lose or corrupt committed data.' },
      { title: 'Expecting replicas to scale writes', fix: 'Every write still goes to the primary; only partitioning or sharding spreads writes.' },
    ],
    interview: {
      when: 'Explain WAL → crash recovery, then the sync-vs-async replication trade-off and replication lag. That is the backbone of most "design the data layer" follow-ups.',
      problems: [],
    },
    inWork: [
      'Read replicas for reporting and analytics',
      'Point-in-time recovery after a bad migration',
      'Failover planning: how much data you may lose (RPO) and how fast you recover (RTO)',
      'Change data capture reads the WAL (Debezium, Supabase Realtime)',
    ],
    quiz: [
      { question: 'Why write to a log before updating the data pages?', answer: 'Sequential appends are fast to flush; after a crash, replaying the log restores every committed change.' },
      { question: 'Asynchronous vs synchronous replication?', answer: 'Async: fast commits, but the newest commits can be lost on failover. Sync: no loss, but each commit waits for a replica.' },
      { question: 'Why might a user not see the comment they just posted?', answer: 'The read hit a replica that has not replayed the write yet — replication lag.' },
    ],
    source: { label: 'PostgreSQL: Write-ahead logging', url: `${PG}/wal-intro.html` },
    extraSource: { label: 'PostgreSQL: High availability and replication', url: `${PG}/high-availability.html` },
  },
}
