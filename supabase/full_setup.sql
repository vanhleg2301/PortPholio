-- ============================================================
-- FULL SETUP: Chạy file này trong Supabase SQL Editor
-- Project: PortPholio - Coding Challenge Platform
-- ============================================================

-- ============================================================
-- MIGRATION 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums (bỏ qua lỗi nếu đã tồn tại)
DO $$ BEGIN
  CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE language AS ENUM ('javascript', 'typescript', 'python', 'java', 'cpp', 'go');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty difficulty NOT NULL,
  constraints TEXT NOT NULL DEFAULT '',
  examples JSONB NOT NULL DEFAULT '[]',
  starter_code JSONB NOT NULL DEFAULT '{}',
  solution_code JSONB,
  time_complexity VARCHAR(50),
  space_complexity VARCHAR(50),
  acceptance_rate REAL NOT NULL DEFAULT 0,
  submission_count INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS problems_slug_idx ON problems(slug);
CREATE INDEX IF NOT EXISTS problems_difficulty_idx ON problems(difficulty);
CREATE INDEX IF NOT EXISTS problems_order_idx ON problems(order_index);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- Problem <-> Tags
CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language language NOT NULL,
  code TEXT NOT NULL,
  status submission_status NOT NULL,
  runtime_ms INTEGER,
  memory_kb INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submissions_user_idx ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_problem_idx ON submissions(problem_id);

-- User progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_language language NOT NULL DEFAULT 'javascript',
  last_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS user_progress_user_problem_idx ON user_progress(user_id, problem_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MIGRATION 002: Row Level Security
-- ============================================================

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public can read published problems" ON problems FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public can read problem_tags" ON problem_tags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can read own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can manage own progress" ON user_progress USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MIGRATION 003: Seed Data - Tags & Sample Problems
-- ============================================================

INSERT INTO tags (name, slug) VALUES
  ('Array', 'array'),
  ('Hash Map', 'hash-map'),
  ('Two Pointers', 'two-pointers'),
  ('Sliding Window', 'sliding-window'),
  ('Binary Search', 'binary-search'),
  ('Stack', 'stack'),
  ('Queue', 'queue'),
  ('Linked List', 'linked-list'),
  ('Tree', 'tree'),
  ('Graph', 'graph'),
  ('Dynamic Programming', 'dynamic-programming'),
  ('Greedy', 'greedy'),
  ('Backtracking', 'backtracking'),
  ('Math', 'math'),
  ('String', 'string')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO problems (slug, title, description, difficulty, constraints, examples, starter_code, time_complexity, space_complexity, acceptance_rate, order_index, is_published)
VALUES
(
  'two-sum',
  'Two Sum',
  'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to target*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.',
  'easy',
  '- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
   {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}]',
  '{
    "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  \n};",
    "typescript": "function twoSum(nums: number[], target: number): number[] {\n  \n};",
    "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
    "go": "func twoSum(nums []int, target int) []int {\n    \n}"
  }',
  'O(n)', 'O(n)', 49.3, 1, true
),
(
  'valid-parentheses',
  'Valid Parentheses',
  'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
  'easy',
  '- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `()[]{}`.',
  '[{"input": "s = \"()\"", "output": "true"},
   {"input": "s = \"()[]{}\"", "output": "true"},
   {"input": "s = \"(]\"", "output": "false"}]',
  '{
    "javascript": "function isValid(s) {\n  \n};",
    "typescript": "function isValid(s: string): boolean {\n  \n};",
    "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        ",
    "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
    "go": "func isValid(s string) bool {\n    \n}"
  }',
  'O(n)', 'O(n)', 40.2, 2, true
),
(
  'longest-substring-without-repeating',
  'Longest Substring Without Repeating Characters',
  'Given a string `s`, find the length of the **longest substring** without repeating characters.',
  'medium',
  '- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols and spaces.',
  '[{"input": "s = \"abcabcbb\"", "output": "3"},
   {"input": "s = \"bbbbb\"", "output": "1"},
   {"input": "s = \"pwwkew\"", "output": "3"}]',
  '{
    "javascript": "function lengthOfLongestSubstring(s) {\n  \n};",
    "typescript": "function lengthOfLongestSubstring(s: string): number {\n  \n};",
    "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ",
    "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
    "go": "func lengthOfLongestSubstring(s string) int {\n    \n}"
  }',
  'O(n)', 'O(min(m,n))', 33.8, 3, true
)
ON CONFLICT (slug) DO NOTHING;

-- Assign tags to problems
INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'two-sum' AND t.slug IN ('array', 'hash-map')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'valid-parentheses' AND t.slug IN ('string', 'stack')
ON CONFLICT DO NOTHING;

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'longest-substring-without-repeating' AND t.slug IN ('string', 'sliding-window', 'hash-map')
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION 004: Developer Profile Data
-- ============================================================

CREATE TABLE IF NOT EXISTS developer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  tools TEXT[],
  websites JSONB NOT NULL DEFAULT '[]',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public can read developer profiles" ON developer_profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER developer_profiles_updated_at
    BEFORE UPDATE ON developer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Dữ liệu developer profile
INSERT INTO developer_profiles (name, role, tools, websites, bio) VALUES (
  'Van Hle',
  'Full Stack Developer',
  ARRAY['lovable.dev', 'Supabase', 'React', 'TypeScript', 'Node.js', 'Hono'],
  '[
    {
      "name": "Gateway of Talent",
      "url": "https://gatewayoftalent.com",
      "description": "Talent discovery platform built with lovable.dev",
      "platform": "lovable.dev"
    },
    {
      "name": "Gateway of Asia",
      "url": "https://gatewayofasia.com",
      "description": "Asia-focused web platform built with lovable.dev",
      "platform": "lovable.dev"
    }
  ]'::jsonb,
  'Lập trình viên Full Stack, sử dụng lovable.dev để xây dựng các website gatewayoftalent.com và gatewayofasia.com. Dự án PortPholio là nền tảng luyện code với Supabase backend.'
);

-- Xác nhận kết quả
SELECT 'Setup hoàn tất!' AS status;
SELECT COUNT(*) AS so_bai_toan FROM problems;
SELECT COUNT(*) AS so_tags FROM tags;
SELECT name, role FROM developer_profiles;
