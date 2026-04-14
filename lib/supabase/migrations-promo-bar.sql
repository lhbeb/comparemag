-- Migration for Promotional Bar Feature

-- Add is_featured flag to articles
ALTER TABLE public.articles 
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create an index to quickly find the featured article for the global layout query
CREATE INDEX IF NOT EXISTS articles_is_featured_idx ON public.articles(is_featured) WHERE is_featured = true;
