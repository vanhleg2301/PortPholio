-- (1) Spaced-repetition reviews: a missed problem comes back after 3, 7 and 30 days.
CREATE TABLE IF NOT EXISTS roadmap_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  due_date DATE NOT NULL,
  step_days INT NOT NULL CHECK (step_days > 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roadmap_reviews_due_idx ON roadmap_reviews(due_date) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS roadmap_reviews_task_idx ON roadmap_reviews(task_id);

ALTER TABLE roadmap_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages roadmap reviews"
  ON roadmap_reviews FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());

-- (2) Focus sessions from the study timer. Public read (total hours is a portfolio stat), owner write.
CREATE TABLE IF NOT EXISTS roadmap_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  minutes INT NOT NULL CHECK (minutes > 0 AND minutes <= 600),
  task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roadmap_sessions_day_idx ON roadmap_sessions(day);

ALTER TABLE roadmap_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read roadmap sessions"
  ON roadmap_sessions FOR SELECT
  USING (true);

CREATE POLICY "Owner writes roadmap sessions"
  ON roadmap_sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_roadmap_owner());

CREATE POLICY "Owner deletes roadmap sessions"
  ON roadmap_sessions FOR DELETE TO authenticated
  USING (public.is_roadmap_owner());
