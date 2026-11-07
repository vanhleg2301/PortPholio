// Find text on the page and mark it with the CSS Custom Highlight API (no DOM changes, so
// React-rendered content is never touched). Used by "Find in lesson", the Library and the
// jump to a search result.

interface HighlightRegistry {
  set: (name: string, value: unknown) => void
  delete: (name: string) => void
}
type HighlightCtor = new (...ranges: Range[]) => unknown

export function getHighlightApi(): { registry: HighlightRegistry; Highlight: HighlightCtor } | null {
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
  const Highlight = (window as unknown as { Highlight?: HighlightCtor }).Highlight
  return registry && Highlight ? { registry, Highlight } : null
}

function isVisible(node: Text): boolean {
  const parent = node.parentElement
  if (!parent || parent.closest('[data-find-skip]')) return false
  return parent.getClientRects().length > 0
}

// Every match of `query` in the visible text under `root`, as DOM ranges. Text is joined across
// nodes first, so a phrase split by a glossary word or code span is still found.
// `isWordStart`: only matches at the start of a word ("rag" in "RAG", not in "storage").
export function findRanges(root: HTMLElement, query: string, isWordStart = false): Range[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < 2) return []
  const nodes: { node: Text; start: number }[] = []
  let text = ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text
    if (!node.data || !isVisible(node)) continue
    nodes.push({ node, start: text.length })
    text += node.data
  }
  const haystack = text.toLowerCase()
  const locate = (offset: number, isEnd: boolean) => {
    let i = nodes.length - 1
    while (i > 0 && (isEnd ? nodes[i].start >= offset : nodes[i].start > offset)) i--
    return { node: nodes[i].node, offset: offset - nodes[i].start }
  }
  const ranges: Range[] = []
  for (let at = haystack.indexOf(needle); at !== -1 && ranges.length < 500; at = haystack.indexOf(needle, at + needle.length)) {
    if (isWordStart && at > 0 && /[a-z0-9]/.test(haystack[at - 1])) continue
    const start = locate(at, false)
    const end = locate(at + needle.length, true)
    const range = document.createRange()
    range.setStart(start.node, start.offset)
    range.setEnd(end.node, end.offset)
    ranges.push(range)
  }
  return ranges
}

// Ranges for the whole query; if the words never appear together, for its longest word.
export function findBestRanges(root: HTMLElement, query: string): { ranges: Range[]; used: string } {
  const phrase = query.trim()
  const whole = findRanges(root, phrase, true)
  if (whole.length > 0) return { ranges: whole, used: phrase }
  const longest = phrase.split(/\s+/).sort((a, b) => b.length - a.length)[0] ?? ''
  return { ranges: longest && longest !== phrase ? findRanges(root, longest, true) : [], used: longest }
}

// True when `range` starts inside `element` or anywhere after it in the page.
export function isAtOrAfter(range: Range, element: Element): boolean {
  const node = range.startContainer
  return element.contains(node) || Boolean(element.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)
}

export function scrollToRange(range: Range, behavior: ScrollBehavior = 'smooth') {
  const rect = range.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return
  window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior })
}

const FLASH = 'search-current'

interface FlashOptions {
  // Prefer the first match inside or after this element.
  after?: () => Element | null
  onMiss?: () => void
}

// After opening a search result: wait for the content to appear, scroll to the first match and
// mark it for a few seconds. Returns a cancel function.
export function flashFirstMatch(getRoot: () => HTMLElement | null, query: string, { after, onMiss }: FlashOptions = {}): () => void {
  const timers: Array<ReturnType<typeof setTimeout>> = []
  const api = getHighlightApi()
  const attempt = (triesLeft: number) => {
    const root = getRoot()
    const { ranges } = root ? findBestRanges(root, query) : { ranges: [] }
    const anchor = after?.()
    const target = (anchor && ranges.find((r) => isAtOrAfter(r, anchor))) || ranges[0]
    if (!target) {
      if (triesLeft > 0) timers.push(setTimeout(() => attempt(triesLeft - 1), 250))
      else onMiss?.()
      return
    }
    scrollToRange(target)
    // Content may still be animating in; correct the position once it has settled.
    timers.push(setTimeout(() => scrollToRange(target), 650))
    api?.registry.set(FLASH, new api.Highlight(target))
    timers.push(setTimeout(() => api?.registry.delete(FLASH), 4000))
  }
  timers.push(setTimeout(() => attempt(8), 200))
  return () => {
    timers.forEach(clearTimeout)
    api?.registry.delete(FLASH)
  }
}
