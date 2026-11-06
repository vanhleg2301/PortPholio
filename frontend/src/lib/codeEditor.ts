// CodeMirror 6 setup for the Python editor. Imported lazily by CodeEditor, so pages
// without code cells never download it.
import { EditorView, basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { indentWithTab } from '@codemirror/commands'
import { indentUnit } from '@codemirror/language'
import { EditorState, Prec } from '@codemirror/state'
import { keymap } from '@codemirror/view'

export interface EditorOptions {
  doc: string
  onChange: (doc: string) => void
  onRun: () => void
  onSubmit?: () => void
  // Grow with the content (inline cells) or fill the parent (full-screen workspace).
  isFill: boolean
}

export interface EditorHandle {
  setDoc: (doc: string) => void
  focus: () => void
  destroy: () => void
}

const layout = (isFill: boolean) =>
  EditorView.theme({
    '&': { fontSize: '13.5px', backgroundColor: 'transparent', height: isFill ? '100%' : 'auto' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      lineHeight: '1.6',
      minHeight: isFill ? '100%' : '140px',
      maxHeight: isFill ? 'none' : '520px',
    },
    '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid rgba(255,255,255,0.06)' },
    '.cm-content': { padding: '10px 0' },
  })

export function createEditor(parent: HTMLElement, options: EditorOptions): EditorHandle {
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.doc,
      extensions: [
        Prec.highest(
          keymap.of([
            { key: 'Mod-Enter', run: () => (options.onRun(), true) },
            { key: 'Mod-Shift-Enter', run: () => (options.onSubmit ? (options.onSubmit(), true) : false) },
          ])
        ),
        basicSetup,
        keymap.of([indentWithTab]),
        python(),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        oneDark,
        layout(options.isFill),
        EditorView.contentAttributes.of({ autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Python code editor' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) options.onChange(update.state.doc.toString())
        }),
      ],
    }),
  })

  return {
    setDoc: (doc) => {
      if (doc === view.state.doc.toString()) return
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: doc } })
    },
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  }
}
