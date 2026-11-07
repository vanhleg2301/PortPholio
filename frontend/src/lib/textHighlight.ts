// Find text on the page and mark it with the CSS Custom Highlight API (no DOM changes, so
// React-rendered content is never touched). Used by "Find in lesson" and the Library search.

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
