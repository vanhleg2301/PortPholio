import type { TaskReference } from './types'

const PY = 'https://docs.python.org/3'

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
    extraSource: { label: 'heapq — Heap queue algorithm', url: `${PY}/library/heapq.html` },
  },
} satisfies Record<string, TaskReference>

// ── NeetCode categories: the pattern behind each group ──
const CATEGORY_NOTES: Record<string, Omit<TaskReference, 'title'>> = {
  'Arrays & Hashing': {
    source: { label: 'Python Tutorial: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
    points: [
      'Trade memory for speed: a dict/set turns an O(n) search into an O(1) lookup.',
      'Frequency count (`Counter`), "seen" set, and grouping by a computed key (e.g. sorted word) cover most problems.',
      'Prefix/suffix arrays answer "product/sum of everything except i" in O(n).',
    ],
    example: `def two_sum(nums, target):
    index = {}
    for i, x in enumerate(nums):
        if target - x in index:
            return [index[target - x], i]
        index[x] = i`,
  },
  'Two Pointers': {
    source: { label: 'Python Sorting HOW TO', url: `${PY}/howto/sorting.html` },
    points: [
      'Usually on a sorted array or a string: one pointer at each end, move them toward each other.',
      'Move the pointer that can improve the answer (sum too small → move left up).',
      '3Sum = sort, fix one number, then two pointers on the rest. Skip duplicates.',
    ],
    example: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l, r = l + 1, r - 1
    return True`,
  },
  'Sliding Window': {
    source: { label: 'Python Tutorial: Dictionaries', url: `${PY}/tutorial/datastructures.html#dictionaries` },
    points: [
      'Keep a window [left, right]; grow right every step, shrink left while the window is invalid.',
      'Track what is inside the window with a dict of counts or a set.',
      'Each index enters and leaves once → O(n).',
    ],
    example: `def longest_unique(s):
    seen, left, best = set(), 0, 0
    for right, ch in enumerate(s):
        while ch in seen:
            seen.remove(s[left]); left += 1
        seen.add(ch)
        best = max(best, right - left + 1)
    return best`,
  },
  Stack: {
    source: { label: 'Python Tutorial: Using Lists as Stacks', url: `${PY}/tutorial/datastructures.html#using-lists-as-stacks` },
    points: [
      'A list is a stack: `append` to push, `pop()` to pop, `stack[-1]` to peek — all O(1).',
      'Matching pairs (brackets) and "undo" problems are stack problems.',
      'Monotonic stack: keep items increasing/decreasing to find the next greater/smaller element in O(n).',
    ],
    example: `def daily_temperatures(t):
    res, stack = [0] * len(t), []   # stack of indexes
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop(); res[j] = i - j
        stack.append(i)
    return res`,
  },
  'Binary Search': {
    source: { label: 'bisect — Array bisection algorithm', url: `${PY}/library/bisect.html` },
    points: [
      'Halve the search space each step → O(log n). Needs something sorted or monotonic.',
      'Write the invariant first: what is true about `lo` and `hi` at every loop?',
      '"Binary search on the answer": guess a value (e.g. eating speed) and check if it works.',
    ],
    example: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        if nums[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
  },
  'Linked List': {
    source: { label: 'Python Tutorial §9: Classes', url: `${PY}/tutorial/classes.html` },
    points: [
      'A dummy head node removes edge cases when the head itself may change.',
      'Fast/slow pointers find the middle and detect cycles.',
      'Reverse in place with three variables: prev, cur, next.',
    ],
    example: `def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev`,
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
