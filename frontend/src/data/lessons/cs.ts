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
        type: 'callout',
        tone: 'compare',
        md: 'Every language talks to the network through the operating system, so the TCP costs are the same in Python, Java or Go. What differs is the default **connection reuse**: Python’s `requests.get(url)` opens a fresh connection each call (use a `requests.Session` to keep it alive), while Java’s `HttpClient`, Go’s `http.Client` and Node’s `fetch` pool and reuse connections by default. Reusing a warm connection skips the handshake and slow start.',
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
        type: 'callout',
        tone: 'compare',
        md: 'Python’s `ssl` module and Node use OpenSSL underneath, Java has its own TLS (JSSE), and Go’s `crypto/tls` is written in Go. Each has a switch that turns certificate checks **off** — `verify=False` in Python `requests`, `InsecureSkipVerify` in Go, `rejectUnauthorized: false` in Node. Never ship it: it removes the “you are talking to the real server” promise.',
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
  {
    id: 'net-http-dns',
    title: 'HTTP and DNS',
    summary:
      'The first and the last step of every web request: DNS turns a name into an address, and HTTP is the message you send once the connection is open. Status codes, methods, caching and HTTP/1.1 → 2 → 3 — the parts every backend interview asks about.',
    minutes: 70,
    videos: [
      { label: 'ByteByteGo: Everything you need to know about DNS', url: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ' },
      { label: 'ByteByteGo: HTTP/1 to HTTP/2 to HTTP/3', url: 'https://www.youtube.com/watch?v=a-sBfyiXysI' },
      { label: 'Traversy Media: HTTP crash course', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0' },
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Where this fits',
          'You already know the middle of the story: the TCP handshake and the TLS handshake. This lesson adds the two ends:',
          '',
          '1. **DNS** — before anything else, the browser needs the IP address of `shop.example.com`.',
          '2. TCP handshake, then TLS handshake (earlier lessons).',
          '3. **HTTP** — the browser sends a request message and reads the response message.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## DNS: from a name to an address',
          '[[dns|DNS]] is the phone book of the internet. Asking it is a chain of [[cache|caches]] and servers; each step is tried only when the one before does not know the answer:',
          '',
          '1. the browser’s own cache;',
          '2. the operating system’s cache;',
          '3. a [[dns resolver|recursive resolver]] — your ISP’s, or a public one like `1.1.1.1` or `8.8.8.8`. If it has no cached answer, it asks:',
          '4. a **root** server: “who knows about `.com`?”',
          '5. the **TLD** server for `.com`: “who knows about `example.com`?”',
          '6. the [[authoritative name server]] for `example.com`, which gives the real answer.',
          '',
          'Most lookups stop at step 1–3 because the answer is cached. A full, uncached lookup can cost several round trips — one reason sites put their files on few domains.',
        ),
      },
      {
        type: 'diagram',
        mermaid: `sequenceDiagram
    participant B as Browser / OS
    participant R as Recursive resolver
    participant Root as Root server
    participant T as .com server
    participant A as example.com name server
    B->>R: shop.example.com?
    R->>Root: shop.example.com?
    Root-->>R: ask the .com servers
    R->>T: shop.example.com?
    T-->>R: ask example.com's name server
    R->>A: shop.example.com?
    A-->>R: 203.0.113.10 (TTL 300)
    R-->>B: 203.0.113.10`,
        caption: 'An uncached lookup. Next time the resolver answers from its cache until the TTL runs out.',
      },
      {
        type: 'text',
        md: md(
          '## TTL: why a DNS change takes time',
          'Every answer comes with a [[ttl|TTL]] (time to live) in seconds. Caches keep the answer that long and do not ask again. That makes DNS fast — but if you move your site to a new server, people keep going to the **old** IP until their cached answer expires.',
        ),
      },
      {
        type: 'code',
        id: 'dns-cache-ttl',
        caption: 'A tiny cache with a TTL: the second lookup is free, the third has expired.',
        code: `cache = {}   # name -> (ip, expires_at)

def resolve(name, now):
    if name in cache and cache[name][1] > now:
        return cache[name][0], "from cache"
    ip, ttl = "203.0.113.10", 300          # pretend the DNS servers answered this
    cache[name] = (ip, now + ttl)
    return ip, "asked DNS"

print(resolve("shop.example.com", now=0))     # ('203.0.113.10', 'asked DNS')
print(resolve("shop.example.com", now=120))   # ('203.0.113.10', 'from cache')
print(resolve("shop.example.com", now=300))   # ('203.0.113.10', 'asked DNS')`,
      },
      {
        type: 'callout',
        tone: 'tip',
        md: 'Before moving a server, lower the TTL (for example from 1 day to 60 seconds) **a day or two in advance**, so old long-lived answers expire first. After the move works, raise it again. Long TTL = fewer lookups; short TTL = faster changes. A classic [[trade-off]].',
      },
      {
        type: 'text',
        md: md(
          '## The records you will meet',
          'A name server stores [[dns record|records]]. The common ones:',
          '',
          '| Record | Meaning | Example |',
          '| --- | --- | --- |',
          '| A | name → IPv4 address | `shop.example.com → 203.0.113.10` |',
          '| AAAA | name → IPv6 address | `→ 2001:db8::10` |',
          '| CNAME | name → **another name** (an alias) | `www.example.com → example.com` |',
          '| MX | where to deliver email | `example.com → mail.example.com` |',
          '| TXT | free text, often proof you own the domain | Google or Vercel domain checks |',
          '| NS | which servers are authoritative | `example.com → ns1.provider.com` |',
          '',
          'DNS questions are tiny, so they usually travel over **UDP** on [[port]] 53 — one [[datagram]] there, one back. Big answers fall back to TCP. DNS can also do simple load balancing: return several IPs, or a different IP depending on where the user is (a [[cdn|CDN]] works this way).',
        ),
      },
      {
        type: 'text',
        md: md(
          '## HTTP: plain-text messages',
          '[[http|HTTP]] is a request–response protocol. In HTTP/1.1 a message is just text:',
          '',
          '```',
          'GET /search?q=shoes HTTP/1.1',
          'Host: shop.example.com',
          'Accept: application/json',
          '',
          '```',
          '',
          'The first line is the [[http method|method]], the path and the version. Then come [[http header|headers]] (`Name: value`), an empty line, and an optional body. The `Host` header lets one server (one IP) host many websites. The response looks the same, but starts with a [[status code]]:',
        ),
      },
      {
        type: 'code',
        id: 'parse-response',
        caption: 'Split a raw response into status, headers and body. Header names are case-insensitive, so store them in lower case.',
        code: `raw = (
    "HTTP/1.1 200 OK\\r\\n"
    "Content-Type: application/json\\r\\n"
    "Content-Length: 14\\r\\n"
    "Cache-Control: max-age=60\\r\\n"
    "\\r\\n"
    '{"items": [1]}'
)
head, body = raw.split("\\r\\n\\r\\n", 1)
status_line, *header_lines = head.split("\\r\\n")
version, code, reason = status_line.split(" ", 2)
headers = {}
for line in header_lines:
    name, value = line.split(": ", 1)
    headers[name.lower()] = value
print(version, int(code), reason)   # HTTP/1.1 200 OK
print(headers["cache-control"])     # max-age=60
print(len(body), body)              # 14 {"items": [1]}`,
      },
      {
        type: 'text',
        md: md(
          '## Status codes: the first digit tells you who is at fault',
          '| Code | Meaning | When you see it |',
          '| --- | --- | --- |',
          '| 200 OK / 201 Created / 204 No Content | success | a read, a new row, a delete with no body |',
          '| 301 / 302 | moved (for good / for now) — go to the `Location` header | `http://` → `https://` |',
          '| 304 Not Modified | your cached copy is still good | cache check with an ETag |',
          '| 400 Bad Request | the request is wrong | invalid JSON, missing field |',
          '| 401 Unauthorized | **who are you?** — not logged in, or bad token | expired login |',
          '| 403 Forbidden | **I know you, but no** | a normal user opens the admin page |',
          '| 404 Not Found / 409 Conflict | no such thing / clashes with the current state | wrong id / email already used |',
          '| 429 Too Many Requests | [[rate limiting|rate limit]] hit — slow down | calling an API in a tight loop |',
          '| 500 Internal Server Error | the server code crashed | a bug |',
          '| 502 Bad Gateway | the proxy got a **bad answer** from the app behind it | the app crashed or restarted |',
          '| 503 Service Unavailable | overloaded or in maintenance | too much traffic |',
          '| 504 Gateway Timeout | the proxy got **no answer in time** | a slow database query |',
          '',
          '4xx: the **client** must change something; trying again will not help. 5xx: the **server** failed; trying again later might work.',
        ),
      },
      {
        type: 'code',
        id: 'status-classes',
        code: `def status_class(code):
    return {1: "info", 2: "success", 3: "redirect", 4: "client error", 5: "server error"}[code // 100]

for code in [200, 304, 404, 429, 503]:
    print(code, status_class(code))
# 200 success
# 304 redirect
# 404 client error
# 429 client error
# 503 server error`,
      },
      {
        type: 'text',
        md: md(
          '## Methods: safe and idempotent',
          '| Method | Use | [[safe method|Safe]] (only reads) | [[idempotent|Idempotent]] (doing it twice = once) |',
          '| --- | --- | --- | --- |',
          '| GET | read | yes | yes |',
          '| POST | create, or “do this action” | no | **no** |',
          '| PUT | replace the whole thing | no | yes |',
          '| PATCH | change some fields | no | not guaranteed |',
          '| DELETE | remove | no | yes |',
          '',
          'Why it matters: networks fail **after** the server did the work but **before** you got the answer. Retrying a GET or a PUT is harmless. Retrying a POST might create two orders or charge a card twice.',
        ),
      },
      {
        type: 'code',
        id: 'retry-safe',
        code: `IDEMPOTENT = {"GET", "HEAD", "OPTIONS", "PUT", "DELETE"}

def can_retry(method, status):
    return method in IDEMPOTENT and status in {502, 503, 504}

print(can_retry("GET", 503))    # True
print(can_retry("POST", 503))   # False: the order might be created twice
print(can_retry("PUT", 404))    # False: a 404 will not fix itself`,
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '“How do you make a payment API safe to retry?” Give each request an **idempotency key** (a random id the client creates). The server stores the key with the result; a retry with the same key gets the saved result instead of a second payment. Stripe’s API works exactly like this.',
      },
      {
        type: 'text',
        md: md(
          '## HTTP is stateless',
          'Each request stands alone: the server does not remember the previous one. HTTP is [[stateless]]. To know who you are, every request carries proof: a [[cookie]] with a session id (the browser sends it automatically), or an [[auth token|access token]] in the `Authorization: Bearer …` header. Stateless servers are easy to scale — any server behind the [[load balancer]] can answer any request.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Caching: do not download it again',
          '- `Cache-Control: max-age=60` — the copy is fresh for 60 seconds; use it without asking.',
          '- `Cache-Control: no-cache` — you **may** store it, but must check with the server before each use.',
          '- `Cache-Control: no-store` — never store it (bank pages, private data).',
          '- An [[etag|ETag]] is a version tag of the response. When the copy is stale, the browser asks `If-None-Match: "v42"`. If nothing changed, the server answers **304 Not Modified** with no body — one round trip, almost no bytes.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## HTTP/1.1 → HTTP/2 → HTTP/3',
          '| Version | Key idea | Problem left |',
          '| --- | --- | --- |',
          '| HTTP/1.1 | text messages, [[keep-alive]] reuses the connection | one request at a time per connection, so browsers open ~6 connections per site |',
          '| HTTP/2 | binary frames, many requests at once on **one** TCP connection ([[multiplexing]]), compressed headers | one lost TCP packet blocks **all** streams ([[head-of-line blocking]]) |',
          '| HTTP/3 | HTTP/2 ideas over [[quic|QUIC]] on UDP, TLS 1.3 built in | some networks block UDP, so browsers keep HTTP/2 as a fallback |',
          '',
          'The messages mean the same in all three: same methods, status codes and headers. Only how they travel changes.',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: 'HTTP errors are **not** exceptions in most clients. JavaScript `fetch` only rejects on a network failure; a 404 or 500 still resolves — you must check `response.ok`. Python `requests` is the same until you call `response.raise_for_status()`. Java’s `HttpClient` and Go’s `http.Client` also return 4xx/5xx as normal responses and give an error only when no response came back. Forgetting this check is a common bug in every language.',
      },
      {
        type: 'text',
        md: md(
          '## The parts of a URL',
          '`https://shop.example.com:8443/search?q=shoes&page=2#top` = scheme `https`, host `shop.example.com` (what DNS looks up), port `8443` (443 is the default for https), path `/search`, query `q=shoes&page=2`, fragment `top` (never sent to the server — only the browser uses it).',
        ),
      },
      {
        type: 'code',
        id: 'url-parts',
        code: `from urllib.parse import urlsplit, parse_qs

u = urlsplit("https://shop.example.com:8443/search?q=shoes&page=2#top")
print(u.scheme, u.hostname, u.port)   # https shop.example.com 8443
print(u.path, u.query, u.fragment)    # /search q=shoes&page=2 top
print(parse_qs(u.query))              # {'q': ['shoes'], 'page': ['2']}`,
      },
      {
        type: 'exercise',
        id: 'parse-headers',
        title: 'Parse response headers',
        prompt: 'Given the header part of a response (lines split by `"\\r\\n"`, the first line is the status line), return `(status_code, headers)`: the code as an `int`, and a dict with **lower-case** names. A value may contain `": "` itself, so split each line only at the first one.',
        starter: `def parse_head(head):
    # your code here
    pass`,
        tests: `code, h = parse_head("HTTP/1.1 404 Not Found\\r\\nContent-Type: text/html\\r\\nX-Note: a: b")
assert code == 404
assert h == {"content-type": "text/html", "x-note": "a: b"}
code, h = parse_head("HTTP/1.1 204 No Content")
assert code == 204 and h == {}`,
        hint: '`lines = head.split("\\r\\n")`. The code is `int(lines[0].split(" ")[1])`. For the rest: `name, value = line.split(": ", 1)`.',
        solution: `def parse_head(head):
    lines = head.split("\\r\\n")
    code = int(lines[0].split(" ")[1])
    headers = {}
    for line in lines[1:]:
        name, value = line.split(": ", 1)
        headers[name.lower()] = value
    return code, headers`,
      },
      {
        type: 'exercise',
        id: 'is-fresh',
        title: 'Can I use my cached copy?',
        prompt: '`cache_control` is a `Cache-Control` value like `"public, max-age=60"`; `age` is how many seconds ago you stored the copy. Return `True` only if you may use the copy **without asking the server**: there is a `max-age`, `age < max-age`, and neither `no-cache` nor `no-store` is present.',
        starter: `def is_fresh(cache_control, age):
    # your code here
    pass`,
        tests: `assert is_fresh("max-age=60", 30) is True
assert is_fresh("public, max-age=60", 60) is False
assert is_fresh("no-cache, max-age=600", 1) is False
assert is_fresh("no-store", 0) is False
assert is_fresh("public", 5) is False
assert is_fresh("max-age=3600, private", 100) is True`,
        hint: 'Split by `","` and `strip()` each part. Remember `max-age` with `part.startswith("max-age=")` and `int(part.split("=")[1])`.',
        solution: `def is_fresh(cache_control, age):
    max_age = None
    for part in cache_control.split(","):
        part = part.strip()
        if part in ("no-cache", "no-store"):
            return False
        if part.startswith("max-age="):
            max_age = int(part.split("=")[1])
    return max_age is not None and age < max_age`,
      },
      {
        type: 'exercise',
        id: 'retry-policy',
        title: 'A retry policy',
        prompt: 'Return how many times a client should **retry** a failed request (0, 1, 2 or 3). Rules: never retry a 4xx; never retry a non-idempotent method (`POST`, `PATCH`) unless `has_key` is `True` (it sent an idempotency key); for 502, 503 and 504 retry 3 times; for any other 5xx retry once.',
        starter: `def retries(method, status, has_key=False):
    # your code here
    pass`,
        tests: `assert retries("GET", 503) == 3
assert retries("GET", 500) == 1
assert retries("GET", 404) == 0
assert retries("POST", 503) == 0
assert retries("POST", 503, has_key=True) == 3
assert retries("PATCH", 500, has_key=True) == 1
assert retries("DELETE", 429) == 0`,
        hint: 'Check the 4xx case first, then the method, then the 5xx codes.',
        solution: `def retries(method, status, has_key=False):
    if 400 <= status < 500:
        return 0
    if method in ("POST", "PATCH") and not has_key:
        return 0
    if status in (502, 503, 504):
        return 3
    if 500 <= status < 600:
        return 1
    return 0`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why can a DNS change take hours to reach everyone?', answer: 'Resolvers and browsers keep the old answer until its TTL runs out. Lower the TTL before a move.' },
          { question: '401 or 403: which one means “I know who you are, but you may not do this”?', answer: '403 Forbidden. 401 means you are not authenticated (no or bad login).' },
          { question: 'Why is retrying a POST risky?', answer: 'POST is not idempotent: the first request may have worked, so a retry can create a second order. Use an idempotency key.' },
          { question: 'What problem does HTTP/2 solve, and which one is left for HTTP/3?', answer: 'HTTP/2 sends many requests at once on one connection. One lost TCP packet still blocks all of them; QUIC in HTTP/3 fixes that.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'Cloudflare Learning: What is DNS?', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' },
      { label: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview' },
      { label: 'MDN: HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching' },
      { label: 'HPBN: HTTP/2', url: `${HPBN}/http2/` },
      { label: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
    ],
  },
  {
    id: 'os-processes-threads',
    title: 'Processes and threads',
    summary:
      'How one computer runs hundreds of programs at once: each program runs as a process with its own memory, and a process can run several threads that share that memory. Sharing is fast — and is where race conditions and deadlocks come from.',
    minutes: 65,
    videos: [
      { label: 'ByteByteGo: Process vs Thread', url: 'https://www.youtube.com/watch?v=4rLW7zg21gI' },
      { label: 'ByteByteGo: Concurrency vs Parallelism', url: 'https://www.youtube.com/watch?v=RlM9AfWf1WU' },
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## A program is a file; a process is a program running',
          'Your `app.py` on disk is just a file. When you run it, the operating system creates a [[process]]: the running program plus everything it needs —',
          '',
          '- its own [[address space]]: code, data, the heap and the stack, which no other process can touch;',
          '- a process id (PID), open files and network sockets;',
          '- the CPU registers, saved whenever the process is paused.',
          '',
          'Open two Chrome tabs and look at the task manager: each tab can be its own process. If one crashes, the others keep working — that is the point of separate memory.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## One CPU, many processes: time sharing',
          'A CPU core runs one thing at a time. The OS [[scheduler]] gives each ready process a short slice of time (a few milliseconds), then does a [[context switch]]: it saves the registers of one process and loads another. It happens so often that everything seems to run at once.',
          '',
          'A process is always in one of three main states:',
        ),
      },
      {
        type: 'diagram',
        mermaid: `stateDiagram-v2
    [*] --> Ready: created
    Ready --> Running: scheduled
    Running --> Ready: time slice used up
    Running --> Blocked: waits for disk / network
    Blocked --> Ready: data arrived
    Running --> [*]: finished`,
        caption: 'Waiting for I/O moves a process to Blocked, so the CPU can run someone else meanwhile.',
      },
      {
        type: 'text',
        md: md(
          '## Round robin: everyone gets a turn',
          'The simplest fair scheduler is round robin: a queue of ready jobs; each runs for one time slice (the **quantum**), then goes to the back of the queue if it is not finished. A small quantum feels responsive but wastes time on context switches; a big one wastes less but short jobs wait longer.',
        ),
      },
      {
        type: 'code',
        id: 'round-robin',
        caption: 'Three jobs needing 5, 2 and 4 time units, quantum 2. The output is (job, the time it finished).',
        code: `from collections import deque

def round_robin(jobs, quantum):
    queue = deque(jobs.items())
    clock, order = 0, []
    while queue:
        name, left = queue.popleft()
        run = min(quantum, left)
        clock += run
        if left > run:
            queue.append((name, left - run))   # not done: back of the queue
        else:
            order.append((name, clock))
    return order

print(round_robin({"A": 5, "B": 2, "C": 4}, 2))   # [('B', 4), ('C', 10), ('A', 11)]`,
      },
      {
        type: 'text',
        md: md(
          '## Threads: several workers inside one process',
          'A [[thread]] is a line of execution inside a process. All threads of a process **share** its memory (the same variables, the same heap), but each has its own stack and registers.',
          '',
          '| | Process | Thread |',
          '| --- | --- | --- |',
          '| memory | its own, protected | shared with the other threads |',
          '| start cost | high (new address space) | low |',
          '| talking to others | pipes, sockets, files (copying data) | just read the same variables |',
          '| a crash | kills only that process | kills the whole process |',
          '| typical use | isolation: browser tabs, separate services, worker pools | many tasks in one app: a web server answering many requests |',
          '',
          'On Unix a new process is made with `fork()` (copy me) and then `exec()` (replace me with another program) — that is how your terminal starts every command.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Concurrency is not parallelism',
          '- [[concurrency|Concurrency]]: several tasks are **in progress** at the same time, taking turns. One cook making three dishes, switching between them while the water boils.',
          '- [[parallelism|Parallelism]]: several tasks **run at the same moment** on different CPU cores. Three cooks.',
          '',
          'Waiting for the network or the disk (I/O) only needs concurrency: while one task waits, another runs. Heavy computing needs parallelism: more cores doing work at once.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Python’s GIL',
          'In standard CPython, the [[gil|Global Interpreter Lock]] lets only **one thread run Python code at a time**. So:',
          '',
          '- **I/O-bound** work (downloads, API calls, database queries): threads work well — a thread releases the GIL while it waits. Or use `asyncio`.',
          '- **CPU-bound** work (image processing, big calculations in pure Python): threads do not get faster; use **processes** (`multiprocessing`, `ProcessPoolExecutor`), each with its own interpreter and its own GIL. NumPy and similar libraries do their heavy work in C without the GIL.',
          '',
          'Python 3.13 added an optional “free-threaded” build without the GIL, but most code still runs on the normal build.',
          '',
          '```python',
          'from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor',
          '',
          'with ThreadPoolExecutor(max_workers=8) as pool:       # I/O: many downloads at once',
          '    pages = list(pool.map(download, urls))',
          '',
          'with ProcessPoolExecutor() as pool:                   # CPU: one process per core',
          '    results = list(pool.map(resize_image, files))',
          '```',
          '',
          '(This example is not runnable here: the in-browser Python cannot start threads or processes.)',
        ),
      },
      {
        type: 'callout',
        tone: 'compare',
        md: '**Java** and **C#** threads run truly in parallel on all cores (no GIL), and Java 21 added cheap **virtual threads** for millions of waiting tasks. **Go** starts goroutines — tiny threads managed by the Go runtime — with one word, `go f()`. **JavaScript / Node.js** runs your code on **one** thread with an event loop: great for I/O, and heavy CPU work blocks everything (you move it to worker threads). **Rust** checks at compile time that threads cannot share data unsafely. Python’s trade-off: simple, safe-ish threads for I/O, processes for CPU.',
      },
      {
        type: 'text',
        md: md(
          '## Race conditions: when sharing goes wrong',
          '`counter += 1` looks like one step, but it is three: **read** the value, **add** 1, **write** it back. It is not [[atomic]]. If the scheduler switches threads between the read and the write, two threads can both read 0, both write 1 — one update is lost. A bug whose result depends on the timing is a [[race condition]].',
          '',
          'Real threads cannot run in this browser, so the code below replays one unlucky order of steps by hand:',
        ),
      },
      {
        type: 'code',
        id: 'race-replay',
        caption: 'Two threads each add 1. The right answer is 2.',
        code: `counter = 0
local = {}                 # each thread's private copy (its registers)
schedule = [("A", "read"), ("B", "read"), ("A", "write"), ("B", "write")]

for thread, step in schedule:
    if step == "read":
        local[thread] = counter
    else:
        counter = local[thread] + 1
    print(thread, step, "counter =", counter)
print("final:", counter)
# A read counter = 0
# B read counter = 0
# A write counter = 1
# B write counter = 1
# final: 1`,
      },
      {
        type: 'text',
        md: md(
          '## Locks fix it — and can cause deadlocks',
          'A lock ([[mutex]]) lets only one thread at a time into a **critical section**:',
          '',
          '```python',
          'import threading',
          'lock = threading.Lock()',
          '',
          'def add_one():',
          '    global counter',
          '    with lock:              # read, add and write happen as one step',
          '        counter += 1',
          '```',
          '',
          'Locks have a cost: threads wait for each other. And with two locks there is a new danger, a [[deadlock]]: thread A holds lock 1 and waits for lock 2, thread B holds lock 2 and waits for lock 1 — both wait forever. The simple rule that prevents it: **every thread takes the locks in the same order**.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: '“Process vs thread?” Answer with memory first: processes have **separate** memory (safe, costly to start, talk by copying), threads **share** memory (cheap, fast to communicate, but need locks). Then give a real example (browser tabs as processes; a web server handling requests on threads) and, for Python, the GIL rule: threads for I/O, processes for CPU.',
      },
      {
        type: 'text',
        md: md(
          '## Where you meet this at work',
          '- Web servers: Gunicorn runs several **worker processes**, each can use threads; Node runs one process per core.',
          '- Background jobs: Celery or RQ workers are separate processes reading from a queue.',
          '- “It works on my machine but fails under load” is often a race condition: two requests updating the same row or the same cache key.',
          '- Docker containers are processes with their own view of files and network.',
        ),
      },
      {
        type: 'exercise',
        id: 'process-state',
        title: 'Process state machine',
        prompt: 'Write `next_state(state, event)` for the diagram above. States: `"ready"`, `"running"`, `"blocked"`. Events: `"schedule"` (ready → running), `"timeout"` (running → ready), `"wait_io"` (running → blocked), `"io_done"` (blocked → ready). Any other pair is not allowed: return `None`.',
        starter: `def next_state(state, event):
    # your code here
    pass`,
        tests: `assert next_state("ready", "schedule") == "running"
assert next_state("running", "timeout") == "ready"
assert next_state("running", "wait_io") == "blocked"
assert next_state("blocked", "io_done") == "ready"
assert next_state("blocked", "schedule") is None
assert next_state("ready", "wait_io") is None`,
        hint: 'A dict with `(state, event)` tuples as keys, and `.get(...)` returns `None` for anything missing.',
        solution: `def next_state(state, event):
    moves = {
        ("ready", "schedule"): "running",
        ("running", "timeout"): "ready",
        ("running", "wait_io"): "blocked",
        ("blocked", "io_done"): "ready",
    }
    return moves.get((state, event))`,
      },
      {
        type: 'exercise',
        id: 'replay-race',
        title: 'Replay a race',
        prompt: 'Generalize the race example. `schedule` is a list of `(thread, step)` with steps `"read"` (copy the shared counter into the thread’s own copy) and `"write"` (set the shared counter to its own copy + 1). Return the final counter, starting from 0.',
        starter: `def replay(schedule):
    # your code here
    pass`,
        tests: `assert replay([("A", "read"), ("A", "write"), ("B", "read"), ("B", "write")]) == 2
assert replay([("A", "read"), ("B", "read"), ("A", "write"), ("B", "write")]) == 1
assert replay([("A", "read"), ("B", "read"), ("B", "write"), ("C", "read"), ("C", "write"), ("A", "write")]) == 1
assert replay([]) == 0`,
        hint: 'Keep `counter` and a dict `local` from thread name to its copy.',
        solution: `def replay(schedule):
    counter = 0
    local = {}
    for thread, step in schedule:
        if step == "read":
            local[thread] = counter
        else:
            counter = local[thread] + 1
    return counter`,
      },
      {
        type: 'exercise',
        id: 'round-robin-ex',
        title: 'Round-robin scheduler',
        prompt: '`jobs` is a list of `(name, time_needed)` in arrival order (all arrive at time 0). Run them round robin with time slice `quantum`, and return how many **context switches** happen: every time the CPU moves from one job to a different job. (Running the same job again right after itself is not a switch.)',
        starter: `def count_switches(jobs, quantum):
    # your code here
    pass`,
        tests: `assert count_switches([("A", 5), ("B", 2), ("C", 4)], 2) == 5
assert count_switches([("A", 3)], 1) == 0
assert count_switches([("A", 2), ("B", 2)], 5) == 1
assert count_switches([], 2) == 0`,
        hint: 'Simulate with a `deque` like the example. Keep the name of the last job that ran; when the next job has a different name, add 1.',
        solution: `from collections import deque

def count_switches(jobs, quantum):
    queue = deque(jobs)
    last, switches = None, 0
    while queue:
        name, left = queue.popleft()
        if last is not None and name != last:
            switches += 1
        last = name
        if left > quantum:
            queue.append((name, left - quantum))
    return switches`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'What do threads of one process share, and what do they not share?', answer: 'They share memory (variables, heap, open files). Each thread has its own stack and registers.' },
          { question: 'In Python, threads or processes for resizing 10,000 images in pure Python code?', answer: 'Processes: the work is CPU-bound, and the GIL lets only one thread run Python code at a time.' },
          { question: 'Why is `counter += 1` unsafe with threads?', answer: 'It is read, add, write. A switch between the read and the write lets two threads write the same value, so an update is lost.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'OSTEP ch.4: The abstraction: the process (PDF)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf' },
      { label: 'OSTEP ch.26: Concurrency and threads (PDF)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf' },
      { label: 'Python docs: concurrent.futures', url: 'https://docs.python.org/3/library/concurrent.futures.html' },
      { label: 'Python glossary: global interpreter lock', url: 'https://docs.python.org/3/glossary.html#term-global-interpreter-lock' },
    ],
  },
  {
    id: 'sd-basics',
    title: 'System design basics',
    summary:
      'Grow a web app from one server to millions of users, one step at a time: scale up, then out behind a load balancer; add read replicas, a cache and a CDN; and learn to estimate the load with simple numbers. These boxes appear in every design interview.',
    minutes: 70,
    videos: [
      { label: 'ByteByteGo: Vertical vs horizontal scaling', url: 'https://www.youtube.com/watch?v=dvRFHG2-uYs' },
      { label: 'ByteByteGo: Cache systems every developer should know', url: 'https://www.youtube.com/watch?v=dGAgxozNWFE' },
      { label: 'ByteByteGo: System design interview, a step-by-step guide', url: 'https://www.youtube.com/watch?v=i7twT3x5yv8' },
    ],
    blocks: [
      {
        type: 'text',
        md: md(
          '## Step 0: one server',
          'Every product starts here: one machine runs the web app **and** the database. Users find it with [[dns|DNS]] and talk to it over HTTPS. It is cheap and simple — and it is a [[single point of failure]]: if that machine dies, everything is down, and it can only grow as big as one machine.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Scale up or scale out',
          '| | [[vertical scaling|Vertical]] (scale up) | [[horizontal scaling|Horizontal]] (scale out) |',
          '| --- | --- | --- |',
          '| how | a bigger machine: more CPU, RAM | more machines doing the same job |',
          '| good | no code change | almost no upper limit; one machine can fail |',
          '| bad | hard limit and very expensive at the top; still one machine | needs a load balancer and **stateless** servers |',
          '',
          'The first step is usually to move the database to its own machine. Then the app servers scale out.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Load balancer + stateless app servers',
          'A [[load balancer]] gets every request and passes it to one of many app servers — round robin, or the server with the fewest open connections. It runs **health checks** and stops sending traffic to a dead server.',
          '',
          'This only works if the app servers are [[stateless]]: no user session kept in one server’s memory. Sessions go to a shared store (Redis, the database) or into a token the client sends. Then any server can answer any request, and you can add or remove servers at any time.',
        ),
      },
      {
        type: 'code',
        id: 'round-robin-lb',
        caption: 'Round robin in one line: `cycle` repeats the list forever.',
        code: `from itertools import cycle

servers = cycle(["app-1", "app-2", "app-3"])
print([next(servers) for _ in range(5)])   # ['app-1', 'app-2', 'app-3', 'app-1', 'app-2']`,
      },
      {
        type: 'text',
        md: md(
          '## The database: replicas for reads',
          'Most apps read far more than they write (a feed is read 100 times for every post). [[replication|Replication]] keeps copies of the database:',
          '',
          '- the **primary** takes all writes;',
          '- [[read replica|read replicas]] copy the changes and answer reads. More replicas = more read capacity.',
          '',
          'Two things to say in an interview: replicas are a little **behind** (replication lag — a user may not see their own new post for a moment, so “read your own writes” can go to the primary), and if the primary dies, a replica is promoted ([[failover]]). When even the writes do not fit on one machine, you split the data by key across machines: [[sharding]].',
        ),
      },
      {
        type: 'diagram',
        mermaid: `flowchart LR
    U[Users] --> CDN[CDN: images, JS, CSS]
    U --> LB[Load balancer]
    LB --> A1[App server 1]
    LB --> A2[App server 2]
    LB --> A3[App server 3]
    A1 & A2 & A3 --> C[(Cache: Redis)]
    A1 & A2 & A3 -->|writes| P[(Primary DB)]
    A1 & A2 & A3 -->|reads| R[(Read replicas)]
    P -. copies changes .-> R`,
        caption: 'The standard picture for “a web app with a few million users”.',
      },
      {
        type: 'text',
        md: md(
          '## Cache: do not ask the database twice',
          'A [[cache]] keeps hot data in memory (Redis, Memcached) — reading memory takes well under a millisecond, a database query often several milliseconds or more. The most common pattern is [[cache-aside]]:',
          '',
          '1. look in the cache; if it is there (a **hit**), return it;',
          '2. on a **miss**, read the database, put the result in the cache with a [[ttl|TTL]], return it.',
          '',
          'The [[hit rate]] — hits / all requests — tells you how much load the cache removes.',
        ),
      },
      {
        type: 'code',
        id: 'cache-aside',
        code: `db = {"user:1": "Ana", "user:2": "Binh"}
cache = {}
db_reads = 0

def get_user(key):
    global db_reads
    if key in cache:              # hit
        return cache[key]
    db_reads += 1                 # miss: go to the database
    value = db[key]
    cache[key] = value
    return value

for key in ["user:1", "user:1", "user:2", "user:1", "user:2"]:
    get_user(key)
print("requests:", 5, "db reads:", db_reads, "hit rate:", f"{(5 - db_reads) / 5:.0%}")
# requests: 5 db reads: 2 hit rate: 60%`,
      },
      {
        type: 'callout',
        tone: 'warning',
        md: 'The hard part of caching is **stale data**. When the user changes their name, the cache still has the old one. Fixes: delete the key on every write (then the next read refills it), and always set a TTL as a safety net. A cache also has limited memory, so it removes old keys — usually the least recently used ([[lru cache|LRU]], the Linked List lesson).',
      },
      {
        type: 'text',
        md: md(
          '## CDN for static files, queues for slow work',
          '- A [[cdn|CDN]] keeps copies of images, videos, JS and CSS on servers near the users. The files load fast and never touch your app servers.',
          '- A [[message queue]] (SQS, RabbitMQ, Kafka) takes slow work out of the request: the app puts “resize this photo” or “send this email” on the queue and answers at once; [[worker process|worker processes]] do the job in the background. If workers fall behind, the queue just gets longer instead of the site going down.',
        ),
      },
      {
        type: 'text',
        md: md(
          '## Back-of-the-envelope numbers',
          'Interviewers want a rough size, not exact maths. Useful facts: a day has **86,400 ≈ 100,000** seconds; peak traffic is often **2–3×** the average; 1 million × 1 MB = 1 TB.',
        ),
      },
      {
        type: 'code',
        id: 'estimate',
        caption: '10 million daily users, 20 requests each; 10% of them upload one 2 MB photo a day.',
        code: `dau = 10_000_000
requests_per_user = 20
seconds_per_day = 86_400

avg_qps = dau * requests_per_user / seconds_per_day
print(round(avg_qps))        # 2315   requests per second on average
print(round(avg_qps * 3))    # 6944   at peak (about 3x)

photos_per_day = dau * 0.1
storage_per_year_tb = photos_per_day * 2_000_000 * 365 / 1e12
print(round(storage_per_year_tb))   # 730   TB of photos per year`,
      },
      {
        type: 'text',
        md: md(
          '## How to run a design interview',
          '1. **Requirements** (5 min): what must it do? How many users? Read-heavy or write-heavy? What matters most — speed, consistency, cost?',
          '2. **Estimates**: [[qps|QPS]], storage, bandwidth — just enough to choose the boxes.',
          '3. **API and data**: the main endpoints and tables.',
          '4. **High-level design**: draw the boxes above, follow one request through them.',
          '5. **Deep dive**: the hardest part (the feed, the cache, the hot key), the bottleneck and the [[single point of failure|single points of failure]].',
          '6. **Trade-offs**: say what you chose **and what you gave up**.',
        ),
      },
      {
        type: 'callout',
        tone: 'interview',
        md: 'Do not start by drawing. Ask questions first, write the numbers down, then grow the design step by step like this lesson: one server → load balancer + stateless servers → replicas → cache → CDN → queue. For every box, say **why** it is there and what breaks without it.',
      },
      {
        type: 'exercise',
        id: 'healthy-round-robin',
        title: 'Round robin with health checks',
        prompt: 'Send `n` requests to `servers` in round-robin order, but **skip** servers that are not in the set `healthy`. Return the list of servers used. If no server is healthy, return an empty list.',
        starter: `def assign(servers, healthy, n):
    # your code here
    pass`,
        tests: `assert assign(["a", "b", "c"], {"a", "b", "c"}, 4) == ["a", "b", "c", "a"]
assert assign(["a", "b", "c"], {"a", "c"}, 4) == ["a", "c", "a", "c"]
assert assign(["a", "b"], set(), 3) == []
assert assign(["a", "b", "c"], {"b"}, 2) == ["b", "b"]`,
        hint: 'Filter first: `alive = [s for s in servers if s in healthy]`. Then request `i` goes to `alive[i % len(alive)]`.',
        solution: `def assign(servers, healthy, n):
    alive = [s for s in servers if s in healthy]
    if not alive:
        return []
    return [alive[i % len(alive)] for i in range(n)]`,
      },
      {
        type: 'exercise',
        id: 'lru-hit-rate',
        title: 'Cache hits with LRU',
        prompt: 'A cache holds at most `capacity` keys and removes the **least recently used** key when it is full. Given the keys of `requests` in order, return how many were **hits**. Use `OrderedDict`.',
        starter: `from collections import OrderedDict

def count_hits(requests, capacity):
    # your code here
    pass`,
        tests: `assert count_hits(["a", "b", "a", "c", "b"], 2) == 1
assert count_hits(["a", "a", "a"], 1) == 2
assert count_hits(["a", "b", "c", "a"], 3) == 1
assert count_hits(["a", "b", "a", "c", "a"], 2) == 2
assert count_hits([], 2) == 0`,
        hint: 'On a hit: count it and `move_to_end(key)`. On a miss: add the key; if the cache is now bigger than `capacity`, `popitem(last=False)`.',
        solution: `from collections import OrderedDict

def count_hits(requests, capacity):
    cache = OrderedDict()
    hits = 0
    for key in requests:
        if key in cache:
            hits += 1
            cache.move_to_end(key)
        else:
            cache[key] = True
            if len(cache) > capacity:
                cache.popitem(last=False)
    return hits`,
      },
      {
        type: 'exercise',
        id: 'estimate-qps',
        title: 'Estimate the servers you need',
        prompt: 'Return `(avg_qps, peak_qps, servers)`. `avg_qps` = `dau * requests_per_user / 86400`, **rounded up** to a whole number. `peak_qps` = `avg_qps * peak_factor`. `servers` = how many servers handle the peak if one server handles `qps_per_server`, rounded up, **plus one spare** (so one can fail).',
        starter: `def plan(dau, requests_per_user, peak_factor, qps_per_server):
    # your code here
    pass`,
        tests: `assert plan(10_000_000, 20, 3, 1000) == (2315, 6945, 8)
assert plan(86_400, 1, 2, 10) == (1, 2, 2)
assert plan(1_000_000, 50, 3, 500) == (579, 1737, 5)`,
        hint: 'Round up without floats: `-(-a // b)`, or `(a + b - 1) // b`.',
        solution: `def plan(dau, requests_per_user, peak_factor, qps_per_server):
    avg_qps = (dau * requests_per_user + 86_399) // 86_400
    peak_qps = avg_qps * peak_factor
    servers = (peak_qps + qps_per_server - 1) // qps_per_server + 1
    return avg_qps, peak_qps, servers`,
      },
      {
        type: 'quiz',
        items: [
          { question: 'Why must app servers be stateless behind a load balancer?', answer: 'Any server may get the next request of a user. If the session lived in one server’s memory, the user would be logged out on another server.' },
          { question: 'What do read replicas fix, and what problem do they bring?', answer: 'They add read capacity. The data on them can be slightly behind the primary (replication lag).' },
          { question: 'About how many requests per second is 1 million daily users × 10 requests?', answer: '10 million / ~100,000 seconds ≈ 100 QPS on average (about 116), maybe 300 at peak.' },
        ],
      },
    ],
    furtherReading: [
      { label: 'ByteByteGo: Scale from zero to millions of users (free chapter)', url: 'https://bytebytego.com/courses/system-design-interview/scale-from-zero-to-millions-of-users' },
      { label: 'Hello Interview: Caching', url: 'https://www.hellointerview.com/learn/system-design/core-concepts/caching' },
      { label: 'Cloudflare Learning: What is load balancing?', url: 'https://www.cloudflare.com/learning/performance/what-is-load-balancing/' },
      { label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
  },
]
