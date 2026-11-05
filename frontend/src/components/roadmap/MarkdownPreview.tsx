import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { GlossTerm } from '@/components/learn/GlossTerm'
import { keepLineBreaks } from '@/lib/noteSections'

const GLOSS_PREFIX = '#gloss:'
const TERM_RE = /\[\[([A-Za-z][^\]|\n]*)(?:\|([^\]\n]+))?\]\]/g

// [[key]] / [[key|shown text]] → a link the `a` renderer turns into a GlossTerm. Code is left alone.
function linkGlossary(md: string): string {
  return md
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(TERM_RE, (_m, key: string, shown?: string) => `[${shown ?? key}](${GLOSS_PREFIX}${encodeURIComponent(key.trim().toLowerCase())})`)
    )
    .join('')
}

interface MarkdownPreviewProps {
  content: string
  withGlossary?: boolean
}

export function MarkdownPreview({ content, withGlossary = false }: MarkdownPreviewProps) {
  const text = keepLineBreaks(content)
  return (
    <div className="markdown text-[15px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node: _node, href, children, ...props }) =>
            href?.startsWith(GLOSS_PREFIX) ? (
              <GlossTerm termKey={decodeURIComponent(href.slice(GLOSS_PREFIX.length))}>{children}</GlossTerm>
            ) : (
              <a href={href} {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
        }}
      >
        {withGlossary ? linkGlossary(text) : text}
      </ReactMarkdown>
    </div>
  )
}
