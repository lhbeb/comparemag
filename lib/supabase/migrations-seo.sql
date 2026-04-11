-- Add SEO fields to articles table
-- Run this migration to add comprehensive SEO support

-- Add SEO-specific columns
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image',
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS focus_keyword TEXT,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;

-- Create index on focus_keyword for SEO queries
CREATE INDEX IF NOT EXISTS idx_articles_focus_keyword ON articles(focus_keyword);

-- Create index on meta_keywords for search
CREATE INDEX IF NOT EXISTS idx_articles_meta_keywords ON articles USING gin(to_tsvector('english', COALESCE(meta_keywords, '')));

-- Function to auto-generate meta description from content if not provided
CREATE OR REPLACE FUNCTION generate_meta_description(content_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(content_text, '<[^>]*>', '', 'g'),
    '\s+',
    ' ',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing articles to have auto-generated meta descriptions
UPDATE articles 
SET meta_description = LEFT(generate_meta_description(content), 160)
WHERE meta_description IS NULL OR meta_description = '';

-- Add comment for documentation
COMMENT ON COLUMN articles.meta_description IS 'SEO meta description (150-160 characters recommended)';
COMMENT ON COLUMN articles.meta_keywords IS 'Comma-separated keywords for SEO';
COMMENT ON COLUMN articles.og_title IS 'Open Graph title (defaults to article title if null)';
COMMENT ON COLUMN articles.og_description IS 'Open Graph description (defaults to meta_description if null)';
COMMENT ON COLUMN articles.og_image IS 'Open Graph image URL (defaults to image_url if null)';
COMMENT ON COLUMN articles.twitter_card IS 'Twitter card type: summary_large_image or summary';
COMMENT ON COLUMN articles.canonical_url IS 'Canonical URL for the article';
COMMENT ON COLUMN articles.focus_keyword IS 'Primary keyword for SEO optimization';
COMMENT ON COLUMN articles.seo_score IS 'SEO score (0-100) based on optimization factors';
