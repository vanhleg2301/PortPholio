// Short text where `backticks` mark code — lighter than a full markdown render (quiz options, glossary).
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
          <code key={i} className="rounded bg-foreground/[0.07] px-1 py-0.5 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  )
}
