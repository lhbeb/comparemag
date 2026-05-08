-- Add image SEO metadata for article hero/thumbnail images.
-- Filenames help Google Images lightly, but alt text is the stronger signal and
-- the accessibility requirement, so both are stored separately.

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS image_alt TEXT,
ADD COLUMN IF NOT EXISTS image_title TEXT;

COMMENT ON COLUMN articles.image_alt IS 'Human-readable alt text for the article hero/thumbnail image.';
COMMENT ON COLUMN articles.image_title IS 'SEO-friendly image title/filename label for the article hero/thumbnail image.';

UPDATE articles
SET
  image_alt = COALESCE(
    NULLIF(image_alt, ''),
    title || ', ' || category || ' review ' || EXTRACT(YEAR FROM COALESCE(published_at, created_at))::TEXT
  ),
  image_title = COALESCE(
    NULLIF(image_title, ''),
    lower(regexp_replace(title || ' ' || category || ' review ' || EXTRACT(YEAR FROM COALESCE(published_at, created_at))::TEXT, '[^a-zA-Z0-9]+', '-', 'g'))
  )
WHERE image_url IS NOT NULL;
