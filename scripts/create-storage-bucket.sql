-- Create storage bucket for article images
-- Run this in Supabase SQL Editor if the bucket doesn't exist

-- Note: If INSERT doesn't work, create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: article_images
-- 4. Public bucket: Yes
-- 5. Click "Create bucket"

-- Try to create bucket via SQL (may require service role key)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article_images',
  'article_images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'article_images';
