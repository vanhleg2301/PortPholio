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
  'dsa-two-pointers': {
    choice: [
      choice('tp-cost', 'Two Sum II with two pointers on a sorted array of n numbers: what are the time and the extra memory?',
        ['O(n) time, O(1) memory', 'O(n log n) time, O(1) memory', 'O(n) time, O(n) memory', 'O(n²) time, O(1) memory'],
        'Each step moves one pointer and throws away one number for good, so there are at most n steps. Only two indexes are stored.'),
      choice('tp-why-left', 'Sorted `[1, 3, 5, 8]`, target 12, `l` at 1, `r` at 8: the sum is 9. Why is it safe to move `l`?',
        ['1 plus any number up to 8 is at most 9 < 12, so 1 can never be in the answer', 'Because the left pointer always moves first', 'Because 9 is odd', 'It is not safe; we should check every pair'],
        'This is the [[invariant]]: every pair that is skipped is proven too small (or too big). Saying this out loud is what makes the solution convincing.'),
      choice('tp-trace', PRINT, ['1 4 1', '0 4 0', '1 3 2', '2 4 1'],
        '1 + 11 = 12 is too small → `l` moves to 2; 2 + 11 = 13 stops the loop after one step.',
        'nums = [1, 2, 4, 7, 11]\nl, r, steps = 0, len(nums) - 1, 0\nwhile l < r and nums[l] + nums[r] != 13:\n    if nums[l] + nums[r] < 13:\n        l += 1\n    else:\n        r -= 1\n    steps += 1\nprint(l, r, steps)'),
      choice('tp-sorted', 'What goes wrong if you use opposite-end two pointers for Two Sum on an **unsorted** array?',
        ['Moving a pointer may skip the answer: “too small” no longer proves anything about the other numbers', 'Nothing — it works the same', 'It becomes O(n²)', 'Python raises an error'],
        'The proof needs order. Without sorting, use the hash map from Week 1 — or sort first (and keep the original indexes if you need them).'),
      choice('three-dupes', 'In 3Sum, why do we skip `i` when `nums[i] == nums[i - 1]` (after sorting)?',
        ['The same first number would find the same triples again → duplicates in the answer', 'To make the loop faster only', 'Because equal numbers cannot sum to 0', 'To avoid an IndexError'],
        'Sorting puts equal values next to each other, so skipping repeats is easy. The same idea is used for `l` after a triple is found.'),
      choice('three-cost', '3Sum with sort + two pointers: what is the time?',
        ['O(n²)', 'O(n log n)', 'O(n³)', 'O(n)'],
        'Sorting is O(n log n). Then for each of n values one two-pointer pass costs O(n): O(n²) in total, much better than three loops (O(n³)).'),
      choice('container-move', 'Container With Most Water: the left line has height 2, the right line height 7. Which pointer moves?',
        ['The left one (the shorter line)', 'The right one (the taller line)', 'Both at the same time', 'Whichever is closer to the middle'],
        'The area is limited by the shorter line. Moving the taller one only makes the width smaller, so it can never give a bigger area.'),
      choice('trap-formula', 'Bars `[3, 0, 2]`. How much water stays above the middle bar?',
        ['2', '3', '0', '5'],
        'Water above bar i = min(highest on the left, highest on the right) − height[i] = min(3, 2) − 0 = 2. The lower wall decides.'),
      choice('trap-side', 'Trapping Rain Water: `left_max = 3`, `right_max = 5`. Which side can you finish now?',
        ['The left side: somewhere on the right there is a wall of 5 > 3, so the water at l depends only on left_max', 'The right side, because 5 is bigger', 'Neither — you need every bar first', 'Both sides at once'],
        'The smaller maximum is the limit. Its side can be computed safely and that pointer moves. That is why one pass with O(1) memory is enough.'),
      choice('same-direction', 'Remove Duplicates in place (sorted array). What do the two pointers do?',
        ['A read pointer visits every item; a write pointer marks where the next new value goes', 'They start at both ends and meet in the middle', 'One pointer sorts, the other one deletes', 'They both jump two places each step'],
        'This is the **same-direction** shape. The write pointer only moves when a value is kept, so the kept values end up at the front in O(n) time and O(1) memory.'),
      choice('palindrome-memory', 'Valid Palindrome with two pointers (skipping non-alphanumeric characters) instead of building a cleaned string: what changes?',
        ['Extra memory goes from O(n) to O(1); time stays O(n)', 'Time goes from O(n) to O(1)', 'It becomes O(n²)', 'Nothing changes'],
        'The cleaned string and its reverse are new strings (O(n) memory). The pointers read the original string directly.'),
      choice('tp-signals', 'Which signal points most clearly to two pointers?',
        ['The input is sorted and you look for a pair, or you must work in place with O(1) memory', 'You must count how often each word appears', 'The input is a tree', 'You need the k largest items'],
        'Counting is a hash map, k largest is a heap. Sorted input, both ends, or in-place work are the classic two-pointer hints.'),
    ],
    code: [
      {
        id: 'sorted-squares',
        title: 'Squares of a Sorted Array',
        prompt: '`nums` is sorted and may contain negative numbers. Return the squares, sorted, in **O(n)** — do not call `sort`. The biggest square is always at one of the two ends.',
        starter: `def sorted_squares(nums):
    # your code here
    pass`,
        tests: `assert sorted_squares([-4, -1, 0, 3, 10]) == [0, 1, 9, 16, 100]
assert sorted_squares([-7, -3, 2, 3, 11]) == [4, 9, 9, 49, 121]
assert sorted_squares([1, 2]) == [1, 4]
assert sorted_squares([-3]) == [9]`,
        hint: 'Pointers at both ends; fill the answer from the back with the bigger of the two squares, then move that pointer.',
        solution: `def sorted_squares(nums):
    out = [0] * len(nums)
    l, r = 0, len(nums) - 1
    for i in range(len(nums) - 1, -1, -1):
        if abs(nums[l]) > abs(nums[r]):
            out[i] = nums[l] * nums[l]
            l += 1
        else:
            out[i] = nums[r] * nums[r]
            r -= 1
    return out`,
      },
      {
        id: 'move-zeroes',
        title: 'Move Zeroes',
        prompt: 'Move every `0` in `nums` to the end **in place**, keeping the order of the other numbers. Use a read pointer and a write pointer.',
        starter: `def move_zeroes(nums):
    # your code here
    pass`,
        tests: `a = [0, 1, 0, 3, 12]
move_zeroes(a)
assert a == [1, 3, 12, 0, 0], a
b = [0]
move_zeroes(b)
assert b == [0]
c = [1, 2, 3]
move_zeroes(c)
assert c == [1, 2, 3]`,
        hint: 'For each read index `r`: if `nums[r] != 0`, swap it with `nums[w]` and move `w`.',
        solution: `def move_zeroes(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w], nums[r] = nums[r], nums[w]
            w += 1`,
      },
    ],
    explain: [
      {
        id: 'two-pointer-proof',
        question: 'The interviewer asks: “Why is your two-pointer solution for Two Sum II correct? Could it skip the answer?” Prove it.',
        points: [
          'The array is sorted',
          'If the sum is too small, nums[l] plus any number at or left of r is too small, so nums[l] is in no answer → l += 1',
          'If the sum is too big, nums[r] is too big with any partner at or right of l → r -= 1',
          'Invariant: if an answer exists, it stays between l and r',
          'Each step removes one number: O(n) time, O(1) memory',
        ],
        answer: 'Because the array is sorted, every move removes a number that cannot be part of any answer. If `nums[l] + nums[r]` is smaller than the target, then `nums[l]` plus any number at or left of `r` is even smaller, so `nums[l]` cannot be in a solution and I can move `l`. If the sum is too big, `nums[r]` plus any number at or right of `l` is even bigger, so I drop `nums[r]`. So the invariant holds: if a pair exists, it is always between `l` and `r`, and I can never skip it. Every step removes one number, so it takes at most n steps — O(n) time and O(1) extra memory.',
      },
      {
        id: 'trap-explain',
        question: 'Explain Trapping Rain Water: the formula for one bar, the simple O(n) memory solution, and how two pointers bring the memory to O(1).',
        points: [
          'Water at i = min(max height on the left, max height on the right) − height[i] (never below 0)',
          'Simple version: precompute left_max[] and right_max[] arrays — O(n) time, O(n) memory',
          'Two pointers keep only left_max and right_max',
          'Move the side with the smaller max: its water is decided by that max, because the other side has a higher wall',
          'O(n) time, O(1) memory',
        ],
        answer: 'Water can stand above bar i only up to the lower of the highest wall on its left and the highest wall on its right, so the water there is `min(max_left, max_right) - height[i]`. The simple solution precomputes two arrays with the running maximum from the left and from the right — O(n) time but O(n) memory. With two pointers I keep just `left_max` and `right_max`. If `left_max < right_max`, I know there is a wall on the right at least as high as `right_max`, so the water at `l` is limited only by `left_max`: I add `left_max - height[l]` and move `l`. Otherwise I do the same on the right. Each bar is handled once: O(n) time and O(1) memory.',
      },
    ],
  },

  'dsa-sliding-window': {
    choice: [
      choice('sw-cost', 'Why is the sliding window O(n), even with a `while` loop inside the `for` loop?',
        ['Each index enters the window once (r) and leaves at most once (l): at most 2n moves in total', 'Because the while loop runs only once', 'Because Python loops are fast', 'It is O(n²)'],
        'Count the moves of each pointer over the whole run, not per step. This “amortized” argument is what interviewers want to hear.'),
      choice('sw-trace', PRINT, ['3', '2', '4', '1'],
        '"dvdf": the window grows to "dv", then "d" repeats, so `l` moves past the first "d"; "vdf" has length 3.',
        's = "dvdf"\nseen, l, best = set(), 0, 0\nfor r, ch in enumerate(s):\n    while ch in seen:\n        seen.remove(s[l])\n        l += 1\n    seen.add(ch)\n    best = max(best, r - l + 1)\nprint(best)'),
      choice('sw-not', 'Count the subarrays with sum exactly k, when numbers can be **negative**. Does a sliding window work?',
        ['No: adding or removing a number can move the sum up or down, so “shrink when too big” breaks. Use prefix sums + a hash map', 'Yes, the same as always', 'Yes, but only with a fixed size', 'No, you need a heap'],
        'A sliding window needs a rule that only gets worse as the window grows. Negative numbers break that. Prefix sums + a dict (Week 1) solve it in O(n).'),
      choice('stock-idea', 'Best Time to Buy and Sell Stock in one pass: what do you keep while you walk through the prices?',
        ['The cheapest price so far (and the best profit)', 'Every pair of days', 'The most expensive price so far', 'A sorted copy of the prices'],
        'Selling today, the best you can do is today’s price minus the cheapest earlier price. One variable is enough: O(n) time, O(1) memory.'),
      choice('replace-valid', 'Character Replacement with k = 1. Is the window "AABA" valid?',
        ['Yes: length 4 − most common count 3 = 1 change, and 1 ≤ k', 'No: it has two different letters', 'No: 4 > k', 'Yes, every window is valid'],
        'The rule: window length − count of its most common letter ≤ k. Those are exactly the letters you would change.'),
      choice('perm-size', 'Permutation in String: which kind of window, and how big?',
        ['A fixed-size window of len(s1)', 'A window that grows until it has every letter', 'A window of size k = 26', 'The whole of s2'],
        'A permutation of s1 has exactly len(s1) letters. Slide that window and compare 26 counts; each slide adds one letter and removes one.'),
      choice('minwin-shrink', 'Minimum Window Substring: when do you move `l`?',
        ['When the window contains everything in t — then shrink while it still does, saving the shortest', 'After every new character', 'Only at the end of the string', 'When the window has a repeated character'],
        'Grow until valid, then shrink while valid. Each shrink step tries a shorter answer.'),
      choice('deque-indexes', 'In Sliding Window Maximum, why does the deque store **indexes**, not values?',
        ['To know when the front has left the window (index ≤ i − k)', 'Indexes use less memory', 'Values cannot be compared', 'Python deques only hold ints'],
        'Two equal values may be in different places. With the index you always know if the front is still inside the window.'),
      choice('deque-pop', 'The deque holds values `[9, 5, 3]` (front to back) and 7 arrives. What does the deque look like after adding it?',
        ['[9, 7]', '[9, 5, 3, 7]', '[7]', '[9, 7, 5, 3]'],
        '5 and 3 are smaller and older than 7, so they can never be the maximum again — pop them from the back. 9 stays because it is bigger.'),
      choice('sw-vs-tp', 'How does a sliding window differ from opposite-end two pointers?',
        ['Both window pointers only move forward and the answer is the part between them', 'There is no difference', 'A sliding window needs sorted data', 'A sliding window always has size 2'],
        'Opposite-end pointers move towards each other (often on sorted data). A window moves left to right over contiguous data.'),
      choice('sw-rule', 'Before you write a variable-size window, what should you decide first?',
        ['The rule that makes a window valid (and what to update when a character comes in or goes out)', 'The size of the window', 'Whether to sort the string', 'Which hash function to use'],
        'With a clear validity rule, the template writes itself: grow, shrink while invalid, update the answer.'),
      choice('sw-jump', PRINT, ['3', '2', '4', '1'],
        'This version forgets to check `last[ch] >= l`. At the last "a", `l` jumps **back** to 1 and the window "bba" (with a repeat) is counted. The right answer for "abba" is 2.',
        'def buggy(s):\n    last, l, best = {}, 0, 0\n    for r, ch in enumerate(s):\n        if ch in last:\n            l = last[ch] + 1\n        last[ch] = r\n        best = max(best, r - l + 1)\n    return best\n\nprint(buggy("abba"))'),
    ],
    code: [
      {
        id: 'max-sum-k',
        title: 'Maximum sum of k neighbours',
        prompt: 'Return the biggest sum of `k` consecutive numbers in `nums` (numbers may be negative). Use a fixed-size window: add the new number, remove the one that left. O(n).',
        starter: `def max_sum_k(nums, k):
    # your code here
    pass`,
        tests: `assert max_sum_k([1, 12, -5, -6, 50, 3], 4) == 51
assert max_sum_k([5], 1) == 5
assert max_sum_k([-1, -2, -3], 2) == -3
assert max_sum_k([2, 1, 5, 1, 3, 2], 3) == 9`,
        hint: 'Start with `window = sum(nums[:k])`. For i from k: `window += nums[i] - nums[i - k]`.',
        solution: `def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best`,
      },
      {
        id: 'two-distinct',
        title: 'Longest part with at most two kinds',
        prompt: 'Return the length of the longest substring of `s` that has **at most 2 different characters**. Use a variable window and a dict of counts.',
        starter: `def longest_two_distinct(s):
    # your code here
    pass`,
        tests: `assert longest_two_distinct("eceba") == 3
assert longest_two_distinct("ccaabbb") == 5
assert longest_two_distinct("a") == 1
assert longest_two_distinct("") == 0
assert longest_two_distinct("abaccc") == 4`,
        hint: 'Add `s[r]` to the counts. While the dict has more than 2 keys, lower the count of `s[l]` (delete it at 0) and move `l`.',
        solution: `def longest_two_distinct(s):
    counts = {}
    l = best = 0
    for r, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        while len(counts) > 2:
            counts[s[l]] -= 1
            if counts[s[l]] == 0:
                del counts[s[l]]
            l += 1
        best = max(best, r - l + 1)
    return best`,
      },
    ],
    explain: [
      {
        id: 'window-template',
        question: 'Explain the sliding window template to an interviewer using Longest Substring Without Repeating Characters: the steps, the rule, and why it is O(n).',
        points: [
          'Window [l, r] over a contiguous part of the string',
          'Move r one step and add s[r]',
          'While the window is invalid (s[r] already inside), remove s[l] and move l',
          'Update the best length when the window is valid',
          'Each index enters once and leaves at most once → O(n); a set/dict of the window → O(k) memory',
        ],
        answer: 'I keep a window `[l, r]` and a set of the characters inside it. For each new index `r` I want to add `s[r]`. If it is already in the set, the window would have a repeat, so I remove `s[l]` and move `l` forward until the repeat is gone. Then I add `s[r]` and update the best length with `r - l + 1`. The pointers only move forward: `r` visits each index once and `l` visits each index at most once, so the total work is O(n) even though there is a while loop inside the for loop. The set holds at most the number of different characters. An improvement is to store the last index of each character in a dict and jump `l` straight past the repeat — but only if that index is inside the window.',
      },
      {
        id: 'min-window-explain',
        question: 'Walk through Minimum Window Substring: what you count, when you grow, when you shrink, and the complexity.',
        points: [
          'Count what t needs (a dict) and how many characters are still missing',
          'Grow r; when a needed character comes in, missing goes down',
          'When missing == 0 the window is valid: save it if it is the shortest, then shrink from l',
          'Stop shrinking when removing s[l] makes a needed character missing again',
          'O(|s| + |t|) time; each index enters and leaves once',
        ],
        answer: 'First I count the characters of `t` in a dict `need` and set `missing = len(t)`. I move `r` over `s`; when `s[r]` is a character that is still needed, `missing` goes down, and I lower its count in `need`. When `missing` reaches 0, the window contains everything, so I record it if it is shorter than the best so far and start moving `l`: I give `s[l]` back to `need`, and if that makes it needed again, `missing` goes up and the window is no longer valid, so I continue growing `r`. Every index is added once and removed at most once, so the time is O(|s| + |t|), and the dict holds at most the distinct characters.',
      },
    ],
  },
  'dsa-stack': {
    choice: [
      choice('lifo-print', PRINT, ['4 [1, 2]', '1 [2, 4]', '3 [1, 2, 4]', '4 [1, 2, 3]'],
        'After the loop the stack is `[1, 2, 3]`. `pop()` removes 3, `append(4)` puts 4 on top, and the last `pop()` takes the top again: 4. Last in, first out.',
        's = []\nfor x in [1, 2, 3]:\n    s.append(x)\ns.pop()\ns.append(4)\nprint(s.pop(), s)'),
      choice('pop-front', 'Why should a stack never use `list.pop(0)`?',
        ['It removes the first item and shifts every other item one place left: O(n)', 'It raises an error on an empty list, but `pop()` does not', 'It returns a copy, not the item', 'It works only on lists of numbers'],
        'A list keeps its items side by side in memory. Taking the first one means moving all the others: O(n). `append` and `pop()` work at the end: O(1).'),
      choice('paren-end', 'In Valid Parentheses, why do we finish with `return not stack` instead of `return True`?',
        ['An opening bracket left on the stack was never closed, like `"(("`', 'To free the memory of the stack', 'Because `pop()` may have failed', 'To handle strings with spaces'],
        'Every closer is checked during the loop, but nobody checks the openers that are still waiting. If any remain, the string is not valid.'),
      choice('paren-trace', PRINT, ["['(']", '[]', "['{']", "['{', '(']"],
        '`{[()]}` opens and closes completely, so the stack is empty again. The last `(` is pushed and never closed.',
        'stack = []\nfor ch in "{[()]}(":\n    if ch in "([{":\n        stack.append(ch)\n    else:\n        stack.pop()\nprint(stack)'),
      choice('minstack-idea', 'How does Min Stack return the minimum in O(1)?',
        ['Each item is stored with the smallest value of itself and everything below it', 'It sorts the stack after every push', 'It keeps one variable `min` and updates it on push and pop', 'It scans the stack but stops early'],
        'One variable is not enough: after you pop the minimum, you would not know the next one. Storing “minimum so far” with each item means the top always knows the answer, even after pops.'),
      choice('rpn-div', PRINT, ['-4 -3', '-3 -3', '-4 -4', '-3 -4'],
        '7 ÷ −2 = −3.5. `//` rounds **down** to −4. `int()` cuts off the decimals, which rounds **towards zero**: −3. Evaluate RPN wants −3.',
        'print(7 // -2, int(7 / -2))'),
      choice('rpn-order', 'In RPN, the tokens are `["10", "4", "-"]`. When you see `-`, what do the two pops give you?',
        ['First pop: 4 (the right operand), second pop: 10 — compute 10 - 4 = 6', 'First pop: 10, second pop: 4 — compute 10 - 4', 'First pop: 4, second pop: 10 — compute 4 - 10', 'Both numbers at once, in any order'],
        'The last number pushed is on top, so it comes out first, and it is the **right** side of the operator. For `+` and `*` the order does not matter; for `-` and `/` it does.'),
      choice('mono-cost', 'Daily Temperatures with a monotonic stack has a `while` inside a `for`. What is the time?',
        ['O(n): each index is pushed once and popped at most once', 'O(n²): the while loop can run n times for each day', 'O(n log n)', 'O(1)'],
        'Count the work per index instead of per loop: one push and at most one pop. That is at most 2n stack operations for the whole input.'),
      choice('mono-order', 'In Daily Temperatures, what is true about the temperatures of the days on the stack, from bottom to top?',
        ['They never go up: each one is not warmer than the one below it', 'They always go up', 'They are in random order', 'They are all equal'],
        'A warmer day pops every colder day before it is pushed. So the stack only holds days that are still waiting, from warmest (bottom) to coldest (top) — a [[monotonic stack]].'),
      choice('mono-trace', PRINT, ['[3]', '[0, 3]', '[0, 2, 3]', '[]'],
        '60 waits under 70. 65 pops 60 but not 70. 80 pops 65 and 70. Only day 3 is left waiting.',
        'temps = [70, 60, 65, 80]\nstack = []\nfor i, t in enumerate(temps):\n    while stack and temps[stack[-1]] < t:\n        stack.pop()\n    stack.append(i)\nprint(stack)'),
      choice('fleet', 'In Car Fleet, why do we look at the cars **closest to the target first**?',
        ['A car can only be slowed down by cars ahead of it, so the cars in front must be decided first', 'Because they are the fastest', 'To make the sort stable', 'Because the input is already sorted that way'],
        'Whether a car joins a fleet depends only on the fleet directly ahead. Going from the front backwards, you always know the arrival time of the fleet in front.'),
      choice('stack-signal', 'Which task is a stack the natural tool for?',
        ['Check that every HTML tag like `<div>` is closed in the right order', 'Find the shortest path out of a maze', 'Count how often each word appears', 'Find two numbers in a sorted array that add up to a target'],
        'Nested “open now, close later” structure is the stack signal. The maze is BFS with a queue, counting is a hash map, the sorted pair is two pointers.'),
    ],
    code: [
      {
        id: 'remove-adjacent',
        title: 'Remove All Adjacent Duplicates',
        prompt: 'Repeatedly remove two **equal letters next to each other** until none are left, and return the result. `"abbaca"` → remove `bb` → `"aaca"` → remove `aa` → `"ca"`. O(n) with a stack.',
        starter: `def remove_duplicates(s):
    # your code here
    pass`,
        tests: `assert remove_duplicates("abbaca") == "ca"
assert remove_duplicates("azxxzy") == "ay"
assert remove_duplicates("aaaa") == ""
assert remove_duplicates("abc") == "abc"
assert remove_duplicates("") == ""`,
        hint: 'For each letter: if it equals the top of the stack, pop; otherwise push. Join the stack at the end.',
        solution: `def remove_duplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)`,
      },
      {
        id: 'next-greater',
        title: 'Next Greater Element I',
        prompt: 'Every value of `nums1` also appears in `nums2` (all values are different). For each value of `nums1`, return the first **greater** value to its right **in `nums2`**, or -1. Walk `nums2` once with a monotonic stack and save the answers in a dict.',
        starter: `def next_greater(nums1, nums2):
    # your code here
    pass`,
        tests: `assert next_greater([4, 1, 2], [1, 3, 4, 2]) == [-1, 3, -1]
assert next_greater([2, 4], [1, 2, 3, 4]) == [3, -1]
assert next_greater([5], [5]) == [-1]
assert next_greater([3, 1], [3, 1, 2, 5]) == [5, 2]`,
        hint: 'Stack of values waiting for a greater one. When `x` is greater than the top, pop it and set `answer[top] = x`. At the end, look up each `nums1` value with `answer.get(v, -1)`.',
        solution: `def next_greater(nums1, nums2):
    answer = {}
    stack = []
    for x in nums2:
        while stack and stack[-1] < x:
            answer[stack.pop()] = x
        stack.append(x)
    return [answer.get(v, -1) for v in nums1]`,
      },
    ],
    explain: [
      {
        id: 'mono-explain',
        question: 'Explain how you solve Daily Temperatures in O(n): what the stack holds, when you pop, and why it is O(n) even with a loop inside a loop.',
        points: [
          'Brute force checks every later day: O(n²)',
          'The stack holds indexes of days still waiting for a warmer day; their temperatures never go up from bottom to top',
          'For a new day i: while it is warmer than the top day j, pop j and set answer[j] = i - j; then push i',
          'Each index is pushed once and popped at most once → O(n) time, O(n) memory in the worst case',
          'Days left on the stack at the end keep the answer 0',
        ],
        answer: 'The simple solution looks at every later day for each day, which is O(n²). Instead I walk the days once and keep a stack of indexes of days that have not found a warmer day yet. Because a warmer day removes every colder day before it is pushed, the temperatures on the stack never go up from bottom to top. For each new day `i`, while its temperature is higher than the day on top, that top day `j` has found its answer: I pop it and write `i - j`. Then I push `i`, because it is waiting too. Days still on the stack at the end never get a warmer day, so their answer stays 0. Every index is pushed once and popped at most once, so all the work together is O(n), and the stack is O(n) memory when the temperatures only go down.',
      },
      {
        id: 'min-stack-design',
        question: 'Design a stack that supports push, pop, top and get_min in O(1). Then: how would you also support get_max, and what does it cost in memory?',
        points: [
          'Store each value with the minimum of itself and everything below it',
          'get_min reads the top pair; pop restores the old minimum automatically',
          'A single min variable fails: after popping the minimum you do not know the next one',
          'get_max: store a third value, the maximum so far (or keep a second stack)',
          'Memory: O(n) extra; all operations stay O(1)',
        ],
        answer: 'I store pairs on a normal list: the value and the smallest value at that moment, which is `min(value, minimum of the pair below)`. `push`, `pop` and `top` work on the end of the list, and `get_min` just reads the second part of the top pair — all O(1). A single variable for the minimum is not enough, because after popping the minimum I would have to scan the stack to find the next one. Popping a pair brings back the previous minimum for free. To support `get_max` too, I store a third value, the largest so far, in the same way. The cost is O(n) extra memory — one or two extra numbers per item — and a version with a separate min stack that only grows when a new minimum arrives can save some of it.',
      },
    ],
  },
  'dsa-binary-search': {
    choice: [
      choice('bs-steps', 'At most how many steps does binary search need on 1,000,000 sorted items?',
        ['About 20', 'About 1,000', 'About 500,000', 'About 6'],
        'Each step halves the range: 2²⁰ ≈ 1,000,000, so about 20 steps. That is the power of [[logarithm|O(log n)]].'),
      choice('bs-trace', PRINT, ['[8, 4]', '[2, 4]', '[8, 6, 4]', '[6, 4]'],
        'The first middle is index 3 (8). 4 is smaller, so `hi = 2`; the next middle is index 1, which is 4.',
        'nums = [2, 4, 6, 8, 10, 12, 14]\nlo, hi = 0, len(nums) - 1\nseen = []\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    seen.append(nums[mid])\n    if nums[mid] == 4:\n        break\n    if nums[mid] < 4:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(seen)'),
      choice('bs-sorted', 'What must be true for binary search to work?',
        ['The data is sorted — or, more generally, the “yes/no” answers change only once (monotonic)', 'The data has no duplicates', 'The list length is a power of 2', 'The values are integers'],
        'Throwing away half is only safe if you can prove the answer is not in it. Sorted order (or a monotonic yes/no) gives you that proof.'),
      choice('bs-plusone', 'In the basic template, why `lo = mid + 1` and not `lo = mid`?',
        ['`mid` was already checked; without `+ 1` the range may stop shrinking and the loop never ends', 'To skip duplicates', 'Because Python indexes start at 0', 'It is only a style choice'],
        'When `lo` and `hi` are next to each other, `mid == lo`. `lo = mid` would change nothing, forever.'),
      choice('lower-bound', PRINT, ['1 4', '1 3', '3 4', '0 4'],
        '`bisect_left(a, x)` is the first index where `a[i] >= x`. The first 2 is at index 1. There is no 3, so it would be inserted before 5, at index 4.',
        'from bisect import bisect_left\na = [1, 2, 2, 2, 5]\nprint(bisect_left(a, 2), bisect_left(a, 3))'),
      choice('lower-hi', 'In the lower-bound template, why does `hi` start at `len(nums)` and not `len(nums) - 1`?',
        ['The target can be bigger than every item; then the answer is `len(nums)`, so it must be inside the range', 'To avoid an IndexError', 'Because the loop uses `<=`', 'To make the loop faster'],
        'A lower bound answers “where would it go?”, and “after the last item” is a real answer. The loop never reads `nums[len(nums)]` because `mid < hi` always.'),
      choice('answer-monotonic', 'When can you binary search **on the answer** (like Koko’s speed)?',
        ['When “x works” means every bigger x works too (or every smaller one)', 'Only when the input array is sorted', 'When the answer is a float', 'When n is small'],
        'The answers look like `no, no, yes, yes, yes`. Binary search finds the first “yes” in O(log(range)) checks.'),
      choice('koko-cost', 'Koko Eating Bananas: n piles, the biggest pile is m. What is the time of the binary-search solution?',
        ['O(n log m)', 'O(n · m)', 'O(log n)', 'O(m log n)'],
        'There are log m guesses of the speed, and each guess sums over all n piles.'),
      choice('rotated-min', 'Find Minimum in Rotated Sorted Array: what does `nums[mid] > nums[hi]` tell you?',
        ['The drop — and so the minimum — is to the right of `mid`', 'The minimum is at `mid`', 'The array is not rotated', 'The minimum is to the left of `mid`'],
        'In a sorted (not rotated) part, the left value is never bigger than the right. If `nums[mid] > nums[hi]`, the rotation point is between them.'),
      choice('matrix-index', 'You search a 3 × 4 matrix (3 rows, 4 columns) as one sorted list. Which cell is index 7?',
        ['Row 1, column 3', 'Row 2, column 1', 'Row 1, column 4', 'Row 2, column 3'],
        '`divmod(7, 4)` = `(1, 3)`: 7 // 4 = 1 full rows before it, 7 % 4 = column 3. Divide by the number of **columns**.'),
      choice('bs-overflow', 'Why do Java and C programmers write `lo + (hi - lo) / 2` instead of `(lo + hi) / 2`?',
        ['`lo + hi` can be bigger than the largest 32-bit int and wrap to a negative number', 'It rounds better', 'It is faster', 'It works for negative indexes'],
        'With huge arrays `lo + hi` can [[overflow]]. The Java library had this bug for years. Python ints never overflow.'),
      choice('bs-signal', 'Which problem is a binary search problem?',
        ['Find the smallest ship capacity that ships all packages within D days', 'Count the words in a text', 'Check if brackets are balanced', 'Find two numbers in an unsorted array with a given sum'],
        'If capacity c works, every bigger capacity works too — binary search on the answer. The others are a hash map, a stack and a hash map.'),
    ],
    code: [
      {
        id: 'first-bad-version',
        title: 'First Bad Version',
        prompt: 'Versions `1 … n`; once a version is bad, every later version is bad too. `is_bad(v)` tells you if version `v` is bad. Return the first bad version, calling `is_bad` as few times as possible (O(log n)).',
        starter: `def first_bad(n, is_bad):
    # your code here
    pass`,
        tests: `calls = []
def make(bad):
    def is_bad(v):
        calls.append(v)
        return v >= bad
    return is_bad

assert first_bad(5, make(4)) == 4
assert first_bad(1, make(1)) == 1
assert first_bad(10, make(1)) == 1
calls.clear()
assert first_bad(2 ** 31 - 1, make(1702766719)) == 1702766719
assert len(calls) <= 32`,
        hint: 'Lower bound on `[1, n]`: if `is_bad(mid)`, then `hi = mid`, else `lo = mid + 1`.',
        solution: `def first_bad(n, is_bad):
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      },
      {
        id: 'int-sqrt',
        title: 'Sqrt(x)',
        prompt: 'Return the square root of `x` (x ≥ 0) **rounded down**, without `**`, `math` or any built-in power function. O(log x).',
        starter: `def my_sqrt(x):
    # your code here
    pass`,
        tests: `assert my_sqrt(4) == 2
assert my_sqrt(8) == 2
assert my_sqrt(0) == 0
assert my_sqrt(1) == 1
assert my_sqrt(2147395599) == 46339`,
        hint: 'Find the **last** `m` with `m * m <= x`. Search `[0, x]`; when `mid * mid <= x`, remember it and go right.',
        solution: `def my_sqrt(x):
    lo, hi, best = 0, x, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return best`,
      },
    ],
    explain: [
      {
        id: 'bs-answer-explain',
        question: 'Explain “binary search on the answer” using Koko Eating Bananas: why it works, the search range, the check, and the complexity.',
        points: [
          'If speed k lets Koko finish in h hours, every faster speed does too: the answers are monotonic',
          'Range: 1 to max(piles) — at max(piles) each pile takes one hour, and h ≥ number of piles',
          'Check: hours = sum of ceil(pile / k); it works if hours ≤ h',
          'Lower bound: if it works, hi = mid (maybe slower works), else lo = mid + 1',
          'O(n log m) time, O(1) memory (n piles, m = biggest pile)',
        ],
        answer: 'There is no sorted array here, but the answers are sorted: if Koko can finish at speed k, she can also finish at any faster speed. So the speeds look like “too slow, too slow, … fast enough, fast enough”, and I want the first “fast enough”. The smallest possible speed is 1 and the largest I ever need is the biggest pile, because then each pile takes exactly one hour and h is at least the number of piles. For a guess `mid`, I add up `ceil(pile / mid)` for every pile; if the total is at most h, `mid` works and a slower speed might work too, so `hi = mid`; otherwise `lo = mid + 1`. When `lo == hi`, that is the answer. Each check is O(n) and there are about log m checks, so the total is O(n log m) with O(1) extra memory.',
      },
      {
        id: 'bs-bugs-explain',
        question: '“Binary search is easy to get wrong.” Which bugs do people make, and how do you avoid them?',
        points: [
          'Infinite loop: lo = mid (or hi = mid with <=) so the range stops shrinking',
          'Off by one: wrong start for hi (len - 1 vs len) or < vs <= — pick one template and keep it',
          'Overflow of lo + hi in Java/C (not in Python)',
          'Using it on data that is not sorted / not monotonic',
          'Test edge cases: empty, one item, target smaller and bigger than all, duplicates',
        ],
        answer: 'The most common bug is an infinite loop: one side is set to `mid` instead of `mid + 1` or `mid - 1`, so when the range has two items it never shrinks. The second is off-by-one: mixing `while lo <= hi` with `hi = mid`, or starting `hi` at `len(nums) - 1` when the answer can be `len(nums)`. I avoid both by using two fixed templates — the closed range `[lo, hi]` with `<=` and `±1` to find an exact value, and the half-open `[lo, hi)` with `<` and `hi = mid` for “the first position that fits” — and by saying the invariant: the answer is always inside the range. In Java or C, `lo + hi` can overflow, so they write `lo + (hi - lo) / 2`; Python does not have that problem. Finally, I check that the data really is sorted or monotonic, and I test an empty list, one item, a target smaller and bigger than everything, and duplicates.',
      },
    ],
  },
  'dsa-linked-list': {
    choice: [
      choice('ll-cost', 'What does it cost to read the item at index `i` of a linked list?',
        ['O(i) — you walk from the head, one node at a time', 'O(1), like a Python list', 'O(log n)', 'O(n²)'],
        'Nodes are not next to each other in memory, so there is no way to jump to node i. This is the price for O(1) inserts at a node you already hold.'),
      choice('ll-reverse-order', 'Reversing a list: inside the loop, which line must come **first**?',
        ['`nxt = cur.next`', '`cur.next = prev`', '`prev = cur`', '`cur = nxt`'],
        'Once `cur.next` points back to `prev`, the only way to reach the rest of the list is gone. Save it first.'),
      choice('dummy', 'Why do many linked-list solutions start with `dummy = ListNode(0)`?',
        ['The head may change or the result may be empty; a fake first node removes the special case', 'To make the list one longer', 'Python needs it to allocate memory', 'To store the length'],
        'With a [[dummy node]] you always attach to `tail.next` and return `dummy.next`, even if the real head was removed.'),
      choice('merge-trace', PRINT, ['3 4 None', '4 4 None', '3 None 4', '2 4 3'],
        'The loop takes 1 (from `a`), then 2 and 3 (from `b`). Now `b` is empty, so the loop stops: `tail` is 3 and `a` still holds 4.',
        'class Node:\n    def __init__(self, val, next=None):\n        self.val, self.next = val, next\na = Node(1, Node(4))\nb = Node(2, Node(3))\ndummy = tail = Node(0)\nwhile a and b:\n    if a.val <= b.val:\n        tail.next, a = a, a.next\n    else:\n        tail.next, b = b, b.next\n    tail = tail.next\nprint(tail.val, a.val if a else None, b)'),
      choice('middle', PRINT, ['4', '3', '5', '6'],
        'The same fast/slow idea with indexes: `fast` moves 2, `slow` moves 1. With an even length, `slow` stops at the **second** middle.',
        'vals = [1, 2, 3, 4, 5, 6]\nslow = fast = 0\nwhile fast < len(vals) and fast + 1 < len(vals):\n    slow += 1\n    fast += 2\nprint(vals[slow])'),
      choice('cycle-meet', 'In Floyd’s cycle detection, why must `fast` meet `slow` if there is a cycle?',
        ['Inside the cycle, fast gains one node per step, so the gap shrinks by one each step until it is 0', 'Because fast is twice as fast, it meets slow after exactly n steps', 'Because the list is sorted', 'It does not always meet; you also need a set'],
        'Once both are in the loop, think of fast chasing slow: each step closes the gap by exactly one, so it cannot jump over slow.'),
      choice('is-vs-eq', PRINT, ['True False', 'True True', 'False False', 'False True'],
        '`==` compares the **values**; `is` asks “the same object?”. Two nodes can hold equal values and still be different nodes — that is why cycle detection uses `is`.',
        'x = [1]\ny = [1]\nprint(x == y, x is y)'),
      choice('nth-end', 'Remove the n-th node from the end in one pass. What is the trick?',
        ['Move a pointer n steps ahead, then move both until the first one reaches the end', 'Reverse the list twice', 'Store all nodes in a dict', 'Walk the list n times'],
        'The gap between the two pointers stays n, so when the front one is at the end, the back one is just before the node to remove.'),
      choice('lru-structures', 'An LRU cache needs `get` and `put` in O(1). Which pair of structures does it use?',
        ['A dict (key → node) and a doubly linked list (order of use)', 'A sorted list and binary search', 'A heap and a set', 'Two stacks'],
        'The dict finds the node; the list moves it to the front and drops the oldest from the back, all in O(1).'),
      choice('doubly', 'Why does an LRU cache use a **doubly** linked list?',
        ['To remove a node from the middle in O(1) you need its previous node, and each node keeps `prev`', 'It uses less memory', 'So it can be sorted', 'Singly linked lists cannot hold strings'],
        'With only `next`, finding the node before a given node means walking from the head: O(n).'),
      choice('ll-vs-array', 'Java has `LinkedList`, but `ArrayList` is usually faster even for many inserts. Why?',
        ['Its values sit together in memory, which the CPU cache loves; linked nodes are spread around', 'ArrayList is written in C', 'LinkedList is not thread-safe', 'ArrayList never resizes'],
        'Big O hides the constant. Jumping between scattered nodes causes cache misses; scanning a packed array is very fast.'),
      choice('reorder', 'Reorder List (`1→2→3→4→5` becomes `1→5→2→4→3`) in O(1) extra memory. Which steps?',
        ['Find the middle with fast/slow, reverse the second half, then merge the two halves one by one', 'Sort the list', 'Copy into a Python list and rebuild it', 'Use recursion only'],
        'The three basic moves of this lesson combined. (Copying into a list also works, but it costs O(n) memory.)'),
    ],
    code: [
      {
        id: 'remove-elements',
        title: 'Remove Linked List Elements',
        prompt: 'Remove **every** node whose value equals `val` and return the new head. The head itself may need to be removed.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def remove_elements(head, val):
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

assert to_list(remove_elements(build([1, 2, 6, 3, 4, 5, 6]), 6)) == [1, 2, 3, 4, 5]
assert to_list(remove_elements(build([7, 7, 7, 7]), 7)) == []
assert to_list(remove_elements(build([1, 7, 7, 2]), 7)) == [1, 2]
assert remove_elements(None, 1) is None`,
        hint: 'Dummy node in front. `cur = dummy`; while `cur.next`: if `cur.next.val == val`, skip it (`cur.next = cur.next.next`), else move `cur`.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def remove_elements(head, val):
    dummy = ListNode(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next`,
      },
      {
        id: 'palindrome-list',
        title: 'Palindrome Linked List',
        prompt: 'Return `True` if the values read the same forwards and backwards. Aim for O(n) time and O(1) extra memory: find the middle, reverse the second half, compare.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def is_palindrome(head):
    # your code here
    pass`,
        tests: `def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

assert is_palindrome(build([1, 2, 2, 1])) is True
assert is_palindrome(build([1, 2, 3, 2, 1])) is True
assert is_palindrome(build([1, 2])) is False
assert is_palindrome(build([1])) is True
assert is_palindrome(None) is True`,
        hint: 'Fast/slow to the middle. Reverse from `slow`. Walk the first half and the reversed half together and compare values.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def is_palindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, slow.next
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    return True`,
      },
    ],
    explain: [
      {
        id: 'll-reverse-explain',
        question: 'Explain how you reverse a singly linked list in place. Then: how would you do it with recursion, and what does that cost?',
        points: [
          'Two pointers: prev = None, cur = head',
          'Each step: save next, point cur.next to prev, move prev and cur forward',
          'At the end prev is the new head; O(n) time, O(1) memory',
          'Recursive: reverse the rest, then head.next.next = head and head.next = None',
          'Recursion uses O(n) stack memory and can hit Python’s recursion limit on long lists',
        ],
        answer: 'I keep two pointers, `prev` starting at `None` and `cur` at the head. In each step I first save `cur.next`, because I am about to overwrite it; then I point `cur.next` back to `prev`, and move both pointers one step: `prev` becomes `cur`, `cur` becomes the saved next node. When `cur` is `None`, every arrow has been turned around and `prev` is the new head. That is O(n) time and O(1) extra memory. Recursively, I reverse everything after the head first, which returns the new head; then the old second node points back to the old head with `head.next.next = head`, and I cut `head.next = None`. It is elegant, but every node adds a stack frame, so it uses O(n) memory and in Python a list with a few thousand nodes hits the recursion limit — I prefer the loop.',
      },
      {
        id: 'lru-explain',
        question: 'Design an LRU cache with `get(key)` and `put(key, value)`, both O(1), and a fixed capacity.',
        points: [
          'A dict from key to node gives O(1) lookup',
          'A doubly linked list keeps the order of use: most recent at one end, least recent at the other',
          'get: find the node, move it to the recent end, return the value (or -1)',
          'put: update or insert at the recent end; if over capacity, remove the least recent node and its key',
          'Dummy head and tail nodes avoid special cases; Python’s OrderedDict does the same thing',
        ],
        answer: 'I combine two structures. A dict maps each key to a node, so I can find any entry in O(1). The nodes form a doubly linked list ordered by use: the most recently used node sits next to the tail, the least recently used next to the head. I put dummy head and tail nodes at both ends, so inserting and removing never need special cases. For `get`, I look up the node; if it is missing I return -1, otherwise I unlink it — O(1) because it knows its `prev` and `next` — and insert it before the tail, then return its value. For `put`, if the key exists I update the value and move the node; if not, I create a node, add it before the tail and to the dict, and if the size is now over capacity I remove the node after the dummy head and delete its key from the dict. In Python, `OrderedDict` with `move_to_end` and `popitem(last=False)` is exactly this design.',
      },
    ],
  },
  'dsa-trees': {
    choice: [
      choice('tree-depth', PRINT, ['3', '2', '4', '5'],
        'The longest root-to-leaf path is 1 → 2 → 4: three nodes. The recursion returns 1 + the bigger depth of the two children.',
        'class T:\n    def __init__(self, v, l=None, r=None):\n        self.v, self.l, self.r = v, l, r\ndef depth(n):\n    return 0 if n is None else 1 + max(depth(n.l), depth(n.r))\nroot = T(1, T(2, T(4), T(5)), T(3))\nprint(depth(root))'),
      choice('orders', PRINT, ['[1, 2, 4, 5, 3]', '[4, 2, 5, 1, 3]', '[4, 5, 2, 3, 1]', '[1, 2, 3, 4, 5]'],
        'Pre-order: the node first, then the whole left subtree, then the right subtree.',
        'class T:\n    def __init__(self, v, l=None, r=None):\n        self.v, self.l, self.r = v, l, r\ndef pre(n):\n    return [n.v] + pre(n.l) + pre(n.r) if n else []\nroot = T(1, T(2, T(4), T(5)), T(3))\nprint(pre(root))'),
      choice('inorder-bst', 'Which traversal gives the values of a binary search tree in sorted order?',
        ['In-order (left, node, right)', 'Pre-order (node, left, right)', 'Post-order (left, right, node)', 'Level order (BFS)'],
        'Everything left of a node is smaller and everything right is bigger, so “left, node, right” visits values from small to big.'),
      choice('bfs-queue', 'BFS on a tree uses `collections.deque` with `popleft()`. Why not a list with `pop(0)`?',
        ['`pop(0)` shifts every item, O(n) each time; `popleft()` is O(1)', '`pop(0)` returns the last item', 'Lists cannot hold nodes', 'There is no difference'],
        'A queue takes from the front. On a list that costs O(n) per pop, making BFS O(n²) on a big tree.'),
      choice('bfs-print', PRINT, ['[[1], [2, 3], [4, 5]]', '[[1], [2, 3, 4, 5]]', '[[1, 2, 3], [4, 5]]', '[1, 2, 3, 4, 5]'],
        'Each round handles exactly `len(queue)` nodes — the current level — and adds the next level to the back.',
        'from collections import deque\nclass T:\n    def __init__(self, v, l=None, r=None):\n        self.v, self.l, self.r = v, l, r\nroot = T(1, T(2, T(4), T(5)), T(3))\nlevels, q = [], deque([root])\nwhile q:\n    level = []\n    for _ in range(len(q)):\n        n = q.popleft()\n        level.append(n.v)\n        q.extend(c for c in (n.l, n.r) if c)\n    levels.append(level)\nprint(levels)'),
      choice('dfs-vs-bfs', 'Minimum Depth of Binary Tree (the shortest path to a leaf): why is BFS a good fit?',
        ['BFS reaches nodes level by level, so the first leaf it meets is the shallowest — it can stop early', 'BFS uses less memory than DFS in every tree', 'DFS cannot find leaves', 'BFS sorts the nodes'],
        'DFS must explore the whole tree to be sure; BFS can return as soon as it finds a leaf.'),
      choice('bst-rule', 'Which tree is **not** a valid BST?',
        ['Root 5, left child 3, right child 7, and 7 has a left child 4', 'Root 5, left 3, right 7', 'Root 5, left 3, and 3 has a right child 4', 'A single node 5'],
        '4 is smaller than 7 (fine for its parent) but it is in the **right** subtree of 5, where every value must be bigger than 5. Checking only parent and child misses this.'),
      choice('bst-cost', 'You insert 1, 2, 3, …, 1000 into a plain BST, in that order. How long is a search now?',
        ['O(n): every node has only a right child, so the tree is a line of height 1000', 'O(log n)', 'O(1)', 'O(n log n)'],
        'BST speed depends on the height. Sorted inserts make the worst shape. Balanced trees (red-black, AVL) fix the height at about log n.'),
      choice('recursion-cost', 'A recursive DFS on a tree with n nodes and height h. Time and extra memory?',
        ['O(n) time, O(h) memory for the call stack', 'O(h) time, O(n) memory', 'O(n log n) time, O(1) memory', 'O(n) time, O(1) memory'],
        'Every node is visited once. At any moment the call stack holds one frame per level of the current path: h frames (log n balanced, n for a line).'),
      choice('diameter', 'In Diameter of Binary Tree, what does the recursive function **return**, and what does it **record**?',
        ['It returns the height of the subtree; it records the best `left height + right height` seen so far', 'It returns the diameter and records the height', 'It returns the number of nodes', 'It returns a list of paths'],
        'The parent needs the height to continue; the longest path may bend at any node, so you record it on the side.'),
      choice('invert', PRINT, ['[1, 3, 2, 5, 4]', '[1, 2, 4, 5, 3]', '[3, 1, 2, 5, 4]', '[1, 3, 2, 4, 5]'],
        'Inverting swaps the children of every node: 3 is now on the left, and 2’s children are swapped (5, then 4).',
        'class T:\n    def __init__(self, v, l=None, r=None):\n        self.v, self.l, self.r = v, l, r\ndef invert(n):\n    if n:\n        n.l, n.r = invert(n.r), invert(n.l)\n    return n\ndef pre(n):\n    return [n.v] + pre(n.l) + pre(n.r) if n else []\nprint(pre(invert(T(1, T(2, T(4), T(5)), T(3)))))'),
      choice('lca-bst', 'Lowest Common Ancestor in a **BST** of `p` and `q`: when do you stop at the current node?',
        ['When p and q are on different sides of it (or one of them is the node itself)', 'When the node is a leaf', 'When both are smaller than the node', 'Only at the root'],
        'If both are smaller, the answer is in the left subtree; both bigger, the right subtree. The first node where they split is the answer: O(h).'),
    ],
    code: [
      {
        id: 'average-levels',
        title: 'Average of Levels',
        prompt: 'Return the average value of the nodes on each level, top to bottom, as floats. Use BFS.',
        starter: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def average_of_levels(root):
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

assert average_of_levels(build([3, 9, 20, None, None, 15, 7])) == [3.0, 14.5, 11.0]
assert average_of_levels(build([3, 9, 20, 15, 7])) == [3.0, 14.5, 11.0]
assert average_of_levels(build([5])) == [5.0]
assert average_of_levels(None) == []`,
        hint: 'Level-order template; for each level sum the values and divide by the number of nodes in that level.',
        solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def average_of_levels(root):
    out, queue = [], deque([root] if root else [])
    while queue:
        size, total = len(queue), 0
        for _ in range(size):
            node = queue.popleft()
            total += node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(total / size)
    return out`,
      },
      {
        id: 'symmetric-tree',
        title: 'Symmetric Tree',
        prompt: 'Return `True` if the tree is a mirror of itself around its centre.',
        starter: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_symmetric(root):
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

assert is_symmetric(build([1, 2, 2, 3, 4, 4, 3])) is True
assert is_symmetric(build([1, 2, 2, None, 3, None, 3])) is False
assert is_symmetric(build([1])) is True
assert is_symmetric(build([1, 2, 3])) is False
assert is_symmetric(None) is True`,
        hint: 'Write `mirror(a, b)`: both None → True; one None → False; else equal values and `mirror(a.left, b.right)` and `mirror(a.right, b.left)`.',
        solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_symmetric(root):
    def mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return root is None or mirror(root.left, root.right)`,
      },
    ],
    explain: [
      {
        id: 'dfs-bfs-explain',
        question: '“DFS or BFS?” Explain how each one walks a tree, what it uses, its memory, and one problem where each is the better choice.',
        points: [
          'DFS goes deep first: recursion (the call stack) or an explicit stack; pre/in/post order',
          'BFS goes level by level with a queue (deque)',
          'Both O(n) time; DFS memory O(height), BFS memory O(widest level)',
          'BFS: levels, right side view, minimum depth — it can stop at the first leaf',
          'DFS: path sums, subtree answers (height, diameter), BST in-order; deep trees → iterative DFS',
        ],
        answer: 'Depth-first search follows one branch all the way down before it comes back, either with recursion — the call stack remembers where to return — or with my own stack. Depending on when I handle the node, it is pre-order, in-order or post-order. Breadth-first search visits the tree level by level using a queue, a `deque`, and reading `len(queue)` at the start of each round gives me exactly one level. Both visit every node once, so both are O(n) time. DFS keeps one path in memory, O(height); BFS keeps a whole level, which can be about n / 2 nodes in a full tree. I choose BFS for level questions — level order, right side view — and for “the nearest” or minimum depth, because it reaches shallow nodes first and can stop early. I choose DFS when the answer is built from subtrees, like height, diameter or path sums, and for in-order walks of a BST. For a very deep tree in Python I write DFS with an explicit stack to avoid the recursion limit.',
      },
      {
        id: 'bst-explain',
        question: 'What is a binary search tree, how do you check that a tree is a valid BST, and why can a BST become slow?',
        points: [
          'Rule: every value in the left subtree < node < every value in the right subtree',
          'Search goes left or right at each node: O(height)',
          'Validate by passing an allowed range (low, high) down the recursion — comparing only with children is wrong',
          'Or: an in-order walk must be strictly increasing',
          'Sorted inserts make it a line (height n, O(n)); balanced trees (red-black, AVL, B-trees) keep the height ~log n',
        ],
        answer: 'A binary search tree is a binary tree with one rule: everything in a node’s left subtree is smaller than the node, and everything in its right subtree is bigger. Because of that, a search compares with the node and goes left or right, like binary search, so it costs O(height). To check that a tree is valid it is not enough to compare each node with its two children — a value deep in the right subtree can still be smaller than the root. I pass an allowed range down: the root may be anything, going left the upper limit becomes the node’s value, going right the lower limit becomes it, and every node must be strictly inside its range. Another way is an in-order walk, which must give strictly increasing values. The weakness is the shape: if I insert values in sorted order, every node gets only a right child, the height becomes n and search becomes O(n). That is why real systems use self-balancing trees — red-black trees in Java’s `TreeMap`, B-trees in database indexes — which keep the height near log n.',
      },
    ],
  },
}
