import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Bold,
  Check,
  Code,
  Download,
  Eye,
  FileCode2,
  Heading2,
  Heading3,
  Italic,
  LayoutTemplate,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
  SquareCode,
  Table,
  TextCursorInput,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AutoTextarea } from '@/components/roadmap/AutoTextarea'
import { MarkdownPreview } from '@/components/roadmap/MarkdownPreview'
import { NoteForm } from '@/components/roadmap/NoteForm'
import { TOPICS, TOPIC_ORDER, type NoteTopic } from '@/data/roadmap/topics'
import type { NoteDraft, RoadmapNote } from '@/hooks/useRoadmapNotes'
import { continueList, countWords, insertBlock, toggleLinePrefix, wrapSelection, type TextEdit } from '@/lib/markdownEditing'
import { parseNote, serializeNote, type NoteForm as NoteFormValue } from '@/lib/noteSections'

type EditStyle = 'form' | 'markdown'
type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error'

const AUTOSAVE_MS = 1500
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = IS_MAC ? '⌘' : 'Ctrl'

const SHORTCUTS: Record<string, [before: string, after: string, placeholder: string]> = {
  b: ['**', '**', 'bold'],
  i: ['_', '_', 'italic'],
  e: ['`', '`', 'code'],
  k: ['[', '](https://)', 'text'],
}

interface NoteEditorProps {
  note: RoadmapNote
  onSave: (draft: NoteDraft) => Promise<void>
  onDelete: () => void
  onClose: () => void
}

function isSameDraft(a: NoteDraft, b: NoteDraft) {
  return a.title === b.title && a.topic === b.topic && a.content === b.content
}

function toForm(content: string): NoteFormValue {
  const form = parseNote(content)
  if (form.intro === '' && form.sections.length === 0) {
    return { intro: '', sections: [{ id: crypto.randomUUID(), heading: 'Notes', body: '' }] }
  }
  return form
}

// Writes through the browser's editing pipeline so undo works and React's onChange fires.
function applyEdit(el: HTMLTextAreaElement, edit: TextEdit) {
  el.focus()
  el.setSelectionRange(edit.from, edit.to)
  const isApplied =
    edit.insert === ''
      ? edit.from === edit.to || document.execCommand('delete')
      : document.execCommand('insertText', false, edit.insert)
  if (!isApplied) {
    const next = el.value.slice(0, edit.from) + edit.insert + el.value.slice(edit.to)
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  requestAnimationFrame(() => el.setSelectionRange(edit.selectFrom, edit.selectTo))
}

export function NoteEditor({ note, onSave, onDelete, onClose }: NoteEditorProps) {
  const [draft, setDraft] = useState<NoteDraft>({ title: note.title, topic: note.topic, content: note.content })
  const [form, setForm] = useState<NoteFormValue>(() => toForm(note.content))
  const [editStyle, setEditStyle] = useState<EditStyle>('form')
  const [isMobilePreview, setIsMobilePreview] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [savedAt, setSavedAt] = useState(note.updated_at)
  const markdownRef = useRef<HTMLTextAreaElement>(null)
  const activeFieldRef = useRef<HTMLTextAreaElement | null>(null)
  const savedRef = useRef<NoteDraft>(draft)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const isDirty = !isSameDraft(draft, savedRef.current)

  const save = useCallback(async () => {
    const snapshot = draftRef.current
    if (isSameDraft(snapshot, savedRef.current)) return
    setStatus('saving')
    try {
      await onSaveRef.current(snapshot)
      savedRef.current = snapshot
      setSavedAt(new Date().toISOString())
      setStatus(isSameDraft(draftRef.current, snapshot) ? 'saved' : 'dirty')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!isDirty) return
    setStatus((s) => (s === 'saving' ? s : 'dirty'))
    const timer = setTimeout(() => void save(), AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [draft, isDirty, save])

  // Ctrl/Cmd+S anywhere while this note is open; flush unsaved text when it closes.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      void save()
    }
  }, [save])

  const setContent = (content: string) => setDraft((d) => ({ ...d, content }))

  function handleFormChange(next: NoteFormValue) {
    setForm(next)
    setContent(serializeNote(next))
  }

  function switchStyle(next: EditStyle) {
    if (next === editStyle) return
    if (next === 'form') setForm(toForm(draft.content))
    activeFieldRef.current = null
    setEditStyle(next)
  }

  function runOnSelection(build: (value: string, start: number, end: number) => TextEdit) {
    const el = activeFieldRef.current ?? (editStyle === 'markdown' ? markdownRef.current : null)
    if (!el) return
    setIsMobilePreview(false)
    applyEdit(el, build(el.value, el.selectionStart, el.selectionEnd))
  }

  const wrap = (before: string, after: string, placeholder: string) =>
    runOnSelection((v, s, e) => wrapSelection(v, s, e, before, after, placeholder))
  const prefix = (p: string) => runOnSelection((v, s, e) => toggleLinePrefix(v, s, e, p))
  const block = (text: string, cursorOffset?: number) => runOnSelection((v, s, e) => insertBlock(v, s, e, text, cursorOffset))

  const isForm = editStyle === 'form'
  const tools: Array<{ icon: LucideIcon; label: string; run: () => void } | 'divider'> = [
    ...(isForm ? [] : [{ icon: Heading2, label: 'Heading', run: () => prefix('## ') }]),
    { icon: Heading3, label: 'Subheading', run: () => prefix('### ') },
    'divider',
    { icon: Bold, label: `Bold (${MOD}+B)`, run: () => wrap('**', '**', 'bold') },
    { icon: Italic, label: `Italic (${MOD}+I)`, run: () => wrap('_', '_', 'italic') },
    { icon: Code, label: `Inline code (${MOD}+E)`, run: () => wrap('`', '`', 'code') },
    { icon: Link, label: `Link (${MOD}+K)`, run: () => wrap('[', '](https://)', 'text') },
    'divider',
    { icon: List, label: 'Bullet list', run: () => prefix('- ') },
    { icon: ListOrdered, label: 'Numbered list', run: () => prefix('1. ') },
    { icon: ListChecks, label: 'Checklist', run: () => prefix('- [ ] ') },
    { icon: Quote, label: 'Quote', run: () => prefix('> ') },
    'divider',
    ...(isForm ? [] : [{ icon: SquareCode, label: 'Code block', run: () => block('```python\n\n```\n', 10) }]),
    { icon: Table, label: 'Table', run: () => block('| Column | Column |\n| --- | --- |\n|  |  |\n', 2) },
    { icon: Minus, label: 'Divider', run: () => block('---\n') },
    ...(isForm
      ? []
      : [{ icon: LayoutTemplate, label: `Insert ${TOPICS[draft.topic].label} template`, run: () => block(TOPICS[draft.topic].template) }]),
  ]

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    const shortcut = e.metaKey || e.ctrlKey ? SHORTCUTS[e.key.toLowerCase()] : undefined
    if (shortcut) {
      e.preventDefault()
      const [before, after, placeholder] = shortcut
      applyEdit(el, wrapSelection(el.value, el.selectionStart, el.selectionEnd, before, after, placeholder))
      return
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const s = el.selectionStart
      applyEdit(el, { from: s, to: el.selectionEnd, insert: '  ', selectFrom: s + 2, selectTo: s + 2 })
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.nativeEvent.isComposing) {
      if (el.selectionStart !== el.selectionEnd) return
      const edit = continueList(el.value, el.selectionStart)
      if (edit) {
        e.preventDefault()
        applyEdit(el, edit)
      }
    }
  }

  const handleFieldFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    activeFieldRef.current = e.currentTarget
  }

  function handleExport() {
    const body = `# ${draft.title || 'Untitled'}\n\n_${TOPICS[draft.topic].label} · ${note.day}_\n\n${draft.content}`
    const url = URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.day}-${(draft.title || 'note').replace(/[^\w-]+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusText = {
    saved: `Saved ${format(parseISO(savedAt), 'HH:mm')}`,
    dirty: 'Unsaved',
    saving: 'Saving…',
    error: 'Save failed — retry',
  }[status]

  const iconButton = 'p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors'
  const segment = (isActive: boolean) =>
    cn(
      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
      isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
    )

  return (
    <div className="rounded-2xl border border-foreground/30 bg-card/60 shadow-sm">
      {/* Title + topic */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className={cn('rounded-full pl-2.5 pr-1 py-0.5 text-[11px] font-semibold uppercase tracking-widest', TOPICS[draft.topic].chipClass)}>
            <span className="sr-only">Topic</span>
            <select
              value={draft.topic}
              onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value as NoteTopic }))}
              className="bg-transparent outline-none cursor-pointer uppercase"
            >
              {TOPIC_ORDER.map((t) => (
                <option key={t} value={t} className="bg-background text-foreground normal-case">
                  {TOPICS[t].label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex rounded-lg bg-foreground/[0.06] p-0.5" role="group" aria-label="Editing style">
            <button type="button" onClick={() => switchStyle('form')} className={segment(isForm)} title="Fill in sections, no syntax needed">
              <TextCursorInput className="h-3.5 w-3.5" /> Form
            </button>
            <button type="button" onClick={() => switchStyle('markdown')} className={segment(!isForm)} title="Edit the raw markdown">
              <FileCode2 className="h-3.5 w-3.5" /> Markdown
            </button>
          </div>
        </div>
        <input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          onBlur={() => void save()}
          placeholder="Title"
          aria-label="Note title"
          className="w-full bg-transparent font-display text-xl font-bold outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Toolbar */}
      <div className="mt-2 flex items-center gap-1 border-y border-border/60 px-2 py-1.5">
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
          {tools.map((tool, i) =>
            tool === 'divider' ? (
              <span key={`d${i}`} className="mx-1 h-5 w-px shrink-0 bg-border" />
            ) : (
              <button
                key={tool.label}
                type="button"
                title={tool.label}
                aria-label={tool.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={tool.run}
                className={cn(iconButton, 'shrink-0')}
              >
                <tool.icon className="h-4 w-4" />
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsMobilePreview((v) => !v)}
          aria-pressed={isMobilePreview}
          className={cn(
            'lg:hidden flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
            isMobilePreview ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08]'
          )}
        >
          {isMobilePreview ? <PencilLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isMobilePreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Body: editor + live preview side by side on large screens */}
      <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-border/60">
        <div className={cn(isMobilePreview && 'hidden lg:block')}>
          {isForm ? (
            <NoteForm
              form={form}
              onChange={handleFormChange}
              onFieldKeyDown={handleKeyDown}
              onFieldFocus={handleFieldFocus}
              onFieldBlur={() => void save()}
            />
          ) : (
            <AutoTextarea
              ref={markdownRef}
              value={draft.content}
              minHeight={260}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFieldFocus}
              onBlur={() => void save()}
              onKeyDown={handleKeyDown}
              placeholder="Write in markdown. Use the toolbar or the shortcuts."
              spellCheck={false}
              className="block w-full resize-none bg-transparent px-4 py-3 font-mono text-[15px] md:text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
            />
          )}
        </div>
        <div className={cn('px-4 py-4 min-h-[200px]', !isMobilePreview && 'hidden lg:block')}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Preview</p>
          {draft.content.trim() ? (
            <MarkdownPreview content={draft.content} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
        <p className="text-[11px] text-muted-foreground">
          <button
            type="button"
            onClick={() => void save()}
            className={cn('rounded px-1 hover:text-foreground', status === 'error' && 'text-hard', status === 'dirty' && 'text-medium')}
          >
            {statusText}
          </button>
          <span className="mx-1.5">·</span>
          {countWords(draft.content)} words
          <span className="hidden md:inline">
            <span className="mx-1.5">·</span>
            {MOD}+S to save
          </span>
        </p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleExport} title="Download .md" aria-label="Download as markdown" className={iconButton}>
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete note"
            aria-label="Delete note"
            className="p-2 rounded-lg text-muted-foreground hover:text-hard hover:bg-hard/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              void save()
              onClose()
            }}
            className="ml-1 flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/85 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      </div>
    </div>
  )
}
