-- Add only if missing
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_slug text;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Optional: for faster filtering later
CREATE INDEX IF NOT EXISTS blogs_category_slug_idx ON blogs (category_slug);
CREATE INDEX IF NOT EXISTS blogs_featured_idx ON blogs (featured);
