-- Several notes per day, each with a title and a topic (Python, DSA, System Design, ...).
-- Existing notes are kept: each becomes one note with topic 'general'.

ALTER TABLE roadmap_notes ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE roadmap_notes ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE roadmap_notes ADD COLUMN IF NOT EXISTS topic TEXT NOT NULL DEFAULT 'general';
ALTER TABLE roadmap_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE roadmap_notes DROP CONSTRAINT IF EXISTS roadmap_notes_pkey;
ALTER TABLE roadmap_notes ADD PRIMARY KEY (id);

ALTER TABLE roadmap_notes ADD CONSTRAINT roadmap_notes_topic_check
  CHECK (topic IN ('general', 'python', 'dsa', 'cs', 'sd', 'ai', 'review', 'career'));

CREATE INDEX IF NOT EXISTS roadmap_notes_day_idx ON roadmap_notes(day);
