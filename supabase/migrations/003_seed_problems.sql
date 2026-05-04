-- Seed tags
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
  ('String', 'string');

-- Seed sample problems
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
  'O(n)',
  'O(n)',
  49.3,
  1,
  true
),
(
  'valid-parentheses',
  'Valid Parentheses',
  'Given a string `s` containing just the characters `''('')''`, `''{''`, `''}''`, `''[''` and `'']''`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.',
  'easy',
  '- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `()[]{}`.',
  '[{"input": "s = \"()\"", "output": "true"},
   {"input": "s = \"()[]{}\"", "output": "true"},
   {"input": "s = \"(]\"", "output": "false"}]',
  '{
    "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  \n};",
    "typescript": "function isValid(s: string): boolean {\n  \n};",
    "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        ",
    "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
    "go": "func isValid(s string) bool {\n    \n}"
  }',
  'O(n)',
  'O(n)',
  40.2,
  2,
  true
),
(
  'longest-substring-without-repeating',
  'Longest Substring Without Repeating Characters',
  'Given a string `s`, find the length of the **longest substring** without repeating characters.',
  'medium',
  '- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols and spaces.',
  '[{"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."},
   {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with the length of 1."},
   {"input": "s = \"pwwkew\"", "output": "3"}]',
  '{
    "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  \n};",
    "typescript": "function lengthOfLongestSubstring(s: string): number {\n  \n};",
    "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ",
    "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}",
    "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
    "go": "func lengthOfLongestSubstring(s string) int {\n    \n}"
  }',
  'O(n)',
  'O(min(m,n))',
  33.8,
  3,
  true
);

-- Assign tags to problems
INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'two-sum' AND t.slug IN ('array', 'hash-map');

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'valid-parentheses' AND t.slug IN ('string', 'stack');

INSERT INTO problem_tags (problem_id, tag_id)
SELECT p.id, t.id FROM problems p, tags t
WHERE p.slug = 'longest-substring-without-repeating' AND t.slug IN ('string', 'sliding-window', 'hash-map');
