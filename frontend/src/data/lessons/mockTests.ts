import type { TaskLink } from '../roadmap/types'
import type { CodeQuestion, ExplainQuestion } from './types'

// Interview-style tests on the test day of a week (Sunday) or at the end of a month.
// Quiz questions are drawn from the lessons already taught that week (or month); the coding
// tasks and interview questions below are new, so they test the pattern, not memory of a lesson.
// Progress rows use `mock-<date>` as their lesson id, with the same item ids as a lesson test.
export type MockKind = 'week' | 'month'

export interface MockTest {
  kind: MockKind
  title: string
  // Suggested time for the whole test. The timer only shows the time; it never locks anything.
  minutes: number
  quizSize: number
  code: CodeQuestion[]
  explain: ExplainQuestion[]
}

const leet = (title: string, slug: string): TaskLink => ({ label: `LeetCode: ${title}`, url: `https://leetcode.com/problems/${slug}/` })

export const MOCK_TESTS: Record<string, MockTest> = {
  '2026-11-22': {
    kind: 'week',
    title: 'Week 1 mock interview',
    minutes: 40,
    quizSize: 12,
    code: [
      {
        id: 'first-unique',
        title: 'First Unique Character',
        prompt: 'Return the index of the first character in `s` that appears **exactly once**, or -1 if there is none. Say the time and memory before you code.',
        starter: `def first_unique(s):
    # your code here
    pass`,
        tests: `assert first_unique("leetcode") == 0
assert first_unique("loveleetcode") == 2
assert first_unique("aabb") == -1
assert first_unique("") == -1
assert first_unique("z") == 0`,
        hint: 'Two passes: count every character with a `Counter`, then walk `s` again and return the first index whose count is 1.',
        solution: `from collections import Counter

def first_unique(s):
    counts = Counter(s)
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1`,
        ref: leet('First Unique Character in a String', 'first-unique-character-in-a-string'),
      },
    ],
    explain: [
      {
        id: 'hash-o1',
        question: '“Why is looking up a key in a dict O(1)? Is it always O(1)?”',
        points: [
          'The key is hashed to a number that picks a slot in an array, so you jump straight to it',
          'O(1) on average, not always: collisions put several keys in the same place',
          'Many collisions (bad hash or attacker-chosen keys) → O(n) in the worst case',
          'Growing the table costs O(n) once in a while, but amortized append/insert stays O(1)',
          'Keys must be hashable (immutable), e.g. a tuple, not a list',
        ],
        answer: 'A dict is a hash table. Python turns the key into a number with its hash, and that number picks a slot in an internal array, so it can jump straight to the right place instead of scanning — that is why a lookup is O(1) on average. It is not a promise for every case: two keys can land on the same slot, a collision, and then Python has to check more than one entry. With a bad hash function, or keys chosen by an attacker, many keys collide and a lookup can become O(n); Python randomizes string hashes partly for this reason. When the table gets too full it is rebuilt into a bigger one, which costs O(n) once, but spread over all inserts it is still O(1) amortized. The key must be hashable, so a tuple works and a list does not.',
      },
      {
        id: 'far-api',
        question: 'Users in Vietnam call your API in the US. Each call takes about 600 ms, but the server spends only 20 ms. Where does the time go, and what would you do?',
        points: [
          'Most of the time is round trips: the RTT across the Pacific is about 150–200 ms',
          'A new HTTPS connection costs TCP + TLS handshakes before the request (≈ 3 RTTs)',
          'Reuse connections: keep-alive / a connection pool, so only the first call pays the handshakes',
          'Fewer calls: batch requests, return everything the screen needs in one response',
          'Move closer: a CDN or a server region in Asia; cache responses that do not change',
        ],
        answer: 'The server is not the problem — 20 ms out of 600 ms. The time goes into round trips: between Vietnam and the US one round trip is around 150 to 200 ms. If every call opens a new HTTPS connection, it pays the TCP handshake and the TLS handshake before the request even starts, so about three round trips, which is roughly the 600 ms we see. First I would reuse connections with keep-alive or a connection pool, so only the first call pays for the handshakes. Then I would cut the number of calls by batching, so one screen needs one request instead of five. Finally I would move the data closer: a CDN for anything cacheable, and maybe a server region in Asia, because no code can beat the speed of light.',
      },
    ],
  },
  '2026-11-29': {
    kind: 'week',
    title: 'Week 2 mock interview',
    minutes: 40,
    quizSize: 12,
    code: [
      {
        id: 'is-subsequence',
        title: 'Is Subsequence',
        prompt: 'Return `True` if `s` is a **subsequence** of `t`: you can get `s` by deleting some characters of `t` without changing the order of the rest. `"ace"` is a subsequence of `"abcde"`, `"aec"` is not. O(len(t)) time, O(1) memory.',
        starter: `def is_subsequence(s, t):
    # your code here
    pass`,
        tests: `assert is_subsequence("abc", "ahbgdc") is True
assert is_subsequence("axc", "ahbgdc") is False
assert is_subsequence("", "abc") is True
assert is_subsequence("abc", "") is False
assert is_subsequence("aa", "ab") is False`,
        hint: 'One index `i` in `s`. Walk over `t`; when `t[j] == s[i]`, move `i`. At the end, check `i == len(s)`.',
        solution: `def is_subsequence(s, t):
    i = 0
    for ch in t:
        if i < len(s) and ch == s[i]:
            i += 1
    return i == len(s)`,
        ref: leet('Is Subsequence', 'is-subsequence'),
      },
    ],
    explain: [
      {
        id: 'tp-vs-sw',
        question: '“How do you tell if a problem needs two pointers or a sliding window?” Give the signals and one example of each.',
        points: [
          'Both replace nested loops with indexes that only move forward → O(n)',
          'Two pointers: sorted input, compare both ends, or rewrite in place (Two Sum II, Valid Palindrome)',
          'Sliding window: a contiguous subarray/substring with a condition — longest/shortest/count (Longest Substring Without Repeating Characters)',
          'The window must have a rule: grow on the right, shrink on the left while it is invalid',
          'Negative numbers break “shrink to lower the sum” → use prefix sums + hash map instead',
        ],
        answer: 'Both patterns replace two nested loops with indexes that only move forward, so both are usually O(n). I think of two pointers when the input is sorted or can be sorted, when I compare items from the two ends, or when I must change an array in place with O(1) memory — Two Sum II is the classic: if the sum is too small, the left number can never be in the answer, so I move the left pointer. I think of a sliding window when the question is about a contiguous part — the longest, shortest or number of substrings or subarrays that meet a condition, like the longest substring without repeating characters. The window grows on the right and shrinks on the left while it breaks the rule. One warning: the window only works if shrinking moves the condition the right way. With negative numbers and “sum equals k”, it does not, and I switch to prefix sums with a hash map.',
      },
      {
        id: 'wifi-https',
        question: 'You are on public Wi-Fi and open your bank over HTTPS. What can someone on the same Wi-Fi see, what can they not see, and what stops them from pretending to be the bank?',
        points: [
          'They see that you connect to the bank: the IP, the name (DNS and SNI), sizes and timing',
          'They cannot see paths, headers, cookies, passwords or page content: all encrypted with the session key',
          'Changing the data is detected (integrity)',
          'The certificate, signed by a trusted CA and checked for the name and expiry, stops a fake bank',
          'Forward secrecy: recorded traffic stays safe even if the server key leaks later',
        ],
        answer: 'They can see that I am talking to my bank: the IP address, the site name from the DNS lookup and from SNI in the TLS handshake, and how much data goes back and forth and when. They cannot see which pages I open, my cookies, my password or my balance — everything after the handshake is encrypted with a session key that only my browser and the bank know, and if they change a byte, the change is detected. To pretend to be the bank they would need a certificate for the bank’s name signed by an authority my browser trusts; the browser checks the signature chain, the name and the expiry date, so a fake server fails and I get a big warning. And because the key exchange uses temporary secrets, even recording the traffic now and stealing the bank’s private key later would not let them read it.',
      },
    ],
  },
  '2026-12-06': {
    kind: 'week',
    title: 'Week 3 mock interview',
    minutes: 40,
    quizSize: 12,
    code: [
      {
        id: 'backspace-compare',
        title: 'Backspace String Compare',
        prompt: 'In `s` and `t`, `#` means Backspace: it deletes the character before it (if there is one). Return `True` if both strings are equal after typing them. `"ab#c"` → `"ac"`.',
        starter: `def backspace_compare(s, t):
    # your code here
    pass`,
        tests: `assert backspace_compare("ab#c", "ad#c") is True
assert backspace_compare("ab##", "c#d#") is True
assert backspace_compare("a#c", "b") is False
assert backspace_compare("#a", "a") is True
assert backspace_compare("abc", "abd") is False`,
        hint: 'Write `build(text)`: push letters on a stack, pop on `#` if the stack is not empty. Compare the two results.',
        solution: `def backspace_compare(s, t):
    def build(text):
        stack = []
        for ch in text:
            if ch == "#":
                if stack:
                    stack.pop()
            else:
                stack.append(ch)
        return stack
    return build(s) == build(t)`,
        ref: leet('Backspace String Compare', 'backspace-string-compare'),
      },
    ],
    explain: [
      {
        id: 'stack-when',
        question: '“When do you reach for a stack?” Give three signals in a problem, and one place stacks are used in real software.',
        points: [
          'Nested “open now, close later” structure: brackets, tags, function calls',
          'The most recent item must be handled first (LIFO): undo, Back button',
          '“Next greater / smaller element” → monotonic stack, O(n) because each item is pushed and popped once',
          'Expression evaluation (RPN, calculators)',
          'Real software: the call stack in error traces, parsers for JSON/HTML, undo/redo, turning recursion into a loop',
        ],
        answer: 'I reach for a stack when the most recent thing must be dealt with first. The first signal is nesting: brackets, HTML tags or function calls, where whatever opened last must close first — Valid Parentheses is the example. The second is undo or “go back” behaviour, where you return to the previous state. The third is the “next greater or next smaller element” family, like Daily Temperatures: items wait on a monotonic stack until a bigger one arrives, and because each item is pushed and popped once it is O(n) instead of O(n²). Expression evaluation, like Reverse Polish Notation, is a fourth. In real software the call stack is the one everyone meets: an error trace is the stack of function calls. JSON and HTML parsers, undo and redo in editors, and turning deep recursion into a loop all use stacks too.',
      },
      {
        id: 'status-retry',
        question: 'Explain 401 vs 403 and 502 vs 504. Which of these four should a client retry automatically?',
        points: [
          '401: not authenticated (no or bad login/token); 403: authenticated but not allowed',
          '502: the proxy got a bad answer or no connection from the app behind it',
          '504: the proxy waited and got no answer in time (slow app or database)',
          'Do not retry 401/403 automatically: the request must change (log in, get permission); 401 may refresh the token once',
          'Retry 502/504 with backoff — but only idempotent requests, or with an idempotency key',
        ],
        answer: '401 means the server does not know who I am — no token, or an expired one. 403 means it knows exactly who I am, and I am not allowed to do this. 502 and 504 both come from a proxy or load balancer in front of the app: 502 means it got a bad answer or could not connect at all, for example because the app crashed; 504 means it waited and the app did not answer in time, often because of a slow query. A client should not blindly retry 401 or 403, because the same request will fail again — for 401 it can refresh the token once and then try again, for 403 it should show an error. 502 and 504 are server-side and often temporary, so retrying with a growing delay makes sense, but only for idempotent methods like GET and PUT, or for a POST that carries an idempotency key.',
      },
    ],
  },
  '2026-12-13': {
    kind: 'month',
    title: 'Month 1 mock interview',
    minutes: 75,
    quizSize: 20,
    code: [
      {
        id: 'sorted-squares',
        title: 'Squares of a Sorted Array (Easy)',
        prompt: '`nums` is sorted and may contain negative numbers. Return the squares of all numbers, **sorted**. Squaring and sorting is O(n log n) — do it in O(n). Explain your idea first.',
        starter: `def sorted_squares(nums):
    # your code here
    pass`,
        tests: `assert sorted_squares([-4, -1, 0, 3, 10]) == [0, 1, 9, 16, 100]
assert sorted_squares([-7, -3, 2, 3, 11]) == [4, 9, 9, 49, 121]
assert sorted_squares([1, 2, 3]) == [1, 4, 9]
assert sorted_squares([-3, -2, -1]) == [1, 4, 9]
assert sorted_squares([]) == []`,
        hint: 'The biggest square is at one of the two ends. Two pointers at both ends; put the bigger square at the **end** of the result and move that pointer.',
        solution: `def sorted_squares(nums):
    out = [0] * len(nums)
    l, r = 0, len(nums) - 1
    for k in range(len(nums) - 1, -1, -1):
        if abs(nums[l]) > abs(nums[r]):
            out[k] = nums[l] * nums[l]
            l += 1
        else:
            out[k] = nums[r] * nums[r]
            r -= 1
    return out`,
        ref: leet('Squares of a Sorted Array', 'squares-of-a-sorted-array'),
      },
      {
        id: 'asteroid-collision',
        title: 'Asteroid Collision (Medium)',
        prompt: 'Each number is an asteroid: the size is `abs(x)`, the sign is the direction (positive = right, negative = left). When a right-moving asteroid meets a left-moving one, the smaller one explodes; if they are equal, both explode. Asteroids moving the same way never meet. Return what is left. O(n).',
        starter: `def asteroid_collision(asteroids):
    # your code here
    pass`,
        tests: `assert asteroid_collision([5, 10, -5]) == [5, 10]
assert asteroid_collision([8, -8]) == []
assert asteroid_collision([10, 2, -5]) == [10]
assert asteroid_collision([-2, -1, 1, 2]) == [-2, -1, 1, 2]
assert asteroid_collision([1, -2, -2, -2]) == [-2, -2, -2]`,
        hint: 'Stack of survivors. A new negative asteroid fights the top while the top is positive: pop smaller tops; if equal, pop and stop; if the top is bigger, the new one dies. If it survives, push it.',
        solution: `def asteroid_collision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
            elif stack[-1] == -a:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(a)
    return stack`,
        ref: leet('Asteroid Collision', 'asteroid-collision'),
      },
    ],
    explain: [
      {
        id: 'm1-patterns',
        question: '“You get a new array or string problem. How do you choose between a hash map, two pointers, a sliding window and a stack?” Give the signal for each.',
        points: [
          'Hash map: “have I seen this before?”, counting, grouping, pairs that sum to a target (unsorted)',
          'Two pointers: sorted input, compare both ends, in-place with O(1) memory',
          'Sliding window: longest/shortest/count of a contiguous part with a condition',
          'Stack: nesting, undo, “next greater/smaller element”',
          'Always start from brute force, name its cost, then say which pattern removes the inner loop',
        ],
        answer: 'I start with the brute force and its cost, usually O(n²), and then ask what the inner loop is doing. If it searches for something I have seen before — a complement in Two Sum, a count, a group of anagrams — a hash map makes that search O(1). If the input is sorted, or I compare elements from both ends, or I must work in place, two pointers let me throw away one element at each step. If the question is about a contiguous subarray or substring — the longest, the shortest, or how many meet a rule — a sliding window grows on the right and shrinks on the left. If there is nesting, like brackets, or I need the next greater or smaller element, a stack keeps the items that are still waiting. In every case I explain why each element is processed a constant number of times, which is what makes the solution O(n).',
      },
      {
        id: 'm1-url',
        question: '“What happens when you type `https://shop.example.com` and press Enter?” Cover DNS, TCP, TLS and HTTP, and count the round trips before the first byte of HTML.',
        points: [
          'DNS: caches → recursive resolver → root → .com → authoritative; 0 RTT if cached, several if not',
          'TCP three-way handshake: 1 RTT',
          'TLS 1.3 handshake: 1 RTT (2 with TLS 1.2); certificate check and key exchange',
          'HTTP GET with Host and cookies; the response: status, headers, body: 1 RTT + server time',
          'About 3 RTTs + DNS for a new connection; slow start and more files add more; keep-alive / HTTP/2 reuse the connection',
        ],
        answer: 'The browser first needs an IP address. It checks its own cache and the OS cache; on a miss a recursive resolver answers from its cache or asks the root servers, then the `.com` servers, then the domain’s authoritative name server, and the answer is cached for its TTL. That is zero round trips when cached and several when not. With the IP, TCP opens the connection with SYN, SYN-ACK, ACK: one round trip. Then the TLS 1.3 handshake checks the certificate — signed by a trusted authority, right name, not expired — and agrees on a session key: one more round trip, two with TLS 1.2. Now the browser sends `GET /` with the `Host` header and any cookies, and the first bytes of the response — the status line, headers like `Content-Type` and `Cache-Control`, then the HTML — arrive one round trip later plus the server time. So a new connection costs about three round trips plus DNS before the first byte. Slow start adds round trips for a big page, and the CSS, JS and images reuse the same connection thanks to keep-alive or HTTP/2.',
      },
      {
        id: 'm1-tcp-udp',
        question: 'You are building two features: a video call and a file upload. TCP, UDP or QUIC for each, and why?',
        points: [
          'File upload: every byte must arrive in order → TCP (HTTP over TCP, or HTTP/3 over QUIC)',
          'Video call: late data is useless; waiting for resends causes freezes → UDP (WebRTC uses UDP)',
          'The app decides what to do with loss: skip a frame, lower quality',
          'QUIC gives reliability per stream on UDP, faster setup, no head-of-line blocking between streams',
          'Trade-off: reliability and order vs. low latency',
        ],
        answer: 'For the file upload every byte must arrive, in order, or the file is broken, so I want a reliable transport: TCP, normally just HTTPS, or HTTP/3 over QUIC, which is also reliable. Waiting a bit longer for a resent packet is fine there. For the video call, data that arrives late is useless — a frame from half a second ago should be skipped, not waited for — so TCP’s resending and in-order delivery would cause freezes. I would use UDP, which is what WebRTC does, and let the app handle loss by skipping frames or lowering the quality. QUIC sits in the middle: it runs on UDP, adds reliability and order per stream and TLS built in, so one lost packet only delays its own stream. The core trade-off is reliability and order against low latency.',
      },
      {
        id: 'm1-faster-api',
        question: 'An API feels slow for users who are far from the server. List the things you would check and change, from the network up to HTTP.',
        points: [
          'Measure first: server time vs. network time (RTT, DNS, TLS) in the browser’s network panel',
          'Reuse connections (keep-alive, pooling, HTTP/2) to avoid repeated TCP + TLS handshakes',
          'Fewer round trips: batch calls, avoid request chains, send what the screen needs in one response',
          'Cache: Cache-Control max-age, ETag → 304, a CDN at the edge for cacheable responses',
          'Move closer: a region near the users; smaller payloads (compression, pagination)',
        ],
        answer: 'First I measure, because I need to know if the time is in the server or in the network: the browser’s network panel shows DNS, connection, TLS, waiting and download time for each request. If the server is fast and the users are far away, the cost is round trips. I make sure connections are reused with keep-alive, pooling and HTTP/2, so the TCP and TLS handshakes happen once. Then I cut round trips in the API design: no chains where one call waits for another, batch endpoints, and responses that contain everything a screen needs. Next is caching: `Cache-Control` with a `max-age` for data that does not change often, ETags so a check returns 304 with no body, and a CDN so cacheable answers come from a server near the user. If that is still not enough, I deploy the API or a read replica in a region close to the users, and I make payloads smaller with compression and pagination.',
      },
    ],
  },
  '2026-12-20': {
    kind: 'week',
    title: 'Week 5 mock interview',
    minutes: 40,
    quizSize: 12,
    code: [
      {
        id: 'middle-node',
        title: 'Middle of the Linked List',
        prompt: 'Return the **value** of the middle node. With an even number of nodes, return the second of the two middle nodes. One pass, O(1) memory.',
        starter: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def middle_value(head):
    # your code here
    pass`,
        tests: `def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

assert middle_value(build([1, 2, 3, 4, 5])) == 3
assert middle_value(build([1, 2, 3, 4, 5, 6])) == 4
assert middle_value(build([7])) == 7
assert middle_value(build([1, 2])) == 2`,
        hint: 'Fast and slow pointers: while `fast and fast.next`, move slow one step and fast two.',
        solution: `class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def middle_value(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.val`,
        ref: leet('Middle of the Linked List', 'middle-of-the-linked-list'),
      },
    ],
    explain: [
      {
        id: 'fast-slow-explain',
        question: 'Explain the fast and slow pointer technique. Which two problems does it solve, and why is it better than the simple solution?',
        points: [
          'slow moves one node per step, fast moves two',
          'Middle: when fast reaches the end, slow is in the middle — one pass, no length needed',
          'Cycle: if there is a loop, fast catches up with slow inside it (the gap shrinks by one each step)',
          'The simple versions use O(n) memory (a list of nodes, a set of seen nodes)',
          'Fast/slow is O(n) time and O(1) memory; check `fast and fast.next` to avoid errors',
        ],
        answer: 'I walk the list with two pointers from the head: `slow` moves one node per step and `fast` moves two. For the middle of a list, when `fast` reaches the end `slow` has gone half the distance, so it is at the middle — I get it in one pass without counting the length first. For cycle detection, if the list ends, `fast` reaches `None` and there is no cycle; if there is a loop, both pointers end up inside it, and each step `fast` gains exactly one node on `slow`, so the gap shrinks to zero and they meet. The simple solutions copy nodes into a list or keep a set of visited nodes, which costs O(n) memory; fast and slow pointers are O(n) time and O(1) memory. The one detail to get right is the loop condition, `while fast and fast.next`, so `fast.next.next` never runs on `None`.',
      },
      {
        id: 'threads-or-processes',
        question: 'Your Python service must (1) call 50 slow external APIs for each report and (2) compute a heavy statistic in pure Python. Threads or processes for each part, and why?',
        points: [
          'API calls are I/O-bound: the time is spent waiting on the network',
          'Threads (or asyncio) overlap the waits; a waiting thread releases the GIL',
          'The statistic is CPU-bound: the GIL lets one thread run Python code at a time, so threads do not speed it up',
          'Use processes (ProcessPoolExecutor / multiprocessing) or a C library like NumPy for the CPU part',
          'Processes cost more to start and must copy data; keep the pool and send small inputs',
        ],
        answer: 'The 50 API calls are I/O-bound: almost all the time is waiting for the network, not computing. A thread that waits releases the GIL, so with a `ThreadPoolExecutor` — or `asyncio` — the 50 waits overlap and the total time is close to the slowest call instead of the sum. The heavy statistic is CPU-bound pure Python. In CPython the GIL lets only one thread run Python bytecode at a time, so more threads would not make it faster and could even slow it down. For that part I would use processes, a `ProcessPoolExecutor` with one worker per core, because each process has its own interpreter and its own GIL — or move the maths into NumPy, which does the work in C. Processes are more expensive to start and their inputs and results are copied between them, so I would reuse one pool and send them compact data.',
      },
    ],
  },
  '2026-12-27': {
    kind: 'week',
    title: 'Week 6 mock interview',
    minutes: 40,
    quizSize: 12,
    code: [
      {
        id: 'min-depth',
        title: 'Minimum Depth of Binary Tree',
        prompt: 'Return the number of nodes on the **shortest** path from the root down to a **leaf** (a node with no children). An empty tree has depth 0. Hint: a node with only one child is not a leaf.',
        starter: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def min_depth(root):
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

assert min_depth(build([3, 9, 20, None, None, 15, 7])) == 2
assert min_depth(build([2, None, 3, None, 4, None, 5, None, 6])) == 5
assert min_depth(build([1])) == 1
assert min_depth(None) == 0`,
        hint: 'BFS level by level; return the level number as soon as you pop a node with no children.',
        solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def min_depth(root):
    if root is None:
        return 0
    queue = deque([(root, 1)])
    while queue:
        node, depth = queue.popleft()
        if node.left is None and node.right is None:
            return depth
        for child in (node.left, node.right):
            if child:
                queue.append((child, depth + 1))`,
        ref: leet('Minimum Depth of Binary Tree', 'minimum-depth-of-binary-tree'),
      },
    ],
    explain: [
      {
        id: 'right-view',
        question: '“Binary Tree Right Side View”: return the values you see when you look at the tree from the right. Explain a BFS solution and a DFS solution.',
        points: [
          'The answer is the last node of each level',
          'BFS: level-order with a deque; record the last node of each round',
          'DFS: visit right child before left, carry the depth; the first node seen at a new depth is visible',
          'Both O(n) time; BFS memory O(width), DFS memory O(height)',
          'Edge cases: empty tree, a left branch longer than the right one',
        ],
        answer: 'Looking from the right, I see exactly one node per level: the rightmost one. With BFS I do a normal level-order walk using a deque, and in each round — the `len(queue)` nodes of one level — I keep the value of the last node I pop and add it to the answer. With DFS I visit the right child before the left child and pass the current depth down; the first time I reach a depth that has no answer yet, that node is the rightmost at that depth, so I append it. That also handles a left branch that is deeper than the right one, which a careless “just follow right children” answer misses. Both visit every node once, so O(n) time; BFS keeps a whole level in memory, DFS keeps one path, O(height). For an empty tree the answer is an empty list.',
      },
      {
        id: 'first-scale',
        question: 'Your web app runs on one server with its database. Pages get slow as users grow. What do you check first, and what are your first two or three changes?',
        points: [
          'Measure first: CPU, memory, slow queries, which pages are slow',
          'Move the database to its own server; add indexes for slow queries',
          'Cache hot reads (cache-aside with a TTL) and put static files on a CDN',
          'Then several stateless app servers behind a load balancer; sessions in Redis or tokens',
          'Read replicas if the database is still the bottleneck for reads',
        ],
        answer: 'I would not add machines blindly; first I measure where the time goes — server CPU and memory, the slowest database queries, and which pages are slow. On one machine the app and the database fight for the same CPU and memory, so an easy first step is to move the database to its own server, and to add indexes for the slow queries I found. Next I take load off the database: frequently read data goes into a cache like Redis with the cache-aside pattern and a TTL, and images, CSS and JavaScript go to a CDN. When one app server is not enough, I run several behind a load balancer with health checks, which means the app must be stateless — sessions move to Redis or into tokens. If the database is still the bottleneck because of reads, I add read replicas and keep writes on the primary.',
      },
    ],
  },
  '2026-12-31': {
    kind: 'month',
    title: 'Month 2 mock interview',
    minutes: 75,
    quizSize: 20,
    code: [
      {
        id: 'path-sum',
        title: 'Path Sum (Easy)',
        prompt: 'Return `True` if the tree has a **root-to-leaf** path whose values add up to `target`. Say your idea and its cost first.',
        starter: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def has_path_sum(root, target):
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

assert has_path_sum(build([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22) is True
assert has_path_sum(build([1, 2, 3]), 5) is False
assert has_path_sum(build([1, 2]), 1) is False
assert has_path_sum(None, 0) is False
assert has_path_sum(build([-2, None, -3]), -5) is True`,
        hint: 'Subtract the node value from `target` on the way down. At a leaf, check whether what is left equals the leaf’s value.',
        solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def has_path_sum(root, target):
    if root is None:
        return False
    if root.left is None and root.right is None:
        return root.val == target
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)`,
        ref: leet('Path Sum', 'path-sum'),
      },
      {
        id: 'zigzag',
        title: 'Zigzag Level Order (Medium)',
        prompt: 'Return the values level by level, but the direction changes every level: left to right, then right to left, and so on.',
        starter: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def zigzag(root):
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

assert zigzag(build([3, 9, 20, None, None, 15, 7])) == [[3], [20, 9], [15, 7]]
assert zigzag(build([1, 2, 3, 4, 5, 6, 7])) == [[1], [3, 2], [4, 5, 6, 7]]
assert zigzag(build([1])) == [[1]]
assert zigzag(None) == []`,
        hint: 'Normal BFS by levels. Before adding a level to the answer, reverse it on every second level.',
        solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def zigzag(root):
    out, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level[::-1] if len(out) % 2 else level)
    return out`,
        ref: leet('Binary Tree Zigzag Level Order Traversal', 'binary-tree-zigzag-level-order-traversal'),
      },
    ],
    explain: [
      {
        id: 'm2-linked-moves',
        question: '“Reorder List: turn 1→2→3→4→5 into 1→5→2→4→3 in place.” Explain your plan and which linked-list techniques it uses.',
        points: [
          'Find the middle with fast and slow pointers',
          'Cut the list there and reverse the second half (prev / cur / save next)',
          'Merge the two halves by alternating nodes',
          'O(n) time, O(1) extra memory; copying into a list would be O(n) memory',
          'Edge cases: 1 or 2 nodes; do not lose the rest of a list when changing a next pointer',
        ],
        answer: 'The result takes nodes alternately from the front and from the back, so I need the second half in reverse order. First I find the middle with fast and slow pointers. I cut the list after the middle and reverse the second half in place with the usual three pointers, always saving `next` before I turn an arrow around. Now I have `1→2→3` and `5→4`, and I merge them by alternating: take one node from the first list, then one from the second, saving the following nodes before I relink. Each step is O(n) and only uses a few pointers, so the whole solution is O(n) time and O(1) extra memory, while copying the nodes into a Python list would be easier but cost O(n) memory. I would check one and two nodes, where nothing should change.',
      },
      {
        id: 'm2-tree-recursion',
        question: '“How do you approach a tree problem?” Show your method with Diameter of Binary Tree.',
        points: [
          'Think of each node as the root of a smaller tree; base case: None',
          'Decide what the recursive call returns to its parent, and what extra you record',
          'Diameter: return the height; record left height + right height at each node',
          'Post-order: the node needs its children’s answers first',
          'O(n) time, O(h) memory; consider iterative/BFS for very deep trees or level questions',
        ],
        answer: 'I treat every node as the root of a smaller tree and ask two questions: what does a call need to return to its parent, and what answer can I compute at this node from its children’s results? The base case is an empty tree. For Diameter of Binary Tree, the longest path may bend at any node, and the path that bends at a node has length height of left plus height of right. So the recursive function returns the height — that is what the parent needs — and on the side I keep the best `left + right` seen so far in a variable. It is a post-order walk because a node needs both children first. Every node is visited once, so it is O(n) time and O(h) memory for the call stack, where h is the height. If the tree can be extremely deep I would switch to an explicit stack, and if the question is about levels I would use BFS instead.',
      },
      {
        id: 'm2-work-split',
        question: 'A photo app’s Python backend must, for each upload: save the file, make 3 resized copies (CPU-heavy) and send 2 notifications (slow APIs). How do you design this so uploads stay fast?',
        points: [
          'Do the minimum in the request: store the original, write the row, put jobs on a queue, answer at once',
          'Workers take jobs from the queue in the background',
          'Resizing is CPU-bound → separate worker processes (one per core), not threads, because of the GIL',
          'Notifications are I/O-bound → threads or asyncio in a worker',
          'Retries for failed jobs; idempotent jobs so a retry does not send twice',
        ],
        answer: 'The request should only do what the user must wait for: store the original file, write the database row, put the follow-up work on a message queue, and answer right away. Background workers then take the jobs from the queue. Resizing images is CPU-bound pure work, so I would run it in separate worker processes, about one per CPU core — threads would not help because of the GIL. Sending the notifications is I/O-bound: the time is spent waiting on other services, so one worker can handle many of them with threads or asyncio. The queue also makes the system tougher: if the notification service is down, jobs wait and are retried instead of failing the upload, and I make the jobs idempotent, for example with the upload id as a key, so a retry does not resize twice or send a notification twice.',
      },
      {
        id: 'm2-design',
        question: 'Design the first version of a photo-sharing site for about 1 million daily users. Draw the main boxes, give rough numbers, and explain each box.',
        points: [
          'Requirements: upload photos, view a feed; read-heavy',
          'Estimates: e.g. 1M users × 20 views ≈ 230 reads/s average, peak ~3×; 10% upload a 2 MB photo → ~200 GB/day',
          'CDN + object storage for the photos; the database stores only metadata',
          'Load balancer → stateless app servers; cache for hot feeds and profiles',
          'Primary DB for writes + read replicas; queue + workers for resizing; no single point of failure',
        ],
        answer: 'First the requirements: users upload photos and look at a feed, and it is read-heavy. Rough numbers: one million daily users viewing about 20 pages is 20 million requests a day, about 230 per second on average and maybe 700 at peak; if 10% upload one 2 MB photo a day, that is around 200 GB of new photos daily, so the files must go to object storage like S3, not into the database, and be served through a CDN near the users. The database keeps only metadata — users, photos, follows. Requests go through a load balancer to several stateless app servers, with sessions in Redis or tokens. Feeds and profiles are read much more than they change, so they sit in a cache with the cache-aside pattern and a TTL. The database has a primary for writes and read replicas for reads, with failover. Uploads put a resize job on a queue for worker processes. Each part exists at least twice, so no single machine can take the site down.',
      },
    ],
  },
}
