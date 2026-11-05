-- Learning roadmap progress (/roadmap page).
-- Everyone can read; only the owner account can tick or untick tasks.

CREATE TABLE IF NOT EXISTS roadmap_progress (
  task_id TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read roadmap progress"
  ON roadmap_progress FOR SELECT
  USING (true);

CREATE POLICY "Owner can insert roadmap progress"
  ON roadmap_progress FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'vanhleg2301@gmail.com');

CREATE POLICY "Owner can update roadmap progress"
  ON roadmap_progress FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'vanhleg2301@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'vanhleg2301@gmail.com');

CREATE POLICY "Owner can delete roadmap progress"
  ON roadmap_progress FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'vanhleg2301@gmail.com');
