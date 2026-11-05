-- In-app lessons: which exercises the owner has passed, and code saved per code cell.
-- Owner-only, like notes.

CREATE TABLE IF NOT EXISTS roadmap_lesson_progress (
  lesson_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (lesson_id, item_id)
);

ALTER TABLE roadmap_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages lesson progress"
  ON roadmap_lesson_progress FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());

CREATE TABLE IF NOT EXISTS roadmap_code (
  key TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roadmap_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages saved code"
  ON roadmap_code FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());
