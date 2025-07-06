-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  category TEXT DEFAULT 'technical',
  icon TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now (same as blogs and projects)
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;

-- Insert some default skills
INSERT INTO public.skills (name, level, category, featured) VALUES
('JavaScript', 90, 'frontend', true),
('TypeScript', 85, 'frontend', true),
('React', 95, 'frontend', true),
('Next.js', 90, 'frontend', true),
('Node.js', 80, 'backend', true),
('HTML/CSS', 95, 'frontend', true),
('Tailwind CSS', 90, 'frontend', true),
('GraphQL', 75, 'backend', false),
('PostgreSQL', 70, 'database', false),
('AWS', 65, 'cloud', false),
('Docker', 60, 'devops', false),
('Git', 85, 'tools', true)
ON CONFLICT (name) DO NOTHING;
