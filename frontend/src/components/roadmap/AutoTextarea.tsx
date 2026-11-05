import { useLayoutEffect, useRef, type Ref, type TextareaHTMLAttributes } from 'react'

interface AutoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  minHeight?: number
  ref?: Ref<HTMLTextAreaElement>
}

// Textarea that grows with its content instead of scrolling inside itself.
export function AutoTextarea({ value, minHeight = 44, ref, ...props }: AutoTextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [value, minHeight])

  function setRefs(el: HTMLTextAreaElement | null) {
    innerRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  return <textarea ref={setRefs} value={value} rows={1} {...props} />
}
