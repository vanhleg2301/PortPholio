// Technical words marked as [[key]] in lessons and tests. `en` explains the word in plain
// English (A2–B1); `example` shows it in a real situation, so the meaning sticks.
export interface GlossaryEntry {
  en: string
  example: string
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // Python
  object: {
    en: 'a piece of data in memory. It has a type (int, str, list…) and a value',
    example: 'In `age = 30`, the number 30 is an object of type int, and `age` is just a name that points to it.',
  },
  'dynamically typed': {
    en: 'Python checks types while the program runs, not before, so one name can hold an int now and a string later',
    example: '`x = 5` then `x = "five"` is fine in Python. In Java, a variable declared as `int` can never hold text.',
  },
  overflow: {
    en: 'a number grows too big for the space it is stored in, so it becomes wrong',
    example: 'An old car odometer with 6 digits goes from 999999 back to 000000. In C, a 32-bit int going past 2,147,483,647 does the same.',
  },
  immutable: {
    en: 'cannot be changed after it is created. To “change” it you make a new one',
    example: 'A printed receipt: to fix a mistake you print a new receipt. `s = "hi"; s.upper()` gives a new string, `s` is still "hi".',
  },
  mutable: {
    en: 'can be changed in place after it is created',
    example: 'A whiteboard: you erase and write on the same board. `nums.append(4)` changes the same list everyone points to.',
  },
  'floor division': {
    en: 'divide, then round down to the nearest whole number. In Python it is `//`',
    example: '17 people, 5 seats per car: `17 // 5` is 3 full cars.',
  },
  remainder: {
    en: 'what is left after dividing into equal groups. In Python it is `%`',
    example: '17 people, 5 seats per car: `17 % 5` is 2 people left over. Also: `n % 2 == 0` means n is even.',
  },
  tolerance: {
    en: 'a very small difference you agree to treat as “equal”',
    example: 'Two shop scales show 1.000 kg and 1.001 kg — you call it the same. For floats: `abs(a - b) < 1e-9`.',
  },
  aliasing: {
    en: 'two names point to the same object, so a change through one name shows through the other',
    example: 'Two people share one Google Doc link: when one edits, the other sees it. `b = a` with a list works the same way.',
  },
  'arbitrary precision': {
    en: 'the number can have as many digits as memory allows; it never overflows',
    example: '`2 ** 100` in Python prints all 31 digits exactly. A calculator would show something like 1.27e30.',
  },
  sequence: {
    en: 'an ordered collection where each item has a position: str, list, tuple',
    example: 'A playlist: song 0, song 1, song 2… You can ask for “the 3rd song” or “songs 2 to 5”.',
  },
  index: {
    en: 'the position of an item in a sequence, counting from 0',
    example: 'In `["red", "green", "blue"]`, "red" is at index 0 and "blue" is at index 2 (or -1, counting from the end).',
  },
  slicing: {
    en: 'taking a part of a sequence with `[start:stop:step]`. `stop` is not included',
    example: 'Cutting a slice from a loaf: `"Saturday"[0:3]` gives "Sat". `[::-1]` reads it backwards.',
  },
  'f-string': {
    en: 'a string that starts with `f`; the code inside `{ }` is run and its value is put in the text',
    example: '`f"Total: {price * qty} VND"` with price 20 and qty 3 gives "Total: 60 VND".',
  },
  'big o': {
    en: 'how the running time or memory grows when the input gets bigger, ignoring small details',
    example: 'Looking for a name in a phone book page by page is O(n). Opening it in the middle and halving each time is O(log n).',
  },
  palindrome: {
    en: 'a word or sequence that reads the same forwards and backwards',
    example: '"level", "racecar", or the number 12321.',
  },
  'dynamic array': {
    en: 'an array that grows by itself: when it is full it moves to a bigger block of memory',
    example: 'A restaurant moves your group to a bigger table when more friends arrive. Python lists work like this.',
  },
  reference: {
    en: 'an arrow that points to an object; the name holds the arrow, not the object itself',
    example: 'A contact in your phone is not the person, only a way to reach them. Two contacts can reach the same person.',
  },
  amortized: {
    en: 'the average cost per operation over many operations, even if a few of them are expensive',
    example: 'A monthly metro pass costs a lot once, but split over 60 rides each ride is cheap. `list.append` is amortized O(1).',
  },
  timsort: {
    en: 'Python’s built-in sorting algorithm. It is very fast when the data is already partly sorted',
    example: 'Sorting a list of orders that is already in date order except the last few: Timsort finishes almost at once.',
  },
  unpacking: {
    en: 'putting the items of a tuple or list into several names in one line',
    example: '`name, age = ("An", 25)` sets name to "An" and age to 25. `a, b = b, a` swaps two values.',
  },
  'prefix sum': {
    en: 'a list where item i is the total of all items up to i, so any range total takes one subtraction',
    example: 'Your phone counts total steps since Monday. Steps from Wednesday to Friday = total on Friday − total on Tuesday.',
  },
  'hash table': {
    en: 'a structure that turns a key into a number (a hash) and uses it to jump straight to where the value is stored',
    example: 'A cloakroom: you get ticket 42 and the staff go straight to hook 42 — no search through every coat.',
  },
  'hash map': {
    en: 'a hash table that maps keys to values. In Python, this is a dict',
    example: 'A phone contact list: name → number. `phone["Mai"]` finds Mai’s number at once.',
  },
  hashable: {
    en: 'has a hash that never changes, so it can be a dict key or a set item. Immutable things like str, int and tuple are hashable',
    example: '`{(1, 2): "point"}` works because a tuple cannot change. `{[1, 2]: "point"}` fails because a list can change.',
  },
  collision: {
    en: 'two different keys get the same slot in a hash table, so the table must keep both and check which is which',
    example: 'Two coats on the same cloakroom hook: the staff must look at the tickets to give back the right one.',
  },
  'trade-off': {
    en: 'you get one benefit but pay for it with something else',
    example: 'Taking a taxi instead of the bus: faster, but more money. A cache: faster reads, but more memory.',
  },
  iterable: {
    en: 'anything you can loop over with `for`',
    example: 'A list, a string (letter by letter), a dict (key by key), a file (line by line), `range(5)`.',
  },
  comprehension: {
    en: 'a one-line way to build a list, set or dict from a loop',
    example: '`[p * 1.1 for p in prices]` makes a new list with every price 10% higher.',
  },
  'local variable': {
    en: 'a variable created inside a function. It only exists while that function call runs',
    example: 'A notepad you use during one phone call and throw away when you hang up.',
  },
  scope: {
    en: 'the part of the code where a name can be used',
    example: 'A variable made inside `def total():` cannot be used outside it, like a room key that only opens one room.',
  },
  recursion: {
    en: 'a function that calls itself on a smaller version of the same problem',
    example: 'Russian nesting dolls: to count them, open one and count the dolls inside it, down to the smallest doll.',
  },
  'base case': {
    en: 'the smallest input a recursive function answers directly, so the calls stop',
    example: 'The smallest nesting doll does not open — that is where you stop. For factorial: `if n == 0: return 1`.',
  },
  'call stack': {
    en: 'the memory where each function call waits until the call it made returns',
    example: 'A stack of plates: each new call goes on top, and the top one must finish first. Too many calls → “maximum recursion depth exceeded”.',
  },
  lambda: {
    en: 'a small function with no name, written in one line',
    example: '`sorted(people, key=lambda p: p.age)` sorts people by age without writing a full `def`.',
  },
  transpose: {
    en: 'turn rows into columns (and columns into rows)',
    example: 'A timetable with days as rows and hours as columns becomes one with hours as rows and days as columns. In Python: `list(zip(*grid))`.',
  },
  memoization: {
    en: 'saving answers you already computed so you can reuse them instead of computing again',
    example: 'Writing the answer to a hard sum on a sticky note, so the next person who asks gets it at once. `@functools.cache` does this.',
  },
  deque: {
    en: 'a double-ended queue: fast to add and remove items at both the front and the back',
    example: 'A “recently viewed” list: add new pages at one end, drop the oldest from the other. `collections.deque(maxlen=10)`.',
  },
  heap: {
    en: 'a tree stored in a list where the smallest item is always on top, so you can take the minimum fast',
    example: 'A hospital emergency room: the most urgent patient is always seen next, even if they came last. `heapq.heappop`.',
  },
  'stable sort': {
    en: 'a sort that keeps items with equal keys in the order they had before',
    example: 'Sort students by grade: two students with grade 8 stay in their original (alphabetical) order. Python’s sort is stable.',
  },
  anagram: {
    en: 'a word made from exactly the same letters as another word',
    example: '“listen” and “silent”, or “evil” and “vile”.',
  },
  carry: {
    en: 'the extra 1 you move to the next column when a column adds up to 10 or more',
    example: '58 + 7: 8 + 7 = 15, write 5 and carry 1 to the tens, so the answer is 65.',
  },
  isomorphic: {
    en: 'having the same pattern: one can become the other by swapping each item for exactly one other item',
    example: '"egg" and "add" have the same pattern (x, y, y). "foo" and "bar" do not.',
  },

  // DSA
  'brute force': {
    en: 'the simple way that tries every possibility; correct but often slow',
    example: 'Opening a 3-digit lock by trying 000, 001, 002… up to 999.',
  },
  complement: {
    en: 'the other part you need to reach a target',
    example: 'Target 10,000 VND and you have 7,000 VND: the complement is 3,000. In Two Sum, for target 9 and x = 2 you look for 7.',
  },
  'canonical form': {
    en: 'one standard way to write things that count as “the same”, so they get the same key',
    example: 'Phone numbers "0912 345 678" and "+84912345678" become one standard form before you compare them. For anagrams: the sorted letters.',
  },
  'bucket sort': {
    en: 'put items into numbered buckets, then read the buckets in order',
    example: 'Sorting exam papers: put each paper in pile 0–10 by its score, then pick up the piles from 10 down to 0.',
  },
  prefix: {
    en: 'the start of a sequence: everything before a position',
    example: '"inter" is a prefix of "internet". For [3, 1, 4, 1], the prefix before index 2 is [3, 1].',
  },
  suffix: {
    en: 'the end of a sequence: everything after a position',
    example: '".com" is a suffix of "google.com". For [3, 1, 4, 1], the suffix after index 1 is [4, 1].',
  },
  delimiter: {
    en: 'a character that marks where one piece of data ends and the next begins',
    example: 'In a CSV line "An,25,Hanoi" the comma is the delimiter. `"a,b".split(",")` gives ["a", "b"].',
  },
  subarray: {
    en: 'a continuous part of an array, with no gaps',
    example: 'For [2, 5, 1, 8], [5, 1] is a subarray; [2, 1] is not (it skips 5).',
  },
  'two pointers': {
    en: 'two indexes that move through the data in a planned way, instead of checking every pair',
    example: 'Two people search a sorted bookshelf, one from each end, and walk toward each other.',
  },
  invariant: {
    en: 'a rule that stays true at every step of a loop; it is the reason the algorithm is correct',
    example: 'In a bank, “the money in all accounts together stays the same after a transfer” is an invariant.',
  },
  'sliding window': {
    en: 'a range [l, r] that grows on the right and shrinks on the left as it moves over the data',
    example: 'A train window: as the train moves, new houses come in on one side and old ones leave on the other.',
  },
  'monotonic queue': {
    en: 'a deque kept in increasing or decreasing order, so its front is always the current min or max',
    example: 'A line for “the tallest person in view”: when a taller person arrives, everyone shorter in front of them leaves.',
  },

  // Networking
  latency: {
    en: 'the waiting time for data to travel from one place to another',
    example: 'You tap “Send” and the message arrives 0.2 s later. That 0.2 s is the latency.',
  },
  bandwidth: {
    en: 'how much data can move per second',
    example: 'A highway with 4 lanes carries more cars per minute than a road with 1 lane, even with the same speed limit.',
  },
  rtt: {
    en: 'round-trip time: the time for a message to go to the server and the answer to come back',
    example: 'Hanoi → a server in the US and back takes about 200 ms. The `ping` command shows your RTT.',
  },
  'propagation delay': {
    en: 'the time a signal needs to travel the physical distance; light in fibre cannot go faster',
    example: 'Hanoi to New York is about 13,000 km; light in fibre needs about 65 ms one way, however fast the server is.',
  },
  fiber: {
    en: 'glass cables that carry data as light. Most internet traffic between cities and countries uses them',
    example: 'The undersea cables linking Vietnam to Singapore and Hong Kong are fibre cables.',
  },
  region: {
    en: 'a group of cloud data centres in one area of the world',
    example: 'AWS “ap-southeast-1” is Singapore. A Vietnamese app answers faster from Singapore than from a US region.',
  },
  cdn: {
    en: 'content delivery network: many servers around the world that keep copies of files close to users',
    example: 'A YouTube video you watch in Hanoi usually comes from a server in Vietnam or nearby, not from the US.',
  },
  congestion: {
    en: 'too much traffic on part of the network, so packets wait in queues or get dropped',
    example: 'Like rush hour on a road: the road still works, but everyone moves slowly and some cars give up.',
  },
  dns: {
    en: 'the system that turns a name like google.com into an IP address',
    example: 'Like your phone’s contact list: you tap “Mom”, and the phone looks up her number for you.',
  },
  cache: {
    en: 'a store of recent results kept close by, so the next request for the same thing is faster',
    example: 'Your browser keeps a site’s logo after the first visit, so it does not download it again.',
  },
  handshake: {
    en: 'messages two sides exchange to agree on settings before real data flows',
    example: 'A phone call: “Hello?” — “Hi, it’s An.” — “Oh, hi!” Only then the real talk starts. TCP does SYN, SYN-ACK, ACK.',
  },
  tls: {
    en: 'the encryption layer that protects web traffic; it is the “S” in HTTPS',
    example: 'The lock icon in the address bar means the page came over TLS, so others on the Wi-Fi cannot read your password.',
  },
  packet: {
    en: 'a small piece of data sent over the network on its own',
    example: 'A big file is cut into many packets, like a book sent as numbered postcards and put back together at the end.',
  },
  retransmission: {
    en: 'sending a lost packet again',
    example: 'A courier reports a parcel lost, so the shop sends the same item again.',
  },
  'flow control': {
    en: 'the receiver tells the sender how much more data it can take, so it is not flooded',
    example: 'A waiter says “the kitchen is full, please wait before ordering more” so orders do not pile up.',
  },
  buffer: {
    en: 'memory that holds data for a short time, between where it comes from and where it goes',
    example: 'A video player downloads a few seconds ahead into a buffer, so a short network drop does not stop the video.',
  },
  'congestion control': {
    en: 'the sender slows down when the network looks busy, and speeds up when it looks free',
    example: 'A driver slows down when the road ahead gets crowded, then speeds up when it clears.',
  },
  'slow start': {
    en: 'a new TCP connection sends a little at first, then doubles the amount every round trip',
    example: 'A new worker gets 1 task, then 2, then 4… as long as they finish them all without problems.',
  },
  'congestion window': {
    en: 'how much data the sender lets itself have “in flight” before it gets an ACK',
    example: 'How many parcels a courier may carry out at once before coming back for confirmation.',
  },
  'head-of-line blocking': {
    en: 'one lost or slow item holds back everything queued behind it',
    example: 'A supermarket line where the first customer’s card fails: everyone behind waits, even people paying cash.',
  },
  quic: {
    en: 'a newer transport protocol built on UDP, with TLS built in; HTTP/3 runs on it',
    example: 'YouTube and Google Search use QUIC, so one lost packet does not freeze every file on the page.',
  },
  'keep-alive': {
    en: 'keeping a connection open after a request, to reuse it for the next requests',
    example: 'Staying on one phone call to ask three questions, instead of hanging up and calling again for each one.',
  },
  'connection pool': {
    en: 'a set of open connections a program keeps and reuses, so it does not open a new one each time',
    example: 'A taxi company keeps cars waiting at the station, so customers do not wait for a car to be called in.',
  },
  datagram: {
    en: 'one UDP packet. It is sent on its own, with no connection and no promise that it arrives',
    example: 'Throwing a paper plane with a note: it usually gets there, but nobody tells you if it did not.',
  },
  port: {
    en: 'a number (0–65535) that says which program on a machine the data is for',
    example: 'The IP address is the apartment building; the port is the room number. HTTPS uses 443, SSH uses 22.',
  },
  encryption: {
    en: 'turning data into unreadable bytes that only someone with the right key can turn back',
    example: 'Your bank app encrypts your password, so someone on the same café Wi-Fi sees only random bytes.',
  },
  certificate: {
    en: 'a signed file that links a domain name to a public key, so you know who you are talking to',
    example: 'Like a passport for a website: it says “this key belongs to vietcombank.com.vn”, signed by a trusted authority.',
  },
  'certificate authority': {
    en: 'a trusted company that signs certificates after checking who owns a domain (CA)',
    example: 'Let’s Encrypt and DigiCert are CAs. Your phone already trusts a built-in list of them.',
  },
  'symmetric encryption': {
    en: 'encryption where the same secret key locks and unlocks the data; very fast',
    example: 'A house key: the same key locks and opens the door. TLS uses AES this way for the page data itself.',
  },
  'public key': {
    en: 'the half of a key pair that anyone may see; used to check signatures or to lock data for the owner',
    example: 'An open padlock you hand out to anyone: they can lock a box with it, but only you can open it.',
  },
  'private key': {
    en: 'the secret half of a key pair; it never leaves its owner',
    example: 'The only key that opens your padlock. If a server’s private key is stolen, others can pretend to be that server.',
  },
  'key exchange': {
    en: 'a way for two sides to agree on a shared secret key even when others can see every message',
    example: 'Diffie–Hellman: two people mix a public paint colour with their own secret colours and end up with the same colour nobody else can make.',
  },
  'forward secrecy': {
    en: 'old recorded traffic stays safe even if the server’s private key is stolen later',
    example: 'Each chat uses a new one-time key that is thrown away, so a key stolen next year cannot open this year’s chats.',
  },
  sni: {
    en: 'Server Name Indication: the site name the browser sends at the start of TLS, before encryption starts',
    example: 'Your Wi-Fi provider cannot read the page, but it can see from the SNI that you opened facebook.com.',
  },
}
