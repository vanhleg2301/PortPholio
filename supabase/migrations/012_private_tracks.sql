-- Private study tracks (for example a company's internal processes): lessons, tests and the day
-- plan are stored here instead of in the app's public JavaScript, and only the owner can read them.
-- The content is written outside this public repository and loaded with a generated upsert script.

CREATE TABLE IF NOT EXISTS roadmap_private_tracks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roadmap_private_tracks ENABLE ROW LEVEL SECURITY;

-- No policy for anon or other users: they get no rows at all.
CREATE POLICY "Owner manages private tracks"
  ON roadmap_private_tracks FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());
