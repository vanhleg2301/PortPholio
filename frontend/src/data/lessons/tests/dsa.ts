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
}
