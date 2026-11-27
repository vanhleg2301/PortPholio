import type { Primer } from '../types'

// "Learn first" for every question: the idea it needs, explained simply with a small example,
// and the lesson part that teaches it. A primer teaches the idea, not the answer — it is shared
// by both questions of a concept, so it must not give either one away.
//
// Keyed by test id (a lesson id or `mock-<date>`), then by concept (multiple choice) or item id
// (coding and interview). `section` is an item of the lesson outline; `check:lessons` checks that
// it exists and that every `print` in the examples prints what its `# comment` says.

const md = (...lines: string[]) => lines.join('\n')
const py = (...lines: string[]) => ['```python', ...lines, '```'].join('\n')

const HASH_CORE = 'The core move: trade memory for time'
const CANONICAL = 'Canonical keys: grouping things that “look the same”'
const PREFIX = 'Prefix and suffix passes'
const BEFORE_FIRST_BYTE = 'What happens before the first byte'
const TCP_COST = 'TCP is reliable — but it has a cost'
const TP_LOOPS = 'Two indexes instead of two loops'
const TP_PROOF = 'Why it is correct'
const THREE_SUM = '3Sum: sort, fix one, two pointers for the rest'
const CONTAINER = 'Container With Most Water: move the shorter side'
const TRAP = 'Trapping Rain Water'
const WINDOW = 'A window that moves'
const STOCK = 'Best Time to Buy and Sell Stock'
const REPLACE = 'Longest Repeating Character Replacement'
const PERM = 'Permutation in String'
const MINWIN = 'Minimum Window Substring: grow, then shrink'
const DEQUE = 'Sliding Window Maximum'
const UDP_SECTION = 'UDP: just send it'
const QUIC_SECTION = 'QUIC: reliability on top of UDP'
const TLS_SECTION = 'TLS: three promises'
const KEYS_SECTION = 'Two kinds of keys'
const BROWSER_SECTION = 'What the browser checks — and what TLS does not hide'

const HASH_TABLE = md(
  'A hash table is like a wall of mailboxes. The **hash** of a key is a number that tells you which box to open, so you go straight there instead of checking every box — that is the O(1).',
  '',
  'Sometimes two keys get the same box: a [[collision]]. Then that box holds several keys, and Python must check them one by one. One collision is cheap. Now imagine **every** key landing in the same box: how many checks would one lookup need?',
)

export const TEST_PRIMERS: Record<string, Record<string, Primer>> = {
  'dsa-arrays-hashing': {
    'tuple-key': {
      section: CANONICAL,
      read: md(
        'A dict finds a key by its **hash**: a number Python computes from the key’s value when you store it. If the key could change later, its hash would change too, and the dict would look in the wrong place. So Python only accepts keys whose value can never change — they are [[hashable]]: `int`, `str`, and `tuple` (of hashable values). `list`, `dict` and `set` can change, so they are not.',
        '',
        py(
          'counts = [1, 0, 2]',
          'key = tuple(counts)        # a frozen copy of the list',
          'd = {key: "abc"}',
          'print(d[(1, 0, 2)])        # abc',
        ),
        '',
        'Two equal tuples have the same hash, so a tuple you build later finds the same entry.',
      ),
    },
    'group-cost': {
      section: CANONICAL,
      read: md(
        'To find the time of a loop, multiply: **(how many times it runs) × (cost of one run)**.',
        '',
        'Here the loop runs once per word. Inside, the cost depends on how you build the key: sorting k letters costs O(k log k); counting k letters into 26 slots costs O(k) — one step per letter, and building a tuple of 26 numbers is a fixed cost.',
        '',
        'Example: 1,000 words of 10 letters, one step per letter → about 1,000 × 10 = 10,000 steps.',
      ),
    },
    'one-zero': {
      section: PREFIX,
      read: md(
        'Product rule: if **any** number in a product is 0, the whole product is 0.',
        '',
        '“Everything except i” leaves out exactly one number. So for each position, ask: *does what I multiply still contain a zero?* Try a tiny list by hand, for example `[3, 0, 5]`:',
        '',
        '| except index | multiply | result |',
        '| --- | --- | --- |',
        '| 0 | 0 × 5 | ? |',
        '| 1 | 3 × 5 | ? |',
        '| 2 | 3 × 0 | ? |',
        '',
        'With two zeros, every “except i” product still keeps at least one of them.',
      ),
    },
    'consecutive-start': {
      section: 'Longest Consecutive Sequence',
      read: md(
        'A **run** is numbers that follow each other, like 7, 8, 9. Every run has exactly one first number: the one whose left neighbour `x - 1` is missing.',
        '',
        py(
          'nums = {7, 8, 9, 20}',
          'starts = [x for x in sorted(nums) if x - 1 not in nums]',
          'print(starts)              # [7, 20]',
        ),
        '',
        'If you started counting from every number, the run 7, 8, 9 would be walked from 7, again from 8 and again from 9 — the same work repeated. Starting only at first numbers means each number is walked once.',
      ),
    },
    'length-prefix': {
      section: 'Encode and Decode Strings',
      read: md(
        'Joining strings with a separator like `,` breaks when a string contains `,` itself: the decoder cannot tell where one string ends.',
        '',
        'A **length prefix** solves it: write how long the string is, a marker, then the string. The decoder reads the number, then copies exactly that many characters **without looking at them**:',
        '',
        py(
          's = "5#a,b,c"',
          'n = int(s[:s.index("#")])',
          'start = s.index("#") + 1',
          'print(s[start:start + n])  # a,b,c',
        ),
        '',
        'Real protocols do the same: HTTP’s `Content-Length` header says how many bytes the body has.',
      ),
    },
    'box-index': {
      section: 'Valid Sudoku',
      read: md(
        'A 9×9 Sudoku has nine 3×3 boxes. Integer division `//` turns a row or column number (0–8) into a box row or box column (0–2):',
        '',
        py(
          'for r in [0, 2, 3, 5, 6, 8]:',
          '    print(r, "->", r // 3)',
          '# 0 -> 0',
          '# 2 -> 0',
          '# 3 -> 1',
          '# 5 -> 1',
          '# 6 -> 2',
          '# 8 -> 2',
        ),
        '',
        'Do it once for the row and once for the column. To give each box a single number from 0 to 8, use `box_row * 3 + box_col` — like numbering cinema seats row by row.',
      ),
    },
    'bucket-size': {
      section: 'Bucket sort: top-k in O(n)',
      read: md(
        'In bucket sort for counts, **the count is the index**: a value that appears 3 times goes into `buckets[3]`. So the list needs an index for every count that can happen.',
        '',
        'Ask: in a list of n numbers, what are the smallest and the largest count a value can have? And remember that a list of length m has indexes 0 … m − 1:',
        '',
        py(
          'buckets = [[] for _ in range(4)]',
          'print(len(buckets), "buckets, last index", len(buckets) - 1)  # 4 buckets, last index 3',
        ),
      ),
    },
    'two-sum-sort': {
      section: 'Two Sum with a hash map',
      read: md(
        'There are two common ways to find a pair: a **hash map** of the numbers you have seen (look up the [[complement]] `target - x` in O(1)), or **sort + two pointers** (one pointer at each end). Compare them on time, extra memory, and whether the original positions survive. Sorting moves numbers:',
        '',
        py(
          'nums = [3, 1, 2]',
          'print(sorted(nums))        # [1, 2, 3]',
          'print(nums.index(1))       # 1',
        ),
        '',
        'After sorting, `1` is at index 0 — but the question asks for its index in the input.',
        '',
        'A dict answers one question fast: *“what is stored for this key?”* So choose as the key the thing you **look up**, and store what you need back.',
      ),
    },
    'group-count': {
      section: CANONICAL,
      read: md(
        '`defaultdict(list)` creates an empty list the first time you use a new key, so you can `append` right away. Words with the same canonical key land in the same list. `len(g)` counts the **keys** (the groups), not the words.',
        '',
        py(
          'from collections import defaultdict',
          'g = defaultdict(list)',
          'for w in ["no", "on", "hi"]:',
          '    g["".join(sorted(w))].append(w)',
          'print(dict(g))             # {\'no\': [\'no\', \'on\'], \'hi\': [\'hi\']}',
          'print(len(g))              # 2',
        ),
      ),
    },
    'prefix-left': {
      section: PREFIX,
      read: md(
        'A **running product** walks the list and keeps multiplying. The order of two lines decides what you store. Write `out.append(running)` **before** `running *= x`, and each slot gets the product of the numbers **before** it — so the first slot gets 1, the “empty product” (just like 0 is the empty sum).',
        '',
        py(
          'running, out = 1, []',
          'for x in [5, 2]:',
          '    out.append(running)',
          '    running *= x',
          'print(out, running)        # [1, 5] 10',
        ),
        '',
        'Walking from the right with the same trick gives the product of the numbers **after** each slot.',
      ),
    },
    'dup-no-memory': {
      section: HASH_CORE,
      read: md(
        'Contains Duplicate has two classic answers:',
        '',
        '- A **set** remembers what you have seen: one pass, O(n) time, but O(n) extra memory.',
        '- **Sorting** puts equal values next to each other, so you only compare neighbours. `list.sort()` works in place. Sorting costs O(n log n) — unless the data is already sorted.',
        '',
        py(
          'nums = [4, 1, 4, 2]',
          'nums.sort()',
          'print(nums)                # [1, 2, 4, 4]',
          'print(any(nums[i] == nums[i - 1] for i in range(1, len(nums))))  # True',
        ),
      ),
    },
    'hash-worst': {
      section: HASH_CORE,
      read: md(HASH_TABLE, '', 'That is why interviewers want to hear “O(1) **on average**”.'),
    },
    'subarray-sum-k': {
      section: PREFIX,
      read: md(
        'A [[prefix sum]] is the running total up to each position. The sum of any [[subarray]] is the **difference of two prefix sums**:',
        '',
        py(
          'nums = [3, 4, 7, 2]',
          'prefix, running = [], 0',
          'for x in nums:',
          '    running += x',
          '    prefix.append(running)',
          'print(prefix)                 # [3, 7, 14, 16]',
          'print(prefix[2] - prefix[0])  # 11',
        ),
        '',
        '11 = 4 + 7: the part after index 0, up to index 2. So the question “does a subarray ending here sum to k?” becomes “have I seen the prefix sum `running - k` before?” — a lookup, which a dict does in O(1). Keep a count of how many times each prefix sum has appeared. (What about a subarray that starts at index 0?)',
      ),
    },
    'nearby-duplicate': {
      section: HASH_CORE,
      read: md(
        'When the question is “have I seen this value **recently**?”, a set is not enough — you also need **where** you saw it. A dict can map value → the last index where it appeared. Overwrite it each time: the newest index is always the closest one to what comes next.',
        '',
        py(
          'last = {}',
          'for i, x in enumerate(["a", "b", "a"]):',
          '    last[x] = i',
          'print(last)                # {\'a\': 2, \'b\': 1}',
        ),
      ),
    },
    'consecutive-proof': {
      section: 'Longest Consecutive Sequence',
      read: md(
        'To prove that a loop inside a loop is O(n), do not multiply the two loops. **Count the total work of the inner loop over the whole run**: how many times can one number be visited by the inner `while`?',
        '',
        'If each number is visited by at most one start, all inner steps together are at most n. Some outer steps do a lot, most do nothing — the total is what matters. (This way of counting is called *aggregate* or *amortized* analysis.)',
        '',
        'A good answer has four parts: the data structure and why, the rule for where to start, the counting argument, then time and memory.',
      ),
    },
    'encoding-design': {
      section: 'Encode and Decode Strings',
      read: md(
        'A good design answer names the problem first, then compares options. The problem: a separator can also appear **inside** the data.',
        '',
        'There are two families of fixes:',
        '',
        '- **Say how long** each piece is, so the reader never looks inside it.',
        '- **Escape** the special character inside the data — like writing `\\"` for a quote inside a string in code.',
        '',
        'For each design, think about how simple the decoder is, its speed, and edge cases: an empty list and a list with one empty string must encode differently.',
      ),
    },
    'two-sum-ladder': {
      section: HASH_CORE,
      read: md(
        'Interviewers like a **ladder**: start simple, then improve, and say the cost at each step. For pair problems the usual steps are: check every pair → remember what you have seen in a hash map → sort and walk with two pointers.',
        '',
        'For each step, say the time, the extra memory, and when it is the best choice: how big is the input, is memory tight, is the input already sorted? Saying the [[trade-off]] out loud before you code is part of the answer.',
      ),
    },
  },

  'net-latency-tcp': {
    ttfb: {
      section: BEFORE_FIRST_BYTE,
      read: md(
        'To estimate when the first byte arrives, **count the round trips and multiply by the RTT**, then add DNS time and server time.',
        '',
        'On a new HTTPS connection the steps are: DNS (skip it if cached) → TCP handshake → TLS handshake → the request. The lesson lists how many round trips each step costs, and the TLS version changes one of them.',
        '',
        'Example of the sum: RTT 40 ms and 5 round trips → 5 × 40 = 200 ms, plus the server’s time.',
      ),
    },
    'bandwidth-small': {
      section: 'Two different numbers',
      read: md(
        'Two different numbers set the speed: [[bandwidth]] (bits per second) and [[latency]] (how long one trip takes). The time to push the data onto the line is **size ÷ bandwidth** — and 1 byte = 8 bits:',
        '',
        py(
          'size_kbit = 50 * 8          # 50 KB',
          'mbit_per_s = 10',
          'print(size_kbit / (mbit_per_s * 1000) * 1000, "ms")  # 40.0 ms',
        ),
        '',
        'Compare that with what the round trips cost. Whichever is bigger decides which change helps.',
      ),
    },
    'light-floor': {
      section: 'Distance and the speed of light',
      read: md(
        'Light in fibre travels about 200,000 km per second — that is **200 km per millisecond**. A round trip goes there **and back**, so double the distance:',
        '',
        py(
          'km = 3_000',
          'print(2 * km / 200, "ms")   # 30.0 ms',
        ),
        '',
        'This is a floor, not a typical value: real routes are longer than a straight line, and every router and queue on the way adds time.',
      ),
    },
    'three-way': {
      section: BEFORE_FIRST_BYTE,
      read: md(
        'TCP gives every byte a **sequence number**, so the other side can put bytes in order and say what is missing. Each side picks its own starting number, and a number is only safe to use after the other side has confirmed it.',
        '',
        'The receiver confirms with an **ACK** that names the next byte it expects — like saying “I have pages 1–40, send page 41”.',
        '',
        'Think about how many messages are needed so that **both** sides’ numbers are sent and confirmed.',
      ),
    },
    'slow-start-count': {
      section: 'Slow start',
      read: md(
        'A new TCP connection does not know how fast the network is, so it starts with a small [[congestion window]] and **doubles** it after every round trip. To count the round trips for a size, keep adding windows until the total is big enough. (Here the first window is 10 KB to keep the numbers easy.)',
        '',
        py(
          'window, sent, trips = 10, 0, 0',
          'while sent < 60:',
          '    sent += window',
          '    window *= 2',
          '    trips += 1',
          'print(trips, sent)          # 3 70',
        ),
        '',
        '10 + 20 + 40 = 70 KB after 3 round trips. Do the same sum with a first window of 14 KB.',
      ),
    },
    hol: {
      section: 'Head-of-line blocking',
      read: md(
        'TCP promises the app gets the bytes **in order**. Picture a queue at a ticket desk where the first person has lost their ticket: everyone behind them waits, even though their tickets are fine. That is [[head-of-line blocking]].',
        '',
        'HTTP/2 puts many requests on one TCP connection, so they all share one queue. [[quic|QUIC]] (used by HTTP/3) runs over UDP and keeps the order **per stream**, so each stream has its own queue.',
      ),
    },
    'flow-vs-congestion': {
      section: TCP_COST,
      read: md(
        'A TCP sender has two different limits:',
        '',
        '- [[flow control|Flow control]]: the **receiver** says how much free [[buffer]] space it has, so the sender does not fill it faster than the app reads it.',
        '- [[congestion control|Congestion control]]: the sender guesses how much the **network** between them can carry, from packet loss.',
        '',
        'Picture water poured through a pipe into a bucket: the bucket size is one limit, the pipe width is the other. The sender must respect both at the same time.',
      ),
    },
    'keep-alive': {
      section: TCP_COST,
      read: md(
        'Opening a connection costs time **before** any useful data moves: the TCP handshake, the TLS handshake (and for a database, logging in), and then slow start begins from a small window. A connection that stays open is “warm”: it has paid all of that already.',
        '',
        '[[keep-alive|Keep-alive]] keeps one connection open between requests; a [[connection pool]] keeps several open and lends them out. In Python, `requests.Session()` reuses connections, while each plain `requests.get()` opens a new one.',
      ),
    },
    chatty: {
      section: 'Chatty API vs one batched call',
      read: md(
        'When calls run **one after another**, each one waits for the previous answer, so every call pays a full round trip:',
        '',
        '**total ≈ number of calls × (RTT + server time)**',
        '',
        'When the work is combined into **one** call, you pay the round trip once. For small requests, bandwidth barely matters — the waiting does.',
      ),
    },
    cdn: {
      section: 'Two different numbers',
      read: md(
        'Latency has four parts, and each has its own fix:',
        '',
        '| Part | Comes from | Fix |',
        '| --- | --- | --- |',
        '| Propagation | distance | move closer |',
        '| Transmission | size ÷ bandwidth | more bandwidth, smaller data |',
        '| Processing | routers, your code | faster code, caching |',
        '| Queuing | busy links | less congestion |',
        '',
        'A [[cdn|CDN]] keeps copies of files on servers near users, and connections end at that nearby server. It can only serve what it is allowed to copy; a response that must be computed fresh for one user still comes from the origin server.',
      ),
    },
    'tls-versions': {
      section: 'New HTTPS connection',
      read: md(
        'TLS does two jobs before data flows:',
        '',
        '1. The client and the server **agree on keys** for encryption.',
        '2. The server **proves who it is** with a certificate, signed by an authority the browser trusts — like a passport stamped by a government.',
        '',
        'Newer TLS versions save time by sending more in the first message. Open the handshake animation, switch between 1.2 and 1.3, and count the trips there and back.',
      ),
    },
    'loss-detect': {
      section: TCP_COST,
      read: md(
        'TCP has no message that says “this packet was lost”. The sender has to **notice**: either the ACK it waits for never comes (a timer runs out), or the receiver keeps sending the **same** ACK (“still waiting for byte N”) because later packets arrive but N is missing.',
        '',
        'Then the sender sends the packet again ([[retransmission]]) and reads the loss as a sign of [[congestion]]: it slows down, then speeds up again carefully.',
      ),
    },
    'slow-start-cap': {
      section: 'Slow start',
      read: md(
        'Start from the slow-start loop in the lesson: each round trip sends one window, then the window doubles. A **cap** means the window grows up to a limit and then stays there. `min(a, b)` returns the smaller value, so it caps a number in one step:',
        '',
        py(
          'print(min(40 * 2, 64))    # 64',
          'print(min(16 * 2, 64))    # 32',
        ),
      ),
    },
    'reuse-connection': {
      section: 'Time to first byte',
      read: md(
        'Write down the cost of each request first, then add them up. A **new** connection pays the handshakes and the request; a **reused** one pays only the request.',
        '',
        'Draw a small table for n = 3 — requests 1, 2 and 3 — and mark which ones pay the handshakes in each mode. Then check the edge case n = 0: no requests means no time.',
      ),
    },
    'type-url': {
      section: BEFORE_FIRST_BYTE,
      read: md(
        'Answer this as a **timeline**: one step per line, in order, each with its cost in round trips. The network part has four steps: DNS, TCP, TLS, then the request and response.',
        '',
        'Then say what happens when the response is big (slow start) and when the page needs more files. Picking one RTT number, for example 50 ms, and adding it up at the end makes the answer concrete.',
      ),
    },
    'slow-for-vietnam': {
      section: 'Distance and the speed of light',
      read: md(
        'Use numbers: distance → minimum RTT (200 km per ms in fibre, there and back), then **× the number of round trips** a page needs. The same code is fast or slow only because of how far away the user is.',
        '',
        'Then group the fixes: **move closer** (CDN, a region near the users) and **fewer round trips** (reuse connections, newer protocols, batch calls, caching). Also say why more bandwidth would not help.',
      ),
    },
    'slow-start-why': {
      section: 'Slow start',
      read: md(
        'A clear structure:',
        '',
        '1. **What** it does: start with a small window, double it every round trip, shrink it after a loss.',
        '2. **Why** it exists: the sender cannot see the network; sending too much at once fills router queues and causes loss for everyone.',
        '3. **What it costs**: count the round trips for a size, like the slow-start code in the lesson.',
        '',
        'End with what engineers do about it: reuse warm connections and keep responses small.',
      ),
    },
  },

  'dsa-two-pointers': {
    'tp-cost': {
      section: TP_LOOPS,
      read: md(
        'To compare two solutions, **count the steps**. Checking every pair of n numbers is a loop inside a loop:',
        '',
        py(
          'n = 5',
          'pairs = sum(1 for i in range(n) for j in range(i + 1, n))',
          'print(pairs)               # 10',
          'print(n * (n - 1) // 2)    # 10',
        ),
        '',
        'With two pointers, `l` starts at 0 and `r` at n − 1, so they begin n − 1 places apart. Every step moves one of them one place towards the other. How many steps until they meet? For memory, count what you keep **besides** the input.',
      ),
    },
    'tp-why-left': {
      section: TP_PROOF,
      read: md(
        'A pointer may only move when the number it points to is **proven useless**. To prove it, give that number its **best possible partner**: of the numbers still between `l` and `r`, the one that helps it most.',
        '',
        '- If the sum is too small, the best partner is the biggest number left. Where is it in a sorted list?',
        '- If the sum is too big, the best partner is the smallest number left.',
        '',
        'If even the best partner fails, every other partner fails too, and the number can be dropped for good. This promise — “if an answer exists, it is still between `l` and `r`” — is the [[invariant]] of the loop.',
      ),
    },
    'tp-trace': {
      section: TP_LOOPS,
      read: md(
        'To trace a loop by hand, write one row per step: the values **before** the step, the test, then what changes. Remember that the `while` condition is checked before every step, so the loop can stop before it even starts.',
        '',
        py(
          'nums = [1, 3, 6]',
          'l, r, steps = 0, 2, []',
          'while l < r and nums[l] + nums[r] != 9:',
          '    steps.append((l, r, nums[l] + nums[r]))',
          '    if nums[l] + nums[r] < 9:',
          '        l += 1',
          '    else:',
          '        r -= 1',
          'print(steps, l, r)         # [(0, 2, 7)] 1 2',
        ),
        '',
        '1 + 6 = 7 is too small, so `l` moves; then 3 + 6 = 9 and the condition stops the loop. One step was made.',
      ),
    },
    'tp-sorted': {
      section: TP_PROOF,
      read: md(
        'The proof that a pointer may move uses one fact: everything between `l` and `r` is **at most** `nums[r]` and **at least** `nums[l]`. Only a sorted list makes that true. In `[8, 1, 5, 3]` the right end is 3, but 8 and 5 are bigger — “3 is the biggest partner left” is simply false.',
        '',
        'Sorting fixes the order but moves every number away from its original index. If you need those indexes, keep them next to the value:',
        '',
        py(
          'pairs = sorted((x, i) for i, x in enumerate([8, 1, 5]))',
          'print(pairs)               # [(1, 1), (5, 2), (8, 0)]',
        ),
        '',
        'And remember the Week 1 tool for pairs in **unsorted** data, which needs no order at all.',
      ),
    },
    'three-dupes': {
      section: THREE_SUM,
      read: md(
        'Sorting puts **equal values next to each other**. So a value is a repeat exactly when it equals the one just before it:',
        '',
        py(
          'nums = sorted([3, 1, 3, 2, 1])',
          'print(nums)                # [1, 1, 2, 3, 3]',
          'print([x for i, x in enumerate(nums) if i == 0 or x != nums[i - 1]])  # [1, 2, 3]',
        ),
        '',
        'In 3Sum the first number is fixed, then two pointers search the rest. Ask: if two first numbers are equal, would the search after them find anything new?',
      ),
    },
    'three-cost': {
      section: THREE_SUM,
      read: md(
        'Two rules for the cost of a whole solution:',
        '',
        '- Steps done **one after another**: add them, then keep only the biggest term. O(n log n) + O(n) = O(n log n).',
        '- A loop **inside** a loop: multiply. n outer steps × O(n) inner work = O(n²).',
        '',
        'Big-O hides constants, but the size gap is huge. For n = 1,000: n log n ≈ 10,000, n² = 1,000,000 and n³ = 1,000,000,000. Python does roughly 10–50 million simple steps a second.',
      ),
    },
    'container-move': {
      section: CONTAINER,
      read: md(
        'The water a container holds is **width × the height of the shorter line** — water spills over the lower side.',
        '',
        py(
          'def area(h, l, r):',
          '    return (r - l) * min(h[l], h[r])',
          '',
          'h = [1, 8, 6, 2]',
          'print(area(h, 0, 3))       # 3',
        ),
        '',
        'Any move makes the width one smaller. So a move can only win if the **height** can grow. Try both moves on `h` above: which line limits the height, and can keeping it ever give more than 3?',
      ),
    },
    'trap-formula': {
      section: TRAP,
      read: md(
        'Think of one bar as the floor of a bathtub. Water rises until it spills over the **lower** of the two walls: the highest bar on its left and the highest bar on its right. The water above the bar is that level minus the bar’s own height (never below 0).',
        '',
        py(
          'bars = [5, 1, 3]',
          'level = min(max(bars[:1]), max(bars[2:]))',
          'print(level, level - bars[1])  # 3 2',
        ),
      ),
    },
    'trap-side': {
      section: TRAP,
      read: md(
        'The water at a bar needs both walls, but you only need to know the **lower** one.',
        '',
        'Suppose the highest wall seen from the left is 4, and you know there is a wall of **at least** 9 somewhere on the right. Even without knowing the exact right wall, the lower wall is 4 — the water level is settled.',
        '',
        'So compare `left_max` and `right_max`: on which side do you know for sure that the **other** side has a wall at least as high? That side can be finished now, and its pointer moves.',
      ),
    },
    'same-direction': {
      section: TP_LOOPS,
      read: md(
        'Two pointers do not always start at both ends. In the **same-direction** shape, a read pointer `r` visits every item, and a write pointer `w` marks where the next item you keep goes. `w` only moves when an item is kept, so the kept items end up at the front, in order, with no extra list:',
        '',
        py(
          'nums = [3, 4, 7, 6, 8]',
          'w = 0',
          'for r in range(len(nums)):',
          '    if nums[r] % 2 == 0:',
          '        nums[w] = nums[r]',
          '        w += 1',
          'print(nums[:w], w)         # [4, 6, 8] 3',
        ),
      ),
    },
    'palindrome-memory': {
      section: 'Valid Palindrome with O(1) memory',
      read: md(
        'The easy way builds a **cleaned copy**, then its reverse — two new strings as long as the input:',
        '',
        py(
          's = "No, on!"',
          'clean = "".join(c.lower() for c in s if c.isalnum())',
          'print(clean, clean == clean[::-1])  # noon True',
          'print("a".isalnum(), "7".isalnum(), " ".isalnum(), ",".isalnum())  # True True False False',
        ),
        '',
        'Two pointers read the **original** string instead. Each pointer jumps over characters that do not count and compares the rest with `lower()`. Ask: what is stored now besides two indexes, and does the number of character visits change?',
      ),
    },
    'tp-signals': {
      section: TP_LOOPS,
      read: md(
        'Two pointers work because a pointer can **throw an item away for good** after one comparison. That needs a reason to know which item to drop. Typical reasons: an **order** (sorted data), a question about **both ends** (palindromes, containers), or a rule that you must change the data **in place**.',
        '',
        'Other jobs have their own tools: counting and grouping use a [[hash map]] (Week 1), “the k largest” uses a heap, a tree uses recursion. When you read a problem, ask first: what would let me drop an item without checking it against everything?',
      ),
    },
    'sorted-squares': {
      section: TP_LOOPS,
      read: md(
        'Negative numbers turn big when squared. So in a sorted list with negatives, the squares are big at **both ends** and small in the middle — like a valley:',
        '',
        py(
          'nums = [-5, -2, 1, 4]',
          'print([x * x for x in nums])  # [25, 4, 1, 16]',
          'print(list(range(3, -1, -1)))  # [3, 2, 1, 0]',
        ),
        '',
        'The biggest square left is always at one of the two ends, so you know it after **one** comparison. Where in the answer does the biggest value go? `range(n - 1, -1, -1)` walks the answer slots from the back.',
      ),
    },
    'move-zeroes': {
      section: TP_LOOPS,
      read: md(
        'This is the **same-direction** shape: a read pointer looks at every item, a write pointer marks the next free place at the front. Python swaps two list items in one line:',
        '',
        py(
          'nums = [1, 2, 3]',
          'nums[0], nums[2] = nums[2], nums[0]',
          'print(nums)                # [3, 2, 1]',
        ),
        '',
        'Swapping (instead of only copying) keeps every value in the list, so whatever is not moved to the front ends up behind it.',
      ),
    },
    'two-pointer-proof': {
      section: TP_PROOF,
      read: md(
        'A correctness proof for a pointer loop has three parts:',
        '',
        '1. **The fact you rely on** — here, the sorted order.',
        '2. **Each move is safe**: for both cases (sum too small, sum too big), say why the dropped number cannot be in any answer. Use its best possible partner.',
        '3. **The [[invariant]]**: a sentence that is true before every step, such as “if an answer exists, it is between `l` and `r`”. Since it is never broken and the pointers meet, the loop cannot miss the answer.',
        '',
        'Finish with the cost: how many steps, and what you store.',
      ),
    },
    'trap-explain': {
      section: TRAP,
      read: md(
        'Build the answer in three steps: the formula for one bar, a simple solution, then the better one.',
        '',
        'The simple solution precomputes the **running maximum** from the left (and the same from the right):',
        '',
        py(
          'h = [0, 2, 1, 3]',
          'left_max, best = [], 0',
          'for x in h:',
          '    best = max(best, x)',
          '    left_max.append(best)',
          'print(left_max)            # [0, 2, 2, 3]',
        ),
        '',
        'Two arrays like this cost O(n) memory. To drop them, explain which single number per side is enough, and why the side with the **smaller** maximum can be finished first.',
      ),
    },
  },

  'dsa-sliding-window': {
    'sw-cost': {
      section: WINDOW,
      read: md(
        'A `while` inside a `for` is **not** automatically O(n²). Count the total moves of each pointer over the **whole run**, not per step:',
        '',
        py(
          'moves_r = moves_l = l = 0',
          'for r in range(6):',
          '    moves_r += 1',
          '    while r - l + 1 > 2:',
          '        l += 1',
          '        moves_l += 1',
          'print(moves_r, moves_l)    # 6 4',
        ),
        '',
        'Some steps of the `for` do no inner work, some do a little; what matters is the sum. Compare with brute force, which builds every substring from scratch. This way of counting is [[amortized]] analysis.',
      ),
    },
    'sw-trace': {
      section: WINDOW,
      read: md(
        'To trace a window, write down the window **after** each step. The `while` throws characters out from the left until the new character has no copy inside:',
        '',
        py(
          's = "abca"',
          'seen, l, trace = set(), 0, []',
          'for r, ch in enumerate(s):',
          '    while ch in seen:',
          '        seen.remove(s[l])',
          '        l += 1',
          '    seen.add(ch)',
          '    trace.append(s[l:r + 1])',
          'print(trace)               # [\'a\', \'ab\', \'abc\', \'bca\']',
        ),
        '',
        'The answer is the longest window you wrote down.',
      ),
    },
    'sw-not': {
      section: WINDOW,
      read: md(
        'A variable window needs a rule that moves **one way**: adding items can only make the window “more” (bigger sum, more letters), and removing items can only make it “less”. Then “too big → shrink” always helps.',
        '',
        'Negative numbers break that promise:',
        '',
        py(
          'w = [4, -3]',
          'print(sum(w[:1]), sum(w))  # 4 1',
        ),
        '',
        'Adding a number made the sum **smaller**. Also learn the other kind: when the question gives the size (“any 3 in a row”), the window is **fixed**: one item in on the right, one out on the left, every step.',
      ),
    },
    'stock-idea': {
      section: STOCK,
      read: md(
        'If you sell on a given day, the best day to buy is the **cheapest day before it**. So while you walk the prices, you only need to remember the lowest price so far — a running minimum:',
        '',
        py(
          'prices = [7, 2, 9, 4]',
          'cheapest, mins = float("inf"), []',
          'for p in prices:',
          '    cheapest = min(cheapest, p)',
          '    mins.append(cheapest)',
          'print(mins)                # [7, 2, 2, 2]',
        ),
        '',
        'Each day, “today’s price − the cheapest so far” is the best profit for selling today. Keep the biggest one.',
      ),
    },
    'replace-valid': {
      section: REPLACE,
      read: md(
        'To make every letter in a window the same with the fewest changes, **keep the most common letter and change the others**. So the number of changes is the window length minus the count of its most common letter:',
        '',
        py(
          'from collections import Counter',
          'w = "ABBB"',
          'top = Counter(w).most_common(1)[0][1]',
          'print(top, len(w) - top)   # 3 1',
        ),
        '',
        'Compare that number with `k`, the changes you are allowed.',
      ),
    },
    'perm-size': {
      section: PERM,
      read: md(
        'A **permutation** uses the same letters the same number of times, only in another order. So two strings are permutations of each other when their letter counts match:',
        '',
        py(
          'def counts(s):',
          '    c = [0] * 26',
          '    for ch in s:',
          '        c[ord(ch) - ord("a")] += 1',
          '    return c',
          '',
          'print(counts("abc") == counts("cab"))  # True',
        ),
        '',
        'Ask two things: how many letters does **every** permutation of `s1` have? And when a window moves one step, how many counts change?',
      ),
    },
    'minwin-shrink': {
      section: MINWIN,
      read: md(
        'A window is **valid** when it contains every character `t` needs. You want the **shortest** valid window.',
        '',
        'A short window cannot become valid by losing characters, so first it must grow. But once it is valid, its left end may hold characters it does not need. Ask: after a window becomes valid, could a shorter window that starts further right also be valid? And when is the only moment you see each of those shorter windows?',
      ),
    },
    'deque-indexes': {
      section: DEQUE,
      read: md(
        'A window of size `k` that ends at position `i` covers positions `i − k + 1 … i`. To know whether an item is still inside, you need its **position**, not only its value.',
        '',
        'Values alone are not enough when they repeat:',
        '',
        py(
          'nums = [9, 1, 9]',
          'print(nums.index(9))       # 0',
        ),
        '',
        '`index()` only finds the first 9. If the deque held just the value 9, could you tell whether it is the old one (maybe gone) or the new one?',
      ),
    },
    'deque-pop': {
      section: DEQUE,
      read: md(
        'A [[monotonic queue]] keeps its values in **decreasing** order from front to back. The front is the maximum of the window.',
        '',
        'Think of a team where the strongest player plays. A new player joins who is **stronger and younger** than some players already there. Those older, weaker players can never be the strongest again: the new one beats them and stays longer. So they can leave now — from the back, where the weakest are:',
        '',
        py(
          'from collections import deque',
          'q = deque([8, 2])',
          'while q and q[-1] < 5:',
          '    q.pop()',
          'q.append(5)',
          'print(q)                   # deque([8, 5])',
        ),
      ),
    },
    'sw-vs-tp': {
      section: WINDOW,
      read: md(
        'Draw where the pointers go on a list of 5 items:',
        '',
        py(
          'print([(l, 4 - l) for l in range(3)])  # [(0, 4), (1, 3), (2, 2)]',
          'print([(l, l + 2) for l in range(3)])  # [(0, 2), (1, 3), (2, 4)]',
        ),
        '',
        'The first line is opposite-end [[two pointers]]; the second is a [[sliding window]] of size 3. In each one, which way does each pointer move, and what is the “answer” — two items, or everything between them?',
      ),
    },
    'sw-rule': {
      section: WINDOW,
      read: md(
        'Before writing a variable window, write its rule as **one line you could test**, for example `zeros <= 1` (“at most one zero inside”). Then decide two updates:',
        '',
        '- When `s[r]` **comes in**, what changes? (`zeros += 1` if it is a 0)',
        '- When `s[l]` **goes out**, what changes? (`zeros -= 1` if it was a 0)',
        '',
        'With those three lines, the template is the same every time: grow, shrink while the rule is broken, update the answer.',
      ),
    },
    'sw-jump': {
      section: WINDOW,
      read: md(
        'Instead of moving `l` one step at a time, you can store the **last index** of every character and jump `l` straight past the repeat:',
        '',
        py(
          'last = {}',
          'for i, ch in enumerate("abba"):',
          '    last[ch] = i',
          'print(last)                # {\'a\': 3, \'b\': 2}',
        ),
        '',
        'But the dict remembers characters from **before** the window too. `l` must only ever move right. If `l` is already 3 and `last["a"]` is 1, where would `l = last["a"] + 1` put it?',
      ),
    },
    'max-sum-k': {
      section: WINDOW,
      read: md(
        'Summing every window from scratch works, but costs O(k) per window:',
        '',
        py(
          'nums, k = [1, 2, 3, 4], 2',
          'print([sum(nums[i:i + k]) for i in range(len(nums) - k + 1)])  # [3, 5, 7]',
        ),
        '',
        'Each window differs from the one before by **one number in and one number out**. Use that to update the sum in O(1). And since numbers may be negative, start the best answer from the first window, not from 0.',
      ),
    },
    'two-distinct': {
      section: WINDOW,
      read: md(
        'Keep a dict of **counts** for the window. `len(counts)` is the number of different characters — but only if a character whose count drops to 0 is deleted:',
        '',
        py(
          'counts = {"a": 1, "b": 2}',
          'counts["a"] -= 1',
          'print(len(counts))         # 2',
          'del counts["a"]',
          'print(len(counts))         # 1',
        ),
        '',
        'The rule for this window is `len(counts) <= 2`.',
      ),
    },
    'window-template': {
      section: WINDOW,
      read: md(
        'A clear template answer has five parts, in this order:',
        '',
        '1. **The window**: `[l, r]` over a contiguous part, and what you store about it (a set or a dict).',
        '2. **The rule**: when is the window valid?',
        '3. **Grow**: move `r`, add `s[r]`.',
        '4. **Shrink**: while invalid, remove `s[l]`, move `l`.',
        '5. **Cost**: count total pointer moves over the whole run ([[amortized]]), plus the memory of what you store.',
        '',
        'An extra point for a strong answer: an improvement, and the trap it brings.',
      ),
    },
    'min-window-explain': {
      section: MINWIN,
      read: md(
        'Before the steps, say **what you count**. `t` can repeat letters, so you need a count per letter, not a set:',
        '',
        py(
          'from collections import Counter',
          'need = Counter("aab")',
          'print(need, len("aab"))    # Counter({\'a\': 2, \'b\': 1}) 3',
        ),
        '',
        'A second number, “how many characters are still missing”, tells you in O(1) whether the window is valid — no need to compare whole dicts. Then explain when you grow, when you shrink, when you save, and the cost.',
      ),
    },
  },

  'net-udp-tls': {
    'udp-features': {
      section: UDP_SECTION,
      read: md(
        'Think of TCP as a **phone call**: you dial first (handshake), words arrive in order, and if a word is lost the other side asks “sorry?”.',
        '',
        '[[udp|UDP]] is like **postcards**: you just drop each one in the box. Each card travels on its own — it may arrive late, out of order, or not at all, and the post office never tells you. UDP adds very little on top of IP: [[port|ports]], a length and a checksum.',
        '',
        'For each feature in the question, ask: does a postcard do that?',
      ),
    },
    'udp-use': {
      section: UDP_SECTION,
      read: md(
        'Ask two questions about the data:',
        '',
        '1. **Must every byte arrive, in order?** A file, a database write, a piece of JavaScript — one missing byte breaks the whole thing.',
        '2. **Is late data still useful?** In a voice call or a game, a sound or position from half a second ago is worth nothing; the next one matters more.',
        '',
        'TCP waits and resends until everything is there. That is perfect for the first kind and painful for the second.',
      ),
    },
    'udp-loss': {
      section: UDP_SECTION,
      read: md(
        'TCP notices loss because the receiver sends ACKs and the sender counts them. UDP has **no ACKs and no numbering** — the [[datagram]] is gone and no layer keeps track.',
        '',
        'So someone else must keep count. An app that cares can put its own number in every message, notice a gap, and choose what to do: skip it, ask again, or hide it (a video call can repeat the last frame).',
      ),
    },
    'dns-udp': {
      section: UDP_SECTION,
      read: md(
        'Count **round trips**, then multiply by the [[rtt|RTT]]:',
        '',
        '- The question and its answer always cost one round trip.',
        '- Every setup step before the question costs one more: a TCP [[handshake]], and on top of that a TLS handshake (one round trip for TLS 1.3).',
        '',
        'Which setup steps does each transport need **before** the question can leave? A DNS question is tiny, so with UDP it fits in a single message.',
      ),
    },
    'quic-why': {
      section: QUIC_SECTION,
      read: md(
        'Where does each protocol live?',
        '',
        '- **TCP** is built into every operating system (Windows, Linux, phones) and is inspected by many boxes on the way: routers, firewalls, NAT. Changing how TCP works means updating all of them — that takes many years.',
        '- **UDP** is so simple that almost every network lets it through, and an app can put whatever it likes inside.',
        '',
        'So a new protocol that runs **inside the app** on top of UDP can ship with a browser update. [[quic|QUIC]] rebuilds what it needs — resending, ordering, encryption — itself. Ordering per stream also removes [[head-of-line blocking]] between requests.',
      ),
    },
    'tls-three': {
      section: TLS_SECTION,
      read: md(
        'Imagine three different attackers on the Wi-Fi:',
        '',
        '1. One **reads** everything you send.',
        '2. One **pretends to be** the bank and answers you.',
        '3. One **changes** your messages on the way (“send $10” → “send $1,000”).',
        '',
        'A safe connection needs one protection against each. Notice that hiding the data (1) does not help against (2): if you are talking to the wrong server, you encrypt your secrets **for the attacker**. Ordering and resending lost data are not security — another layer already does that.',
      ),
    },
    'sym-asym': {
      section: KEYS_SECTION,
      read: md(
        '[[symmetric encryption|Symmetric]] encryption uses **one shared key** on both sides. It is very fast (AES, ChaCha20), so it can protect gigabytes. Its problem: how do two strangers get the same key without anyone seeing it?',
        '',
        'Asymmetric keys come as a **pair**: a public key everyone may see and a private key that never leaves its owner. They are much slower, but they can do what shared keys cannot: prove who you are (a signature) and help two sides agree on a secret.',
        '',
        'TLS uses each kind for the job it is good at. Which kind should protect every byte of a page?',
      ),
    },
    'dh-print': {
      section: 'Diffie–Hellman by hand',
      read: md(
        '`pow(g, a, p)` means g to the power a, then the remainder after dividing by p — the same as `g ** a % p`, but fast even for huge numbers:',
        '',
        py(
          'print(pow(2, 5, 7), 2 ** 5 % 7)  # 4 4',
        ),
        '',
        'The idea of Diffie–Hellman is like mixing paint: each side keeps a secret colour, mixes it with a shared public colour and sends the mix. Then each adds its own secret to the **other** side’s mix — both end with the same final colour, but nobody watching can unmix it. Work out each `pow` step by step, then compare the two final values.',
      ),
    },
    'forward-secrecy': {
      section: KEYS_SECTION,
      read: md(
        'In TLS 1.3 the server’s long-term private key only **signs** — it proves the server is real. The session key comes from a key exchange with **temporary secrets** that are created for one connection and then thrown away.',
        '',
        'To answer questions like this, follow the key: was the stolen key ever used to make the session key? Does anything that was recorded let someone rebuild the temporary secrets? That property has a name: [[forward secrecy]].',
      ),
    },
    'cert-checks': {
      section: BROWSER_SECTION,
      read: md(
        'A [[certificate]] works like a passport. A border officer does not trust a passport just because it looks official. They check:',
        '',
        '- **Who issued it**: a country they trust? For a certificate, the chain must lead up to a root [[certificate authority]] that the browser trusts.',
        '- **Whose it is**: the name must be the person in front of them. For a site, the name in the certificate must match the host you visit (`*.example.com` covers one level of subdomains).',
        '- **Is it still valid**: not expired.',
      ),
    },
    'verify-false': {
      section: BROWSER_SECTION,
      read: md(
        'TLS makes three promises, and each depends on something: encryption on the session key, integrity on checks of every message, and **knowing who the server is** on the certificate check.',
        '',
        'So ask: if you switch the certificate check off, which promise is gone? Is the data still encrypted — and if yes, encrypted for whom?',
        '',
        'A certificate error always has a real cause: an incomplete chain, the wrong name, or an expired date. Fix the cause, and stop it from coming back (automatic renewal and an alert before expiry).',
      ),
    },
    'what-visible': {
      section: BROWSER_SECTION,
      read: md(
        'Think of a sealed envelope. The postman must read the **address** to deliver it, but cannot read the **letter** inside.',
        '',
        'With HTTPS, the “address” part is what the network needs to deliver your traffic: the server’s IP, the site name you looked up in DNS, and the name in the [[sni|SNI]] field of the handshake. Everything inside the HTTP message is the letter. Also, anyone can see **how big** the envelopes are and **when** they are sent.',
        '',
        'For each part of a visit — the site name, the path, a cookie, a password — decide: address or letter?',
      ),
    },
    'missing-packets': {
      section: UDP_SECTION,
      read: md(
        'Two tools make this short. `range(1, total + 1)` gives every number that **should** arrive (the end of a range is not included), and a set answers “did this one arrive?” in O(1) and ignores duplicates:',
        '',
        py(
          'print(list(range(1, 4)))   # [1, 2, 3]',
          'got = set([2, 2, 1])',
          'print(got, 3 in got)       # {1, 2} False',
        ),
        '',
        'Walk the numbers in order, and the result comes out sorted for free.',
      ),
    },
    'first-byte-transport': {
      section: QUIC_SECTION,
      read: md(
        'The time is **round trips × RTT**, and each transport needs a fixed number of round trips. A dict maps a name to its number, so the function becomes one lookup and one multiplication:',
        '',
        py(
          'price = {"tea": 2, "cake": 5}',
          'print(price["cake"] * 3)   # 15',
        ),
        '',
        'The prompt lists the round trips for every transport — copy them carefully into the dict.',
      ),
    },
    'tcp-or-udp': {
      section: UDP_SECTION,
      read: md(
        'A strong trade-off answer has four parts:',
        '',
        '1. **What each one gives** and what it costs: setup round trips, waiting for resends, or no guarantees at all.',
        '2. **The deciding question**: must every byte arrive, and is late data still useful?',
        '3. **One real example for each** side, with the reason.',
        '4. **What QUIC changes**: what it keeps from each side, and what HTTP/3 gains.',
      ),
    },
    'https-walkthrough': {
      section: TLS_SECTION,
      read: md(
        'Tell it as a story in time order, and link each step to the promise it gives:',
        '',
        '1. TCP connects first.',
        '2. The server shows its [[certificate]]; the browser checks it → **who** you are talking to.',
        '3. Both sides agree on a session key without ever sending it (Diffie–Hellman) → nobody else has the key.',
        '4. Every byte, including the password, is encrypted with fast [[symmetric encryption]], and changes are detected → **privacy** and **integrity**.',
        '',
        'End with the limits: what stays safe later ([[forward secrecy]]) and what is still visible on the network.',
      ),
    },
  },

  'mock-2026-11-22': {
    'first-unique': {
      lessonId: 'dsa-arrays-hashing',
      section: HASH_CORE,
      read: md(
        '“The first item that appears exactly once” needs two facts per item: **how often** it appears (you only know that after seeing the whole input) and **where** it is (order). One pass cannot know a count before it has seen everything, so use two passes: count first, then walk again in order.',
        '',
        '`Counter` counts in one line, and a missing key counts as 0:',
        '',
        py(
          'from collections import Counter',
          'c = Counter("banana")',
          'print(c["a"], c["b"], c["z"])   # 3 1 0',
        ),
      ),
    },
    'hash-o1': {
      lessonId: 'dsa-arrays-hashing',
      section: HASH_CORE,
      read: md(
        HASH_TABLE,
        '',
        'A full answer covers: how a key becomes a slot, why it is O(1) on average and not always, what many collisions do, what happens when the table grows, and which keys are allowed.',
      ),
    },
    'far-api': {
      lessonId: 'net-latency-tcp',
      section: BEFORE_FIRST_BYTE,
      read: md(
        'Start by splitting the 600 ms: how much is server time, and how much is waiting on the network? Then count the round trips of a new HTTPS connection and multiply by a trans-Pacific RTT (about 150–200 ms).',
        '',
        'Fixes come in three groups: reuse connections, make fewer calls, and move closer to the users.',
      ),
    },
  },
  'mock-2026-11-29': {
    'is-subsequence': {
      lessonId: 'dsa-two-pointers',
      section: TP_LOOPS,
      read: md(
        'This is the **same-direction** shape, but over two strings: one pointer in `s`, one in `t`. The pointer in `t` moves every step; the pointer in `s` only moves when it finds what it is looking for.',
        '',
        'Why is it safe to take the **first** match you see? Matching a character of `s` as early as possible leaves the most of `t` for the characters still to come — a later match could never leave more.',
        '',
        'Before coding, try the edge cases by hand: an empty `s`, an empty `t`, and a repeated letter like `"aa"`.',
      ),
    },
    'tp-vs-sw': {
      lessonId: 'dsa-sliding-window',
      section: WINDOW,
      read: md(
        'Start with what the two patterns share: both replace nested loops with indexes that only move forward, so both are usually O(n). Then give the **signals** that tell them apart: what the input looks like (sorted? contiguous?), which way the pointers move, and what the answer is (a pair, or a part).',
        '',
        'Use one known problem for each. A great answer also says when a window **fails** — think about what negative numbers do to a sum.',
      ),
    },
    'wifi-https': {
      lessonId: 'net-udp-tls',
      section: BROWSER_SECTION,
      read: md(
        'Answer in three parts:',
        '',
        '1. **Visible**: what the network needs to deliver the traffic (the “address on the envelope”), plus sizes and timing.',
        '2. **Hidden**: everything inside the HTTP messages, encrypted with the session key, with changes detected.',
        '3. **Not fooled**: how the [[certificate]] checks stop a fake bank, and what [[forward secrecy]] adds.',
      ),
    },
  },
}
