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
}
