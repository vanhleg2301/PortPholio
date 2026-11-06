-- Lesson progress, test answers and saved code per account: any signed-in user keeps
-- their own rows. Existing rows belong to the owner. Tasks, notes and files stay owner-only.

BEGIN;

-- roadmap_lesson_progress -------------------------------------------------------
ALTER TABLE roadmap_lesson_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE roadmap_lesson_progress
SET user_id = (SELECT id FROM auth.users WHERE lower(email) = 'vanhleg2301@gmail.com')
WHERE user_id IS NULL;

ALTER TABLE roadmap_lesson_progress
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE roadmap_lesson_progress DROP CONSTRAINT IF EXISTS roadmap_lesson_progress_pkey;
ALTER TABLE roadmap_lesson_progress ADD PRIMARY KEY (user_id, lesson_id, item_id);

DROP POLICY IF EXISTS "Owner manages lesson progress" ON roadmap_lesson_progress;
CREATE POLICY "Users manage their own lesson progress"
  ON roadmap_lesson_progress FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- roadmap_code (saved code, interview answers, multiple-choice answers) -----------
ALTER TABLE roadmap_code ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE roadmap_code
SET user_id = (SELECT id FROM auth.users WHERE lower(email) = 'vanhleg2301@gmail.com')
WHERE user_id IS NULL;

ALTER TABLE roadmap_code
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE roadmap_code DROP CONSTRAINT IF EXISTS roadmap_code_pkey;
ALTER TABLE roadmap_code ADD PRIMARY KEY (user_id, key);

DROP POLICY IF EXISTS "Owner manages saved code" ON roadmap_code;
CREATE POLICY "Users manage their own saved code"
  ON roadmap_code FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

COMMIT;
