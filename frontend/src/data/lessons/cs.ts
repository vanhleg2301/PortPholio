import type { Lesson } from './types'

const md = (...lines: string[]) => lines.join('\n')
const HPBN = 'https://hpbn.co'

export const CS_LESSONS: Lesson[] = [
  {
    id: 'net-latency-tcp',
    title: 'Latency, bandwidth and TCP',
    summary:
      'Why the web feels slow even on a fast connection: the number of round trips matters more than bandwidth. See what TCP and TLS do before your first byte arrives, and how slow start holds back every new connection.',
    minutes: 60,
    videos: [
      { label: 'ByteByteGo: What happens when you type a URL into your browser?', url: 'https://www.youtube.com/watch?v=AlkDbnbv7dk' },
      { label: 'Hussein Nasser: TCP vs UDP Crash Course', url: 'https://www.youtube.com/watch?v=qqRYkcta6IE' },
      { label: 'Ben Eater: TCP connection walkthrough', url: 'https://www.youtube.com/watch?v=F27PLin3TV0' },
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Two different numbers',
          '- [[bandwidth|**Bandwidth**]]: how much data the line carries per second (for example 100 Mbit/s).',
          '- [[latency|**Latency**]]: how long one trip takes. The [[rtt|**round-trip time (RTT)**]] is the time to go there and come back.',
          '',
          'For small transfers — most API calls and web pages — **latency matters most**. Double the bandwidth, and a 20 KB response is almost as slow as before. Cut the round trips in half, and it is much faster.',
          '',
          'Latency has four parts:',
          '',
          '| Delay | Cause | You can reduce it by |',
          '| --- | --- | --- |',
          '| [[propagation delay|Propagation]] | distance; light in [[fiber|fibre]] ≈ 200,000 km/s | moving servers closer ([[region|regions]], [[cdn|CDN]]) |',
          '| Transmission | pushing bits onto the wire | more bandwidth, smaller payloads |',
          '| Processing | routers, your server | faster code, caching |',
          '| Queuing | [[congestion]] | less traffic, better routing |',
        ),
      },
      {
        type: 'code',
        id: 'propagation',
        caption: 'Light alone sets a floor on latency. Try other distances.',
        code: `FIBRE_KM_PER_MS = 200          # ~200,000 km/s

def min_rtt_ms(distance_km):
    return 2 * distance_km / FIBRE_KM_PER_MS   # there and back

for route, km in [("Hanoi - Singapore", 2_200), ("Hanoi - Frankfurt", 8_900), ("Hanoi - California", 12_500)]:
    print(f"{route}: at least {min_rtt_ms(km):.0f} ms per round trip")
# Hanoi - Singapore: at least 22 ms per round trip
# Hanoi - Frankfurt: at least 89 ms per round trip
# Hanoi - California: at least 125 ms per round trip`,
      },
      {
        type: 'text',
        md: md(
          '## What happens before the first byte',
          'A new HTTPS connection needs several round trips before any useful data moves:',
          '',
          '1. [[dns|**DNS**]] lookup (if it is not [[cache|cached]]) — the name becomes an IP address.',
          '2. **TCP three-way [[handshake]]** — `SYN`, `SYN-ACK`, `ACK`: **1 RTT**.',
          '3. [[tls|**TLS**]] handshake — **1 RTT** with TLS 1.3 (2 with TLS 1.2).',
          '4. The HTTP request and the first bytes of the response — **1 RTT**.',
        ),
      },
      {
        type: 'diagram',
        caption: 'A new HTTPS request with TLS 1.3: three round trips before the first response byte (plus DNS).',
        mermaid: `sequenceDiagram
  participant C as Client
  participant S as Server
  Note over C,S: RTT 1: TCP handshake
  C->>S: SYN
  S->>C: SYN-ACK
  C->>S: ACK
  Note over C,S: RTT 2: TLS 1.3 handshake
  C->>S: ClientHello + key share
  S->>C: ServerHello + certificate + Finished
  Note over C,S: RTT 3: the actual request
  C->>S: Finished + GET /api/feed
  S->>C: 200 OK + first bytes`,
      },
      {
        type: 'text',
        md: md(
          '## TCP is reliable — but it has a cost',
          '- **Reliable and in order**: if a [[packet]] is lost, TCP sends it again ([[retransmission]]). Bytes always arrive in the right order.',
          '- [[flow control|**Flow control**]]: the receiver says how much data it can hold in its [[buffer]], so a fast sender cannot flood it.',
          '- [[congestion control|**Congestion control**]] and [[slow start|**slow start**]]: a new connection starts with a small [[congestion window|window]] (about **10 packets ≈ 14 KB**). It **doubles the window every round trip** until a packet is lost or it reaches the limit. So a new connection is slow, even on a fast line.',
          '- [[head-of-line blocking|**Head-of-line blocking**]]: one lost packet holds back everything behind it, because TCP must deliver bytes in order. This is one reason why HTTP/3 uses [[quic|QUIC]] over UDP.',
          '',
          'What this means in practice: **reuse connections** ([[keep-alive]], [[connection pool|connection pools]]) and **cut round trips** (batch requests, [[cache]], put servers close to users).',
        ),
      },
      {
        type: 'code',
        id: 'slow-start',
        caption: 'Simulated slow start: how many round trips does it take to send a response?',
        code: `def round_trips_to_send(size_kb, initial_window_kb=14):
    window, sent, trips = initial_window_kb, 0, 0
    while sent < size_kb:
        sent += window        # one window per round trip
        window *= 2           # slow start doubles it
        trips += 1
    return trips

for size in [10, 50, 200, 1_000]:
    print(f"{size:>5} KB -> {round_trips_to_send(size)} round trips")
#    10 KB -> 1 round trips
#    50 KB -> 3 round trips
#   200 KB -> 4 round trips
#  1000 KB -> 7 round trips`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'For “What happens when you type a URL?” or “Why is this slow?”, **count the round trips** (DNS + TCP + TLS + request) and multiply by the RTT. This one sum makes your answer clear and concrete.',
      },
      {
        type: 'exercise',
        id: 'time-to-first-byte',
        title: 'Time to first byte',
        prompt: 'Return the milliseconds until the first response byte for a **new** HTTPS connection: DNS (`dns_ms`, 0 if cached) + 1 RTT for TCP + TLS (1 RTT for version `"1.3"`, 2 for `"1.2"`) + 1 RTT for the request + `server_ms` of processing.',
        starter: `def time_to_first_byte(rtt_ms, tls_version, server_ms, dns_ms=0):
    # your code here
    pass`,
        tests: `assert time_to_first_byte(100, "1.3", 20) == 320
assert time_to_first_byte(100, "1.2", 20) == 420
assert time_to_first_byte(50, "1.3", 0, dns_ms=30) == 180`,
        hint: 'Count the round trips: 1 (TCP) + TLS trips + 1 (request).',
        solution: `def time_to_first_byte(rtt_ms, tls_version, server_ms, dns_ms=0):
    tls_trips = 1 if tls_version == "1.3" else 2
    return dns_ms + (1 + tls_trips + 1) * rtt_ms + server_ms`,
      },
      {
        type: 'exercise',
        id: 'sequential-vs-batched',
        title: 'Chatty API vs one batched call',
        prompt: 'A page makes `n` small API calls one after another on an **already open** connection (1 RTT each, plus `server_ms` each). Return a tuple `(sequential_ms, batched_ms)`, where batched means one call that returns everything (1 RTT + `server_ms` once).',
        starter: `def sequential_vs_batched(n, rtt_ms, server_ms):
    # your code here
    pass`,
        tests: `assert sequential_vs_batched(10, 120, 5) == (1250, 125)
assert sequential_vs_batched(1, 50, 10) == (60, 60)`,
        hint: 'Sequential pays the round trip n times.',
        solution: `def sequential_vs_batched(n, rtt_ms, server_ms):
    return n * (rtt_ms + server_ms), rtt_ms + server_ms`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Round trips before the first byte on a new HTTPS connection with TLS 1.3 (DNS cached)?', answer: 'Three: TCP handshake, TLS 1.3 handshake, then the request itself.' },
          { question: 'Why is a brand-new connection slow even on gigabit Wi-Fi?', answer: 'Slow start: the window begins around 14 KB and only doubles each round trip, so early transfers are limited by round trips, not bandwidth.' },
          { question: 'Three practical ways to cut latency?', answer: 'Reuse connections (keep-alive/pools), batch requests, and move content closer to users (CDN/regions) — plus caching.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'HPBN: Primer on latency and bandwidth', url: `${HPBN}/primer-on-latency-and-bandwidth/` },
      { label: 'HPBN: Building blocks of TCP', url: `${HPBN}/building-blocks-of-tcp/` },
      { label: 'HPBN: Transport Layer Security', url: `${HPBN}/transport-layer-security-tls/` },
    ],
  },
]
