import type { TaskReference } from './types'

const PY = 'https://docs.python.org/3'

// ── Python basics (Week 0) ────────────────
export const PYTHON_REFERENCES = {
  basics: {
    title: 'Variables, strings and lists',
    source: { label: 'Python Tutorial §3: An Informal Introduction', url: `${PY}/tutorial/introduction.html` },
    points: [
      'A variable is just a name bound to a value: `x = 5`. No type declaration; the type belongs to the value.',
      'Strings are immutable. Slice with `s[start:end:step]`, e.g. `s[::-1]` reverses; `len(s)` gives the length.',
      'f-strings format text: `f"{name} is {age}"`.',
      'Lists are ordered and mutable: `nums.append(x)`, `nums[-1]` is the last item, `nums[1:3]` slices.',
      'Strings support `in`, `.split()`, `.join()`, `.lower()`, `.strip()` — used constantly in interviews.',
    ],
    example: `name = "Viet Anh"
print(name[::-1], len(name))     # reverse, length
nums = [3, 1, 2]
nums.append(4)
print(sorted(nums), nums[-1])    # [1, 2, 3, 4] 4
print(",".join(["a", "b"]))      # a,b`,
  },
  collections: {
    title: 'Dicts, sets, loops and functions',
    source: { label: 'Python Tutorial §5: Data Structures', url: `${PY}/tutorial/datastructures.html` },
    points: [
      'dict maps key → value with O(1) average lookup: `d.get(k, 0)`, `for k, v in d.items()`.',
      'set stores unique items with O(1) membership: `if x in seen`. Great for "have I seen this?".',
      '`for i, x in enumerate(nums)` gives index and value; `range(n)` loops n times.',
      'Functions: `def f(a, b=0): return a + b`. Return early to keep logic flat.',
      'Loops and functions syntax: see Tutorial §4 (More Control Flow Tools).',
    ],
    example: `def count_words(text):
    counts = {}
    for word in text.split():
        counts[word] = counts.get(word, 0) + 1
    return counts

seen = set()
for i, x in enumerate([2, 7, 2]):
    if x in seen:
        print("duplicate at", i)
    seen.add(x)`,
  },
  interviewToolkit: {
    title: 'Interview toolkit: collections and heapq',
    source: { label: 'collections — Container datatypes', url: `${PY}/library/collections.html` },
    points: [
      '`Counter(iterable)` counts items; `.most_common(k)` gives the top k.',
      '`defaultdict(list)` creates missing keys automatically — perfect for adjacency lists and grouping.',
      '`deque` gives O(1) `append`/`popleft` — use it as the queue in BFS (a list `pop(0)` is O(n)).',
      '`heapq` is a min-heap on a plain list: `heappush`, `heappop`; push `-x` for a max-heap.',
      '`sorted(items, key=lambda x: x[1], reverse=True)` sorts by any field.',
    ],
    example: `from collections import Counter, defaultdict, deque
import heapq

Counter("banana").most_common(1)      # [('a', 3)]
groups = defaultdict(list); groups["a"].append(1)
q = deque([1]); q.append(2); q.popleft()  # 1
h = []; heapq.heappush(h, 5); heapq.heappush(h, 1)
heapq.heappop(h)                       # 1`,
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
