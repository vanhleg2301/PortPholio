import { createLowlight } from 'lowlight'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import type { Element, ElementContent, Root, RootContent } from 'hast'

// Syntax highlighting for ```code``` blocks in lessons and notes, with only the languages this
// app uses. rehype-highlight always bundles ~37 grammars (52 KB gzipped); this keeps 6.
const lowlight = createLowlight({ bash, javascript, json, python, sql, typescript })
lowlight.registerAlias({ bash: ['sh', 'shell', 'zsh'], javascript: ['js', 'jsx'], python: ['py'], typescript: ['ts', 'tsx'] })

function textOf(node: Root | RootContent | ElementContent): string {
  if (node.type === 'text') return node.value
  if ('children' in node) return node.children.map(textOf).join('')
  return ''
}

function languageOf(code: Element): string | null {
  const classes = code.properties.className
  const list = Array.isArray(classes) ? classes : typeof classes === 'string' ? classes.split(' ') : []
  const match = list.map(String).find((c) => c.startsWith('language-'))
  return match ? match.slice('language-'.length) : null
}

function highlight(node: Root | Element) {
  for (const child of node.children) {
    if (child.type !== 'element') continue
    if (node.type === 'element' && node.tagName === 'pre' && child.tagName === 'code') {
      const language = languageOf(child)
      if (language && lowlight.registered(language)) {
        child.children = lowlight.highlight(language, textOf(child)).children as ElementContent[]
        const classes = child.properties.className
        child.properties.className = [...(Array.isArray(classes) ? classes : []), 'hljs']
      }
      continue
    }
    highlight(child)
  }
}

export default function rehypeHighlightLite() {
  return (tree: Root) => highlight(tree)
}
