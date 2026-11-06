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
        type: 'visual',
        visual: 'globe',
        caption: 'Pick two cities: the distance alone sets a floor on latency.',
      },
      {
        type: 'text',
        md: md(
          '## What happens before the first byte',
          'A new HTTPS connection needs several round trips before any useful data moves:',
          '',
          '1. [[dns|**DNS**]] lookup (if it is not [[cache|cached]]) — the name becomes an IP address.',
          '2. **TCP three-way [[handshake]]** — `SYN`, `SYN-ACK`, `ACK`: **1 RTT**. `SYN` sends the client’s starting sequence number, `SYN-ACK` confirms it and sends the server’s, `ACK` confirms the server’s — so both directions are checked.',
          '3. [[tls|**TLS**]] handshake — **1 RTT** with TLS 1.3 (2 with TLS 1.2). The server also sends its **certificate**, which proves (signed by a trusted authority) that it really owns the domain name.',
          '4. The HTTP request and the first bytes of the response — **1 RTT**.',
        ),
      },
      {
        type: 'visual',
        visual: 'handshake',
        caption: 'Switch TLS 1.2 / 1.3 and change the RTT: count the round trips before the first byte.',
      },
      {
        type: 'text',
        md: md(
          '## TCP is reliable — but it has a cost',
          '- **Reliable and in order**: every ACK says “I have everything up to byte N — send N next”. If no ACK comes in time (or the same ACK repeats), the sender knows a [[packet]] was lost and sends it again ([[retransmission]]). Bytes always arrive in the right order.',
          '- [[flow control|**Flow control**]]: the receiver says how much data it can hold in its [[buffer]], so a fast sender cannot flood it. The sender sends at most the **smaller** of this window and its congestion window.',
          '- [[congestion control|**Congestion control**]] and [[slow start|**slow start**]]: a new connection starts with a small [[congestion window|window]] (about **10 packets ≈ 14 KB**). It **doubles the window every round trip** until a packet is lost or it reaches the limit. After a loss it makes the window smaller again. So a new connection is slow, even on a fast line.',
          '- [[head-of-line blocking|**Head-of-line blocking**]]: one lost packet holds back everything behind it, because TCP must deliver bytes in order. This is one reason why HTTP/3 uses [[quic|QUIC]] over UDP.',
          '',
          'What this means in practice: **reuse connections** ([[keep-alive]], [[connection pool|connection pools]]) and **cut round trips** (batch requests, [[cache]], put servers close to users).',
        ),
      },
      {
        type: 'visual',
        visual: 'hol-blocking',
        caption: 'Why one lost packet can stall a whole response.',
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
        type: 'visual',
        visual: 'slow-start',
        caption: 'Try 50 KB, 200 KB and 1,000 KB.',
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
  {
    id: 'net-udp-tls',
    title: 'UDP and TLS',
    summary:
      'UDP sends packets with no promises — no handshake, no order, no resending — and that is exactly why live video, games and DNS like it. TLS is what makes a connection private and proves who the server is.',
    minutes: 60,
    videos: [
      { label: 'Hussein Nasser: TCP vs UDP Crash Course', url: 'https://www.youtube.com/watch?v=qqRYkcta6IE' },
      { label: 'ByteByteGo: SSL, TLS, HTTPS Explained', url: 'https://www.youtube.com/watch?v=j9QmMEWmcfo' },
      { label: 'Sunny Classroom: SSL/TLS handshake', url: 'https://www.youtube.com/watch?v=sEkw8ZcxtFk' },
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## UDP: just send it',
          'UDP sends [[datagram|datagrams]]: separate packets, each with a [[port]] number that says which app it is for. There is **no handshake, no ordering, no resending and no congestion control**. The header is only 8 bytes. If a datagram is lost, nobody notices — unless the application checks.',
          '',
          '| | TCP | UDP |',
          '| --- | --- | --- |',
          '| Setup | 3-way handshake (1 RTT) | none — send at once |',
          '| Order | always in order | any order |',
          '| Lost data | sent again | lost (the app decides) |',
          '| Speed control | congestion control | none built in |',
          '| Good for | web pages, APIs, files, databases | DNS, live video and voice, games, QUIC |',
          '',
          'UDP is not “bad TCP”. It is a choice: when **late data is useless** (a video frame, a game position), waiting for a resend only makes things worse.',
        ),
      },
      {
        type: 'visual',
        visual: 'udp-vs-tcp',
        caption: 'The same lost packet: TCP waits and delivers everything late; UDP delivers the rest at once.',
      },
      {
        type: 'code',
        id: 'dns-transport',
        caption: 'Why DNS uses UDP: one small question, one small answer — no setup.',
        code: `def lookup_ms(rtt_ms, transport):
    if transport == "udp":
        return 1 * rtt_ms      # question + answer
    if transport == "tcp":
        return 2 * rtt_ms      # handshake, then question + answer
    if transport == "https":
        return 3 * rtt_ms      # TCP + TLS 1.3 + question (DNS over HTTPS, new connection)

for t in ["udp", "tcp", "https"]:
    print(t, lookup_ms(40, t), "ms")
# udp 40 ms
# tcp 80 ms
# https 120 ms`,
      },
      {
        type: 'text',
        md: md(
          '## QUIC: reliability on top of UDP',
          'HTTP/3 runs on [[quic|QUIC]], which is built on UDP. QUIC adds what the app needs: resending, order **per stream** (so one lost packet does not block other requests — no [[head-of-line blocking]] between streams) and TLS 1.3 built in, so a new connection needs only one round trip. Why not just change TCP? TCP lives inside every operating system and in many network boxes; changing it takes years. UDP passes through almost everywhere, so new ideas can ship inside apps.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## TLS: three promises',
          '[[tls|TLS]] (the S in HTTPS) gives a connection three things:',
          '',
          '1. **Privacy** — [[encryption]]: people on the network see only random-looking bytes.',
          '2. **Authentication** — the server shows a [[certificate]] that a trusted [[certificate authority]] signed, so you know you are talking to the real `bank.com`.',
          '3. **Integrity** — if someone changes the data on the way, the receiver notices.',
          '',
          'Encryption without authentication is not enough: an attacker in the middle could happily encrypt your traffic **to themselves**.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Two kinds of keys',
          '- [[symmetric encryption|Symmetric]]: one shared secret key encrypts and decrypts. Very fast (AES, ChaCha20). Used for all the actual data.',
          '- **Asymmetric**: a [[public key]] that everyone may see and a [[private key]] that never leaves the server. Slow, so it is only used to set things up: to prove identity (signatures) and to agree on the shared key.',
          '',
          'How can two sides agree on a secret key while everyone listens? With a [[key exchange]] (Diffie–Hellman). Each side keeps a secret number, sends a public value, and both compute the **same** key — but someone who sees only the public values cannot. TLS 1.3 makes new secret numbers for every connection, so even if the server’s private key is stolen later, old recorded traffic stays safe: [[forward secrecy]].',
        ),
      },
      {
        type: 'code',
        id: 'diffie-hellman',
        caption: 'A toy Diffie–Hellman with tiny numbers (real ones have hundreds of digits). Change a and b.',
        code: `p, g = 23, 5        # public: a prime and a base
a = 6               # Alice's secret, never sent
b = 15              # Bob's secret, never sent

A = pow(g, a, p)    # Alice sends A = g^a mod p
B = pow(g, b, p)    # Bob sends   B = g^b mod p
print("on the network:", A, B)

print("Alice computes:", pow(B, a, p))   # (g^b)^a
print("Bob computes:  ", pow(A, b, p))   # (g^a)^b  -> the same number
# on the network: 8 19
# Alice computes: 2
# Bob computes:   2`,
      },
      {
        type: 'visual',
        visual: 'handshake',
        caption: 'Switch between TLS 1.3 and 1.2: the certificate and key shares travel in the handshake before any request.',
      },
      {
        type: 'diagram',
        caption: 'A certificate chain: your device trusts a few root authorities; they vouch for intermediates, which vouch for the site.',
        mermaid: `flowchart TD
  R["Root CA<br/>(built into your OS / browser)"] -- signs --> I["Intermediate CA"]
  I -- signs --> L["example.com certificate<br/>(public key of the server)"]
  L -- "the server proves it has the matching private key" --> S["You are talking to example.com"]`,
      },
      {
        type: 'text',
        md: md(
          '## What the browser checks — and what TLS does not hide',
          '- The chain leads to a **trusted root**, the **name** in the certificate matches the site, and the certificate has **not expired**. If any check fails, you get a certificate error.',
          '- Never “fix” such an error with `verify=False`: that switches off authentication, so anyone could pretend to be the server.',
          '- TLS hides the content, not everything: the site name is still visible in DNS and in the [[sni|SNI]] field of the handshake, and the sizes and timing of messages can tell a lot.',
          '- Expired certificates are a classic cause of outages. Renew them automatically (Let’s Encrypt) and watch the expiry date.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '“TCP or UDP?” — give the trade-off and one example each: TCP when every byte must arrive in order (APIs, files); UDP when late data is useless (calls, games) or the exchange is tiny (DNS). For “How does HTTPS work?”, walk it in order: certificate check → key exchange → fast symmetric encryption, and mention that TLS 1.3 needs one round trip.',
      },
      {
        type: 'exercise',
        id: 'dh-shared',
        title: 'Diffie–Hellman by hand',
        prompt: 'Return a tuple `(A, B, alice_key, bob_key)`: the two public values `A = g^a mod p`, `B = g^b mod p`, and the key each side computes from what it received. Use `pow(x, y, p)`. Both keys must be equal.',
        starter: `def dh_shared(p, g, a, b):
    # your code here
    pass`,
        tests: `assert dh_shared(23, 5, 6, 15) == (8, 19, 2, 2)
A, B, k1, k2 = dh_shared(10007, 5, 1234, 4321)
assert k1 == k2 and A == pow(5, 1234, 10007)
assert dh_shared(23, 5, 1, 1) == (5, 5, 5, 5)`,
        hint: 'Alice uses B and her own a: `pow(B, a, p)`. Bob uses A and his own b.',
        solution: `def dh_shared(p, g, a, b):
    A = pow(g, a, p)
    B = pow(g, b, p)
    return A, B, pow(B, a, p), pow(A, b, p)`,
      },
      {
        type: 'exercise',
        id: 'tcp-deliver',
        title: 'What TCP gives to the app',
        prompt: 'Packets numbered 1, 2, 3, … arrive in the order given by `arrivals` (some may be missing). TCP gives bytes to the app **only in order**: a packet is delivered as soon as every packet before it has arrived. Return the list of packets delivered to the app, in the order the app gets them.',
        starter: `def tcp_deliver(arrivals):
    # your code here
    pass`,
        tests: `assert tcp_deliver([1, 2, 3]) == [1, 2, 3]
assert tcp_deliver([1, 2, 4, 5, 3]) == [1, 2, 3, 4, 5]
assert tcp_deliver([1, 3, 4]) == [1]
assert tcp_deliver([2, 1]) == [1, 2]
assert tcp_deliver([]) == []`,
        hint: 'Keep `next_needed = 1` and a set `waiting`. After each arrival, while `next_needed` is in `waiting`, deliver it and add 1.',
        solution: `def tcp_deliver(arrivals):
    waiting = set()
    next_needed = 1
    out = []
    for p in arrivals:
        waiting.add(p)
        while next_needed in waiting:
            waiting.remove(next_needed)
            out.append(next_needed)
            next_needed += 1
    return out`,
      },
      {
        type: 'exercise',
        id: 'is-trusted',
        title: 'Check a certificate chain',
        prompt: '`chain` is a list of certificates from the site up, each a dict with `"subject"`, `"issuer"` and `"expired"`. Return `True` only if: the first subject equals `host`, no certificate is expired, every certificate’s issuer is the subject of the next one, and the last issuer is in `roots`. (Real browsers also check signatures — skipped here.)',
        starter: `def is_trusted(chain, host, roots):
    # your code here
    pass`,
        tests: `site = {"subject": "example.com", "issuer": "R3", "expired": False}
inter = {"subject": "R3", "issuer": "ISRG Root X1", "expired": False}
roots = {"ISRG Root X1"}
assert is_trusted([site, inter], "example.com", roots) is True
assert is_trusted([site, inter], "evil.com", roots) is False
assert is_trusted([site, dict(inter, expired=True)], "example.com", roots) is False
assert is_trusted([site, dict(inter, issuer="Unknown CA")], "example.com", roots) is False
assert is_trusted([dict(site, issuer="Other")] + [inter], "example.com", roots) is False
assert is_trusted([], "example.com", roots) is False`,
        hint: 'Check the host and the empty chain first. Loop with an index: compare `chain[i]["issuer"]` with `chain[i + 1]["subject"]`.',
        solution: `def is_trusted(chain, host, roots):
    if not chain or chain[0]["subject"] != host:
        return False
    for i, cert in enumerate(chain):
        if cert["expired"]:
            return False
        if i + 1 < len(chain) and cert["issuer"] != chain[i + 1]["subject"]:
            return False
    return chain[-1]["issuer"] in roots`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why does live video often use UDP?', answer: 'A frame that arrives late is useless. Waiting for TCP to resend it would freeze the picture; skipping it is better.' },
          { question: 'What are the three things TLS gives you?', answer: 'Privacy (encryption), authentication (a certificate signed by a trusted CA) and integrity (changes are detected).' },
          { question: 'Why is symmetric encryption used for the data and not asymmetric?', answer: 'Symmetric encryption is much faster. Asymmetric keys are only used to prove identity and agree on the shared key.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'HPBN: Building blocks of UDP', url: `${HPBN}/building-blocks-of-udp/` },
      { label: 'HPBN: Transport Layer Security', url: `${HPBN}/transport-layer-security-tls/` },
      { label: 'Cloudflare: What happens in a TLS handshake?', url: 'https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/' },
    ],
  },
]
