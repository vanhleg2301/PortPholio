import { AnimatePresence, motion } from 'framer-motion'
import { Code, Plus, X } from 'lucide-react'
import { AutoTextarea } from '@/components/roadmap/AutoTextarea'
import { SECTION_HINTS } from '@/data/roadmap/topics'
import { EASE_OUT } from '@/lib/motion'
import type { NoteForm as NoteFormValue, NoteSection } from '@/lib/noteSections'
import type { FocusEvent, KeyboardEvent } from 'react'

interface NoteFormProps {
  form: NoteFormValue
  onChange: (form: NoteFormValue) => void
  onFieldKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onFieldFocus: (e: FocusEvent<HTMLTextAreaElement>) => void
  onFieldBlur: () => void
}

export function NoteForm({ form, onChange, onFieldKeyDown, onFieldFocus, onFieldBlur }: NoteFormProps) {
  const updateSection = (index: number, patch: Partial<NoteSection>) =>
    onChange({ ...form, sections: form.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)) })
  const removeSection = (index: number) => onChange({ ...form, sections: form.sections.filter((_, i) => i !== index) })
  const addSection = (section: NoteSection) => onChange({ ...form, sections: [...form.sections, section] })

  const fieldProps = { onKeyDown: onFieldKeyDown, onFocus: onFieldFocus, onBlur: onFieldBlur, spellCheck: false }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {form.intro !== '' && (
        <AutoTextarea
          value={form.intro}
          onChange={(e) => onChange({ ...form, intro: e.target.value })}
          placeholder="Notes"
          className="w-full resize-none rounded-xl bg-foreground/[0.03] px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:bg-foreground/[0.05]"
          {...fieldProps}
        />
      )}

      <AnimatePresence initial={false}>
        {form.sections.map((section, i) => (
          <motion.div
            key={section.id}
            layout="position"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="group"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <input
                value={section.heading}
                onChange={(e) => updateSection(i, { heading: e.target.value })}
                onBlur={onFieldBlur}
                aria-label="Section title"
                className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold uppercase tracking-widest text-muted-foreground outline-none focus:text-foreground"
              />
              <button
                type="button"
                onClick={() => removeSection(i)}
                aria-label={`Remove section ${section.heading}`}
                className="rounded-full p-1 text-muted-foreground/60 opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-hard hover:bg-hard/10 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {section.codeLang !== undefined ? (
              <AutoTextarea
                value={section.body}
                onChange={(e) => updateSection(i, { body: e.target.value })}
                placeholder={SECTION_HINTS[section.heading] ?? 'Code'}
                minHeight={88}
                className="w-full resize-none rounded-xl bg-[#0d1117] px-3.5 py-3 font-mono text-[13px] leading-relaxed text-[#e6edf3] outline-none ring-1 ring-transparent focus:ring-foreground/20 placeholder:text-white/30"
                {...fieldProps}
              />
            ) : (
              <AutoTextarea
                value={section.body}
                onChange={(e) => updateSection(i, { body: e.target.value })}
                placeholder={SECTION_HINTS[section.heading] ?? `Write about ${section.heading.toLowerCase()}…`}
                className="w-full resize-none rounded-xl bg-foreground/[0.03] px-3 py-2.5 text-[15px] leading-relaxed outline-none ring-1 ring-transparent focus:bg-foreground/[0.05] focus:ring-foreground/15 placeholder:text-muted-foreground/50 transition-colors"
                {...fieldProps}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addSection({ id: crypto.randomUUID(), heading: 'New section', body: '' })}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Section
        </button>
        <button
          type="button"
          onClick={() => addSection({ id: crypto.randomUUID(), heading: 'Code', body: '', codeLang: 'python' })}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] transition-colors"
        >
          <Code className="h-3.5 w-3.5" /> Code block
        </button>
      </div>
    </div>
  )
}
