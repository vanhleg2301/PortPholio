import type { LessonTest } from '../types'
import { PRINT, choice } from './helpers'

export const DSA_TESTS: Record<string, LessonTest> = {
  'dsa-arrays-hashing': {
    choice: [
      choice('tuple-key', 'In Group Anagrams with a count key, why do we write `tuple(counts)` and not use the list `counts` as the key?',
        ['A list is not hashable, so it cannot be a dict key', 'A tuple is faster to build', 'A list would sort itself', 'Tuples use less memory, but lists also work'],
        'Dict keys must be [[hashable]]. A tuple of ints is hashable; a list is not. This is the reason almost every “group by a shape” solution turns its key into a tuple or a string.'),
      choice('group-cost', 'Group Anagrams with the key `"".join(sorted(word))`: n words, each with up to k letters. What is the time?',
        ['O(n · k log k)', 'O(n log n)', 'O(n · k)', 'O(n² · k)'],
        'Each word is sorted once: O(k log k). There are n words. With the 26-count key it becomes O(n · k).'),
      choice('one-zero', '`nums` has exactly one `0`. In Product of Array Except Self, which answers are not zero?',
        ['Only the answer at the index of the 0', 'All answers except the one at the 0', 'All answers are zero', 'All answers are non-zero'],
        'Every product that **includes** the 0 is 0. Only the position of the 0 skips it. This is one reason the simple “total product ÷ nums[i]” idea breaks (you cannot divide by 0).'),
      choice('consecutive-start', 'In Longest Consecutive Sequence, why do we only start counting at `x` when `x - 1` is not in the set?',
        ['So each run is counted once from its first number, which keeps the total work O(n)', 'To skip negative numbers', 'Because sets are sorted', 'To find the shortest run first'],
        'If we started counting from every number, a run of length L would be walked L times: O(n²). Starting only at the first number of each run means each number is visited by the inner `while` at most once.'),
      choice('length-prefix', 'With length-prefix encoding (`"4#lint"`), why is a `#` inside a word not a problem?',
        ['The decoder reads the length first, then takes exactly that many characters, without looking for `#` inside them', 'Because `#` is removed before encoding', 'Because we escape `#` as `##`', 'It is a problem: words cannot contain `#`'],
        'The decoder only searches for `#` right after a number. After that it copies a fixed number of characters, whatever they are. This is how many real protocols frame their messages (for example, HTTP has a `Content-Length` header).'),
      choice('box-index', 'In Valid Sudoku, which 3×3 box holds the cell at row 4, column 7 (0-indexed)?',
        ['(1, 2)', '(2, 1)', '(1, 1)', '(4, 7)'],
        'The box is `(r // 3, c // 3)` = `(4 // 3, 7 // 3)` = `(1, 2)`: the middle row of boxes, the right column of boxes.'),
      choice('bucket-size', 'In the bucket sort for Top K Frequent, why do we make `len(nums) + 1` buckets?',
        ['A count can be anything from 0 to n, so we need indexes 0…n', 'To leave room for negative numbers', 'Because Python lists start at 1', 'One extra bucket for values with no count'],
        'The largest possible count is n (all values equal). Index n must exist, so the list needs n + 1 places.'),
      choice('two-sum-sort', 'Why is “sort, then two pointers” not the standard answer for Two Sum (return indexes)?',
        ['Sorting loses the original indexes (unless you store them) and costs O(n log n); the hash map is O(n)', 'Two pointers do not work on sorted arrays', 'Sorting uses O(n²) time', 'The hash map uses less memory'],
        'Two pointers need sorted data. Sorting changes the positions, so you must keep `(value, index)` pairs, and it is O(n log n). The hash map is O(n) but uses O(n) memory. When the input is **already sorted** (Two Sum II), two pointers win: O(n) time and O(1) memory.'),
      choice('group-count', PRINT, ['2', '3', '1', "[['ab', 'ba'], ['c']]"],
        '`"ab"` and `"ba"` have the same sorted letters, so they share one key. `"c"` has its own key. That is 2 groups.',
        'from collections import defaultdict\ng = defaultdict(list)\nfor w in ["ab", "ba", "c"]:\n    g[tuple(sorted(w))].append(w)\nprint(len(g))'),
      choice('prefix-left', PRINT, ['[1, 2, 6]', '[2, 6, 24]', '[1, 2, 8]', '[2, 3, 4]'],
        'The left product at `i` uses everything **before** `i`, so it starts at 1 (an empty product). Then 2, then 2 × 3 = 6.',
        'nums = [2, 3, 4]\nleft, out = 1, []\nfor x in nums:\n    out.append(left)\n    left *= x\nprint(out)'),
      choice('dup-no-memory', 'Contains Duplicate with O(1) extra memory — what is the best time?',
        ['O(n log n): sort in place, then compare neighbours', 'O(n): use a set', 'O(n²): it is the only way', 'O(log n)'],
        'The set gives O(n) time but O(n) memory. Sorting in place gives O(n log n) time and O(1) extra memory. Know both and the [[trade-off]].'),
      choice('hash-worst', 'When can a hash map lookup become O(n)?',
        ['When many keys collide into the same slot (bad hash function, or keys chosen by an attacker)', 'When the keys are strings', 'When the map has more than 1,000 keys', 'When you use `get` instead of `[]`'],
        'With [[collision|collisions]], a lookup must check many entries. Real systems protect against attackers with random hash seeds — Python randomizes string hashes for this reason.'),
    ],
    code: [
      {
        id: 'subarray-sum-k',
        title: 'Subarray Sum Equals K',
        prompt: 'Count the [[subarray|subarrays]] (continuous parts) whose sum is exactly `k` (LeetCode 560). Numbers can be negative, so a sliding window does not work. Combine a [[prefix sum]] with a hash map: O(n).',
        starter: `def subarray_sum(nums, k):
    # your code here
    pass`,
        tests: `assert subarray_sum([1, 1, 1], 2) == 2
assert subarray_sum([1, 2, 3], 3) == 2
assert subarray_sum([1, -1, 0], 0) == 3
assert subarray_sum([3], 2) == 0`,
        hint: 'A subarray `(i, j]` sums to k when `prefix[j] - prefix[i] == k`. Walk once, keep `counts[prefix]`, and at each step add `counts[running - k]`. Start with `counts = {0: 1}`.',
        solution: `def subarray_sum(nums, k):
    counts = {0: 1}
    running = total = 0
    for x in nums:
        running += x
        total += counts.get(running - k, 0)
        counts[running] = counts.get(running, 0) + 1
    return total`,
      },
      {
        id: 'nearby-duplicate',
        title: 'Contains Duplicate II',
        prompt: 'Return `True` if two equal values are at most `k` positions apart: `i != j`, `nums[i] == nums[j]` and `abs(i - j) <= k` (LeetCode 219). One pass, O(n).',
        starter: `def contains_nearby_duplicate(nums, k):
    # your code here
    pass`,
        tests: `assert contains_nearby_duplicate([1, 2, 3, 1], 3) is True
assert contains_nearby_duplicate([1, 0, 1, 1], 1) is True
assert contains_nearby_duplicate([1, 2, 3, 1, 2, 3], 2) is False
assert contains_nearby_duplicate([], 0) is False`,
        hint: 'Keep the **last** index of each value in a dict. When you see a value again, check the distance.',
        solution: `def contains_nearby_duplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False`,
      },
    ],
    explain: [
      {
        id: 'consecutive-proof',
        question: 'Explain your Longest Consecutive Sequence solution, and prove that it is O(n) even though it has a `while` loop inside a `for` loop.',
        points: [
          'Put all numbers in a set for O(1) lookups (sorting would be O(n log n))',
          'Only start at x when x − 1 is not in the set (x is the start of a run)',
          'From a start, walk x + 1, x + 2, … while they are in the set',
          'Each number is walked by the inner loop at most once, because only one start reaches it',
          'Total work: n (outer) + n (all inner steps together) = O(n); memory O(n)',
        ],
        answer: 'I put all numbers into a set so I can check “is this number there?” in O(1). Then for each number x, I only start counting if x − 1 is not in the set, which means x is the first number of a run. From there I walk x + 1, x + 2 and so on while they are in the set, and I keep the longest length. It looks like O(n²) because of the loop inside a loop, but every number belongs to exactly one run, and only that run’s first number walks over it. So all the inner steps together are at most n. The outer loop is n, so the total is O(n) time, and the set is O(n) memory. Sorting would also work, but it would be O(n log n).',
      },
      {
        id: 'encoding-design',
        question: 'Design Encode/Decode for a list of strings. Why does a simple separator like `","` fail? Describe two different correct designs and their trade-offs.',
        points: [
          'Any separator character can also appear inside a string, so splitting breaks',
          'Length prefix (`len#word`): the decoder reads the length, then takes exactly that many characters',
          'Escaping: replace the separator inside words (e.g. `#` → `##`) and use a lone `#` to split; more complex and slower',
          'Fixed-size header (e.g. 4 bytes for the length) is how many binary protocols do it',
          'Edge cases: empty list vs list with one empty string',
        ],
        answer: 'A plain separator fails because the strings can contain any character — including the separator — so `split` would cut a word in two. One correct design is a length prefix: for each word I write its length, a `#`, and the word, like `4#lint`. The decoder reads digits up to the `#`, turns them into a number, and then copies exactly that many characters without looking inside them. It is simple and O(n). A second design is escaping: double every `#` inside a word and use a single `#` between words; it works, but encoding and decoding are more complex. Binary protocols often use a fixed-size header, for example 4 bytes for the length, which avoids parsing digits. I would also test edge cases: an empty list and a list with one empty string must decode differently — with a length prefix they do: `""` vs `"0#"`.',
      },
      {
        id: 'two-sum-ladder',
        question: '“Find two numbers that add up to target.” Walk through three solutions — brute force, hash map, sort + two pointers — with time and memory, and say when each one is the best choice.',
        points: [
          'Brute force: check every pair, O(n²) time, O(1) memory; fine for tiny inputs and as a first idea',
          'Hash map: for each x look for target − x in a dict of seen values, O(n) time, O(n) memory',
          'Sort + two pointers: O(n log n) time, O(1) extra memory; loses original indexes unless you keep them',
          'If the input is already sorted, two pointers are O(n) time and O(1) memory — the best',
          'Say the trade-off out loud before coding',
        ],
        answer: 'First the brute force: two loops check every pair, O(n²) time and O(1) memory. It is a good start and fine for tiny inputs. To be faster, I ask “have I already seen target − x?” and keep a dict of value → index; one pass is enough, so O(n) time but O(n) memory. If memory matters, I can sort and use two pointers, one at each end: if the sum is too small, move the left pointer right; if too big, move the right pointer left. That is O(n log n) because of the sort and O(1) extra memory, but sorting loses the original indexes, so I would need to keep (value, index) pairs. When the input is already sorted, two pointers are the best: O(n) and O(1). In the interview I would say these trade-offs before I start coding the hash map version.',
      },
    ],
  },
}
