-- Web Push subscriptions for the daily study reminder (one row per device).
-- The /api/remind function reads them with the service role key.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages push subscriptions"
  ON push_subscriptions FOR ALL TO authenticated
  USING (public.is_roadmap_owner())
  WITH CHECK (public.is_roadmap_owner());
