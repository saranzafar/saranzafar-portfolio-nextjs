-- Drop the existing skills table and recreate with simpler structure
DROP TABLE IF EXISTS public.skills;

-- Create new simplified skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  website_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;

-- Insert some default skills with placeholder icons
INSERT INTO public.skills (name, website_url) VALUES
('React', 'https://react.dev/'),
('TypeScript', 'https://www.typescriptlang.org/'),
('Next.js', 'https://nextjs.org/'),
('Node.js', 'https://nodejs.org/'),
('Tailwind CSS', 'https://tailwindcss.com/'),
('PostgreSQL', 'https://www.postgresql.org/')
ON CONFLICT (name) DO NOTHING;
