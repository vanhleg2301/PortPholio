import type { TaskReference } from './types'

// Theory cards for the AI project and the career tasks: the practical knowledge an engineer
// uses at work and is asked about in interviews. Python examples marked "runs offline" were
// run in Python 3 and their printed output matches the comments; API examples need a key.

const DOCS = 'https://platform.claude.com/docs/en'
const TIH = 'https://www.techinterviewhandbook.org'
const USE_IT = 'You need this when'

export const AI_REFERENCES = {
  llmBasics: {
    title: 'LLM basics: tokens, context window, cost and speed',
    summary:
      'An LLM reads and writes tokens (pieces of words). You pay per token, the context window limits how many fit in one request, and the API remembers nothing — you send the whole conversation every time.',
    recognizeTitle: USE_IT,
    recognize: [
      'You estimate what an AI feature will cost per month',
      'A long chat suddenly fails or forgets the beginning',
      'Users say the answer "takes forever to start"',
    ],
    points: [
      'A token is roughly ¾ of an English word (about 4 characters). Vietnamese and code usually need more tokens per word. Count exactly with the token-counting endpoint instead of guessing.',
      'The context window is the maximum number of tokens in one request: system prompt + all messages + the answer. Recent Claude models accept up to 1M tokens; that is a limit, not a target — more context costs more and can bury the important part.',
      'The API is stateless: each request must contain the full history you want the model to see. A "chat memory" is just your code storing and resending messages.',
      'Price is per million tokens, and output tokens cost several times more than input tokens. Cost per request = input × input price + output × output price.',
      '`max_tokens` caps the answer length. If the model hits it, `stop_reason` is `max_tokens` and the answer is cut — check `stop_reason` before trusting the text.',
      'Latency has two parts: time to first token (TTFT) and tokens per second. Streaming shows text as it is generated, so the user sees progress after the first token instead of waiting for the whole answer.',
      'Prompt caching: if many requests start with the same long prefix (instructions, a document), the provider can cache it; cached input is read at about a tenth of the normal price and faster.',
    ],
    tableTitle: 'Numbers to remember',
    complexity: [
      { op: '1 token', cost: '≈ 4 chars', note: 'English text' },
      { op: '1,000 words of English', cost: '≈ 1,300 tokens' },
      { op: 'Output vs input price', cost: '≈ 5×', note: 'output is the expensive side' },
      { op: 'Cached input vs normal input', cost: '≈ 0.1×', note: 'prompt caching' },
    ],
    exampleLang: 'python',
    example: `# Runs offline: estimate the monthly cost of a feature.
# Prices are examples in USD per million tokens - check the pricing page.
INPUT_PRICE, OUTPUT_PRICE = 4.00, 20.00

def cost_usd(input_tokens, output_tokens):
    return (input_tokens * INPUT_PRICE + output_tokens * OUTPUT_PRICE) / 1_000_000

per_request = cost_usd(input_tokens=3_000, output_tokens=500)
print(round(per_request, 4))                 # 0.022
print(round(per_request * 2_000 * 30, 2))    # 1320.0  (2,000 requests a day)`,
    pitfalls: [
      { title: 'Sending the whole chat history forever', fix: 'Cost and latency grow with every turn. Keep recent turns, summarise older ones, and cache the stable prefix.' },
      { title: 'Ignoring `stop_reason`', fix: 'A cut-off answer (`max_tokens`) or a refusal looks like normal text if you only read `content`. Branch on `stop_reason` first.' },
      { title: 'Putting the date or a request id at the top of the system prompt', fix: 'Any change at the start breaks prompt caching for everything after it. Keep stable text first, changing text last.' },
    ],
    interview: {
      when: 'AI engineering interviews often start here: "how would you cut the cost / latency of this feature?" Answer with numbers: tokens per request, price, caching, a smaller model or lower effort, streaming.',
      problems: [],
    },
    inWork: [
      'Budgeting an AI feature before building it',
      'Logging tokens per request to find the expensive prompts',
      'Streaming answers in a chat UI so it feels fast',
    ],
    quiz: [
      { question: 'Why does a chatbot get more expensive the longer a conversation goes?', answer: 'The API is stateless, so every new request resends the whole history. Input tokens per request keep growing.' },
      { question: 'An answer ends in the middle of a sentence. What do you check first?', answer: '`stop_reason`. If it is `max_tokens`, the answer hit the length cap — raise `max_tokens` or ask for a shorter answer.' },
      { question: 'What does streaming improve, and what does it not?', answer: 'It improves perceived latency (time until the user sees text). It does not make the total answer faster or cheaper.' },
    ],
    source: { label: 'Claude docs: Context windows', url: `${DOCS}/build-with-claude/context-windows` },
    extraSource: { label: 'Claude docs: Pricing', url: `${DOCS}/about-claude/pricing` },
  },

  apiStructured: {
    title: 'Calling the Claude API and getting reliable JSON',
    summary:
      'One request = model + system prompt + messages. When code needs to read the answer, ask for structured output with a JSON schema, so you get valid JSON every time instead of parsing free text.',
    recognizeTitle: USE_IT,
    recognize: [
      'Your code must read fields from the answer (category, score, list of items)',
      'A regex over the model’s text breaks every few hundred requests',
      'You extract data from emails, invoices or forms',
    ],
    points: [
      'A request has: `model`, `max_tokens`, an optional `system` prompt (who the model is, rules, format) and `messages` — a list of `user` / `assistant` turns.',
      'The response `content` is a list of blocks. Check each block’s `type` (`text`, `tool_use`, `thinking`…) before reading it.',
      'Structured outputs: pass a JSON schema in `output_config.format` (or a Pydantic model with `client.messages.parse`). The answer is guaranteed to match the schema, so `json.loads` never fails.',
      'Still validate the meaning: the JSON can be valid but wrong (a made-up email). Check values your code depends on.',
      'Write the system prompt like a brief for a new colleague: the goal, who the users are, what a good answer looks like, and one or two examples. Clear context beats "magic words".',
      'The SDK retries rate limits (429) and server errors (5xx) for you, with backoff. Catch the SDK’s typed errors, not error-message strings.',
    ],
    exampleLang: 'python',
    example: `# Needs an API key (not run here). pip install anthropic pydantic
import anthropic
from pydantic import BaseModel

class Ticket(BaseModel):
    category: str        # "billing", "bug" or "other"
    urgent: bool
    summary: str

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY
response = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=1000,
    system="You sort customer emails for a small SaaS company.",
    messages=[{"role": "user", "content": "I was charged twice this month!!"}],
    output_format=Ticket,
)
ticket = response.parsed_output          # a validated Ticket
print(ticket.category, ticket.urgent)    # e.g. billing True`,
    pitfalls: [
      { title: 'Asking for JSON in the prompt and hoping', fix: 'Free text sometimes adds a sentence or a code fence. Use structured outputs, which guarantee the schema.' },
      { title: 'Hard-coding the API key', fix: 'Read it from an environment variable; never commit it or send it to the browser — call the API from your server.' },
      { title: 'No timeout or error handling', fix: 'Set a timeout, catch rate-limit and server errors, and show the user a clear message instead of hanging.' },
    ],
    interview: {
      when: 'Expect "how do you make LLM output reliable enough for production?" — schema-constrained output, validation of values, retries, and an eval set to measure it.',
      problems: [],
    },
    inWork: ['Classifying support tickets', 'Extracting fields from documents into a database', 'Turning a user’s sentence into filters for a search'],
    quiz: [
      { question: 'Structured outputs guarantee valid JSON. Is your job done?', answer: 'No. The shape is right but values can still be wrong or made up; validate what your code relies on and measure accuracy with evals.' },
      { question: 'Where should the API call run: browser or server?', answer: 'Server. The browser would expose your API key to every user.' },
    ],
    source: { label: 'Claude docs: Structured outputs', url: `${DOCS}/build-with-claude/structured-outputs` },
    extraSource: { label: 'Claude docs: Prompt engineering', url: `${DOCS}/build-with-claude/prompt-engineering/overview` },
  },

  toolUse: {
    title: 'Tool use (function calling)',
    summary:
      'You describe functions (name, description, JSON schema). The model answers with a `tool_use` block asking you to run one; your code runs it and sends back a `tool_result`. Loop until the model gives a final answer.',
    recognizeTitle: USE_IT,
    recognize: [
      'The model needs live data (weather, an order status, your database)',
      'The model must act: create a ticket, send an email, run a query',
      'You are building an agent',
    ],
    points: [
      'The model never runs code itself. It only says "call `get_order(order_id="A17")`". Your code decides whether to run it — that is where permissions and safety checks live.',
      'Loop: send request → if `stop_reason == "tool_use"`, run every `tool_use` block → append the assistant message and one user message with all the `tool_result` blocks → send again. Stop when `stop_reason == "end_turn"`.',
      'Each `tool_result` must carry the `tool_use_id` of the call it answers. Several calls in one turn → return all results in one message.',
      'If a tool fails, return the error text with `is_error: true`. The model can then retry or explain — do not crash the loop.',
      'Good tool descriptions matter more than clever prompts: say what the tool does, when to use it, and what each field means. `strict: true` makes inputs always match the schema.',
      'Always cap the loop (for example 10 steps) so a confused model cannot call tools forever.',
    ],
    exampleLang: 'python',
    example: `# Needs an API key (not run here): the manual tool loop.
import anthropic
client = anthropic.Anthropic()

tools = [{
    "name": "get_order_status",
    "description": "Look up the delivery status of one order by its id.",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "string"}},
        "required": ["order_id"],
    },
}]

def run_tool(name, args):
    if name == "get_order_status":
        return f"Order {args['order_id']}: shipped, arrives Friday"
    return "Unknown tool"

messages = [{"role": "user", "content": "Where is my order A17?"}]
for step in range(10):                        # step limit
    response = client.messages.create(model="claude-opus-5-5", max_tokens=2000,
                                      tools=tools, messages=messages)
    if response.stop_reason != "tool_use":
        break
    messages.append({"role": "assistant", "content": response.content})
    results = [{"type": "tool_result", "tool_use_id": b.id, "content": run_tool(b.name, b.input)}
               for b in response.content if b.type == "tool_use"]
    messages.append({"role": "user", "content": results})

print(next(b.text for b in response.content if b.type == "text"))`,
    pitfalls: [
      { title: 'Giving a tool more power than the task needs', fix: 'A "run any SQL" tool can drop tables. Give narrow tools (`get_order_status`) and check permissions in your code.' },
      { title: 'Sending each tool result in its own message', fix: 'Put all results of one turn into a single user message; otherwise the model learns to stop calling tools in parallel.' },
      { title: 'No step limit', fix: 'Count iterations and stop with a clear message after N steps.' },
    ],
    interview: {
      when: 'Common question: "walk me through what happens when the model calls a tool". Draw the loop and say where you validate inputs, handle errors and stop.',
      problems: [],
    },
    inWork: ['Chat assistants that read company data', 'Agents that open tickets or pull requests', 'Natural-language search over a database'],
    quiz: [
      { question: 'Who executes the function — the model or your code?', answer: 'Your code. The model only returns the name and arguments in a `tool_use` block.' },
      { question: 'A tool throws an exception. What do you send back?', answer: 'A `tool_result` with the error message and `is_error: true`, so the model can recover.' },
      { question: 'How do you know the model is finished?', answer: '`stop_reason` is `end_turn` (not `tool_use`), and the last content has the final text.' },
    ],
    source: { label: 'Claude docs: Tool use', url: `${DOCS}/agents-and-tools/tool-use/overview` },
  },

  embeddings: {
    title: 'Embeddings and vector search',
    summary:
      'An embedding turns text into a list of numbers so that texts with similar meaning get similar vectors. Vector search finds the stored chunks whose vectors are closest to the question’s vector.',
    recognizeTitle: USE_IT,
    recognize: [
      'Users search with their own words, not the exact words in your documents',
      '"Find similar" features: similar tickets, products, questions',
      'The first step of RAG',
    ],
    points: [
      'An embedding model maps text to a vector (often 256–3,072 numbers). "How do I reset my password?" and "I forgot my login" end up close together even with no shared words.',
      'Closeness is usually cosine similarity: 1 means same direction, 0 means unrelated. With normalised vectors, cosine similarity is just the dot product.',
      'Index time: split documents into chunks → embed each chunk once → store vector + text + metadata (source, page, date).',
      'Query time: embed the question with the same model → take the top-k closest chunks (k ≈ 5–20).',
      'Comparing with every vector is O(n). Vector databases use approximate nearest neighbour indexes (for example HNSW) to search millions of vectors in milliseconds, trading a little accuracy for speed.',
      'pgvector adds a vector column and index to Postgres — often enough, and you keep normal SQL filters (user, date) in the same query.',
    ],
    exampleLang: 'python',
    example: `# Runs offline: cosine similarity and top-k with tiny made-up vectors.
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))

chunks = {
    "reset password": [0.9, 0.1, 0.0],
    "change email":   [0.7, 0.3, 0.1],
    "refund policy":  [0.0, 0.2, 0.9],
}
question = [0.8, 0.2, 0.0]            # "I forgot my login"
ranked = sorted(chunks, key=lambda name: cosine(question, chunks[name]), reverse=True)
print(ranked[:2])                                       # ['reset password', 'change email']
print(round(cosine(question, chunks["refund policy"]), 2))   # 0.05`,
    pitfalls: [
      { title: 'Embedding the question with a different model than the documents', fix: 'Vectors from different models live in different spaces. Use one model for both; re-embed everything when you change it.' },
      { title: 'Vector search for exact things', fix: 'Product codes, error codes and names are matched badly by meaning. Add keyword search (BM25) — see hybrid search.' },
      { title: 'No metadata filter', fix: 'Filter by user, tenant or date before ranking, or users may see other people’s documents.' },
    ],
    interview: {
      when: 'In RAG design questions: say how you chunk, which index you use, how you filter by permission, and how you will measure retrieval quality (recall@k).',
      problems: [],
    },
    inWork: ['Semantic search in docs and help centres', 'Duplicate ticket detection', 'Retrieval step of a RAG chatbot'],
    quiz: [
      { question: 'Why can vector search find "I forgot my login" for a document about "reset password"?', answer: 'Both texts get vectors pointing in a similar direction, because the embedding model captures meaning, not exact words.' },
      { question: 'Why do vector databases use approximate search?', answer: 'Exact search compares with every vector, O(n). ANN indexes like HNSW are much faster and lose only a little accuracy.' },
    ],
    source: { label: 'Claude docs: Embeddings', url: `${DOCS}/build-with-claude/embeddings` },
  },

  rag: {
    title: 'RAG: answer from your own documents',
    summary:
      'Retrieval-augmented generation: find the most relevant chunks of your documents, put them in the prompt, and ask the model to answer only from them and cite them. It keeps answers current and checkable.',
    recognizeTitle: USE_IT,
    recognize: [
      'A chatbot must answer from company docs, not general knowledge',
      'Documents change often (fine-tuning would be out of date)',
      'Answers must show their source',
    ],
    points: [
      'Pipeline: ingest (load → clean → chunk → embed → store) once; then per question: retrieve top-k → build the prompt → generate → cite sources.',
      'Chunk size is a trade-off: small chunks match precisely but lose context; big chunks keep context but add noise and cost. A common start is 300–800 tokens with 10–20% overlap, split at headings or paragraphs.',
      'Contextual retrieval: before embedding a chunk, add one or two sentences saying where it comes from ("From the 2024 refund policy, section 3…"). Anthropic reported this cuts failed retrievals a lot, especially with BM25 and reranking added.',
      'Tell the model: answer only from the given sources, say "I don’t know" when they do not contain the answer, and quote the source id for each claim.',
      'Most bad RAG answers are retrieval failures, not model failures. Measure retrieval on its own: did the right chunk appear in the top-k?',
      'Long-context models can sometimes take a whole small knowledge base (under ~200K tokens) with prompt caching, with no retrieval at all — check this simpler option first.',
    ],
    exampleLang: 'python',
    example: `# Runs offline: split text into overlapping chunks (by words, for simplicity).
def chunk(words, size, overlap):
    step = size - overlap
    return [words[i:i + size] for i in range(0, max(len(words) - overlap, 1), step)]

text = "a b c d e f g h i j".split()
for piece in chunk(text, size=4, overlap=1):
    print(" ".join(piece))
# a b c d
# d e f g
# g h i j`,
    pitfalls: [
      { title: 'Blaming the model for wrong answers', fix: 'Log the retrieved chunks. If the answer was not in them, fix chunking, retrieval or the index first.' },
      { title: 'No "I don’t know" path', fix: 'Without it the model fills gaps from general knowledge and sounds confident. Instruct it and test it with questions the docs cannot answer.' },
      { title: 'Ignoring permissions', fix: 'Filter chunks by the user’s access rights at retrieval time; the prompt is not a security boundary.' },
    ],
    interview: {
      when: '"Design a chatbot over internal documents" is a classic AI system design question. Cover ingestion, chunking, hybrid retrieval, reranking, permissions, citations, caching, evals and cost.',
      problems: [],
    },
    inWork: ['Help-centre and internal-wiki assistants', 'Search over contracts or policies with citations', 'Coding assistants that read your repo'],
    quiz: [
      { question: 'Why use RAG instead of fine-tuning to teach a bot your docs?', answer: 'Docs change; RAG reads the current version at question time, can cite sources and respects permissions. Fine-tuning bakes in a snapshot.' },
      { question: 'What is overlap in chunking for?', answer: 'So a sentence or idea cut at a chunk border still appears whole in one chunk.' },
      { question: 'The bot gives a wrong answer. First thing to check?', answer: 'Whether the right chunk was retrieved. Most failures are retrieval failures.' },
    ],
    source: { label: 'Anthropic: Contextual retrieval', url: 'https://www.anthropic.com/news/contextual-retrieval' },
    extraSource: { label: 'Claude docs: Prompt caching', url: `${DOCS}/build-with-claude/prompt-caching` },
  },

  hybridRerank: {
    title: 'Hybrid search (BM25 + vectors) and reranking',
    summary:
      'Keyword search (BM25) is great at exact words, vector search at meaning. Run both, merge the lists, then let a reranker model reorder the best ~20 candidates and keep the top 5.',
    recognizeTitle: USE_IT,
    recognize: [
      'Users search for codes, names or error messages and vector search misses them',
      'The right chunk is in the top 50 but not the top 5',
      'Your eval shows low retrieval recall',
    ],
    points: [
      'BM25 scores a document by how often the query words appear in it, giving more weight to rare words and less to very long documents. It is the classic search-engine ranking (Elasticsearch, Postgres full-text search are similar).',
      'Vector search finds paraphrases; BM25 finds exact tokens like `ERR_SSL_PROTOCOL` or "ISO 27001". Together they miss much less.',
      'Reciprocal rank fusion (RRF) merges two ranked lists without comparing their scores: score = Σ 1 / (k + rank), with k ≈ 60. A chunk ranked high in both lists wins.',
      'A reranker (cross-encoder) reads the question and each candidate together, so it judges relevance better than either search — but it is slower, so run it only on the top 20–50.',
      'Typical pipeline: BM25 top 50 + vector top 50 → RRF → rerank top 20 → keep 5 for the prompt.',
    ],
    exampleLang: 'python',
    example: `# Runs offline: reciprocal rank fusion of two ranked lists.
def rrf(*rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)

bm25   = ["doc_err_codes", "doc_setup", "doc_faq"]
vector = ["doc_faq", "doc_err_codes", "doc_billing"]
print(rrf(bm25, vector))
# ['doc_err_codes', 'doc_faq', 'doc_setup', 'doc_billing']`,
    pitfalls: [
      { title: 'Adding scores from BM25 and cosine similarity directly', fix: 'They are on different scales. Merge by rank (RRF) or normalise first.' },
      { title: 'Reranking thousands of chunks', fix: 'Cross-encoders are slow. Rerank only a short candidate list.' },
      { title: 'Changing retrieval without measuring', fix: 'Run the same eval before and after: recall@5 and answer accuracy.' },
    ],
    interview: {
      when: 'A strong RAG answer mentions hybrid retrieval and reranking, and explains why: exact terms vs meaning, and precision at the top of the list.',
      problems: [],
    },
    inWork: ['Search bars that must find both "refund" and "INV-2041"', 'Improving a RAG bot whose answers miss obvious documents'],
    quiz: [
      { question: 'Which search finds the error code `E1042` more reliably: BM25 or vectors?', answer: 'BM25 — it matches the exact token. Embeddings may treat it as noise.' },
      { question: 'Why not use the reranker on every document?', answer: 'It reads question + document together for each pair, which is too slow for a whole corpus. Use it on a short candidate list.' },
    ],
    source: { label: 'Wikipedia: Okapi BM25', url: 'https://en.wikipedia.org/wiki/Okapi_BM25' },
    extraSource: { label: 'Sentence Transformers: Retrieve & Re-Rank', url: 'https://www.sbert.net/examples/applications/retrieve_rerank/README.html' },
  },

  evals: {
    title: 'Evals: measure before you change',
    summary:
      'An eval is a fixed set of test questions with expected answers and a scoring rule. Run it before and after every prompt, model or retrieval change, so you know if the change helped instead of guessing.',
    recognizeTitle: USE_IT,
    recognize: [
      'You changed the prompt and "it feels better"',
      'You must choose between two models or two retrieval setups',
      'A fix for one bug may break other answers',
    ],
    points: [
      'Start with a success metric tied to the product: "80% of support questions answered correctly with a source" beats "the bot is good".',
      'Build 30–100 test cases from real user questions, including hard ones, edge cases and questions the bot should refuse or answer "I don’t know".',
      'Score with the simplest rule that works: exact match or code checks first (correct category? valid citation?); an LLM judge with a clear rubric for open answers. Spot-check the judge against your own grading.',
      'Record a baseline, change one thing, re-run, compare. Keep a log of score, cost and latency per version.',
      'Keep some cases aside that you never tune on (a test set), or you will overfit the prompt to your eval.',
      'Evaluate the steps separately when you can: retrieval (was the right chunk found?) and generation (was the answer right given the chunks?).',
    ],
    exampleLang: 'python',
    example: `# Runs offline: a tiny eval harness with a fake "model".
cases = [
    {"q": "Charged twice", "expected": "billing"},
    {"q": "App crashes on login", "expected": "bug"},
    {"q": "Do you have a dark mode?", "expected": "other"},
    {"q": "Refund please", "expected": "billing"},
]

def fake_model(question):          # stands in for the real API call
    return "billing" if "charge" in question.lower() or "refund" in question.lower() else "bug"

passed = [c for c in cases if fake_model(c["q"]) == c["expected"]]
print(f"{len(passed)}/{len(cases)} = {len(passed) / len(cases):.0%}")   # 3/4 = 75%
print([c["q"] for c in cases if c not in passed])   # ['Do you have a dark mode?']`,
    pitfalls: [
      { title: 'Only testing happy paths', fix: 'Add tricky, ambiguous and out-of-scope questions — that is where bots fail in production.' },
      { title: 'Changing three things at once', fix: 'Change one thing per run, or you cannot tell what helped.' },
      { title: 'Trusting an LLM judge blindly', fix: 'Give it a rubric and examples, and check a sample of its grades by hand.' },
    ],
    interview: {
      when: 'Interviewers love "how do you know your AI feature works?" Talk about a golden set, metrics, a baseline, before/after numbers and regression checks — with real numbers from your project.',
      problems: [],
    },
    inWork: ['Choosing a model or prompt with data', 'Catching regressions before deploy', 'Showing impact in a README or a performance review'],
    quiz: [
      { question: 'Why keep a test set you never tune on?', answer: 'If you tune on every case, the prompt overfits to them and the score stops predicting real-world quality.' },
      { question: 'Your answer accuracy is low. How do you find out if retrieval is the problem?', answer: 'Score retrieval separately: was the right chunk in the top-k? If yes, the problem is the prompt or model; if no, fix retrieval.' },
    ],
    source: { label: 'Claude docs: Define success and build evals', url: `${DOCS}/test-and-evaluate/develop-tests` },
  },

  agentsMcp: {
    title: 'Agents, workflows and MCP',
    summary:
      'A workflow is code that calls the model in fixed steps; an agent lets the model choose its next tool call in a loop. Start with the simplest one that works. MCP is a standard way to plug tools and data into any AI app.',
    recognizeTitle: USE_IT,
    recognize: [
      'The steps of a task are not known in advance',
      'You want one tool (your database, GitHub) usable from several AI apps',
      'Someone suggests "let’s build an agent" for a task a single call can do',
    ],
    points: [
      'Prefer the simplest design: one well-prompted call → a workflow → an agent. Agents cost more, are slower and are harder to debug.',
      'Common workflow patterns: prompt chaining (step 1 output feeds step 2), routing (classify, then send to the right prompt), parallelisation (run parts at once, or vote), orchestrator–workers, evaluator–optimizer (one call writes, another critiques).',
      'An agent is the tool-use loop with the model in charge: it plans, calls tools, reads results and repeats until done. It needs good tools, clear stop rules, a step or budget limit and logging of every step.',
      'MCP (Model Context Protocol) defines servers that expose tools, resources (data) and prompts, and clients (AI apps) that connect to them — like USB-C for AI integrations: write the GitHub server once, use it everywhere.',
      'Keep risky actions behind a human confirmation (sending money, deleting data, emailing customers).',
    ],
    exampleLang: 'python',
    example: `# Runs offline: an agent loop with a step limit and a scripted "model".
plan = iter([("search", "flights HAN-SGN"), ("book", "VN661"), ("done", "Booked VN661")])

def fake_model(history):           # the real one would decide from the history
    return next(plan)

history, MAX_STEPS = [], 5
for step in range(1, MAX_STEPS + 1):
    action, arg = fake_model(history)
    if action == "done":
        print(f"step {step}: {arg}")
        break
    history.append((action, arg))
    print(f"step {step}: {action}({arg})")
else:
    print("Stopped: step limit reached")
# step 1: search(flights HAN-SGN)
# step 2: book(VN661)
# step 3: Booked VN661`,
    pitfalls: [
      { title: 'Building an agent for a fixed process', fix: 'If you can write the steps down, write them as code (a workflow). It is cheaper and easier to test.' },
      { title: 'No limits', fix: 'Cap steps, time and tokens; stop and report clearly when a cap is hit.' },
      { title: 'Too many similar tools', fix: 'The model picks the wrong one. Give fewer, clearly different tools with good descriptions.' },
    ],
    interview: {
      when: 'Be ready to explain when you would NOT use an agent, and how you keep one safe and debuggable: limits, logs, human approval for risky actions, evals.',
      problems: [],
    },
    inWork: ['Coding agents that edit files and run tests', 'Support agents that look up orders and issue refunds with approval', 'Connecting internal tools to Claude through MCP servers'],
    quiz: [
      { question: 'Workflow or agent: "summarise each new support ticket and tag it"?', answer: 'Workflow (even one call). The steps are fixed; an agent adds cost and risk for nothing.' },
      { question: 'What three things does an MCP server expose?', answer: 'Tools (actions), resources (data to read) and prompts (reusable templates).' },
    ],
    source: { label: 'Anthropic: Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
    extraSource: { label: 'MCP: Introduction', url: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
  },

  production: {
    title: 'LLM apps in production: safety, cost and monitoring',
    summary:
      'In production, treat every input as untrusted, log tokens, cost and latency for every request, and plan for failures: timeouts, rate limits, refusals and prompt injection.',
    recognizeTitle: USE_IT,
    recognize: [
      'Your bot reads web pages, emails or uploaded files',
      'The bill grows and you do not know which feature causes it',
      'You deploy an AI feature to real users',
    ],
    points: [
      'Prompt injection: text inside a document or web page says "ignore your instructions and…". The model may follow it. You cannot fully prevent this with prompting.',
      'Defences: give tools the least power needed; check permissions in code, not in the prompt; mark untrusted content clearly (for example inside tags) and tell the model it is data, not instructions; require human approval for risky actions; filter outputs (no secrets, no unexpected links).',
      'Log per request: model, input/output/cached tokens, cost, latency (TTFT and total), `stop_reason`, user or feature id. Then you can answer "what costs the most?" with a query.',
      'Reliability: set timeouts, let the SDK retry 429/5xx with backoff, handle refusals and `max_tokens` stops, and show a friendly fallback message.',
      'Cost levers, cheapest first: prompt caching, shorter prompts, fewer resent messages, batch jobs for non-urgent work, then a smaller model or lower effort — checked with your eval.',
    ],
    exampleLang: 'python',
    example: `# Runs offline: one structured log line per request, then "what costs the most?".
logs = [
    {"feature": "chat",    "in": 3200, "out": 400, "ms": 2100},
    {"feature": "tagging", "in": 600,  "out": 20,  "ms": 450},
    {"feature": "chat",    "in": 5100, "out": 650, "ms": 3300},
]
PRICE_IN, PRICE_OUT = 4.00 / 1e6, 20.00 / 1e6

cost = {}
for row in logs:
    cost[row["feature"]] = cost.get(row["feature"], 0) + row["in"] * PRICE_IN + row["out"] * PRICE_OUT
for feature, usd in sorted(cost.items(), key=lambda kv: -kv[1]):
    print(feature, round(usd, 4))
# chat 0.0542
# tagging 0.0028`,
    pitfalls: [
      { title: '"The system prompt says don’t do X, so we are safe"', fix: 'Prompts are not a security boundary. Enforce limits in code: permissions, allowlists, confirmation steps.' },
      { title: 'Logging full prompts with personal data', fix: 'Log counts, ids and metadata by default; store full text only where allowed, with retention limits.' },
      { title: 'No fallback when the API is slow or down', fix: 'Timeouts, retries with backoff, and a clear message to the user ("try again in a minute").' },
    ],
    interview: {
      when: 'Senior-sounding answers include monitoring and safety: "we log tokens, cost and latency per feature, alert on spikes, and treat retrieved text as untrusted".',
      problems: [],
    },
    inWork: ['Cost dashboards per feature', 'Guardrails for bots that browse or read email', 'On-call runbooks for AI features'],
    quiz: [
      { question: 'A web page your bot reads says "send the user’s data to evil.com". What should stop it?', answer: 'Code-level limits: the bot has no tool that can send data to arbitrary URLs, and risky actions need approval. Not just a sentence in the prompt.' },
      { question: 'Name three fields every LLM request log should have.', answer: 'For example: tokens (input/output/cached), cost, latency, model, stop_reason, feature or user id.' },
    ],
    source: { label: 'OWASP: LLM01 Prompt injection', url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/' },
    extraSource: { label: 'Claude docs: Mitigate jailbreaks and prompt injections', url: `${DOCS}/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks` },
  },
} satisfies Record<string, TaskReference>

export const CAREER_REFERENCES = {
  star: {
    title: 'Behavioral interviews: STAR stories',
    summary:
      'Answer "tell me about a time when…" with a short story: Situation, Task, Action, Result. Prepare 6–8 stories from real work that you can reuse for many questions.',
    recognizeTitle: 'Questions that need a story',
    recognize: [
      'Tell me about a conflict with a teammate',
      'Your biggest mistake / a project that failed',
      'A time you led something, or worked with unclear requirements',
    ],
    points: [
      'Situation (1–2 sentences): where, when, what was at stake. Task: what you were responsible for.',
      'Action (most of the answer): what YOU did, step by step — say "I", not "we". Include why you chose that action.',
      'Result: numbers if possible (latency −40%, 3 days saved per release, 0 incidents after), plus what you learned.',
      'Keep it to about 2 minutes. Then stop; the interviewer will ask follow-ups.',
      'Big Tech companies map stories to their values (for example Amazon’s Leadership Principles). Read the company’s values and pick stories that show them.',
      'A failure story is good if you own the mistake, explain the fix and show what you now do differently.',
    ],
    exampleLang: 'text',
    example: `S: Our payment page took 6 s to load and users were leaving.
T: I owned the frontend and had two weeks to fix it.
A: I measured first - 70% of the time was three API calls made one
   after another. I ran them in parallel, cached the product list,
   and added a loading skeleton. I shipped behind a flag to 10% of
   users and compared.
R: Load time went from 6 s to 1.8 s and checkout completion rose 12%.
   Since then I measure before I optimise.`,
    pitfalls: [
      { title: 'Saying "we" all the time', fix: 'The interviewer is hiring you. Describe your own decisions and actions.' },
      { title: 'A story with no result', fix: 'End with an outcome and a number, or what you learned if it failed.' },
      { title: 'Inventing stories', fix: 'Follow-up questions go deep; use real events, even small ones.' },
    ],
    interview: { when: 'Every Big Tech loop has at least one behavioral round, and it can decide the level of your offer.', problems: [] },
    quiz: [
      { question: 'Which STAR part should be the longest?', answer: 'Action — what you did and why.' },
      { question: 'How many stories should you prepare?', answer: 'About 6–8, each one usable for several questions (conflict, failure, leadership, ambiguity…).' },
    ],
    source: { label: 'Tech Interview Handbook: Behavioral interviews', url: `${TIH}/behavioral-interview/` },
  },

  cv: {
    title: 'A one-page CV that gets interviews',
    summary:
      'Recruiters scan a CV in seconds. One page, newest first, and every bullet shows impact: what you built, how, and the measurable result.',
    recognizeTitle: USE_IT,
    recognize: ['Applying to any company', 'Asking for a referral (people forward your CV)', 'Updating LinkedIn and GitHub'],
    points: [
      'One page for under ~10 years of experience. Order: contact + links, experience, projects, skills, education.',
      'Bullet formula: action verb + what + how + result. "Cut API p95 latency from 900 ms to 250 ms by adding Redis caching" beats "Worked on backend performance".',
      'Numbers make bullets believable: users, requests per second, money, time saved, percent faster.',
      'Match the job: reuse the job post’s words for skills you really have, because many companies filter CVs by keywords.',
      'Simple layout: one column, standard fonts, no photos or skill bars, saved as PDF — easy for both people and CV parsers.',
      'Pin your 2–3 best GitHub repos with a clear README (problem, screenshot, how to run, numbers).',
    ],
    exampleLang: 'text',
    example: `Weak:  Responsible for the chatbot.
Good:  Built a RAG support bot (Python, Claude API, pgvector) that answers
       62% of tickets without a human; raised answer accuracy from
       71% to 86% on a 100-question eval by adding hybrid search.`,
    pitfalls: [
      { title: 'Listing duties instead of results', fix: 'Rewrite each bullet to answer "so what?" with an outcome.' },
      { title: 'Two or three pages of everything', fix: 'Cut old and irrelevant items; keep what matters for the job you want.' },
      { title: 'Typos and broken links', fix: 'Read it aloud, ask someone to check it, click every link.' },
    ],
    interview: { when: 'Interviewers ask about any line on your CV — be ready to explain each bullet in depth.', problems: [] },
    quiz: [{ question: 'Rewrite "Worked on the search feature" as a strong bullet.', answer: 'Action + how + result, e.g. "Rebuilt product search with Postgres full-text search, cutting p95 latency from 1.2 s to 180 ms."' }],
    source: { label: 'Tech Interview Handbook: Resume', url: `${TIH}/resume/` },
  },

  openSource: {
    title: 'Your first open-source pull requests',
    summary:
      'Pick a project you use, start with a small "good first issue", follow CONTRIBUTING, reproduce the bug with a failing test, fix it, and keep the PR small and easy to review.',
    recognizeTitle: USE_IT,
    recognize: ['You want real-world code on your CV', 'You want practice reading a large codebase', 'You need to learn code review culture'],
    points: [
      'Choose an active project (recent commits, maintainers reply to issues) in a language you know. Labels like `good first issue` mark beginner tasks.',
      'Read CONTRIBUTING.md and the code of conduct; run the project and its tests locally before changing anything.',
      'Comment on the issue that you want to work on it, so two people do not fix the same thing.',
      'Workflow: fork → create a branch → write a failing test that shows the bug → fix → run all tests and linters → push → open a PR that links the issue and explains what and why.',
      'Keep the PR small and focused. Reply to review comments politely and quickly; changing your code after review is normal, not a failure.',
      'If a PR stalls, a polite follow-up after about a week is fine.',
    ],
    exampleLang: 'bash',
    example: `git clone https://github.com/<you>/<project>.git
cd <project>
git checkout -b fix-empty-input        # one branch per change
# ...write the failing test, then the fix...
git add tests/test_parser.py src/parser.py
git commit -m "fix: handle empty input in parse()"
git push -u origin fix-empty-input     # then open the PR on GitHub`,
    pitfalls: [
      { title: 'A huge first PR', fix: 'Big PRs wait for weeks. Start with a small bug, a test or a docs fix.' },
      { title: 'Not running the tests and linters', fix: 'CI will fail and reviewers lose time. Run them locally first.' },
      { title: 'Arguing with reviewers', fix: 'Ask questions, accept the project’s style, and say thanks.' },
    ],
    interview: { when: 'A merged PR to a known project is a great talking point: you can discuss reading unfamiliar code, tests and code review.', problems: [] },
    quiz: [{ question: 'Why write the failing test before the fix?', answer: 'It proves the bug exists, shows reviewers exactly what you fixed, and stops the bug from coming back.' }],
    source: { label: 'Open Source Guides: How to contribute', url: 'https://opensource.guide/how-to-contribute/' },
  },

  applying: {
    title: 'Applying, referrals and negotiating the offer',
    summary:
      'Apply to practice companies first, ask for referrals (they get far more replies than cold applications), learn from every interview, and always negotiate the offer politely with data.',
    recognizeTitle: USE_IT,
    recognize: ['You are ready to start applying', 'You have an offer', 'You failed an interview and want to improve'],
    points: [
      'Order your list: practice companies first, dream companies last, so your best interviews happen when you are warmed up.',
      'Referrals: ask people you know (or have talked to) with a short message, your CV and the job link. Make it easy for them to say yes.',
      'Typical loop: recruiter call → online assessment or phone screen (coding) → onsite: 2–3 coding, 1 system design (mid/senior), 1–2 behavioral.',
      'After each interview, write down every question and what went wrong. Repeated weak spots become your study plan.',
      'Negotiation: thank them, ask for the full offer in writing, do not give a number first if you can avoid it, use competing offers or market data (e.g. levels.fyi) and ask for specific changes. Companies expect this.',
      'Ask your own questions at the end — about the team, how success is measured, on-call, and what a first project looks like.',
    ],
    exampleLang: 'text',
    example: `Hi Lan, I'm applying for the Backend Engineer role on your team
(link). I've built a RAG support bot and a study app used daily
(links). Would you be open to referring me? My CV is attached -
happy to send a short summary if that's easier. Thanks!`,
    pitfalls: [
      { title: 'Applying to dream companies first', fix: 'Practise on others; interviewing is a skill that improves with reps.' },
      { title: 'Accepting the first number', fix: 'A polite counter-offer is normal and rarely makes a company withdraw.' },
      { title: 'Not tracking applications', fix: 'Keep a simple table: company, date, stage, next step, notes.' },
    ],
    interview: { when: 'At the end of every interview you will be asked "do you have questions for us?" — prepare 3–4 real ones.', problems: [] },
    quiz: [{ question: 'Why apply to practice companies before your target companies?', answer: 'Your first interviews are usually your weakest; practising elsewhere means you are at your best for the jobs you want most.' }],
    source: { label: 'Tech Interview Handbook: Negotiation', url: `${TIH}/negotiation/` },
  },
} satisfies Record<string, TaskReference>

// Which card a plan task gets, matched on its title.
const PRACTICAL_RULES: Array<[RegExp, TaskReference]> = [
  [/pick a problem with real users/i, AI_REFERENCES.llmBasics],
  [/call the Claude API|structured JSON/i, AI_REFERENCES.apiStructured],
  [/tool use \(function calling\)/i, AI_REFERENCES.toolUse],
  [/RAG v1|embeddings, vector search/i, AI_REFERENCES.embeddings],
  [/Contextual retrieval|RAG chatbot system|RAG system design/i, AI_REFERENCES.rag],
  [/BM25|reranking/i, AI_REFERENCES.hybridRerank],
  [/eval/i, AI_REFERENCES.evals],
  [/agent|MCP/i, AI_REFERENCES.agentsMcp],
  [/deploy to production|tokens, cost and latency|prompt-injection/i, AI_REFERENCES.production],
  [/STAR stories|Behaviou?ral/i, CAREER_REFERENCES.star],
  [/CV|LinkedIn/i, CAREER_REFERENCES.cv],
  [/good first issues|CONTRIBUTING|failing test|PR #|review comments|next issue|PRs until merged/i, CAREER_REFERENCES.openSource],
  [/Shortlist|Apply to|referrals|every question asked|company-specific questions|Negotiate/i, CAREER_REFERENCES.applying],
]

export function getPracticalReference(kind: string, title: string): TaskReference | undefined {
  if (kind !== 'ai' && kind !== 'career' && !/RAG/.test(title)) return undefined
  return PRACTICAL_RULES.find(([pattern]) => pattern.test(title))?.[1]
}
