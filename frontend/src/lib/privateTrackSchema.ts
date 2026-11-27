import { z } from 'zod'

// Shape of a private study track (see lib/privateTracks.ts). Also used by
// scripts/build-private-track.ts to check a track before it is uploaded.

const linkSchema = z.object({ label: z.string(), url: z.string() })
const primerSchema = z.object({ read: z.string(), section: z.string().optional() })

const choiceSchema = z.object({
  id: z.string(),
  concept: z.string().optional(),
  question: z.string(),
  code: z.string().optional(),
  // The first option is the correct one; the test shuffles them.
  options: z.array(z.string()).min(2),
  explain: z.string(),
  ref: linkSchema.optional(),
  primer: primerSchema.optional(),
})

const explainSchema = z.object({
  id: z.string(),
  question: z.string(),
  points: z.array(z.string()),
  answer: z.string(),
  primer: primerSchema.optional(),
})

// Blocks a private lesson may use (no runnable Python or animated visuals).
const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), md: z.string() }),
  z.object({ type: z.literal('callout'), tone: z.enum(['tip', 'warning', 'interview', 'compare']), md: z.string() }),
  z.object({ type: z.literal('diagram'), mermaid: z.string(), caption: z.string().optional() }),
  z.object({ type: z.literal('quiz'), items: z.array(z.object({ question: z.string(), answer: z.string() })) }),
])

const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  minutes: z.number(),
  blocks: z.array(blockSchema),
  videos: z.array(linkSchema).optional(),
  furtherReading: z.array(linkSchema).optional(),
})

export const trackSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string(),
  about: z.string(),
  // Content date: everything was checked against its sources on this day.
  checkedOn: z.string(),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      goal: z.string(),
      days: z.array(
        z.object({
          lessons: z.array(z.string()).default([]),
          // Practice outside the app (with a link where there is one).
          tasks: z.array(z.object({ title: z.string(), link: linkSchema.optional() })).default([]),
        })
      ),
    })
  ),
  lessons: z.array(lessonSchema),
  tests: z.record(
    z.string(),
    z.object({ choice: z.array(choiceSchema), explain: z.array(explainSchema), sources: z.array(linkSchema).default([]) })
  ),
  glossary: z.record(z.string(), z.object({ en: z.string(), example: z.string() })).default({}),
})

export type PrivateTrackSource = z.input<typeof trackSchema>

