-- Create writers/contributors table
CREATE TABLE IF NOT EXISTS writers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  bio_html TEXT,
  avatar_url TEXT,
  email TEXT,
  website TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_writers_slug ON writers(slug);

-- Create function to update updated_at timestamp for writers
CREATE OR REPLACE FUNCTION update_writers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for writers
DROP TRIGGER IF EXISTS update_writers_updated_at ON writers;
CREATE TRIGGER update_writers_updated_at
  BEFORE UPDATE ON writers
  FOR EACH ROW
  EXECUTE FUNCTION update_writers_updated_at_column();

-- Enable Row Level Security (RLS) for writers
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Public can view writers" ON writers;
DROP POLICY IF EXISTS "Allow anonymous inserts for writers" ON writers;
DROP POLICY IF EXISTS "Allow anonymous updates for writers" ON writers;
DROP POLICY IF EXISTS "Allow anonymous deletes for writers" ON writers;

-- Policy: Allow public read access to writers
CREATE POLICY "Public can view writers"
  ON writers FOR SELECT
  USING (true);

-- Policy: Allow anonymous inserts for writers (for admin dashboard)
CREATE POLICY "Allow anonymous inserts for writers"
  ON writers FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anonymous updates for writers (for admin dashboard)
CREATE POLICY "Allow anonymous updates for writers"
  ON writers FOR UPDATE
  USING (true);

-- Policy: Allow anonymous deletes for writers (for admin dashboard)
CREATE POLICY "Allow anonymous deletes for writers"
  ON writers FOR DELETE
  USING (true);

-- Add writer_id column to articles table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'writer_id'
  ) THEN
    ALTER TABLE articles ADD COLUMN writer_id UUID REFERENCES writers(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_articles_writer_id ON articles(writer_id);
  END IF;
END $$;

