import type { Lesson } from './types'

const md = (...lines: string[]) => lines.join('\n')
const TIH = 'https://www.techinterviewhandbook.org/algorithms'
const yt = (label: string, id: string) => ({ label, url: `https://www.youtube.com/watch?v=${id}` })

export const DSA_LESSONS: Lesson[] = [
  {
    id: 'dsa-arrays-hashing',
    title: 'Arrays & Hashing',
    summary:
      'The first way to speed up almost every array problem: remember what you have seen in a hash map, so you can answer for each item in O(1). Plus two array tricks you need this week: prefix/suffix products and length-prefixed encoding.',
    minutes: 60,
    videos: [
      yt('NeetCode: Group Anagrams', 'vzdNOK2oB2E'),
      yt('NeetCode: Top K Frequent Elements (bucket sort)', 'YPTqKIgVk-k'),
      yt('NeetCode: Encode and Decode Strings', 'B1k_sxOSgv8'),
      yt('NeetCode: Product of Array Except Self', 'bNvIQI2wAjk'),
      yt('NeetCode: Valid Sudoku', 'TjFXEUCMqI8'),
      yt('NeetCode: Longest Consecutive Sequence', 'P6RZZMu_maU'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## The core move: trade memory for time',
          'A [[brute force]] answer usually compares every pair — two loops inside each other, **O(n²)**. If you can ask the question as *“have I already seen what I need?”*, a [[hash map]] (dict) or set answers it in **O(1)**. Then one pass is enough: **O(n) time, but O(n) memory**. This is a [[trade-off]]: you pay with memory to save time.',
          '',
          'The real skill is choosing **what to use as the key**:',
          '',
          '| Question | Key | Example |',
          '| --- | --- | --- |',
          '| Seen this value before? | the value (a set) | Contains Duplicate |',
          '| Seen the number I need? | the [[complement]] `target - x` | Two Sum |',
          '| Which items belong together? | a [[canonical form]] | Group Anagrams |',
          '| How often does it appear? | value → count | Top K Frequent |',
        ),
      },
      {
        type: 'visual',
        visual: 'two-sum',
        caption: 'The complement key in action: one pass, one dict.',
      },
      {
        type: 'diagram',
        caption: 'How to pick the approach for an array question.',
        mermaid: `flowchart TD
  Q["Array / string question"] --> P{"Comparing pairs or<br/>looking something up?"}
  P -- yes --> H["Hash map / set: O(n)"]
  P -- no --> S{"Needs 'everything except i'<br/>or running totals?"}
  S -- yes --> X["Prefix / suffix pass: O(n)"]
  S -- no --> O{"Order matters / sorted input?"}
  O -- yes --> T["Sort or two pointers: O(n log n)"]
  O -- no --> B["Brute force first, then optimise"]`,
      },
      {
        type: 'text',
        md: md(
          '## Canonical keys: grouping things that “look the same”',
          '[[anagram|Anagrams]] have the same letters, so give each of them the same **key**: its sorted letters (`"eat" → "aet"`), or a tuple of 26 letter counts. Then group with a `defaultdict(list)`.',
          '',
          'Sorting each word costs O(k log k). Counting its letters costs O(k). With n words, that is O(n·k log k) or O(n·k).',
        ),
      },
      {
        type: 'code',
        id: 'canonical-key',
        code: `from collections import defaultdict

def count_key(word):
    counts = [0] * 26
    for ch in word:
        counts[ord(ch) - ord("a")] += 1
    return tuple(counts)               # lists can't be keys, tuples can

groups = defaultdict(list)
for w in ["eat", "tea", "tan", "ate", "nat", "bat"]:
    groups[count_key(w)].append(w)
print(list(groups.values()))           # [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]`,
      },
      {
        type: 'text',
        md: md(
          '## Bucket sort: top-k in O(n)',
          'Sorting the counts costs O(n log n). But a count can never be bigger than n. So make a list of **buckets, one for each count**: `buckets[c]` holds every value that appears `c` times. Walk the buckets from high to low and you get the most frequent values first — O(n) in total. This is [[bucket sort]].',
        ),
      },
      {
        type: 'code',
        id: 'bucket-sort',
        code: `from collections import Counter

nums = [1, 1, 1, 2, 2, 3]
buckets = [[] for _ in range(len(nums) + 1)]
for value, count in Counter(nums).items():
    buckets[count].append(value)
print(buckets)                         # [[], [3], [2], [1], [], [], []]`,
      },
      {
        type: 'visual',
        visual: 'bucket-sort',
        caption: 'Counts become bucket indexes; walk from the top for the k most frequent.',
      },
      {
        type: 'text',
        md: md(
          '## Prefix and suffix passes',
          '“Product of everything except index i”, without division: the answer is *(product of everything left of i) × (product of everything right of i)*. One pass from left to right collects the left products (the [[prefix]]). One pass from right to left multiplies in the right products (the [[suffix]]). O(n) time, and O(1) extra memory apart from the output.',
          '',
          '| i | 0 | 1 | 2 | 3 |',
          '| --- | --- | --- | --- | --- |',
          '| nums | 1 | 2 | 3 | 4 |',
          '| left product | 1 | 1 | 2 | 6 |',
          '| right product | 24 | 12 | 4 | 1 |',
          '| answer | 24 | 12 | 8 | 6 |',
        ),
      },
      {
        type: 'visual',
        visual: 'prefix-suffix',
        caption: 'Left pass fills the left products, right pass multiplies in the right ones.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Say the trade-off before you code: *“Brute force is O(n²). With a hash map it is O(n) time and O(n) memory.”* Then expect the next question: “Can you use less memory?” The answer is usually: sort first.',
      },
      {
        type: 'exercise',
        id: 'group-anagrams',
        title: 'Group Anagrams',
        prompt: 'Group the words that are anagrams of each other. Return a list of groups (any order).',
        starter: `def group_anagrams(strs):
    # your code here
    pass`,
        tests: `def norm(groups):
    return sorted(sorted(g) for g in groups)

assert norm(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])) == [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]
assert norm(group_anagrams([""])) == [[""]]
assert norm(group_anagrams(["a"])) == [["a"]]`,
        hint: 'Key each word by `"".join(sorted(word))` in a `defaultdict(list)`.',
        solution: `from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for w in strs:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())`,
      },
      {
        type: 'exercise',
        id: 'top-k-bucket',
        title: 'Top K Frequent Elements — in O(n)',
        prompt: 'Return the `k` most frequent values (any order) **without sorting the counts** — use bucket sort.',
        starter: `def top_k_frequent(nums, k):
    # your code here
    pass`,
        tests: `assert sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]
assert top_k_frequent([1], 1) == [1]
assert sorted(top_k_frequent([4, 4, 5, 5, 5, 6], 2)) == [4, 5]`,
        hint: 'Buckets indexed by count, then walk from the highest count down until you have k values.',
        solution: `from collections import Counter

def top_k_frequent(nums, k):
    buckets = [[] for _ in range(len(nums) + 1)]
    for value, count in Counter(nums).items():
        buckets[count].append(value)
    out = []
    for count in range(len(buckets) - 1, 0, -1):
        for value in buckets[count]:
            out.append(value)
            if len(out) == k:
                return out
    return out`,
      },
      {
        type: 'exercise',
        id: 'encode-decode',
        title: 'Encode and Decode Strings',
        prompt: 'Turn a list of strings into one string, and back again. The strings can contain **any** character, also `#` and digits, so a simple [[delimiter|separator]] does not work. Put the **length in front** of each string: `"4#lint"`.',
        starter: `def encode(strs):
    # your code here
    pass

def decode(s):
    # your code here
    pass`,
        tests: `for case in [["lint", "code", "love", "you"], ["we", "say", ":", "yes"], ["", "#", "12#ab", ""], []]:
    assert decode(encode(case)) == case, case`,
        hint: 'Encode each word as `f"{len(w)}#{w}"`. To decode, read digits up to `#`, then take exactly that many characters.',
        solution: `def encode(strs):
    return "".join(f"{len(w)}#{w}" for w in strs)

def decode(s):
    out, i = [], 0
    while i < len(s):
        j = s.index("#", i)
        length = int(s[i:j])
        out.append(s[j + 1 : j + 1 + length])
        i = j + 1 + length
    return out`,
      },
      {
        type: 'exercise',
        id: 'product-except-self',
        title: 'Product of Array Except Self',
        prompt: 'Return `answer[i]` = product of every number except `nums[i]`, in O(n) and **without division**.',
        starter: `def product_except_self(nums):
    # your code here
    pass`,
        tests: `assert product_except_self([1, 2, 3, 4]) == [24, 12, 8, 6]
assert product_except_self([-1, 1, 0, -3, 3]) == [0, 0, 9, 0, 0]
assert product_except_self([2, 3]) == [3, 2]`,
        hint: 'First pass: `out[i]` = product of everything left of i. Second pass from the right: multiply by a running right product.',
        solution: `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
      },
      {
        type: 'exercise',
        id: 'valid-sudoku',
        title: 'Valid Sudoku',
        prompt: 'A 9×9 board (`"."` = empty) is valid if no digit repeats in any row, column or 3×3 box. Do it in one pass with sets.',
        starter: `def is_valid_sudoku(board):
    # your code here
    pass`,
        tests: `good = [
    ["5","3",".",".","7",".",".",".","."],
    ["6",".",".","1","9","5",".",".","."],
    [".","9","8",".",".",".",".","6","."],
    ["8",".",".",".","6",".",".",".","3"],
    ["4",".",".","8",".","3",".",".","1"],
    ["7",".",".",".","2",".",".",".","6"],
    [".","6",".",".",".",".","2","8","."],
    [".",".",".","4","1","9",".",".","5"],
    [".",".",".",".","8",".",".","7","9"],
]
bad = [row[:] for row in good]
bad[0][0] = "8"
assert is_valid_sudoku(good) is True
assert is_valid_sudoku(bad) is False`,
        hint: 'Keep a set per row, per column and per box. The box index is `(r // 3, c // 3)`.',
        solution: `from collections import defaultdict

def is_valid_sudoku(board):
    rows, cols, boxes = defaultdict(set), defaultdict(set), defaultdict(set)
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            box = (r // 3, c // 3)
            if v in rows[r] or v in cols[c] or v in boxes[box]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[box].add(v)
    return True`,
      },
      {
        type: 'exercise',
        id: 'longest-consecutive',
        title: 'Longest Consecutive Sequence',
        prompt: 'Return the length of the longest run of consecutive integers (in any order in the input) in **O(n)**.',
        starter: `def longest_consecutive(nums):
    # your code here
    pass`,
        tests: `assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4
assert longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
assert longest_consecutive([]) == 0`,
        hint: 'Put everything in a set. Only start counting at `x` when `x - 1` is not in the set. Then you walk each run only once.',
        solution: `def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
    return best`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why is Longest Consecutive Sequence O(n) even with a `while` inside the `for`?', answer: 'Counting only starts at the first number of each run, so every number is visited by the inner loop at most once overall.' },
          { question: 'Why does a plain separator break Encode/Decode?', answer: 'The separator can appear inside a string. A length prefix tells the decoder exactly how many characters to take.' },
          { question: 'Group Anagrams: sorted-word key or count key?', answer: 'Sorted key costs O(k log k) per word, count key O(k). Both are fine; mention the trade-off.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Hash table', url: `${TIH}/hash-table/` },
      { label: 'Tech Interview Handbook: Array', url: `${TIH}/array/` },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
]
