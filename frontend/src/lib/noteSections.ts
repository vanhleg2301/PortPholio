// Turns a markdown note into fill-in sections ("## Heading" + body) and back,
// so notes can be edited as a simple form without typing markdown syntax.

export interface NoteSection {
  id: string
  heading: string
  body: string
  // Set when the whole body is one fenced code block; `body` then holds only the code.
  codeLang?: string
}

export interface NoteForm {
  intro: string
  sections: NoteSection[]
}

const HEADING = /^## (.*)$/
const CODE_BLOCK = /^```(\w*)\n([\s\S]*?)\n?```$/

function trimBlankLines(lines: string[]): string {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === '') start++
  while (end > start && lines[end - 1].trim() === '') end--
  return lines.slice(start, end).join('\n')
}

export function parseNote(markdown: string): NoteForm {
  const intro: string[] = []
  const sections: Array<{ heading: string; lines: string[] }> = []
  let isInFence = false

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) isInFence = !isInFence
    const match = !isInFence ? HEADING.exec(line) : null
    if (match) sections.push({ heading: match[1].trim(), lines: [] })
    else if (sections.length > 0) sections[sections.length - 1].lines.push(line)
    else intro.push(line)
  }

  return {
    intro: trimBlankLines(intro),
    sections: sections.map(({ heading, lines }) => {
      const body = trimBlankLines(lines)
      const code = CODE_BLOCK.exec(body)
      const id = crypto.randomUUID()
      return code ? { id, heading, body: code[2], codeLang: code[1] } : { id, heading, body }
    }),
  }
}

export function serializeNote({ intro, sections }: NoteForm): string {
  const parts = sections.map(({ heading, body, codeLang }) => {
    const content = codeLang !== undefined ? `\`\`\`${codeLang}\n${body}\n\`\`\`` : body
    return content ? `## ${heading}\n${content}` : `## ${heading}`
  })
  return [intro, ...parts].filter((p) => p !== '').join('\n\n') + '\n'
}

// Markdown merges single line breaks into one paragraph; notes typed in the form expect
// each line to stay on its own line, so turn them into hard breaks (outside code fences).
export function keepLineBreaks(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((chunk, i) => (i % 2 === 1 ? chunk : chunk.replace(/([^\n])\n(?=[^\n\s#>|`*+-]|\d+[^.\d])/g, '$1  \n')))
    .join('')
}
