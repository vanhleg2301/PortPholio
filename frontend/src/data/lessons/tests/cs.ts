import type { LessonTest } from '../types'
import { choice } from './helpers'

export const CS_TESTS: Record<string, LessonTest> = {
  'net-latency-tcp': {
    choice: [
      choice('ttfb', 'RTT is 100 ms. A **new** HTTPS connection with TLS 1.3, DNS already cached, server time 0. When does the first response byte arrive?',
        ['300 ms', '100 ms', '200 ms', '400 ms'],
        'Three round trips: TCP handshake (1) + TLS 1.3 handshake (1) + the request itself (1) = 3 × 100 ms. With TLS 1.2 it would be 400 ms.'),
      choice('bandwidth-small', 'A 20 KB API response, RTT 150 ms. You upgrade from 50 Mbit/s to 100 Mbit/s. What happens to the response time?',
        ['Almost nothing: sending 20 KB takes ~3 ms vs ~1.6 ms, while the round trips cost hundreds of ms', 'It becomes about 2× faster', 'It becomes about 4× faster', 'It becomes slower because of congestion'],
        '20 KB = 160 kbit. At 50 Mbit/s that is 3.2 ms; at 100 Mbit/s 1.6 ms. Each round trip costs 150 ms. For small responses, [[latency]] matters much more than [[bandwidth]].'),
      choice('light-floor', 'Light in fibre moves at about 200,000 km/s. What is the **minimum** RTT between two cities 10,000 km apart?',
        ['100 ms', '50 ms', '200 ms', '10 ms'],
        'One way: 10,000 / 200,000 s = 50 ms. A round trip is twice that: 100 ms. Real networks are slower (routes are not straight, routers add delay). No software can beat this number — only moving servers closer can.'),
      choice('three-way', 'Why does TCP need **three** messages (SYN, SYN-ACK, ACK) to open a connection, and not two?',
        ['Both sides must send their starting sequence number and get it confirmed, so each direction is checked', 'The third message carries the HTTP request', 'Two messages would be too fast for the network', 'The third message is the TLS certificate'],
        'SYN: “my numbers start at x”. SYN-ACK: “got x; my numbers start at y”. ACK: “got y”. After this both sides know that both directions work. This also stops old, delayed SYN packets from opening fake connections.'),
      choice('slow-start-count', 'Slow start: the first window is 14 KB and it doubles every round trip. How many round trips does it take to send 100 KB on a new connection?',
        ['4', '3', '7', '1'],
        'After 1 RTT: 14 KB. After 2: 14 + 28 = 42 KB. After 3: 42 + 56 = 98 KB — still less than 100. After 4: done. So even a 100 KB page needs 4 round trips just for the data.'),
      choice('hol', 'With TCP, one packet in the middle of a stream is lost. What happens to the packets that arrive after it?',
        ['They wait in the receiver’s buffer; the app gets nothing until the lost packet is sent again', 'The app gets them right away, and the lost one later', 'They are thrown away and must all be sent again', 'TCP skips the lost packet'],
        'TCP promises **in-order** bytes, so later data cannot be given to the app before the missing part. This is [[head-of-line blocking]]. HTTP/2 runs many streams on one TCP connection, so one lost packet blocks all of them — one reason for HTTP/3 over QUIC.'),
      choice('flow-vs-congestion', 'What is the difference between flow control and congestion control?',
        ['Flow control protects the **receiver** from too much data; congestion control protects the **network**', 'They are two names for the same thing', 'Flow control is for UDP, congestion control is for TCP', 'Flow control encrypts data; congestion control compresses it'],
        'The receiver tells the sender how much free [[buffer]] space it has (the receive window). The sender also limits itself with the [[congestion window]], which it guesses from packet loss. It sends at most the smaller of the two.'),
      choice('keep-alive', 'Why do [[keep-alive]] and [[connection pool|connection pools]] make APIs faster?',
        ['They reuse an open connection, so you skip the TCP and TLS handshakes and slow start begins only once', 'They compress the data', 'They make packets travel faster', 'They remove the need for DNS'],
        'A new connection costs 2 RTTs of handshakes (TCP + TLS 1.3) and starts with a small window. A reused connection is already “warm”. Every database driver and HTTP client uses pools for this reason.'),
      choice('chatty', 'A page makes 10 API calls **one after another** on an open connection. RTT is 80 ms, server time is 0. How long does it take, and how long with one batched call?',
        ['800 ms vs 80 ms', '80 ms vs 80 ms', '800 ms vs 240 ms', '2,400 ms vs 80 ms'],
        'Each call waits a full round trip before the next starts: 10 × 80 ms. One call that returns everything costs one round trip. This is why GraphQL, batch endpoints and “backend for frontend” services exist.'),
      choice('cdn', 'Which change reduces **propagation** delay?',
        ['Serving content from a [[cdn|CDN]] or a server region close to the users', 'Buying more bandwidth', 'Faster server code', 'Compressing the response'],
        '[[propagation delay|Propagation]] depends only on distance. The only fix is to make the distance shorter. Bandwidth helps transmission, faster code helps processing.'),
      choice('tls-versions', 'How many round trips does the TLS handshake need with TLS 1.2 and with TLS 1.3 (new connection)?',
        ['2 and 1', '1 and 1', '3 and 2', '2 and 0'],
        'TLS 1.3 sends the key share in the first message, so it saves one round trip. (TLS 1.3 can even use 0-RTT when you connect to the same server again, with some security limits.)'),
      choice('loss-detect', 'How does a TCP sender know that a packet was lost?',
        ['No ACK arrives in time (timeout), or it receives several duplicate ACKs for the same position', 'The router sends an error message', 'The receiver sends a NACK for every packet', 'It never knows; the app must check'],
        'The receiver ACKs the next byte it expects. If a packet is missing, later packets cause the same ACK again (duplicate ACKs) — after 3 of them the sender resends quickly. Otherwise a timer runs out. In both cases TCP also lowers its window.'),
    ],
    code: [
      {
        id: 'slow-start-cap',
        title: 'Slow start with a maximum window',
        prompt: 'Return how many round trips it takes to send `size_kb` on a new connection. The window starts at `initial_kb`, doubles every round trip, but **never grows above `max_kb`** (the receiver’s limit).',
        starter: `def round_trips(size_kb, initial_kb=14, max_kb=64):
    # your code here
    pass`,
        tests: `assert round_trips(10) == 1
assert round_trips(100) == 4
assert round_trips(200) == 5
assert round_trips(1000) == 18
assert round_trips(1000, max_kb=10_000) == 7`,
        hint: 'Loop while `sent < size_kb`: add the window, then `window = min(window * 2, max_kb)`, and count the round trip.',
        solution: `def round_trips(size_kb, initial_kb=14, max_kb=64):
    window, sent, trips = initial_kb, 0, 0
    while sent < size_kb:
        sent += window
        window = min(window * 2, max_kb)
        trips += 1
    return trips`,
      },
      {
        id: 'reuse-connection',
        title: 'What keep-alive saves',
        prompt: 'A client sends `n` requests one after another (TLS 1.3, DNS cached, server time 0). A **new** connection costs 3 RTTs for its first request (TCP + TLS + request). On a **reused** connection each next request costs 1 RTT. Return the total time in ms: with `reuse=True` one connection is opened once; with `reuse=False` every request opens a new connection.',
        starter: `def total_time_ms(n, rtt_ms, reuse):
    # your code here
    pass`,
        tests: `assert total_time_ms(5, 100, True) == 700
assert total_time_ms(5, 100, False) == 1500
assert total_time_ms(1, 50, True) == 150
assert total_time_ms(0, 50, True) == 0`,
        hint: 'With reuse: 3 RTTs for the first request + 1 RTT for each of the other n − 1.',
        solution: `def total_time_ms(n, rtt_ms, reuse):
    if n == 0:
        return 0
    if reuse:
        return 3 * rtt_ms + (n - 1) * rtt_ms
    return 3 * rtt_ms * n`,
      },
    ],
    explain: [
      {
        id: 'type-url',
        question: '“What happens when you type `https://example.com` and press Enter?” Answer for the network part: list each step in order and how many round trips it costs.',
        points: [
          'DNS: the browser/OS cache, then a resolver turns the name into an IP (0 RTT if cached, often 1+)',
          'TCP three-way handshake: 1 RTT',
          'TLS handshake: 1 RTT with TLS 1.3 (2 with 1.2); the server proves who it is with a certificate',
          'HTTP request and the first response bytes: 1 RTT (plus server time)',
          'Slow start: a big response needs more round trips; the page then loads more files (keep-alive/HTTP/2 reuse the connection)',
        ],
        answer: 'First the browser needs an IP address: it checks its own cache and the OS cache, and if the name is not there it asks a DNS resolver — that can be one or more round trips. Next, TCP opens a connection with the three-way handshake, SYN, SYN-ACK, ACK: one round trip. Then the TLS handshake agrees on keys and the server shows its certificate so the browser can check it is really example.com: one round trip with TLS 1.3, two with TLS 1.2. Only then does the browser send `GET /`, and the first bytes come back after one more round trip plus the server’s time. So a new HTTPS page costs about 3 round trips plus DNS before the first byte. Because of slow start, a big HTML file needs a few more round trips, and the page then asks for CSS, JS and images, usually on the same connection with keep-alive or HTTP/2.',
      },
      {
        id: 'slow-for-vietnam',
        question: 'Your API is fast for users in the US, where the servers are, but slow for users in Vietnam. Explain why with numbers, and give three fixes.',
        points: [
          'Distance: Vietnam ↔ US west coast is ~12,000+ km, so the RTT is at least ~125 ms, often 200+ ms in reality',
          'Each new connection pays several RTTs (TCP + TLS + request), and chatty pages pay one RTT per sequential call',
          'Bandwidth is not the problem; the number of round trips × RTT is',
          'Fixes: a CDN/edge for static and cacheable content; a server region in Asia (e.g. Singapore)',
          'Fewer round trips: keep-alive / connection reuse, HTTP/2, TLS 1.3, batching calls, caching',
        ],
        answer: 'The difference is distance. From Vietnam to the US west coast is about 12,000 km, so light in fibre alone needs about 125 ms for a round trip, and real routes are often 200 ms or more. A US user might have 20 ms. A new HTTPS connection needs about 3 round trips before the first byte, so that is about 600 ms for the Vietnamese user versus 60 ms in the US — and if the page then makes five API calls one after another, add another second. More bandwidth would not help, because the problem is round trips × RTT. Fixes: (1) put static and cacheable content on a CDN with edge servers near Vietnam; (2) run the API, or at least a read replica, in an Asian region like Singapore; (3) cut round trips — reuse connections with keep-alive, use HTTP/2 and TLS 1.3, batch the API calls into one, and cache responses.',
      },
      {
        id: 'slow-start-why',
        question: 'Explain TCP slow start: what it does, why it exists, and what it means for a 1 MB download on a new connection.',
        points: [
          'The sender does not know how much the network can carry, so it starts small (~10 packets ≈ 14 KB)',
          'It doubles the congestion window each round trip (exponential growth) until loss or a limit',
          'On packet loss it reduces the window — this protects shared networks from collapse',
          'A 1 MB download needs about 7 round trips just for slow start, so short connections never reach full speed',
          'This is why connection reuse and fewer, smaller responses matter',
        ],
        answer: 'When a TCP connection starts, the sender has no idea how much the path can carry, and sending too much at once would fill router queues and cause loss for everyone. So it starts with a small congestion window, about 10 packets or 14 KB, and doubles it after every round trip in which the data was ACKed. When a packet is lost, it takes this as a sign of congestion and lowers the window. For a 1 MB download, 14 + 28 + 56 + … KB means about 7 round trips before all the data is sent, even if the line is very fast — with a 150 ms RTT, that is about a second. Short connections never reach full speed. That is why we reuse warm connections with keep-alive and pools, and why smaller responses load much faster.',
      },
    ],
  },
}
