-- Row Level Security

-- Problems: public read, admin write
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published problems" ON problems FOR SELECT USING (is_published = true);

-- Tags: public read
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);

-- Problem tags: public read
ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read problem_tags" ON problem_tags FOR SELECT USING (true);

-- Submissions: users can read/insert their own
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);

-- User progress: users manage their own
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON user_progress USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
