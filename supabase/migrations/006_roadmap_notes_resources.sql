-- Private study notes and resources for the /roadmap page.
-- Only the owner account can read or write them (unlike roadmap_progress, which is public).

CREATE OR REPLACE FUNCTION public.is_roadmap_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') = 'vanhleg2301@gmail.com'
$$;

-- One markdown note per plan day
CREATE TABLE IF NOT EXISTS roadmap_notes (
  day DATE PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roadmap_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages roadmap notes"
  ON roadmap_notes FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());

-- Links and uploaded files attached to a plan day
CREATE TABLE IF NOT EXISTS roadmap_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('link', 'file')),
  title TEXT NOT NULL,
  url TEXT,
  storage_path TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'link' AND url IS NOT NULL) OR (kind = 'file' AND storage_path IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS roadmap_resources_day_idx ON roadmap_resources(day);

ALTER TABLE roadmap_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages roadmap resources"
  ON roadmap_resources FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());

-- Private storage bucket for uploaded files (20 MB per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('roadmap-files', 'roadmap-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Owner reads roadmap files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'roadmap-files' AND public.is_roadmap_owner());

CREATE POLICY "Owner uploads roadmap files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'roadmap-files' AND public.is_roadmap_owner());

CREATE POLICY "Owner deletes roadmap files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'roadmap-files' AND public.is_roadmap_owner());
