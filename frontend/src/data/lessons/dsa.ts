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
        type: 'callout',
        tone: 'compare',
        md: 'The idea does not depend on the language: Java uses `HashSet<Integer>` / `HashMap<Integer, Integer>`, C++ `unordered_set` / `unordered_map`, JavaScript `Set` / `Map`. The Big O is the same everywhere; what changes is the amount of code — Java needs the types and boxing (`int` → `Integer`), Python and JavaScript do not.',
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
  {
    id: 'dsa-two-pointers',
    title: 'Two Pointers',
    summary:
      'Replace two nested loops with two indexes that walk towards each other. It works when you can prove that one side can never be part of the answer — usually because the data is sorted.',
    minutes: 60,
    videos: [
      yt('NeetCode: Valid Palindrome', 'jJXJ16kPFWg'),
      yt('NeetCode: Two Sum II', 'cQ1Oz4ckceM'),
      yt('NeetCode: 3Sum', 'jzZsG8n2R9A'),
      yt('NeetCode: Container With Most Water', 'UuiTKBwPgAo'),
      yt('NeetCode: Trapping Rain Water', 'ZI2z5pq0TqA'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Two indexes instead of two loops',
          'Checking every pair costs O(n²). With [[two pointers]] you keep two indexes, `l` and `r`, and at every step you move **one** of them. Each step throws away one element for good, so the whole walk is at most n steps: **O(n) time, O(1) extra memory**.',
          '',
          'There are two shapes:',
          '',
          '| Shape | How the pointers move | Problems |',
          '| --- | --- | --- |',
          '| Opposite ends | `l` starts at 0, `r` at the end; they move towards each other | Valid Palindrome, Two Sum II, Container With Most Water, Trapping Rain Water |',
          '| Same direction | a “read” pointer goes over everything, a “write” pointer marks where to put the next good item | Remove Duplicates (you did it in the Lists test), Move Zeroes |',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'In **C and C++**, “pointers” can be real memory addresses (`int *left = arr;`) — the name of the pattern comes from there. In Python, Java and JavaScript they are just two integer indexes. The algorithm and its O(n) cost are identical.',
      },
      {
        type: 'visual',
        visual: 'two-pointers',
        caption: 'Change the target: each step removes one number that can never be in the answer.',
      },
      {
        type: 'text',
        md: md(
          '## Why it is correct',
          'The pointer trick is not a guess. In Two Sum II the array is sorted. If `nums[l] + nums[r]` is **too small**, then `nums[l]` plus **any** number to the left of `r` is even smaller — so `nums[l]` can never be part of the answer and we can safely skip it (`l += 1`). If the sum is too big, the same argument removes `nums[r]`.',
          '',
          'In an interview, say this out loud. A rule that stays true at every step (“the answer is still between `l` and `r`”) is called an [[invariant]]. Explaining the invariant is what makes a two-pointer solution convincing.',
        ),
      },
      {
        type: 'code',
        id: 'two-sum-sorted',
        caption: 'Watch the pointers move. Try another target.',
        code: `def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        print(f"l={l} r={r} sum={s}")
        if s == target:
            return [l, r]
        if s < target:
            l += 1          # nums[l] is too small for every partner
        else:
            r -= 1          # nums[r] is too big for every partner
    return None

print(two_sum_sorted([1, 3, 4, 6, 8, 11], 10))
# l=0 r=5 sum=12
# l=0 r=4 sum=9
# l=1 r=4 sum=11
# l=1 r=3 sum=9
# l=2 r=3 sum=10
# [2, 3]`,
      },
      {
        type: 'text',
        md: md(
          '## 3Sum: sort, fix one, two pointers for the rest',
          'To find all triples that sum to 0: **sort**, then for each `i` look for two numbers after it that sum to `-nums[i]` with two pointers. That is O(n) per `i`, so **O(n²)** in total — much better than O(n³).',
          '',
          'The hard part is **duplicates**. Skip an `i` when `nums[i] == nums[i - 1]`, and after you find a triple, move `l` past equal values. Because the array is sorted, equal values sit next to each other.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Container With Most Water: move the shorter side',
          'The water between two lines is `min(h[l], h[r]) * (r - l)`. Start with the widest container. Moving the **taller** line inwards can never help: the width gets smaller and the height is still limited by the shorter line. So always move the **shorter** one — it is the only move that can find something bigger.',
          '',
          '## Trapping Rain Water: the lower wall decides',
          'Water above bar `i` is `min(max_left, max_right) - h[i]`. With two pointers you keep `left_max` and `right_max`. If `left_max < right_max`, the water at `l` depends only on `left_max` (the right side is surely higher), so you can compute it and move `l`. Otherwise do the same on the right. One pass, O(1) memory.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Signals for two pointers: the input is **sorted** (or you may sort it), you compare **both ends**, or you must work **in place** with O(1) memory. Start with brute force, then say: “Because it is sorted, if the sum is too small I can move the left pointer — that element can never be in the answer.”',
      },
      {
        type: 'exercise',
        id: 'palindrome-two-pointers',
        title: 'Valid Palindrome with O(1) memory',
        prompt: 'Return `True` if `s` reads the same both ways, ignoring case and every character that is not a letter or digit. This time **do not build a new string**: use two pointers and skip characters where `isalnum()` is False.',
        starter: `def is_palindrome(s):
    # your code here
    pass`,
        tests: `assert is_palindrome("A man, a plan, a canal: Panama") is True
assert is_palindrome("race a car") is False
assert is_palindrome(" ") is True
assert is_palindrome("0P") is False
assert is_palindrome(".,") is True`,
        hint: 'While `l < r`: move `l` right while `s[l]` is not alphanumeric, move `r` left in the same way, then compare `s[l].lower()` with `s[r].lower()`.',
        solution: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
      },
      {
        type: 'exercise',
        id: 'two-sum-ii',
        title: 'Two Sum II',
        prompt: '`numbers` is sorted. Return the **1-based** indexes `[i, j]` (`i < j`) of the two numbers that add up to `target`. Exactly one answer exists. Use O(1) extra memory.',
        starter: `def two_sum_ii(numbers, target):
    # your code here
    pass`,
        tests: `assert two_sum_ii([2, 7, 11, 15], 9) == [1, 2]
assert two_sum_ii([2, 3, 4], 6) == [1, 3]
assert two_sum_ii([-1, 0], -1) == [1, 2]
assert two_sum_ii([1, 2, 3, 4, 4, 9, 56, 90], 8) == [4, 5]`,
        hint: 'Pointers at both ends. Too small → `l += 1`, too big → `r -= 1`. Add 1 to both indexes when you return.',
        solution: `def two_sum_ii(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1`,
      },
      {
        type: 'exercise',
        id: 'three-sum',
        title: '3Sum',
        prompt: 'Return all **different** triples `[a, b, c]` from `nums` with `a + b + c == 0`. Each triple sorted, any order of triples. Aim for O(n²).',
        starter: `def three_sum(nums):
    # your code here
    pass`,
        tests: `def norm(triples):
    return sorted(sorted(t) for t in triples)

assert norm(three_sum([-1, 0, 1, 2, -1, -4])) == [[-1, -1, 2], [-1, 0, 1]]
assert norm(three_sum([0, 1, 1])) == []
assert norm(three_sum([0, 0, 0, 0])) == [[0, 0, 0]]
assert norm(three_sum([-2, 0, 1, 1, 2])) == [[-2, 0, 2], [-2, 1, 1]]`,
        hint: 'Sort. For each `i` (skip it if it equals the previous value), run two pointers on `i+1 .. end` looking for `-nums[i]`. After a hit, move `l` while `nums[l] == nums[l - 1]`.',
        solution: `def three_sum(nums):
    nums = sorted(nums)
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return out`,
      },
      {
        type: 'exercise',
        id: 'max-area',
        title: 'Container With Most Water',
        prompt: 'Each `height[i]` is a vertical line. Return the most water two lines can hold: `min(height[l], height[r]) * (r - l)`. O(n).',
        starter: `def max_area(height):
    # your code here
    pass`,
        tests: `assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
assert max_area([1, 1]) == 1
assert max_area([4, 3, 2, 1, 4]) == 16
assert max_area([1, 2, 1]) == 2`,
        hint: 'Start at both ends, keep the best area, and always move the pointer at the **shorter** line.',
        solution: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
      },
      {
        type: 'exercise',
        id: 'trap',
        title: 'Trapping Rain Water',
        prompt: 'Return how much rain water is trapped between the bars. Water above bar `i` = `min(highest bar on the left, highest bar on the right) - height[i]`. Do it in one pass with two pointers and O(1) memory.',
        starter: `def trap(height):
    # your code here
    pass`,
        tests: `assert trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) == 6
assert trap([4, 2, 0, 3, 2, 5]) == 9
assert trap([]) == 0
assert trap([3, 3, 3]) == 0`,
        hint: 'Keep `left_max` and `right_max`. If `left_max < right_max`, move `l`: update `left_max`, add `left_max - height[l]`. Otherwise do the same from the right.',
        solution: `def trap(height):
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why can Two Sum II move `l` when the sum is too small?', answer: 'The array is sorted, so `nums[l]` plus any number left of `r` is even smaller. `nums[l]` can never be in the answer.' },
          { question: 'In Container With Most Water, why move the shorter line?', answer: 'Moving the taller one makes the width smaller while the height is still limited by the shorter line — the area can only go down.' },
          { question: 'What makes 3Sum O(n²)?', answer: 'Sorting is O(n log n); then for each of the n values, one two-pointer pass is O(n).' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Array (two pointers)', url: `${TIH}/array/` },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
  {
    id: 'dsa-sliding-window',
    title: 'Sliding Window',
    summary:
      'For questions about a continuous part of an array or string, keep a window [l, r]: grow it on the right, shrink it on the left. Every element goes in once and out once, so it is O(n).',
    minutes: 70,
    videos: [
      yt('NeetCode: Best Time to Buy and Sell Stock', '1pkOgXD63yU'),
      yt('NeetCode: Longest Substring Without Repeating Characters', 'wiGpQwVHdE0'),
      yt('NeetCode: Longest Repeating Character Replacement', 'gqXU1UyA8pk'),
      yt('NeetCode: Permutation in String', 'UbyhOgBN834'),
      yt('NeetCode: Minimum Window Substring', 'jSto0O4AJbM'),
      yt('NeetCode: Sliding Window Maximum', 'DfljaUwZsOk'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## A window that moves',
          'Many questions ask about the best [[subarray]] or substring: the longest, the shortest, the one with the biggest sum. Checking every start and end is O(n²) or worse. A [[sliding window]] keeps one window `[l, r]` and reuses the work:',
          '',
          '1. Move `r` one step to the right and **add** `s[r]` to the window.',
          '2. While the window breaks the rule, **remove** `s[l]` and move `l` right.',
          '3. The window is valid again: update the answer.',
          '',
          '`r` moves n times and `l` moves at most n times, so the total is **O(n)**, even with a `while` inside the `for`.',
          '',
          '| Window type | Rule | Problems |',
          '| --- | --- | --- |',
          '| Variable size, longest | grow; shrink only when invalid | Longest Substring Without Repeating, Character Replacement |',
          '| Variable size, shortest | grow until valid; then shrink while still valid | Minimum Window Substring |',
          '| Fixed size k | add one on the right, remove one on the left | Permutation in String, Sliding Window Maximum |',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'For the monotonic-queue version, Java uses `ArrayDeque` (`pollFirst` / `pollLast`) and C++ `std::deque`. JavaScript has no deque: people use an array plus a moving `head` index, because `shift()` costs O(n).',
      },
      {
        type: 'visual',
        visual: 'sliding-window',
        caption: 'Try "pwwkew" and "bbbbb". The window only ever moves forward.',
      },
      {
        type: 'code',
        id: 'window-template',
        caption: 'The variable-size template: longest window with no repeated character.',
        code: `def longest_unique(s):
    seen = set()
    l = best = 0
    for r, ch in enumerate(s):
        while ch in seen:          # the window breaks the rule
            seen.remove(s[l])
            l += 1
        seen.add(ch)
        best = max(best, r - l + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", ""]:
    print(repr(s), longest_unique(s))
# 'abcabcbb' 3
# 'bbbbb' 1
# 'pwwkew' 3
# '' 0`,
      },
      {
        type: 'text',
        md: md(
          '## Best Time to Buy and Sell Stock',
          'Buy on one day, sell on a later day. Keep the **cheapest price so far** (the left side of the window). For every day, the best profit if you sell today is `price - cheapest`. One pass, O(1) memory.',
          '',
          '## Longest Repeating Character Replacement',
          'You may change at most `k` characters. A window is valid when `window length - count of its most common letter <= k`: you change everything except the most common letter. Keep 26 counts and the highest count seen.',
          '',
          '## Permutation in String: a fixed-size window',
          'Is some permutation of `s1` inside `s2`? Slide a window of length `len(s1)` over `s2` and compare its 26 letter counts with those of `s1`. Adding one letter and removing one keeps each step O(1) (26 counts).',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Minimum Window Substring: grow, then shrink',
          'Find the shortest part of `s` that contains every character of `t` (with counts). Count what you **need**. Move `r` until the window has everything (`have == need`), then move `l` as far as possible while it still has everything, saving the shortest window. Repeat.',
          '',
          '## Sliding Window Maximum: a monotonic queue',
          'The maximum of every window of size k. Keep a [[deque]] of **indexes** whose values are **decreasing**. A new value removes all smaller values from the back (they can never be a maximum again). The front is the maximum; drop it when it falls out of the window. Each index goes in and out once: O(n). This is a [[monotonic queue]].',
        ),
      },
      {
        type: 'code',
        id: 'window-max',
        caption: 'The monotonic queue keeps only values that can still become a maximum.',
        code: `from collections import deque

def window_max(nums, k):
    q, out = deque(), []          # q holds indexes, values decreasing
    for i, x in enumerate(nums):
        while q and nums[q[-1]] < x:
            q.pop()               # smaller values can never win again
        q.append(i)
        if q[0] <= i - k:
            q.popleft()           # the front left the window
        if i >= k - 1:
            out.append(nums[q[0]])
    return out

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))   # [3, 3, 5, 5, 6, 7]`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Signals for a sliding window: “**contiguous** subarray / substring”, “longest / shortest / at most k”. Say the rule that makes a window valid, then explain why it is O(n): every index enters the window once and leaves it once. If numbers can be **negative** and you need an exact sum, a window does not work — use prefix sums + a hash map (Subarray Sum Equals K).',
      },
      {
        type: 'exercise',
        id: 'max-profit',
        title: 'Best Time to Buy and Sell Stock',
        prompt: 'Return the biggest profit from buying on one day and selling on a **later** day, or `0` if you cannot make a profit.',
        starter: `def max_profit(prices):
    # your code here
    pass`,
        tests: `assert max_profit([7, 1, 5, 3, 6, 4]) == 5
assert max_profit([7, 6, 4, 3, 1]) == 0
assert max_profit([2, 4, 1]) == 2
assert max_profit([5]) == 0`,
        hint: 'Keep `cheapest` so far. For each price: `best = max(best, price - cheapest)`, then update `cheapest`.',
        solution: `def max_profit(prices):
    cheapest = float("inf")
    best = 0
    for price in prices:
        best = max(best, price - cheapest)
        cheapest = min(cheapest, price)
    return best`,
      },
      {
        type: 'exercise',
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        prompt: 'Return the length of the longest substring with no repeated character. This time store the **last index** of each character in a dict, so `l` can jump straight past the repeat.',
        starter: `def length_of_longest_substring(s):
    # your code here
    pass`,
        tests: `assert length_of_longest_substring("abcabcbb") == 3
assert length_of_longest_substring("bbbbb") == 1
assert length_of_longest_substring("pwwkew") == 3
assert length_of_longest_substring("") == 0
assert length_of_longest_substring("abba") == 2`,
        hint: 'If `ch` was seen at index `j` and `j >= l`, set `l = j + 1`. Careful with "abba": never move `l` backwards.',
        solution: `def length_of_longest_substring(s):
    last = {}
    l = best = 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best`,
      },
      {
        type: 'exercise',
        id: 'character-replacement',
        title: 'Longest Repeating Character Replacement',
        prompt: 'You may change at most `k` characters of `s` (uppercase letters). Return the length of the longest substring that can become one repeated letter.',
        starter: `def character_replacement(s, k):
    # your code here
    pass`,
        tests: `assert character_replacement("ABAB", 2) == 4
assert character_replacement("AABABBA", 1) == 4
assert character_replacement("AAAA", 0) == 4
assert character_replacement("ABCDE", 1) == 2`,
        hint: 'Keep counts and `top` = the highest count seen. While `(r - l + 1) - top > k`, remove `s[l]` and move `l`.',
        solution: `def character_replacement(s, k):
    counts = {}
    l = top = best = 0
    for r, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        top = max(top, counts[ch])
        while (r - l + 1) - top > k:
            counts[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
      },
      {
        type: 'exercise',
        id: 'check-inclusion',
        title: 'Permutation in String',
        prompt: 'Return `True` if some permutation of `s1` is a substring of `s2` (lowercase letters). Use a fixed-size window with 26 counts.',
        starter: `def check_inclusion(s1, s2):
    # your code here
    pass`,
        tests: `assert check_inclusion("ab", "eidbaooo") is True
assert check_inclusion("ab", "eidboaoo") is False
assert check_inclusion("adc", "dcda") is True
assert check_inclusion("abc", "ab") is False`,
        hint: 'Build counts for `s1` and for the first `len(s1)` letters of `s2`. Then slide: add `s2[r]`, remove `s2[r - len(s1)]`, compare the two lists.',
        solution: `def check_inclusion(s1, s2):
    k = len(s1)
    if k > len(s2):
        return False
    need, window = [0] * 26, [0] * 26
    for ch in s1:
        need[ord(ch) - ord("a")] += 1
    for i, ch in enumerate(s2):
        window[ord(ch) - ord("a")] += 1
        if i >= k:
            window[ord(s2[i - k]) - ord("a")] -= 1
        if window == need:
            return True
    return False`,
      },
      {
        type: 'exercise',
        id: 'min-window',
        title: 'Minimum Window Substring',
        prompt: 'Return the shortest substring of `s` that contains every character of `t` (with counts), or `""` if there is none.',
        starter: `def min_window(s, t):
    # your code here
    pass`,
        tests: `assert min_window("ADOBECODEBANC", "ABC") == "BANC"
assert min_window("a", "a") == "a"
assert min_window("a", "aa") == ""
assert min_window("aa", "aa") == "aa"`,
        hint: 'Count `need` from `t` and keep `missing = len(t)`. Grow `r`; when `missing == 0`, shrink from `l` while the window still covers `t`, saving the shortest.',
        solution: `def min_window(s, t):
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)
    l = 0
    best = (0, float("inf"))
    for r, ch in enumerate(s):
        if need.get(ch, 0) > 0:
            missing -= 1
        need[ch] = need.get(ch, 0) - 1
        while missing == 0:
            if r - l < best[1] - best[0]:
                best = (l, r)
            need[s[l]] += 1
            if need[s[l]] > 0:
                missing += 1
            l += 1
    return "" if best[1] == float("inf") else s[best[0] : best[1] + 1]`,
      },
      {
        type: 'exercise',
        id: 'max-sliding-window',
        title: 'Sliding Window Maximum',
        prompt: 'Return the maximum of every window of size `k`, in O(n). Use a deque of indexes with decreasing values.',
        starter: `from collections import deque

def max_sliding_window(nums, k):
    # your code here
    pass`,
        tests: `assert max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
assert max_sliding_window([1], 1) == [1]
assert max_sliding_window([9, 8, 7, 6], 2) == [9, 8, 7]
assert max_sliding_window([1, 2, 3, 4], 4) == [4]`,
        hint: 'Pop from the back while the back value is smaller than the new one; append the index; pop the front if it left the window; from `i >= k - 1` record `nums[q[0]]`.',
        solution: `from collections import deque

def max_sliding_window(nums, k):
    q, out = deque(), []
    for i, x in enumerate(nums):
        while q and nums[q[-1]] < x:
            q.pop()
        q.append(i)
        if q[0] <= i - k:
            q.popleft()
        if i >= k - 1:
            out.append(nums[q[0]])
    return out`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why is a sliding window O(n) with a `while` inside a `for`?', answer: 'Each index enters the window once (r) and leaves at most once (l), so all steps together are at most 2n.' },
          { question: 'When does a sliding window NOT work for “subarray with sum k”?', answer: 'When numbers can be negative: shrinking no longer always lowers the sum. Use prefix sums with a hash map instead.' },
          { question: 'Why keep indexes, not values, in the monotonic deque?', answer: 'You must know when the front has left the window (`index <= i - k`).' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Sliding window (in Array)', url: `${TIH}/array/` },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
]
