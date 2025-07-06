-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'
);

-- Create storage bucket for blog assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to published blogs
CREATE POLICY "Public can view published blogs" ON blogs
  FOR SELECT USING (published = true);

-- Policy to allow authenticated users to manage all blogs
CREATE POLICY "Authenticated users can manage blogs" ON blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- Set up storage policies
CREATE POLICY "Public can view blog assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-assets');

CREATE POLICY "Authenticated users can upload blog assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-assets' AND auth.role() = 'authenticated');
