import { useEffect, useId, useState } from 'react'
import { useTheme } from 'next-themes'

interface MermaidDiagramProps {
  source: string
  caption?: string
}

// Mermaid is large, so it is only downloaded when a diagram is on screen.
export function MermaidDiagram({ source, caption }: MermaidDiagramProps) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'light' ? 'neutral' : 'dark',
          fontFamily: 'Inter, system-ui, sans-serif',
          securityLevel: 'strict',
        })
        const { svg: out } = await mermaid.render(id, source)
        if (!isCancelled) setSvg(out)
      } catch (err) {
        if (!isCancelled) setError(err instanceof Error ? err.message : 'Could not draw the diagram.')
      }
    }
    void render()
    return () => {
      isCancelled = true
    }
  }, [id, source, resolvedTheme])

  return (
    <figure className="rounded-2xl border border-border bg-card/40 p-4">
      {error ? (
        <pre className="whitespace-pre-wrap text-xs text-hard">{error}</pre>
      ) : svg ? (
        <div className="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-40 animate-pulse rounded-xl bg-foreground/[0.04]" />
      )}
      {caption && <figcaption className="mt-3 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}
