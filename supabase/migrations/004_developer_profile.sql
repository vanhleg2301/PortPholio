-- Developer / Portfolio profile table
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
CREATE POLICY "Public can read developer profiles" ON developer_profiles FOR SELECT USING (true);

CREATE TRIGGER developer_profiles_updated_at
  BEFORE UPDATE ON developer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert developer profile data
INSERT INTO developer_profiles (name, role, tools, websites, bio) VALUES (
  'Van Hle',
  'Full Stack Developer',
  ARRAY['lovable.dev', 'Supabase', 'React', 'TypeScript', 'Node.js'],
  '[
    {"name": "Gateway of Talent", "url": "https://gatewayoftalent.com", "description": "Talent discovery platform"},
    {"name": "Gateway of Asia", "url": "https://gatewayofasia.com", "description": "Asia-focused web platform"}
  ]'::jsonb,
  'Lập trình viên sử dụng lovable.dev để xây dựng các website gatewayoftalent.com và gatewayofasia.com'
);
