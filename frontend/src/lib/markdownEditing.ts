// Pure text transforms for the markdown note editor. Each returns the range to replace,
// the text to insert and where the selection should land afterwards.

export interface TextEdit {
  from: number
  to: number
  insert: string
  selectFrom: number
  selectTo: number
}

export function wrapSelection(value: string, start: number, end: number, before: string, after: string, placeholder: string): TextEdit {
  const selected = value.slice(start, end)
  const isWrapped = value.slice(start - before.length, start) === before && value.slice(end, end + after.length) === after
  if (isWrapped) {
    return {
      from: start - before.length,
      to: end + after.length,
      insert: selected,
      selectFrom: start - before.length,
      selectTo: end - before.length,
    }
  }
  const text = selected || placeholder
  return {
    from: start,
    to: end,
    insert: `${before}${text}${after}`,
    selectFrom: start + before.length,
    selectTo: start + before.length + text.length,
  }
}

const LINE_PREFIX = /^(#{1,6} |[-*] \[[ xX]\] |[-*] |\d+\. |> )/

export function toggleLinePrefix(value: string, start: number, end: number, prefix: string): TextEdit {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const nextBreak = value.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  const lines = value.slice(lineStart, lineEnd).split('\n')
  const isNumbered = prefix === '1. '
  const matches = (line: string) => (isNumbered ? /^\d+\. /.test(line) : line.startsWith(prefix))
  const shouldRemove = lines.every(matches)

  const next = lines.map((line, i) => {
    const bare = line.replace(LINE_PREFIX, '')
    if (shouldRemove) return bare
    return `${isNumbered ? `${i + 1}. ` : prefix}${bare}`
  })
  const insert = next.join('\n')
  return { from: lineStart, to: lineEnd, insert, selectFrom: lineStart + insert.length, selectTo: lineStart + insert.length }
}

export function insertBlock(value: string, start: number, end: number, block: string, cursorOffset = block.length): TextEdit {
  const needsLeadingBreak = start > 0 && value[start - 1] !== '\n'
  const lead = needsLeadingBreak ? '\n\n' : start > 1 && value[start - 2] !== '\n' ? '\n' : ''
  const insert = `${lead}${block}`
  const cursor = start + lead.length + cursorOffset
  return { from: start, to: end, insert, selectFrom: cursor, selectTo: cursor }
}

const LIST_ITEM = /^(\s*)([-*] \[[ xX]\] |[-*] |(\d+)\. |> )(.*)$/

// Enter inside a list item: continue the list, or end it when the item is empty.
export function continueList(value: string, cursor: number): TextEdit | null {
  const lineStart = value.lastIndexOf('\n', cursor - 1) + 1
  const line = value.slice(lineStart, cursor)
  const match = LIST_ITEM.exec(line)
  if (!match) return null
  const [, indent, marker, number, rest] = match
  if (rest.trim() === '') {
    return { from: lineStart, to: cursor, insert: '', selectFrom: lineStart, selectTo: lineStart }
  }
  const nextMarker = number ? `${Number(number) + 1}. ` : marker.replace(/\[[xX]\]/, '[ ]')
  const insert = `\n${indent}${nextMarker}`
  return { from: cursor, to: cursor, insert, selectFrom: cursor + insert.length, selectTo: cursor + insert.length }
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0
}
