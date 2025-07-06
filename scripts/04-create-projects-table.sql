-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  demo_url TEXT,
  repo_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  technologies TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'web'
);

-- Disable RLS for now (same as blogs)
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
