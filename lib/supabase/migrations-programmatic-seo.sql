-- Supabase SQL Migration: Programmatic SEO and Product Cards Architecture

-- 1. Extend the `articles` table with programmatic SEO support
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS article_type TEXT DEFAULT 'manual' CHECK (article_type IN ('manual', 'programmatic')),
ADD COLUMN IF NOT EXISTS programmatic_template TEXT,
ADD COLUMN IF NOT EXISTS programmatic_key TEXT,
ADD COLUMN IF NOT EXISTS programmatic_data JSONB,
ADD COLUMN IF NOT EXISTS generation_status TEXT CHECK (generation_status IN ('draft', 'generated', 'reviewed', 'published'));

-- Add comment for documentation
COMMENT ON COLUMN articles.article_type IS 'Distinguishes between manual editor content and generated SEO content';

-- 2. Create the `product_cards` table
CREATE TABLE IF NOT EXISTS product_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    brand TEXT,
    image_url TEXT,
    short_description TEXT NOT NULL,
    cta_label TEXT DEFAULT 'Check Price',
    external_url TEXT NOT NULL,
    price_text TEXT,
    rating_text TEXT,
    badge_text TEXT,
    specs JSONB,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create simple index for quick slug lookups
CREATE INDEX IF NOT EXISTS idx_product_cards_slug ON product_cards(slug);

-- Create index on published status for frontend querying
CREATE INDEX IF NOT EXISTS idx_product_cards_published ON product_cards(published);

-- Add updated_at trigger (assuming standard Supabase handle_updated_at function exists. If not, we create one)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_cards_updated_at ON product_cards;
CREATE TRIGGER set_product_cards_updated_at
BEFORE UPDATE ON product_cards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Note on Access/RLS:
-- If Row Level Security is enabled on the articles table, we assume similar permissive/authenticated rules
-- apply here for the MVP. You may wish to restrict to authenticated in production if desired.
-- ALTER TABLE product_cards ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON product_cards FOR SELECT USING (published = true);
-- CREATE POLICY "Allow authenticated full access" ON product_cards FOR ALL USING (auth.role() = 'authenticated');
