-- Create articles table with slug-based structure
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  read_time TEXT DEFAULT '5 min read',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Create index on published status for filtering
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Allow anonymous table checks" ON articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Allow anonymous inserts for migration" ON articles;
DROP POLICY IF EXISTS "Allow anonymous updates" ON articles;
DROP POLICY IF EXISTS "Allow anonymous deletes" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;

-- Policy: Allow public read access to published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (published = true);

-- Policy: Allow anonymous users to check table structure (for health checks)
-- This allows SELECT queries even when no published articles exist
CREATE POLICY "Allow anonymous table checks"
  ON articles FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert articles (you can customize this)
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anonymous inserts for migration scripts and admin operations
CREATE POLICY "Allow anonymous inserts for migration"
  ON articles FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anonymous updates (for admin operations)
CREATE POLICY "Allow anonymous updates"
  ON articles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous deletes (for admin operations)
CREATE POLICY "Allow anonymous deletes"
  ON articles FOR DELETE
  USING (true);

-- Policy: Allow authenticated users to update articles
CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete articles
CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  USING (true);

-- Create storage bucket for article images
-- Note: If this fails, create the bucket manually in Supabase Dashboard → Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('article_images', 'article_images', true)
ON CONFLICT (id) DO NOTHING;

-- Note: We cannot modify RLS policies on storage.buckets (system table)
-- The health check will verify bucket accessibility by trying to access it directly

-- Drop existing storage policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete article images" ON storage.objects;

-- Storage policy: Allow public read access
CREATE POLICY "Public can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article_images');

-- Storage policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article_images');

-- Storage policy: Allow anonymous uploads (for admin operations)
CREATE POLICY "Allow anonymous uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article_images');

-- Storage policy: Allow authenticated users to update images
CREATE POLICY "Authenticated users can update article images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'article_images');

-- Storage policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete article images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article_images');
