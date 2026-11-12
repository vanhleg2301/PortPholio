import type { LessonTest } from '../types'
import { PRINT, choice } from './helpers'

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
  'net-udp-tls': {
    choice: [
      choice('udp-features', 'Which is true for UDP?',
        ['No handshake, no ordering and no resending — each datagram is on its own', 'It resends lost packets, like TCP', 'It always delivers packets in order', 'It needs a 3-way handshake first'],
        'UDP adds almost nothing on top of IP: [[port|ports]] and a small checksum. Everything else is up to the application.'),
      choice('udp-use', 'Which is the best fit for UDP?',
        ['A live voice call', 'Downloading a PDF bank statement', 'Saving an order to a database', 'Loading a web page’s JavaScript'],
        'In a call, a late packet is useless — better to skip it than to wait. The other three need every byte, in order.'),
      choice('udp-loss', 'A UDP datagram is lost on the way. Who notices?',
        ['Only the application, if it checks (for example with sequence numbers)', 'The UDP layer, which resends it', 'The receiver’s operating system, which asks for it again', 'Nobody can ever notice'],
        'UDP has no ACKs. Apps that care add their own numbering and decide what to do: skip, ask again, or hide the gap.'),
      choice('dns-udp', 'A DNS lookup over UDP with an RTT of 40 ms takes about…',
        ['40 ms — one question, one answer, no setup', '80 ms', '120 ms', '0 ms'],
        'No handshake is needed, so a small question and answer fit in one round trip. Over TCP it would be 80 ms; over a new HTTPS connection 120 ms.'),
      choice('quic-why', 'Why was QUIC built on top of UDP instead of changing TCP?',
        ['TCP is inside every operating system and many network boxes, so changing it takes years; UDP passes almost everywhere, so QUIC can ship inside apps', 'UDP is encrypted by default', 'TCP cannot be used on phones', 'UDP is always faster than TCP'],
        'QUIC adds its own resending, per-stream ordering and TLS 1.3 — in the app, not in the operating system.'),
      choice('tls-three', 'What three things does TLS give a connection?',
        ['Privacy (encryption), authentication (who the server is) and integrity (changes are detected)', 'Speed, compression and caching', 'Privacy only', 'Ordering, resending and flow control'],
        'Ordering and resending come from TCP. TLS adds the three security promises on top.'),
      choice('sym-asym', 'Why is the actual data encrypted with a **symmetric** key?',
        ['Symmetric encryption is much faster; asymmetric keys are only used to prove identity and agree on the key', 'Symmetric keys are more secure in every way', 'Asymmetric encryption cannot encrypt data', 'Browsers do not support asymmetric keys'],
        'Public-key operations are slow, so TLS uses them only during the handshake. After that, fast AES or ChaCha20 protects every byte.'),
      choice('dh-print', PRINT, ['10 17 True', '10 17 False', '8 19 True', '3 7 True'],
        '`A = 5³ mod 23 = 10`, `B = 5⁷ mod 23 = 17`. Both sides then compute the same key without ever sending a or b.',
        'p, g = 23, 5\na, b = 3, 7\nA = pow(g, a, p)\nB = pow(g, b, p)\nprint(A, B, pow(B, a, p) == pow(A, b, p))'),
      choice('forward-secrecy', 'An attacker records your HTTPS traffic today and steals the server’s private key next year. With TLS 1.3, can they read the old traffic?',
        ['No — each connection used new temporary secrets that were never sent, so the stolen key does not help', 'Yes, the private key decrypts everything', 'Only the first message', 'Yes, if they also know the domain name'],
        'This is [[forward secrecy]]. The long-term private key only signs; the session keys come from a key exchange with temporary secrets.'),
      choice('cert-checks', 'Which checks does the browser do on the server’s certificate?',
        ['The chain leads to a trusted root, the name matches the site, and it has not expired', 'Only that it is encrypted', 'Only the expiry date', 'That the server is fast'],
        'If any check fails, you get a certificate warning. That is the authentication part of TLS.'),
      choice('verify-false', 'A developer gets a certificate error and adds `verify=False`. What is the real effect?',
        ['Authentication is switched off: anyone in the middle can pretend to be the server', 'Nothing important — the data is still safe', 'The connection becomes faster but just as safe', 'The certificate gets renewed'],
        'The data is still encrypted, but maybe encrypted to the attacker. Fix the real problem: the chain, the name, or the expiry.'),
      choice('what-visible', 'With HTTPS, what can someone on the same Wi-Fi still see?',
        ['Which site you visit (DNS and the SNI field) and the size and timing of the traffic', 'The full URL path and the page content', 'Your passwords', 'Nothing at all'],
        'The path, headers and content are encrypted. The site name usually is not, and traffic patterns can say a lot.'),
    ],
    code: [
      {
        id: 'missing-packets',
        title: 'Find the lost datagrams',
        prompt: 'An app numbers its UDP datagrams 1..`total`. `arrivals` lists the numbers that arrived (any order, maybe duplicates). Return the **sorted** list of numbers that never arrived — the app could ask for these again.',
        starter: `def missing_packets(arrivals, total):
    # your code here
    pass`,
        tests: `assert missing_packets([1, 2, 4, 5], 5) == [3]
assert missing_packets([5, 3, 1], 5) == [2, 4]
assert missing_packets([2, 2, 1], 2) == []
assert missing_packets([], 3) == [1, 2, 3]`,
        hint: 'Put the arrivals in a set, then check every number from 1 to `total`.',
        solution: `def missing_packets(arrivals, total):
    got = set(arrivals)
    return [n for n in range(1, total + 1) if n not in got]`,
      },
      {
        id: 'first-byte-transport',
        title: 'Time to first byte by transport',
        prompt: 'Return the milliseconds until the first answer byte, given the RTT, for a **new** connection: `"udp"` (just ask: 1 RTT), `"tcp"` (handshake + request: 2), `"tls1.3"` (TCP + TLS 1.3 + request: 3), `"tls1.2"` (TCP + 2 for TLS 1.2 + request: 4), `"quic"` (one combined handshake + request: 2).',
        starter: `def first_byte_ms(rtt_ms, transport):
    # your code here
    pass`,
        tests: `assert first_byte_ms(50, "udp") == 50
assert first_byte_ms(50, "tcp") == 100
assert first_byte_ms(50, "tls1.3") == 150
assert first_byte_ms(50, "tls1.2") == 200
assert first_byte_ms(50, "quic") == 100`,
        hint: 'A dict from transport to the number of round trips, then multiply.',
        solution: `def first_byte_ms(rtt_ms, transport):
    trips = {"udp": 1, "tcp": 2, "tls1.3": 3, "tls1.2": 4, "quic": 2}
    return trips[transport] * rtt_ms`,
      },
    ],
    explain: [
      {
        id: 'tcp-or-udp',
        question: '“TCP or UDP?” Explain the trade-off with one real example for each, and say what QUIC changes.',
        points: [
          'TCP: handshake, ordered and reliable, congestion control — every byte arrives, maybe late',
          'UDP: no setup, no order, no resending — the app decides what to do with loss',
          'TCP example: APIs, files, database connections; UDP example: calls, games, live video, DNS',
          'Late data is useless in real time, so waiting for a resend hurts',
          'QUIC adds reliability, per-stream order and TLS 1.3 on top of UDP (HTTP/3)',
        ],
        answer: 'TCP gives a reliable, ordered byte stream: a handshake first, lost packets are resent, and congestion control adapts the speed. The cost is extra round trips and waiting: a lost packet holds back the data behind it. UDP gives none of that — no setup, no order, no resending — so it is ideal when late data is useless, like a voice call or a game, or when the exchange is tiny, like DNS. An API, a file download or a database connection must use TCP because every byte matters. QUIC is the modern middle way: it runs on UDP but adds resending, ordering per stream and TLS 1.3 in the app, so HTTP/3 gets faster setup and no head-of-line blocking between requests.',
      },
      {
        id: 'https-walkthrough',
        question: '“How does HTTPS keep my password safe?” Walk through a TLS connection step by step.',
        points: [
          'After TCP, the TLS handshake starts (1 RTT with TLS 1.3)',
          'The server sends its certificate; the browser checks the chain to a trusted root, the name and the expiry',
          'Both sides do a key exchange (Diffie–Hellman with temporary secrets) and get the same session key without sending it',
          'All data is then encrypted with fast symmetric encryption, and changes are detected',
          'Temporary keys give forward secrecy; the site name (SNI/DNS) is still visible',
        ],
        answer: 'After the TCP handshake, the browser starts TLS. The server sends its certificate, and the browser checks that it chains up to a root authority it trusts, that the name matches the site and that it has not expired — that is how I know I am talking to the real server and not someone in the middle. In the same round trip both sides do a Diffie–Hellman key exchange with fresh temporary secrets: they send only public values but compute the same session key. From then on every byte, including my password, is encrypted with fast symmetric encryption, and any change on the way is detected. Because the secrets are temporary, recorded traffic stays safe even if the server’s private key leaks later. What is still visible is which site I connect to and the size and timing of the traffic.',
      },
    ],
  },
  'net-http-dns': {
    choice: [
      choice('dns-chain', 'Neither the browser nor the OS has an IP for `shop.example.com` cached. Who is asked next?',
        ['A recursive resolver (your ISP’s, or 1.1.1.1), which asks root, `.com` and finally the domain’s own name server', 'The web server of shop.example.com directly', 'The root server, directly from the browser', 'The certificate authority'],
        'The browser only talks to a [[dns resolver|resolver]]. The resolver does the walk — root, then the TLD server, then the [[authoritative name server]] — and caches every answer on the way.'),
      choice('ttl', 'You moved your site to a new server and updated the A record. Its TTL was 86,400 (one day). Six hours later some users still reach the old server. Why?',
        ['Their resolvers cached the old answer and may keep it for up to 24 hours', 'DNS changes are sent out only once a day', 'The browser blocks new IPs for safety', 'The certificate still points to the old server'],
        'Caches are allowed to use an answer until its [[ttl|TTL]] runs out. That is why you lower the TTL a day or two **before** a move.'),
      choice('records', '`www.example.com` should always point to whatever `example.com` points to. Which record do you add for `www`?',
        ['CNAME', 'MX', 'TXT', 'NS'],
        'A CNAME makes a name an alias of another name. A and AAAA map to addresses, MX says where email goes, TXT holds text (for example domain checks), NS names the authoritative servers.'),
      choice('dns-transport', 'How does a normal DNS question usually travel?',
        ['Over UDP, port 53: one small question, one small answer, no handshake', 'Over HTTPS, port 443, always', 'Over TCP with keep-alive', 'Over QUIC'],
        'A DNS question fits in one [[datagram]], and a handshake would double the time. Big answers fall back to TCP. (Newer “DNS over HTTPS” exists, but plain DNS is UDP.)'),
      choice('status-401-403', 'A logged-in normal user opens `/admin`. The server knows who they are, but they are not an admin. Which status?',
        ['403 Forbidden', '401 Unauthorized', '404 Not Found', '400 Bad Request'],
        '401 means “I do not know who you are” (no login or a bad token). 403 means “I know you, and the answer is no”. (Some APIs answer 404 on purpose to hide that the page exists.)'),
      choice('status-5xx', 'Nginx sits in front of your app. A slow database query makes the app take 90 seconds, but Nginx gives up after 60. What does the user get?',
        ['504 Gateway Timeout', '502 Bad Gateway', '500 Internal Server Error', '408 Request Timeout'],
        'The proxy got **no answer in time**: 504. If the app had crashed or sent back garbage, the proxy would say 502. A 500 comes from the app itself.'),
      choice('retry-4xx', 'Your client gets `400 Bad Request`. Should it automatically send the same request again?',
        ['No: a 4xx means the request itself is wrong; the same request will fail again', 'Yes, 3 times with a delay', 'Yes, but only once', 'Only if the method is GET'],
        '4xx = the client must change something. 5xx (and 429 after waiting) are the cases where trying again later can work.'),
      choice('idempotent', 'After a timeout you do not know if the server did the work. Which request is safe to send again automatically?',
        ['`PUT /users/7` with the full new profile', '`POST /orders`', '`POST /payments`', '`PATCH /counter` with `{"add": 1}`'],
        'PUT replaces the resource with the same data, so doing it twice is the same as once: [[idempotent]]. Each POST may create something new, and “add 1” adds again.'),
      choice('idempotency-key', 'How do you make `POST /payments` safe to retry?',
        ['The client sends a unique idempotency key; the server saves the result for that key and returns it for repeats', 'Use PUT instead and change nothing else', 'Retry only after 10 seconds', 'Send the request over HTTP/2'],
        'The key turns “create a payment” into “create payment X”, which can only happen once. The server must store key → result before answering.'),
      choice('stateless', 'HTTP is stateless. How does the server know you are logged in on the next request?',
        ['Every request carries proof — a cookie with a session id, or a token in the `Authorization` header', 'The TCP connection remembers you', 'The server stores your IP address', 'The browser sends your password every time'],
        'The server keeps no memory between requests, so each request brings its own [[cookie]] or [[auth token|token]]. Connections and IPs change all the time (mobile networks, load balancers).'),
      choice('cache-headers', 'What is the difference between `Cache-Control: no-cache` and `no-store`?',
        ['`no-cache`: you may keep a copy but must check with the server before using it; `no-store`: never keep a copy', 'They mean the same', '`no-cache` forbids storing; `no-store` allows it for 60 s', '`no-store` is only for images'],
        'The names are confusing for historical reasons. `no-cache` = “revalidate every time” (often with an [[etag|ETag]] → 304). `no-store` is for private data like bank pages.'),
      choice('http2', 'What is the main change in HTTP/2 compared with HTTP/1.1?',
        ['Many requests and responses travel at the same time over one connection (multiplexing)', 'It uses UDP instead of TCP', 'It removes headers', 'It adds status codes'],
        'HTTP/1.1 sends one request at a time per connection, so browsers open about 6. HTTP/2 splits messages into frames and mixes them on one TCP connection — [[multiplexing]]. HTTP/3 then moves to QUIC on UDP.'),
    ],
    code: [
      {
        id: 'query-parse',
        title: 'Parse a query string',
        prompt: 'Turn a query string like `"q=shoes&tag=a&tag=b"` into a dict from each name to the **list** of its values, in order: `{"q": ["shoes"], "tag": ["a", "b"]}`. An empty string gives `{}`. A part without `=` (like `"debug"`) gets the value `""`. Do not use `urllib`.',
        starter: `def parse_query(qs):
    # your code here
    pass`,
        tests: `assert parse_query("q=shoes&page=2") == {"q": ["shoes"], "page": ["2"]}
assert parse_query("tag=a&tag=b&q=x") == {"tag": ["a", "b"], "q": ["x"]}
assert parse_query("") == {}
assert parse_query("debug&x=1") == {"debug": [""], "x": ["1"]}
assert parse_query("eq=a=b") == {"eq": ["a=b"]}`,
        hint: 'Split by `"&"`. For each part, `name, _, value = part.partition("=")` splits at the first `=` only. Use `setdefault(name, []).append(value)`.',
        solution: `def parse_query(qs):
    out = {}
    if not qs:
        return out
    for part in qs.split("&"):
        name, _, value = part.partition("=")
        out.setdefault(name, []).append(value)
    return out`,
      },
      {
        id: 'follow-redirects',
        title: 'Follow redirects',
        prompt: '`site` maps a URL to `(status, location)`. A 301 or 302 means “go to `location`”; any other status is the final answer. Starting at `url`, return `(final_url, hops)`. If you would need **more than** `max_hops` redirects, or you visit a URL twice (a loop), return `None`.',
        starter: `def follow(site, url, max_hops=5):
    # your code here
    pass`,
        tests: `site = {
    "http://a.com": (301, "https://a.com"),
    "https://a.com": (302, "https://a.com/home"),
    "https://a.com/home": (200, None),
    "https://x.com": (302, "https://y.com"),
    "https://y.com": (302, "https://x.com"),
}
assert follow(site, "https://a.com/home") == ("https://a.com/home", 0)
assert follow(site, "http://a.com") == ("https://a.com/home", 2)
assert follow(site, "http://a.com", max_hops=1) is None
assert follow(site, "https://x.com") is None`,
        hint: 'Keep a set of visited URLs and a hop counter. Loop while the status is 301/302: check the loop and the limit before you move to `location`.',
        solution: `def follow(site, url, max_hops=5):
    seen = {url}
    hops = 0
    status, location = site[url]
    while status in (301, 302):
        if hops == max_hops or location in seen:
            return None
        url = location
        seen.add(url)
        hops += 1
        status, location = site[url]
    return url, hops`,
      },
    ],
    explain: [
      {
        id: 'dns-http-explain',
        question: '“What happens when you type `https://shop.example.com/cart`?” Focus on the DNS part and the HTTP part: the steps, what is cached, and what the request and response look like.',
        points: [
          'DNS: browser cache → OS cache → recursive resolver → root → .com → authoritative server; answers are cached for their TTL',
          'Then TCP + TLS handshakes to the IP (port 443)',
          'HTTP request: method + path + version, headers like Host, Cookie/Authorization, Accept',
          'Response: status code, headers (Content-Type, Cache-Control, ETag, Set-Cookie), body',
          'Caching: max-age copies are reused; stale ones are checked with If-None-Match → 304',
        ],
        answer: 'First the browser needs the IP of `shop.example.com`. It checks its own cache and the OS cache; if they miss, a recursive resolver — the ISP’s or something like 1.1.1.1 — answers from its cache or walks the chain: a root server points to the `.com` servers, they point to the domain’s authoritative name server, and that server returns the A record with a TTL, which every cache keeps for that long. With the IP, the browser opens TCP and then TLS on port 443. Then it sends an HTTP request: `GET /cart HTTP/1.1` (or the same message as HTTP/2 frames) with headers such as `Host: shop.example.com`, the session cookie, and `Accept`. Because HTTP is stateless, the cookie is how the server knows whose cart to show. The response starts with a status code like 200, then headers — `Content-Type`, `Cache-Control`, maybe an `ETag` — and the HTML body. Next time, a copy that is still within its `max-age` is reused, and a stale one is checked with `If-None-Match`, which returns 304 with no body if nothing changed.',
      },
      {
        id: 'safe-retry-explain',
        question: 'A mobile app calls `POST /orders` and the request times out. What could have happened on the server, and how do you design the API so the user can safely try again?',
        points: [
          'A timeout does not mean failure: the order may have been created and only the response was lost',
          'POST is not idempotent, so a blind retry can create a second order or a second charge',
          'Client creates an idempotency key per order attempt and sends it on every retry',
          'Server stores key → result (with a unique constraint) and returns the saved result for repeats',
          'Retry only on timeouts, 502/503/504 — with backoff; never on 4xx',
        ],
        answer: 'A timeout only tells me that I did not get an answer. Three things could have happened: the request never arrived, the server is still working on it, or the order was created and the response was lost on the way back. POST is not idempotent, so if the app simply sends it again it may create a second order and charge the card twice. The fix is an idempotency key: when the user taps “Place order”, the app creates a random id and sends it in a header with the request and with every retry of that same order. The server saves the key together with the result, protected by a unique constraint in the database. If a request comes with a key it has already seen, it returns the saved result instead of doing the work again. The client then retries only on timeouts and on 502, 503 or 504, waiting a bit longer each time, and never retries a 4xx, because the same wrong request will fail again.',
      },
    ],
  },
  'os-processes-threads': {
    choice: [
      choice('proc-memory', 'What keeps one process from reading or breaking the memory of another?',
        ['Each process has its own address space, and the OS and CPU stop it from touching any other', 'Python’s GIL', 'The file system', 'Processes take turns writing to one shared memory'],
        'Every process sees its own private [[address space]]. That is why one crashed browser tab does not take the others with it.'),
      choice('thread-share', 'What do the threads of one process share?',
        ['The memory — global variables, the heap, open files; each thread has its own stack and registers', 'Nothing; each has its own memory', 'Only the stack', 'Only the CPU registers'],
        'Sharing memory makes threads cheap and fast to communicate — and is the source of race conditions.'),
      choice('states', 'A running process asks to read a file from disk. Which state does it go to?',
        ['Blocked (waiting), so the CPU can run another process', 'Ready', 'Running — it keeps the CPU while it waits', 'Finished'],
        'Disk and network are millions of CPU cycles slow. Waiting while holding the CPU would waste it.'),
      choice('context-switch', 'What happens in a context switch?',
        ['The OS saves the registers of the running process or thread and loads those of the next one', 'The process is copied to disk', 'The program is compiled again', 'All memory is cleared'],
        'A [[context switch]] is pure overhead: during it, no useful work runs. Too many switches waste CPU time.'),
      choice('rr-print', PRINT, ["[('B', 3), ('A', 4)]", "[('A', 3), ('B', 4)]", "[('B', 1), ('A', 3)]", "[('A', 2), ('B', 3)]"],
        'A runs 2 units (clock 2, 1 left), B runs its 1 unit and finishes at 3, then A runs its last unit and finishes at 4.',
        'from collections import deque\ndef rr(jobs, q):\n    queue, clock, done = deque(jobs.items()), 0, []\n    while queue:\n        name, left = queue.popleft()\n        run = min(q, left)\n        clock += run\n        if left > run:\n            queue.append((name, left - run))\n        else:\n            done.append((name, clock))\n    return done\nprint(rr({"A": 3, "B": 1}, 2))'),
      choice('conc-par', 'What is the difference between concurrency and parallelism?',
        ['Concurrency: tasks are in progress at the same time, taking turns; parallelism: tasks run at the same instant on different cores', 'They are the same', 'Parallelism is only for networks', 'Concurrency needs many cores'],
        'One core can give you [[concurrency]] (switching). Only several cores give you [[parallelism]].'),
      choice('gil-io', 'Your Python script downloads 200 web pages. Threads, or processes?',
        ['Threads (or asyncio): the work is waiting on the network, and a waiting thread releases the GIL', 'Processes: threads never help in Python', 'Neither: one loop is always fastest', 'Processes, because downloads use the CPU'],
        'The [[gil|GIL]] only matters while running Python code. I/O-bound work spends its time waiting, so threads overlap the waits.'),
      choice('race', 'Why can two threads running `counter += 1` lose an update?',
        ['It is three steps — read, add, write — and a switch between the read and the write lets both write the same value', 'Python ints cannot be shared', 'The GIL makes it impossible', 'Because `+=` creates a new thread'],
        'The operation is not [[atomic]]. The result depends on timing: a [[race condition]].'),
      choice('lock', 'What does `with lock:` around `counter += 1` guarantee?',
        ['Only one thread at a time runs that block, so the read, add and write happen together', 'The code runs faster', 'The counter is saved to disk', 'Each thread gets its own counter'],
        'A [[mutex]] turns a critical section into one step from the other threads’ point of view. The cost: threads wait for each other.'),
      choice('deadlock', 'Thread A holds lock 1 and waits for lock 2. Thread B holds lock 2 and waits for lock 1. What is this, and the simple fix?',
        ['A deadlock; make every thread take the locks in the same order', 'A race condition; add another lock', 'A context switch; use a bigger quantum', 'Normal waiting; it ends by itself'],
        'With one global order (always lock 1 before lock 2), a circle of waiting threads cannot form.'),
      choice('fork-exec', 'How does a Unix terminal run the command `ls`?',
        ['It calls `fork()` to copy itself, and the copy calls `exec()` to become `ls`', 'It starts a new thread inside the terminal', 'It reads `ls` into its own memory and jumps to it', 'It asks the GIL'],
        'fork = “copy me”, exec = “replace me with another program”. The terminal (the parent) then waits for the child.'),
      choice('lang-compare', 'In Node.js, one request runs a 3-second CPU-heavy loop. What happens to the other requests?',
        ['They wait: JavaScript runs on one thread with an event loop, so the loop blocks everything', 'They run in parallel on other cores', 'Node starts a new process for each request automatically', 'Nothing; the event loop pauses the heavy loop'],
        'The event loop is great for I/O, but CPU work must move to worker threads or other processes.'),
    ],
    code: [
      {
        id: 'parallel-finish',
        title: 'Finish time with k workers',
        prompt: 'A pool of `k` workers runs `tasks` (durations, in order). Each new task goes to the worker that becomes free **first**. Return the time when all tasks are done. (This is how `ProcessPoolExecutor` spreads work.) Use `heapq` for the workers’ free times.',
        starter: `import heapq

def finish_time(tasks, k):
    # your code here
    pass`,
        tests: `assert finish_time([4, 2, 3, 1], 2) == 5
assert finish_time([5, 5, 5], 3) == 5
assert finish_time([1, 1, 1, 1], 1) == 4
assert finish_time([], 4) == 0
assert finish_time([2, 2, 3, 7, 1], 2) == 9`,
        hint: 'Start with a heap of `k` zeros. For each task: pop the earliest free time `t`, push `t + task`. The answer is the biggest time in the heap.',
        solution: `import heapq

def finish_time(tasks, k):
    free = [0] * k
    for t in tasks:
        start = heapq.heappop(free)
        heapq.heappush(free, start + t)
    return max(free) if tasks else 0`,
      },
      {
        id: 'detect-deadlock',
        title: 'Detect a deadlock',
        prompt: '`waits_for` maps each blocked thread to the thread it is waiting for (a thread waits for at most one other). Return `True` if some threads wait for each other in a circle — a deadlock.',
        starter: `def has_deadlock(waits_for):
    # your code here
    pass`,
        tests: `assert has_deadlock({"A": "B", "B": "A"}) is True
assert has_deadlock({"A": "B", "B": "C"}) is False
assert has_deadlock({"A": "B", "B": "C", "C": "A"}) is True
assert has_deadlock({"D": "A", "A": "B", "B": "C", "C": "B"}) is True
assert has_deadlock({}) is False`,
        hint: 'From each thread, follow the arrows while you can, keeping a set of threads on this walk. Meeting one again means a circle.',
        solution: `def has_deadlock(waits_for):
    for start in waits_for:
        seen = set()
        t = start
        while t in waits_for:
            if t in seen:
                return True
            seen.add(t)
            t = waits_for[t]
    return False`,
      },
    ],
    explain: [
      {
        id: 'proc-thread-explain',
        question: '“What is the difference between a process and a thread?” Give a real example of each and say what Python changes.',
        points: [
          'Process: a running program with its own address space; isolated, more costly to start, talks by copying (pipes, sockets)',
          'Thread: runs inside a process and shares its memory; cheap, fast to share data, but needs locks',
          'A crash in a thread kills the whole process; a crashed process does not hurt others',
          'Examples: browser tabs / Gunicorn workers as processes; a server handling requests on threads',
          'Python: the GIL lets one thread run Python code at a time → threads for I/O, processes for CPU',
        ],
        answer: 'A process is a running program with its own address space — its own code, heap, stack and open files — and the operating system keeps processes apart, so one cannot read or break another’s memory. A thread is a line of execution inside a process; all threads of a process share its memory, and each one only has its own stack and registers. That makes threads cheaper to create and very fast to share data, but shared data needs locks, and a crash in one thread brings down the whole process. Processes are safer but cost more to start and must copy data to talk, through pipes or sockets. Chrome runs tabs as separate processes so one bad page cannot crash the others; a web server handles many requests on threads inside one process. In CPython the GIL lets only one thread run Python code at a time, so I use threads or asyncio for I/O-bound work, and separate processes — `multiprocessing` or `ProcessPoolExecutor` — for CPU-bound work.',
      },
      {
        id: 'race-explain',
        question: 'Explain a race condition with `counter += 1`, how a lock fixes it, and what new problem locks can cause.',
        points: [
          '`counter += 1` is read, add, write — not atomic',
          'Two threads read the same value, both write value + 1 → one update is lost; the result depends on timing',
          'A lock (mutex) lets one thread at a time into the critical section',
          'Locks add waiting; keep the critical section small',
          'Two locks taken in different orders can deadlock → always take locks in one fixed order',
        ],
        answer: '`counter += 1` looks like one step but is three: read the counter, add one, write it back. If thread A reads 0 and the scheduler switches to thread B before A writes, B also reads 0; both write 1, and one increment is lost. Whether it happens depends on timing, which is why it is called a race condition — the bug appears under load and disappears when you add a print. The fix is to make the three steps one critical section with a lock: `with lock: counter += 1`, so only one thread at a time can be inside. Locks have costs: threads wait for each other, so the locked part should be as small as possible. And with more than one lock there is a new danger, a deadlock: A holds lock 1 and waits for lock 2 while B holds lock 2 and waits for lock 1, and both wait forever. The usual rule is that every thread takes locks in the same fixed order.',
      },
    ],
  },
  'sd-basics': {
    choice: [
      choice('vert-horiz', 'What is the main limit of vertical scaling (a bigger machine)?',
        ['There is a biggest machine you can buy, it gets very expensive, and it is still one machine that can fail', 'It needs a load balancer', 'It requires rewriting the app', 'It makes the database slower'],
        '[[vertical scaling|Scaling up]] is the easy first step with no code change, but it has a ceiling and keeps the [[single point of failure]].'),
      choice('stateless-lb', 'Users get logged out at random after you add a second app server behind a load balancer. Why?',
        ['Sessions are kept in each server’s memory; the next request may go to the other server', 'The load balancer deletes cookies', 'The database is too slow', 'Two servers cannot share a domain'],
        'App servers must be [[stateless]]: keep sessions in Redis or the database, or in a signed token.'),
      choice('health-check', 'Why does a load balancer run health checks?',
        ['To stop sending traffic to a server that is down or broken', 'To measure the users’ internet speed', 'To encrypt the traffic', 'To restart the database'],
        'Without health checks, a dead server would still get its share of requests, and those users would see errors.'),
      choice('replicas', 'Your app does 100 reads for every write and the database is at 90% CPU. What helps most?',
        ['Read replicas: send the reads to copies, keep the writes on the primary', 'A bigger CDN', 'Sharding the writes', 'More app servers'],
        'The bottleneck is reads. [[read replica|Replicas]] add read capacity; app servers were not the problem.'),
      choice('failover', 'The primary database crashes. What does failover do?',
        ['Promotes a replica to be the new primary, so writes can continue', 'Restores yesterday’s backup', 'Sends all writes to the cache', 'Stops the website until a human fixes it'],
        '[[failover|Failover]] removes the database as a single point of failure. Writes that had not reached the replica yet can be lost.'),
      choice('sharding', 'When do you need sharding instead of only replicas?',
        ['When the writes or the data size no longer fit on one primary machine', 'When reads are slow', 'When you add a CDN', 'Always, from the first day'],
        'Replicas copy the **same** data, so they do not help writes. [[sharding|Sharding]] splits the data by a key (for example `user_id`) across machines.'),
      choice('cache-aside', 'In the cache-aside pattern, what happens on a cache **miss**?',
        ['The app reads the database, stores the result in the cache with a TTL, and returns it', 'The cache reads the database by itself and the app waits', 'The request fails', 'The app writes to the database'],
        'The app manages the cache: check cache → on a miss read the DB → fill the cache. Next time it is a hit.'),
      choice('stale-cache', 'A user changes their profile name, but the old name keeps showing for minutes. What is the usual fix?',
        ['Delete (invalidate) the cache key when the data is written, and keep a TTL as a safety net', 'Make the cache bigger', 'Turn off the database', 'Add a read replica'],
        'After the write, the next read misses and refills the cache with the new value.'),
      choice('cdn', 'What does a CDN do for a photo-sharing site?',
        ['Serves images and other static files from servers close to the users, so they load fast and skip your app servers', 'Stores the users’ passwords', 'Balances writes across database shards', 'Runs background jobs'],
        'A [[cdn|CDN]] caches static files at the edge, near the users.'),
      choice('queue', 'Uploading a video must also create 5 sizes of it, which takes a minute. How do you keep the upload request fast?',
        ['Put a “process this video” job on a message queue and let worker processes do it in the background', 'Make the user wait 60 seconds', 'Do it on the load balancer', 'Cache the video'],
        'A [[message queue]] moves slow work out of the request. If workers fall behind, the queue grows instead of the site slowing down.'),
      choice('estimate', PRINT, ['116', '1157', '12', '86400'],
        '1 million users × 10 requests = 10 million a day, divided by 86,400 seconds ≈ 116 requests per second on average.',
        'dau = 1_000_000\nprint(round(dau * 10 / 86_400))'),
      choice('interview-order', 'In a system design interview, what do you do **first**?',
        ['Ask about requirements and scale: what it must do, how many users, read-heavy or write-heavy', 'Draw the database tables', 'Choose Kafka or RabbitMQ', 'Write code for the API'],
        'The requirements decide everything else. Designing before you know the scale is the most common mistake.'),
    ],
    code: [
      {
        id: 'route-query',
        title: 'Route queries to the primary or a replica',
        prompt: 'Return `"primary"` for SQL that **changes** data (it starts with `INSERT`, `UPDATE` or `DELETE`, in any case, maybe after spaces) and `"replica"` for everything else.',
        starter: `def route(sql):
    # your code here
    pass`,
        tests: `assert route("SELECT * FROM users") == "replica"
assert route("insert into posts values (1)") == "primary"
assert route("   UPDATE users SET name = 'A'") == "primary"
assert route("Delete from posts") == "primary"
assert route("select count(*) from orders") == "replica"`,
        hint: '`first = sql.strip().split()[0].upper()`, then check it against a set of words.',
        solution: `def route(sql):
    first = sql.strip().split()[0].upper()
    return "primary" if first in {"INSERT", "UPDATE", "DELETE"} else "replica"`,
      },
      {
        id: 'shard-counts',
        title: 'Shard by user id',
        prompt: 'Users are split across `n` shards with `user_id % n`. Return a list with the number of users on each shard (index = shard number), and the index of the **busiest** shard (the first one if there is a tie): `(counts, busiest)`.',
        starter: `def shard_counts(user_ids, n):
    # your code here
    pass`,
        tests: `assert shard_counts([1, 2, 3, 4, 5, 6], 3) == ([2, 2, 2], 0)
assert shard_counts([10, 20, 30, 31], 10) == ([3, 1, 0, 0, 0, 0, 0, 0, 0, 0], 0)
assert shard_counts([1, 3, 5], 2) == ([0, 3], 1)
assert shard_counts([], 2) == ([0, 0], 0)`,
        hint: '`counts = [0] * n`, add one at `user_id % n`. The busiest is `counts.index(max(counts))`.',
        solution: `def shard_counts(user_ids, n):
    counts = [0] * n
    for uid in user_ids:
        counts[uid % n] += 1
    return counts, counts.index(max(counts))`,
      },
    ],
    explain: [
      {
        id: 'scale-story',
        question: '“Your app runs on one server and is growing towards a million users.” Walk through how you would scale it, step by step, and why each step.',
        points: [
          'Start: app + database on one machine; a single point of failure',
          'Move the database to its own machine; scale up first (simple)',
          'Several stateless app servers behind a load balancer with health checks; sessions in Redis or tokens',
          'Read replicas for read-heavy load; failover for the primary; sharding later if writes do not fit',
          'Cache (cache-aside + TTL) for hot data, CDN for static files, a queue + workers for slow jobs; measure before each step',
        ],
        answer: 'At the start the web app and the database share one machine, which is simple but a single point of failure. The first steps are to move the database to its own server and to scale up, because a bigger machine needs no code change. When one app server is not enough, I run several behind a load balancer that checks their health; for that the app servers must be stateless, so sessions move to Redis or into tokens. Most apps read far more than they write, so next I add read replicas for the reads and keep writes on the primary, with failover so a replica can take over if the primary dies. Hot data goes into a cache with the cache-aside pattern and a TTL, which takes most reads off the database, and images, CSS and JavaScript go to a CDN near the users. Slow work like sending emails or resizing images goes onto a message queue handled by background workers. Only if the writes outgrow one primary would I shard the data by user id. At each step I would measure first, so I fix the real bottleneck.',
      },
      {
        id: 'cache-explain',
        question: 'Explain the cache-aside pattern. What would you cache, how do you keep it fresh, and what can go wrong?',
        points: [
          'Read: check the cache; on a miss read the DB, store with a TTL, return',
          'Cache data that is read often and changes rarely: profiles, product pages, computed feeds',
          'Freshness: delete the key on write (invalidate) + a TTL as a safety net',
          'Memory is limited → eviction, usually LRU; measure the hit rate',
          'Problems: stale data, a burst of misses hitting the DB at once (e.g. after a restart), caching per-user private data by mistake',
        ],
        answer: 'With cache-aside the application owns the cache. On a read it first looks in the cache, for example Redis; on a hit it returns the value at once, and on a miss it reads the database, stores the result in the cache with a TTL and returns it. I cache data that is read much more often than it changes — user profiles, product pages, a computed feed — because that is where the hit rate is high. To keep it fresh, every write to the database deletes the matching cache key, so the next read loads the new value, and the TTL is a safety net in case an invalidation is missed. The cache has limited memory, so old keys are evicted, usually least recently used, and I watch the hit rate to see whether it is worth it. What can go wrong: users seeing stale data, many requests missing at the same time and hitting the database together — for example after a cache restart — and mistakes in the key, like caching one user’s private data under a key that another user can read.',
      },
    ],
  },
}
