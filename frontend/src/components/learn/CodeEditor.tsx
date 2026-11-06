import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { EditorHandle } from '@/lib/codeEditor'

interface CodeEditorProps {
  // The document to show. Changes from outside (reset, restore) replace the editor text.
  value: string
  onChange: (value: string) => void
  onRun: () => void
  onSubmit?: () => void
  isFill?: boolean
  className?: string
}

// Python editor (CodeMirror 6): line numbers, highlighting, auto-indent, brackets, completion.
export function CodeEditor({ value, onChange, onRun, onSubmit, isFill = false, className }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorHandle | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // Latest callbacks, so the editor (created once) always calls the current ones.
  const callbacks = useRef({ onChange, onRun, onSubmit })
  callbacks.current = { onChange, onRun, onSubmit }
  const latestValue = useRef(value)
  latestValue.current = value

  useEffect(() => {
    let isCancelled = false
    void import('@/lib/codeEditor').then(({ createEditor }) => {
      if (isCancelled || !hostRef.current) return
      editorRef.current = createEditor(hostRef.current, {
        doc: latestValue.current,
        isFill,
        onChange: (doc) => callbacks.current.onChange(doc),
        onRun: () => callbacks.current.onRun(),
        onSubmit: () => callbacks.current.onSubmit?.(),
      })
      setIsLoaded(true)
    })
    return () => {
      isCancelled = true
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [isFill])

  useEffect(() => {
    editorRef.current?.setDoc(value)
  }, [value])

  return (
    <div className={cn('relative', isFill && 'h-full', className)}>
      {!isLoaded && (
        <pre className="min-h-[140px] whitespace-pre-wrap px-4 py-3 font-mono text-[13.5px] leading-relaxed text-[#abb2bf]">{value}</pre>
      )}
      <div ref={hostRef} className={cn(isFill && 'h-full', !isLoaded && 'hidden')} />
    </div>
  )
}
