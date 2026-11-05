import { useEffect } from 'react'

// Sets the tab title while a page is mounted and restores the previous one afterwards.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
