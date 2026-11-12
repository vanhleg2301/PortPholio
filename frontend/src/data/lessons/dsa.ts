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
  {
    id: 'dsa-stack',
    title: 'Stack',
    summary:
      'Last in, first out. A stack remembers what is still “open” — a bracket, a number waiting for its operator, a day waiting for a warmer day — and closes the most recent one first.',
    minutes: 70,
    videos: [
      yt('NeetCode: Valid Parentheses', 'WTzjTskDFMg'),
      yt('NeetCode: Min Stack', 'qkLl7nAwDPo'),
      yt('NeetCode: Evaluate Reverse Polish Notation', 'iu0082c4HDE'),
      yt('NeetCode: Generate Parentheses', 's9fokUqJ76A'),
      yt('NeetCode: Daily Temperatures', 'cTBiBSnjO3c'),
      yt('NeetCode: Car Fleet', 'Pr6T-3yB9RM'),
      yt('NeetCode: Largest Rectangle in Histogram', 'zx5Sw9130L0'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Last in, first out',
          'A [[stack]] is a pile of plates: you put a plate on **top** and you take from the **top**. The last item in is the first item out — [[lifo|LIFO]].',
          '',
          'In Python a plain `list` is a perfect stack, because both operations work at the **end** of the list:',
          '',
          '| Stack word | Python | Cost |',
          '| --- | --- | --- |',
          '| push | `stack.append(x)` | O(1) [[amortized]] |',
          '| pop | `stack.pop()` | O(1) |',
          '| peek (look at the top) | `stack[-1]` | O(1) |',
          '| is empty? | `not stack` | O(1) |',
          '',
          'Never use `pop(0)` for a stack: it removes the **first** item and shifts all the others, O(n). If you need both ends, use a `deque`.',
        ),
      },
      {
        type: 'code',
        id: 'stack-basics',
        caption: 'The browser Back button is a stack of pages.',
        code: `stack = []
for page in ["home", "search", "product"]:
    stack.append(page)          # visit a page
print(stack)                    # ['home', 'search', 'product']
print(stack.pop())              # product   (press Back)
print(stack[-1])                # search    (peek: look, do not remove)
print(len(stack), bool(stack))  # 2 True`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Java** has an old `Stack` class, but the docs tell you to use `ArrayDeque` (`push`, `pop`, `peek`) instead. **C++** has `std::stack` on top of a `vector` or `deque`. **JavaScript** arrays have `push` / `pop` at the end, like Python — and `shift()` at the front is O(n), like `pop(0)`. **Go** has no stack type: you append to a slice and cut the last item with `s = s[:len(s)-1]`.',
      },
      {
        type: 'text',
        md: md(
          '## When to think “stack”',
          'Use a stack when something is **opened** now and **closed** later, and the most recent open thing must be closed first:',
          '',
          '- brackets: `(` waits for `)`;',
          '- function calls: the [[call stack]] — the last function called returns first;',
          '- undo: Ctrl+Z removes your **last** change;',
          '- “next greater / warmer / taller” questions: items wait on the stack until a bigger one arrives.',
          '',
          'Any [[recursion]] can be rewritten as a loop with your own stack. That is how you avoid `RecursionError` on very deep input.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Valid Parentheses: match the most recent opener',
          'Push every opening bracket. For a closing bracket, the **top** of the stack must be its partner; pop it. At the end the stack must be **empty** — otherwise some bracket was never closed (`"(("`).',
        ),
      },
      {
        type: 'code',
        id: 'valid-parens-trace',
        caption: 'Each closing bracket removes the most recent opener.',
        code: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
        print(f"{ch} -> {stack}")
    return not stack

print(is_valid("([]{})"))
# ( -> ['(']
# [ -> ['(', '[']
# ] -> ['(']
# { -> ['(', '{']
# } -> ['(']
# ) -> []
# True`,
      },
      {
        type: 'text',
        md: md(
          '## Min Stack: remember the minimum at every level',
          'LeetCode asks for a stack with `push`, `pop`, `top` and `get_min`, **all O(1)**. Scanning for the minimum is O(n). The trick: store, next to each value, the smallest value **at that moment**. When you pop, the old minimum is back automatically.',
          '',
          'The problem is written as a small **class**. A class is a recipe for objects that keep their own data: `__init__` runs when you create one, and `self.items` is a list that belongs to that object. Every method gets `self` as its first argument.',
        ),
      },
      {
        type: 'code',
        id: 'min-stack',
        caption: 'Each item is (value, smallest so far).',
        code: `class MinStack:
    def __init__(self):
        self.items = []

    def push(self, x):
        smallest = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, smallest))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]

s = MinStack()
for x in [5, 3, 7, 2]:
    s.push(x)
print(s.get_min())   # 2
s.pop()
print(s.get_min())   # 3
print(s.top())       # 7`,
      },
      {
        type: 'text',
        md: md(
          '## Reverse Polish Notation: numbers wait for their operator',
          'In RPN the operator comes **after** its two numbers: `3 4 +` means 3 + 4. Push numbers. When an operator comes, pop two numbers, compute, and push the result. The **first** pop is the **right** operand: for `a b -` you pop `b`, then `a`, and compute `a - b`.',
        ),
      },
      {
        type: 'code',
        id: 'rpn',
        caption: '["4", "13", "5", "/", "+"] means 4 + 13 / 5.',
        code: `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in {"+", "-", "*", "/"}:
            b = stack.pop()          # the right operand comes out first
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))   # round towards zero, like C and Java
        else:
            stack.append(int(t))
    return stack[0]

print(eval_rpn(["4", "13", "5", "/", "+"]))  # 6
print(-7 // 2, int(-7 / 2))                  # -4 -3`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'LeetCode says division “truncates toward zero”. Python’s `//` rounds **down**: `-7 // 2` is `-4`, but the expected answer is `-3`. Use `int(a / b)`. Java and C already round towards zero, so this trap is Python-only.',
      },
      {
        type: 'text',
        md: md(
          '## Monotonic stack: wait for something bigger',
          'Daily Temperatures: for each day, how many days until a warmer one? Checking every later day is O(n²).',
          '',
          'Keep a stack of **indexes** of days that are still waiting. Their temperatures go **down** from bottom to top — a [[monotonic stack]]. When a warmer day `i` arrives, it is the answer for every waiting day that is colder: pop them and write `i - j`. Then push `i`, because it now waits too.',
          '',
          'Each index is pushed once and popped at most once, so the `while` inside the `for` costs O(n) **in total**, the same argument as the sliding window.',
        ),
      },
      {
        type: 'code',
        id: 'daily-temps-trace',
        caption: 'The printed list is the temperatures still waiting (always decreasing).',
        code: `def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []                       # indexes of days still waiting
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
        print(i, t, [temps[k] for k in stack])
    return answer

print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# 0 73 [73]
# 1 74 [74]
# 2 75 [75]
# 3 71 [75, 71]
# 4 69 [75, 71, 69]
# 5 72 [75, 72]
# 6 76 [76]
# 7 73 [76, 73]
# [1, 1, 4, 2, 1, 1, 0, 0]`,
      },
      {
        type: 'text',
        md: md(
          '## Car Fleet: sort first, then stack the arrival times',
          'Cars drive to `target`; a fast car that catches a slower one ahead must slow down and they become one **fleet**. Sort cars by position, **closest to the target first**. Compute each car’s arrival time `(target - p) / speed`. If a car would arrive **later** than the fleet in front, it can never catch it: it starts a new fleet (push its time). Otherwise it joins that fleet (do nothing).',
        ),
      },
      {
        type: 'code',
        id: 'car-fleet',
        code: `def car_fleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)   # closest to target first
    stack = []                                          # arrival time of each fleet
    for p, s in cars:
        time = (target - p) / s
        if not stack or time > stack[-1]:
            stack.append(time)     # slower than the fleet ahead: a new fleet
    return len(stack)

print(car_fleet(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]))   # 3`,
      },
      {
        type: 'text',
        md: md(
          '## Generate Parentheses: the stack is hidden in the rule',
          'Build the string one character at a time. You may add `(` while fewer than `n` are open, and `)` only while `closed < opened` — that is, while there is an unmatched `(` on the “stack”. This is [[recursion]] that tries both choices (later you will call it **backtracking**).',
        ),
      },
      {
        type: 'code',
        id: 'generate-parens',
        code: `def generate(n):
    out = []
    def build(s, opened, closed):
        if len(s) == 2 * n:
            out.append(s)
            return
        if opened < n:
            build(s + "(", opened + 1, closed)
        if closed < opened:
            build(s + ")", opened, closed + 1)
    build("", 0, 0)
    return out

print(generate(3))
# ['((()))', '(()())', '(())()', '()(())', '()()()']`,
      },
      {
        type: 'text',
        md: md(
          '## Largest Rectangle in Histogram (hard)',
          'Keep bars on an increasing stack as `(start index, height)`. When a lower bar arrives, every taller bar on the stack cannot reach further right: pop it and measure `height * (i - start)`. The new bar can reach back to the start of the last popped bar, so it takes that start. A `0` added at the end pops everything that is left. Each bar is pushed and popped once: O(n).',
        ),
      },
      {
        type: 'code',
        id: 'largest-rectangle',
        code: `def largest_rectangle(heights):
    stack = []                 # (start index, height), heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):
        start = i
        while stack and stack[-1][1] > h:
            j, height = stack.pop()
            best = max(best, height * (i - j))
            start = j
        stack.append((start, h))
    return best

print(largest_rectangle([2, 1, 5, 6, 2, 3]))   # 10`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Signals for a stack: **brackets** or nested structure, “evaluate an expression”, **undo**, or “for each item, find the **next greater / smaller** one”. Say it out loud: “Each index is pushed once and popped once, so the inner `while` is O(n) in total.” Always check the empty stack before `pop()` or `stack[-1]`.',
      },
      {
        type: 'text',
        md: md(
          '## Where you meet stacks at work',
          '- The [[call stack]] in every error trace: the last line is the function that failed, the lines above are who called it.',
          '- Parsers for JSON, HTML and code check that every `{`, `<div>` and `(` is closed.',
          '- Undo / redo in editors: two stacks.',
          '- Browser history: Back and Forward are two stacks.',
          '- Turning deep recursion (for example walking a huge folder tree) into a loop with an explicit stack.',
        ),
      },
      {
        type: 'exercise',
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        prompt: '`s` has only `()[]{}`. Return `True` if every bracket is closed by the same type, in the right order.',
        starter: `def is_valid(s):
    # your code here
    pass`,
        tests: `assert is_valid("()[]{}") is True
assert is_valid("([{}])") is True
assert is_valid("(]") is False
assert is_valid("([)]") is False
assert is_valid("((") is False
assert is_valid("){") is False`,
        hint: 'Map each closer to its opener. On a closer: the stack must not be empty and its top must be the partner. At the end: `return not stack`.',
        solution: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
      },
      {
        type: 'exercise',
        id: 'min-stack-ex',
        title: 'Min Stack',
        prompt: 'Write the class `MinStack` with `push(x)`, `pop()`, `top()` and `get_min()`. Every method must be O(1).',
        starter: `class MinStack:
    def __init__(self):
        pass

    def push(self, x):
        pass

    def pop(self):
        pass

    def top(self):
        pass

    def get_min(self):
        pass`,
        tests: `s = MinStack()
s.push(-2)
s.push(0)
s.push(-3)
assert s.get_min() == -3
s.pop()
assert s.top() == 0
assert s.get_min() == -2
s.push(-2)
s.pop()
assert s.get_min() == -2`,
        hint: 'Push pairs `(x, min(x, current minimum))`. The minimum is always the second value of the top pair.',
        solution: `class MinStack:
    def __init__(self):
        self.items = []

    def push(self, x):
        smallest = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, smallest))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]`,
      },
      {
        type: 'exercise',
        id: 'eval-rpn',
        title: 'Evaluate Reverse Polish Notation',
        prompt: 'Evaluate `tokens` in RPN with `+ - * /`. Division rounds **towards zero**. Numbers can be negative, like `"-3"`.',
        starter: `def eval_rpn(tokens):
    # your code here
    pass`,
        tests: `assert eval_rpn(["2", "1", "+", "3", "*"]) == 9
assert eval_rpn(["4", "13", "5", "/", "+"]) == 6
assert eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22
assert eval_rpn(["7", "-2", "/"]) == -3
assert eval_rpn(["5", "8", "-"]) == -3`,
        hint: 'Pop `b` first, then `a`. Use `int(a / b)` for division. Check operators with a set so `"-11"` is read as a number.',
        solution: `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in {"+", "-", "*", "/"}:
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[0]`,
      },
      {
        type: 'exercise',
        id: 'daily-temperatures',
        title: 'Daily Temperatures',
        prompt: 'For each day, return how many days you wait for a **warmer** temperature (0 if never). O(n) with a monotonic stack.',
        starter: `def daily_temperatures(temps):
    # your code here
    pass`,
        tests: `assert daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0]
assert daily_temperatures([30, 40, 50, 60]) == [1, 1, 1, 0]
assert daily_temperatures([30, 60, 90]) == [1, 1, 0]
assert daily_temperatures([50, 50, 50]) == [0, 0, 0]`,
        hint: 'Stack of indexes. While the current temperature is **higher** than the top day’s, pop it and write the distance. Then push the current index.',
        solution: `def daily_temperatures(temps):
    answer = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why is `list` a good stack but `pop(0)` a bad one?', answer: '`append` and `pop()` work at the end: O(1). `pop(0)` removes the first item and shifts the rest: O(n).' },
          { question: 'Why must the stack be empty at the end of Valid Parentheses?', answer: 'A bracket left on the stack was opened but never closed, like `"(("`.' },
          { question: 'Why is Daily Temperatures O(n) with a `while` inside the `for`?', answer: 'Each index is pushed once and popped at most once, so all inner steps together are at most n.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Stack', url: `${TIH}/stack/` },
      { label: 'Python tutorial: Using lists as stacks', url: 'https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-stacks' },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
  {
    id: 'dsa-binary-search',
    title: 'Binary Search',
    summary:
      'Throw away half of the possible answers at every step. It works on sorted data — and on any question where the answer is “no, no, no… yes, yes, yes”, like the smallest speed that is fast enough.',
    minutes: 70,
    videos: [
      yt('NeetCode: Binary Search', 's4DPM8ct1pI'),
      yt('NeetCode: Search a 2D Matrix', 'Ber2pi2C0j0'),
      yt('NeetCode: Koko Eating Bananas', 'U2SozAs9RzA'),
      yt('NeetCode: Find Minimum in Rotated Sorted Array', 'nIVW4P8b1VA'),
      yt('NeetCode: Search in Rotated Sorted Array', 'U8XENwh8Oy8'),
      yt('NeetCode: Time Based Key-Value Store', 'fu2cD_6E8Hw'),
      yt('NeetCode: Median of Two Sorted Arrays', 'q6IEA26hvXc'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Halve it, again and again',
          'Guess a number between 1 and 100: if each answer is “higher” or “lower”, you never need more than 7 guesses. That is [[binary search]]: look at the **middle**, decide which half cannot contain the answer, and throw it away.',
          '',
          'Each step halves the range, so n items need about log₂ n steps — [[logarithm|O(log n)]]. That number grows very slowly:',
        ),
      },
      {
        type: 'code',
        id: 'log-steps',
        caption: 'Worst-case number of steps for n sorted items.',
        code: `import math
for n in [8, 1_000, 1_000_000, 1_000_000_000]:
    print(n, math.ceil(math.log2(n + 1)))
# 8 4
# 1000 10
# 1000000 20
# 1000000000 30`,
      },
      {
        type: 'text',
        md: md(
          '## The basic template',
          'Keep the range `[lo, hi]` where the target could still be. Look at `mid`. If `nums[mid]` is too small, the target is to the right: `lo = mid + 1`. If it is too big: `hi = mid - 1`. Stop when the range is empty (`lo > hi`).',
          '',
          'The `+ 1` and `- 1` matter: `mid` was already checked, so it leaves the range. Forget them and the loop can run forever.',
        ),
      },
      {
        type: 'code',
        id: 'bs-trace',
        caption: 'Searching 11 in 7 numbers: 2 steps.',
        code: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        print(f"lo={lo} hi={hi} mid={mid} nums[mid]={nums[mid]}")
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(binary_search([1, 3, 5, 7, 9, 11, 13], 11))
# lo=0 hi=6 mid=3 nums[mid]=7
# lo=4 hi=6 mid=5 nums[mid]=11
# 5`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'In **Java, C and C++**, `(lo + hi) / 2` can [[overflow]] when both are close to 2³¹ — this bug sat in Java’s own `Arrays.binarySearch` for nine years. They write `lo + (hi - lo) / 2`. Python ints never overflow, so `(lo + hi) // 2` is safe. Libraries: Python `bisect`, Java `Arrays.binarySearch` (returns `-(insertion point) - 1` when not found), C++ `std::lower_bound` / `upper_bound`, Go `sort.Search`.',
      },
      {
        type: 'text',
        md: md(
          '## Lower bound: the first position that fits',
          'Many problems do not ask “is it there?” but “**where is the first** item ≥ target?” — the place you would insert it. Use a half-open range `[lo, hi)` with `hi = len(nums)`, because “after the last item” is a valid answer. When `nums[mid]` fits, `mid` **might be** the answer, so keep it: `hi = mid` (no `- 1`). The loop stops when `lo == hi`.',
        ),
      },
      {
        type: 'code',
        id: 'lower-bound',
        caption: 'Your own lower bound, and the same thing from the standard library.',
        code: `def first_at_least(nums, target):
    lo, hi = 0, len(nums)      # "not found" = len(nums) is a valid answer
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid           # mid might be the answer: keep it
        else:
            lo = mid + 1
    return lo

nums = [1, 3, 3, 3, 8]
print(first_at_least(nums, 3), first_at_least(nums, 4), first_at_least(nums, 9))  # 1 4 5

from bisect import bisect_left, bisect_right
print(bisect_left(nums, 3), bisect_right(nums, 3))   # 1 4`,
      },
      {
        type: 'text',
        md: md(
          '## Binary search on the answer',
          'Koko eats bananas at speed `k` per hour; can she finish all piles in `h` hours? If speed `k` works, **every bigger speed works too**. So the answers look like `no, no, no, yes, yes, yes` — and you can binary search for the first “yes”, without any sorted array in the input.',
          '',
          'The recipe: (1) find the smallest and largest possible answer, (2) write `works(x)`, (3) lower-bound search for the first `x` that works. The cost is O(log(range) × cost of `works`).',
        ),
      },
      {
        type: 'code',
        id: 'koko',
        caption: '`(p + k - 1) // k` is the ceiling of p / k without floats.',
        code: `def hours_needed(piles, k):
    return sum((p + k - 1) // k for p in piles)

def min_speed(piles, h):
    lo, hi = 1, max(piles)        # speed max(piles) always works
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(piles, mid) <= h:
            hi = mid              # fast enough: maybe slower also works
        else:
            lo = mid + 1          # too slow
    return lo

print(hours_needed([3, 6, 7, 11], 4), hours_needed([3, 6, 7, 11], 3))  # 8 10
print(min_speed([3, 6, 7, 11], 8))                                       # 4`,
      },
      {
        type: 'text',
        md: md(
          '## Rotated sorted arrays',
          '`[4, 5, 6, 7, 0, 1, 2]` is a sorted array turned around. Compare `nums[mid]` with `nums[hi]`: if `nums[mid] > nums[hi]`, the “drop” (and the minimum) is to the right of `mid`; otherwise `mid..hi` is sorted and the minimum is at `mid` or to its left. For **Search in Rotated Sorted Array**, first find which half is sorted, then check if the target is inside that half.',
        ),
      },
      {
        type: 'code',
        id: 'rotated-min',
        code: `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1     # the drop is to the right of mid
        else:
            hi = mid         # mid..hi is sorted: the minimum is mid or to the left
    return nums[lo]

print(find_min([4, 5, 6, 7, 0, 1, 2]), find_min([1, 2, 3]))   # 0 1`,
      },
      {
        type: 'text',
        md: md(
          '## A 2-D matrix is a 1-D array in disguise',
          'In Search a 2D Matrix every row starts after the previous row ends, so the whole matrix is one sorted list of `rows × cols` items. Search indexes `0 … rows*cols - 1` and turn each index into a cell with `divmod(i, cols)`.',
        ),
      },
      {
        type: 'code',
        id: 'matrix-index',
        code: `matrix = [[1, 3, 5], [7, 9, 11], [13, 15, 17]]
cols = len(matrix[0])
for i in [0, 4, 8]:
    r, c = divmod(i, cols)
    print(i, (r, c), matrix[r][c])
# 0 (0, 0) 1
# 4 (1, 1) 9
# 8 (2, 2) 17`,
      },
      {
        type: 'text',
        md: md(
          '## Time Based Key-Value Store',
          'Each key keeps a list of `(timestamp, value)` pairs. Timestamps only grow, so the list is already sorted. `get(key, t)` wants the last value with timestamp ≤ t: that is `bisect_right(times, t) - 1`.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Signals: **sorted** input, “find the first / last …”, or “find the **minimum** value that is big enough” (speed, capacity, days). Say the [[invariant]] out loud: “the answer is always inside `[lo, hi]`”. Test the edge cases on purpose: an empty list, one item, the target smaller than everything and bigger than everything.',
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'The classic infinite loop: `while lo < hi` with `lo = mid` (not `mid + 1`). When `hi = lo + 1`, `mid` equals `lo` and nothing moves. Rule: if one side keeps `mid`, the other side must move past it.',
      },
      {
        type: 'text',
        md: md(
          '## Where you meet it at work',
          '- **Database indexes** (B-trees) find a row among millions in a few page reads — a wide version of the same idea.',
          '- `git bisect` finds the commit that broke a test: good, good, … bad, bad.',
          '- Finding the largest batch size or the smallest server count that meets a deadline.',
          '- Looking up a value by time in sorted logs or price history.',
        ),
      },
      {
        type: 'exercise',
        id: 'binary-search',
        title: 'Binary Search',
        prompt: '`nums` is sorted with no duplicates. Return the index of `target`, or -1. O(log n).',
        starter: `def search(nums, target):
    # your code here
    pass`,
        tests: `assert search([-1, 0, 3, 5, 9, 12], 9) == 4
assert search([-1, 0, 3, 5, 9, 12], 2) == -1
assert search([5], 5) == 0
assert search([], 1) == -1
assert search([1, 3], 3) == 1`,
        hint: '`lo, hi = 0, len(nums) - 1`, loop while `lo <= hi`, move to `mid + 1` or `mid - 1`.',
        solution: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      },
      {
        type: 'exercise',
        id: 'search-insert',
        title: 'Search Insert Position',
        prompt: 'Return the index of `target` in the sorted list `nums`, or the index where it would be inserted to keep the order. This is a lower bound — do not use `bisect`.',
        starter: `def search_insert(nums, target):
    # your code here
    pass`,
        tests: `assert search_insert([1, 3, 5, 6], 5) == 2
assert search_insert([1, 3, 5, 6], 2) == 1
assert search_insert([1, 3, 5, 6], 7) == 4
assert search_insert([1, 3, 5, 6], 0) == 0
assert search_insert([], 3) == 0`,
        hint: '`lo, hi = 0, len(nums)`. While `lo < hi`: if `nums[mid] >= target`, `hi = mid`, else `lo = mid + 1`. Return `lo`.',
        solution: `def search_insert(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      },
      {
        type: 'exercise',
        id: 'koko-ex',
        title: 'Koko Eating Bananas',
        prompt: 'Each hour Koko picks one pile and eats up to `k` bananas from it. Return the **smallest** integer `k` that lets her eat all `piles` within `h` hours (`h >= len(piles)`).',
        starter: `def min_eating_speed(piles, h):
    # your code here
    pass`,
        tests: `assert min_eating_speed([3, 6, 7, 11], 8) == 4
assert min_eating_speed([30, 11, 23, 4, 20], 5) == 30
assert min_eating_speed([30, 11, 23, 4, 20], 6) == 23
assert min_eating_speed([1], 1) == 1
assert min_eating_speed([1000000000], 2) == 500000000`,
        hint: 'Search `k` in `[1, max(piles)]`. Hours for speed k: `sum((p + k - 1) // k for p in piles)`.',
        solution: `def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum((p + mid - 1) // mid for p in piles) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      },
      {
        type: 'exercise',
        id: 'rotated-search',
        title: 'Search in Rotated Sorted Array',
        prompt: '`nums` was sorted (all values different) and then rotated. Return the index of `target`, or -1, in O(log n).',
        starter: `def search_rotated(nums, target):
    # your code here
    pass`,
        tests: `assert search_rotated([4, 5, 6, 7, 0, 1, 2], 0) == 4
assert search_rotated([4, 5, 6, 7, 0, 1, 2], 3) == -1
assert search_rotated([1], 0) == -1
assert search_rotated([3, 1], 1) == 1
assert search_rotated([5, 1, 3], 5) == 0`,
        hint: 'At each step one half is sorted. If `nums[lo] <= nums[mid]`, the left half is sorted: is the target between `nums[lo]` and `nums[mid]`? Otherwise the right half is sorted.',
        solution: `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'How many steps does binary search need for one billion sorted items?', answer: 'About 30, because 2³⁰ is about one billion.' },
          { question: 'When can you binary search without a sorted array?', answer: 'When the answers are monotonic: if x works, every bigger x works too (Koko, capacity, days). Search for the first x that works.' },
          { question: 'Why `hi = mid` in a lower bound, but `hi = mid - 1` in the basic search?', answer: 'In a lower bound, mid might be the answer, so it must stay in the range. In the basic search mid was already checked.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Python docs: bisect', url: 'https://docs.python.org/3/library/bisect.html' },
      { label: 'Google Research: Nearly all binary searches are broken (overflow)', url: 'https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/' },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
  {
    id: 'dsa-linked-list',
    title: 'Linked List',
    summary:
      'Items that point to the next item instead of sitting side by side. Interview problems are about moving arrows safely: reverse them, merge with a dummy node, and find the middle or a cycle with a fast and a slow pointer.',
    minutes: 70,
    videos: [
      yt('NeetCode: Reverse Linked List', 'G0_I-ZF0S38'),
      yt('NeetCode: Merge Two Sorted Lists', 'XIdigk956u0'),
      yt('NeetCode: Linked List Cycle', 'gBTe7lFR3vc'),
      yt('NeetCode: Reorder List', 'S5bfdUTrKLM'),
      yt('NeetCode: Remove Nth Node From End of List', 'XVuQxVej6y8'),
      yt('NeetCode: Copy List With Random Pointer', '5Y2EiZST97Y'),
      yt('NeetCode: LRU Cache', '7ABFKPK2hD4'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Nodes and arrows',
          'A [[linked list]] is a chain of [[node|nodes]]. Each node holds a value and a [[reference]] to the next node; the last one points to `None`. You only keep the first node, the **head**.',
          '',
          '| Operation | Python `list` (array) | Linked list |',
          '| --- | --- | --- |',
          '| read item `i` | O(1) | O(n) — walk from the head |',
          '| add / remove at the front | O(n) | O(1) |',
          '| add / remove next to a node you already hold | O(n) | O(1) |',
          '| memory | values side by side | one extra reference per node |',
          '',
          'LeetCode gives you nodes as a small class. `ListNode(v, head)` makes a new node that points to the old head — adding at the front in O(1).',
        ),
      },
      {
        type: 'code',
        id: 'list-node',
        caption: '`build` and `to_list` turn Python lists into linked lists and back, so you can print them.',
        code: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

head = build([1, 2, 3])
print(head.val, head.next.val, head.next.next.next)   # 1 2 None
print(to_list(head))                                  # [1, 2, 3]
head = ListNode(0, head)        # add at the front: O(1)
print(to_list(head))                                  # [0, 1, 2, 3]`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'In **C** a node is a `struct` with a pointer, and you must `free` every node yourself — forget one and you leak memory. **Java** has `java.util.LinkedList` (a [[doubly linked list]]), but `ArrayList` is faster for almost everything because the values sit together in memory and the CPU cache loves that. Python has no linked list class; `collections.deque` is built from linked blocks. In real code you rarely write a linked list — but databases, operating systems and caches use them inside.',
      },
      {
        type: 'text',
        md: md(
          '## Reverse: turn every arrow around',
          'Walk with two pointers, `prev` (starts at `None`) and `cur`. At each node: **remember** `cur.next`, point `cur.next` back to `prev`, then move both forward. Forget to save `next` first and you lose the rest of the list.',
        ),
      },
      {
        type: 'code',
        id: 'reverse-trace',
        caption: 'Printed after each step: the reversed part, then the part still to do.',
        code: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next      # 1. remember the rest
        cur.next = prev     # 2. turn the arrow around
        prev, cur = cur, nxt
        print(to_list(prev), to_list(cur))
    return prev

print(to_list(reverse(build([1, 2, 3]))))
# [1] [2, 3]
# [2, 1] [3]
# [3, 2, 1] []
# [3, 2, 1]`,
      },
      {
        type: 'text',
        md: md(
          '## The dummy node',
          'When the head itself might change (merging, removing the first node), start with a fake [[dummy node]] in front. You always attach to `tail.next`, never special-case an empty result, and return `dummy.next` at the end.',
        ),
      },
      {
        type: 'code',
        id: 'merge-dummy',
        code: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def merge(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b          # one list is empty: attach the rest of the other
    return dummy.next

print(to_list(merge(build([1, 4, 5]), build([2, 3, 6, 7]))))   # [1, 2, 3, 4, 5, 6, 7]`,
      },
      {
        type: 'text',
        md: md(
          '## Fast and slow pointers',
          'Move `slow` one step and `fast` two steps at a time.',
          '',
          '- When `fast` reaches the end, `slow` is in the **middle**.',
          '- If the list has a **cycle**, `fast` never reaches the end — it goes round and catches up with `slow` from behind. That is [[floyd cycle detection|Floyd’s tortoise and hare]]: O(n) time, O(1) memory (a set of seen nodes would cost O(n) memory).',
          '',
          'A **gap** works the same way: to remove the n-th node from the end, move one pointer n steps ahead, then move both until the first one hits the end.',
        ),
      },
      {
        type: 'code',
        id: 'fast-slow',
        code: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

print(middle(build([1, 2, 3, 4, 5])), middle(build([1, 2, 3, 4])))   # 3 3
loop = build([1, 2, 3, 4])
loop.next.next.next.next = loop.next      # 4 points back to 2
print(has_cycle(loop), has_cycle(build([1, 2, 3])))                 # True False`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'Use `is` to compare nodes, not `==`: two different nodes can hold the same value. And check `fast and fast.next` before `fast.next.next`, or a list with an even length crashes with `AttributeError: \'NoneType\' object has no attribute \'next\'`.',
      },
      {
        type: 'text',
        md: md(
          '## LRU Cache: a dict plus a doubly linked list',
          'An [[lru cache|LRU cache]] keeps the most recently used items and, when it is full, throws out the one used **longest ago**. Both `get` and `put` must be O(1):',
          '',
          '- a **dict** finds the node for a key in O(1);',
          '- a [[doubly linked list]] keeps the order of use: move a node to the front in O(1) (it knows its `prev` and `next`), and remove the last node in O(1).',
          '',
          'Python’s `OrderedDict` is exactly this pair. In an interview, build it yourself first; then mention the shortcut.',
        ),
      },
      {
        type: 'code',
        id: 'ordered-dict',
        code: `from collections import OrderedDict

cache = OrderedDict()
for key in ["a", "b", "c"]:
    cache[key] = key.upper()
cache.move_to_end("a")          # "a" was just used: it becomes the newest
cache.popitem(last=False)       # the cache is full: remove the oldest ("b")
print(list(cache))              # ['c', 'a']`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Draw the boxes and arrows before you code, and say which arrow changes first. Check the edge cases out loud: an empty list, one node, two nodes, and removing the **head**. Mention the cost: most linked-list answers are O(n) time and O(1) extra memory.',
      },
      {
        type: 'text',
        md: md(
          '## Where you meet linked lists at work',
          '- Caches: the LRU list in Redis, in web frameworks and in your browser.',
          '- `collections.deque` and many queues are linked blocks, so both ends are O(1).',
          '- Operating systems keep free memory pages and waiting processes in linked lists.',
          '- Git history: each commit points to its parent — a linked list (a graph, when branches merge).',
        ),
      },
      {
        type: 'exercise',
        id: 'reverse-list',
        title: 'Reverse Linked List',
        prompt: 'Reverse the list in place and return the new head. O(n) time, O(1) extra memory.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse_list(head):
    # your code here
    pass`,
        tests: `def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

assert to_list(reverse_list(build([1, 2, 3, 4, 5]))) == [5, 4, 3, 2, 1]
assert to_list(reverse_list(build([1, 2]))) == [2, 1]
assert reverse_list(None) is None`,
        hint: '`prev, cur = None, head`. In the loop: save `cur.next`, point `cur.next` to `prev`, move both. Return `prev`.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
      },
      {
        type: 'exercise',
        id: 'merge-two',
        title: 'Merge Two Sorted Lists',
        prompt: 'Merge two sorted linked lists into one sorted list by re-linking their nodes. Return the head.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def merge_two(a, b):
    # your code here
    pass`,
        tests: `def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

assert to_list(merge_two(build([1, 2, 4]), build([1, 3, 4]))) == [1, 1, 2, 3, 4, 4]
assert to_list(merge_two(build([]), build([0]))) == [0]
assert merge_two(None, None) is None`,
        hint: 'Start with `dummy = tail = ListNode(0)`. Attach the smaller head to `tail.next`, move on. At the end attach whatever is left.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def merge_two(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
      },
      {
        type: 'exercise',
        id: 'has-cycle',
        title: 'Linked List Cycle',
        prompt: 'Return `True` if the list has a cycle. Use O(1) extra memory (no set).',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def has_cycle(head):
    # your code here
    pass`,
        tests: `a, b, c, d = ListNode(3), ListNode(2), ListNode(0), ListNode(-4)
a.next, b.next, c.next, d.next = b, c, d, b
assert has_cycle(a) is True
one = ListNode(1)
one.next = one
assert has_cycle(one) is True
assert has_cycle(ListNode(1, ListNode(2))) is False
assert has_cycle(None) is False`,
        hint: '`slow` one step, `fast` two steps, while `fast and fast.next`. If `slow is fast`, there is a cycle.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False`,
      },
      {
        type: 'exercise',
        id: 'remove-nth',
        title: 'Remove Nth Node From End',
        prompt: 'Remove the `n`-th node from the **end** and return the head, in one pass. `n` is always valid.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def remove_nth_from_end(head, n):
    # your code here
    pass`,
        tests: `def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

assert to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 2)) == [1, 2, 3, 5]
assert to_list(remove_nth_from_end(build([1]), 1)) == []
assert to_list(remove_nth_from_end(build([1, 2]), 2)) == [2]
assert to_list(remove_nth_from_end(build([1, 2]), 1)) == [1]`,
        hint: 'Dummy node in front. Move `fast` n steps ahead of `slow` (both start at dummy), then move both until `fast.next` is None. Now `slow.next` is the node to remove.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What do you do first in each step of reversing a list, and why?', answer: 'Save `cur.next`. After you point `cur.next` backwards, the rest of the list would be lost.' },
          { question: 'Why use a dummy node?', answer: 'The head may change or the result may be empty. With a fake first node there is no special case; return `dummy.next`.' },
          { question: 'Why does an LRU cache need a doubly linked list, not a singly linked one?', answer: 'To remove a node from the middle in O(1) you need its previous node; each node keeps `prev` as well as `next`.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Linked list', url: `${TIH}/linked-list/` },
      { label: 'Python docs: OrderedDict.move_to_end', url: 'https://docs.python.org/3/library/collections.html#collections.OrderedDict.move_to_end' },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
  {
    id: 'dsa-trees',
    title: 'Trees: DFS and BFS',
    summary:
      'A tree is a node with smaller trees under it, so most tree answers are short recursive functions. Learn the two ways to walk a tree — depth first with recursion, breadth first with a queue — and the one rule that makes a binary search tree fast.',
    minutes: 75,
    videos: [
      yt('NeetCode: Invert Binary Tree', 'OnSn2XEQ4MY'),
      yt('NeetCode: Maximum Depth of Binary Tree', 'hTM3phVI6YQ'),
      yt('NeetCode: Diameter of Binary Tree', 'K81C31ytOZE'),
      yt('NeetCode: Lowest Common Ancestor of a BST', 'gs2LMfuOR9k'),
      yt('NeetCode: Binary Tree Level Order Traversal', '6ZnyEApgFYg'),
      yt('NeetCode: Validate Binary Search Tree', 's6ATEkipzow'),
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Words first',
          'A [[binary tree]] is made of nodes; each node has a value and at most two children, `left` and `right`. The top node is the **root**; a node with no children is a [[leaf]]. The [[tree height|height]] (or depth) is the number of nodes on the longest path from the root down to a leaf.',
          '',
          'The key idea: **every child is the root of a smaller tree**. So a tree question can almost always be answered as “answer for the left subtree + answer for the right subtree + this node” — [[recursion]] with the base case `node is None`.',
        ),
      },
      {
        type: 'code',
        id: 'max-depth',
        caption: 'The tree used in this lesson, and its depth with three lines of recursion.',
        code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

#        4
#      /   \\
#     2     6
#    / \\     \\
#   1   3     7
root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))

def max_depth(node):
    if node is None:            # base case: an empty tree has depth 0
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

print(max_depth(root))   # 3`,
      },
      {
        type: 'text',
        md: md(
          '## Depth-first search (DFS): three orders',
          '[[dfs|DFS]] goes as deep as it can before it comes back. The only difference between the three orders is **when** you look at the node itself:',
          '',
          '| Order | Steps | Typical use |',
          '| --- | --- | --- |',
          '| pre-order | node, left, right | copy or print a tree, serialize it |',
          '| in-order | left, node, right | a BST gives its values **sorted** |',
          '| post-order | left, right, node | the answer needs the children first: height, diameter, delete a folder |',
        ),
      },
      {
        type: 'code',
        id: 'dfs-orders',
        code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))

def preorder(n, out):
    if n:
        out.append(n.val)
        preorder(n.left, out)
        preorder(n.right, out)
    return out

def inorder(n, out):
    if n:
        inorder(n.left, out)
        out.append(n.val)
        inorder(n.right, out)
    return out

def postorder(n, out):
    if n:
        postorder(n.left, out)
        postorder(n.right, out)
        out.append(n.val)
    return out

print(preorder(root, []))    # [4, 2, 1, 3, 6, 7]
print(inorder(root, []))     # [1, 2, 3, 4, 6, 7]
print(postorder(root, []))   # [1, 3, 2, 7, 6, 4]`,
      },
      {
        type: 'text',
        md: md(
          '## Breadth-first search (BFS): level by level',
          '[[bfs|BFS]] visits the root, then all nodes one level down, then the next level. It uses a **queue** (`collections.deque`, O(1) `popleft`). To group nodes by level, read `len(queue)` at the start of each round: exactly that many nodes belong to the current level.',
          '',
          'BFS is the natural choice for “level”, “closest”, “minimum depth” or “right side view” questions: it reaches the nearest nodes first.',
        ),
      },
      {
        type: 'code',
        id: 'bfs-levels',
        code: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))

def level_order(root):
    levels, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):        # the nodes of this level only
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels

print(level_order(root))   # [[4], [2, 6], [1, 3, 7]]`,
      },
      {
        type: 'text',
        md: md(
          '## DFS or BFS?',
          '| | DFS (recursion or a stack) | BFS (a queue) |',
          '| --- | --- | --- |',
          '| memory | O(height) — small for a balanced tree | O(width) — the widest level can be n / 2 nodes |',
          '| good for | paths, subtree answers, BST order | levels, the nearest node, the shortest path |',
          '| risk | very deep trees hit Python’s recursion limit (~1,000) | none from depth |',
          '',
          'Both visit every node once: **O(n) time**. For a very deep tree, write DFS with your own stack (the Stack lesson): push `right`, then `left`, so `left` is popped first.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Binary search trees',
          'A [[binary search tree|BST]] adds one rule: **everything** in the left subtree is smaller than the node, **everything** in the right subtree is bigger. Then a search goes left or right at each node — binary search on a tree, O(height).',
          '',
          '- Balanced (height ≈ log n): search, insert and delete are O(log n).',
          '- Unbalanced — for example inserting 1, 2, 3, 4, … in order — the tree becomes a line: O(n). Real libraries use self-balancing trees (red-black, AVL, B-trees).',
          '',
          'To **validate** a BST it is not enough to compare a node with its two children: pass down the allowed range `(low, high)` instead.',
        ),
      },
      {
        type: 'code',
        id: 'validate-bst',
        caption: 'In `bad`, 4 is smaller than 7 (its parent) but also smaller than 5 (the root) — it is on the wrong side.',
        code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))
bad = TreeNode(5, TreeNode(3), TreeNode(7, TreeNode(4), TreeNode(8)))

def is_bst(node, low=float("-inf"), high=float("inf")):
    if node is None:
        return True
    if not (low < node.val < high):
        return False
    return is_bst(node.left, low, node.val) and is_bst(node.right, node.val, high)

print(is_bst(root), is_bst(bad))   # True False`,
      },
      {
        type: 'text',
        md: md(
          '## Return one thing, remember another',
          'Diameter of a Binary Tree: the longest path between any two nodes (counted in edges). The path through a node is `height(left) + height(right)`. So the recursive function **returns** the height (what the parent needs) and **updates** the best diameter on the side (with `nonlocal`). This “return X, record Y” shape solves many hard tree problems, like Binary Tree Maximum Path Sum.',
        ),
      },
      {
        type: 'code',
        id: 'diameter',
        code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, None, TreeNode(7)))

def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)      # the path that bends at this node
        return 1 + max(left, right)         # what the parent needs
    height(root)
    return best

print(diameter(root))   # 4  (1 → 2 → 4 → 6 → 7)`,
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Java** has `TreeMap` / `TreeSet` and **C++** has `std::map` / `std::set`: balanced BSTs (red-black trees) with sorted keys and O(log n) operations. **Python has none** in the standard library — `dict` is a hash table with no order by key. In Python you use `sorted()`, `bisect` on a sorted list, or the third-party `sortedcontainers`. Recursion limits differ too: Java and C++ usually allow thousands of nested calls, Python stops at about 1,000.',
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Say the plan in one sentence: “I solve it for the left and right subtrees, then combine at this node; base case: an empty tree.” Then state the cost: **O(n) time**, **O(h) memory** for the recursion (h = height: log n if balanced, n in the worst case). Always try the empty tree and a single node.',
      },
      {
        type: 'text',
        md: md(
          '## Where you meet trees at work',
          '- The file system: folders inside folders. Deleting a folder is a post-order walk.',
          '- The HTML DOM and JSON documents are trees; React walks them to render a page.',
          '- Database indexes are B-trees; a query planner reads the tree, not the whole table.',
          '- Org charts, category menus, comment threads.',
        ),
      },
      {
        type: 'exercise',
        id: 'max-depth-ex',
        title: 'Maximum Depth of Binary Tree',
        prompt: 'Return the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.',
        starter: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def max_depth(root):
    # your code here
    pass`,
        tests: `def build(values):
    if not values:
        return None
    nodes = [None if v is None else TreeNode(v) for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root

assert max_depth(build([3, 9, 20, None, None, 15, 7])) == 3
assert max_depth(build([1, None, 2])) == 2
assert max_depth(build([])) == 0
assert max_depth(build([1, 2, None, 3, None, 4])) == 4`,
        hint: 'Base case: `None` → 0. Otherwise `1 + max(depth of left, depth of right)`.',
        solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
      },
      {
        type: 'exercise',
        id: 'invert-tree',
        title: 'Invert Binary Tree',
        prompt: 'Swap the left and right child of **every** node (a mirror image) and return the root.',
        starter: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def invert(root):
    # your code here
    pass`,
        tests: `def build(values):
    if not values:
        return None
    nodes = [None if v is None else TreeNode(v) for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root

def preorder(n):
    return [n.val] + preorder(n.left) + preorder(n.right) if n else [None]

assert preorder(invert(build([4, 2, 7, 1, 3, 6, 9]))) == preorder(build([4, 7, 2, 9, 6, 3, 1]))
assert preorder(invert(build([2, 1, 3]))) == preorder(build([2, 3, 1]))
assert invert(None) is None`,
        hint: 'If the node is None, return None. Otherwise swap: `root.left, root.right = invert(root.right), invert(root.left)`.',
        solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def invert(root):
    if root is None:
        return None
    root.left, root.right = invert(root.right), invert(root.left)
    return root`,
      },
      {
        type: 'exercise',
        id: 'level-order',
        title: 'Binary Tree Level Order Traversal',
        prompt: 'Return the values level by level, left to right: a list of lists. Use BFS with a `deque`.',
        starter: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def level_order(root):
    # your code here
    pass`,
        tests: `def build(values):
    if not values:
        return None
    nodes = [None if v is None else TreeNode(v) for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root

assert level_order(build([3, 9, 20, None, None, 15, 7])) == [[3], [9, 20], [15, 7]]
assert level_order(build([1])) == [[1]]
assert level_order(build([])) == []`,
        hint: 'Queue starts with the root (if any). Each round: `for _ in range(len(queue))`, pop left, record, push its children.',
        solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def level_order(root):
    levels, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels`,
      },
      {
        type: 'exercise',
        id: 'valid-bst',
        title: 'Validate Binary Search Tree',
        prompt: 'Return `True` if the tree is a valid BST: every value in a left subtree is **smaller** than the node, every value in a right subtree is **bigger** (no duplicates).',
        starter: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_valid_bst(root):
    # your code here
    pass`,
        tests: `def build(values):
    if not values:
        return None
    nodes = [None if v is None else TreeNode(v) for v in values]
    kids = nodes[::-1]
    root = kids.pop()
    for node in nodes:
        if node:
            if kids:
                node.left = kids.pop()
            if kids:
                node.right = kids.pop()
    return root

assert is_valid_bst(build([2, 1, 3])) is True
assert is_valid_bst(build([5, 1, 4, None, None, 3, 6])) is False
assert is_valid_bst(build([5, 4, 6, None, None, 3, 7])) is False
assert is_valid_bst(build([2, 2, 2])) is False
assert is_valid_bst(None) is True`,
        hint: 'Pass the allowed range down: `check(node, low, high)`. Going left, `high` becomes `node.val`; going right, `low` becomes `node.val`.',
        solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_valid_bst(root, low=float("-inf"), high=float("inf")):
    if root is None:
        return True
    if not (low < root.val < high):
        return False
    return is_valid_bst(root.left, low, root.val) and is_valid_bst(root.right, root.val, high)`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Which traversal gives the values of a BST in sorted order?', answer: 'In-order: left, node, right.' },
          { question: 'When is BFS a better choice than DFS?', answer: 'For levels or the nearest / shallowest node: BFS reaches them first. DFS is better for paths and subtree answers, and uses less memory on wide trees.' },
          { question: 'Why can a BST become slow?', answer: 'If values are inserted in sorted order it turns into a line: height n, so search is O(n). Balanced trees keep the height near log n.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Tech Interview Handbook: Tree', url: `${TIH}/tree/` },
      { label: 'Python docs: collections.deque', url: 'https://docs.python.org/3/library/collections.html#collections.deque' },
      { label: 'NeetCode 150 (videos for each problem)', url: 'https://neetcode.io/practice' },
    ],
  },
]
