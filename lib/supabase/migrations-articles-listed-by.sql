-- Add listed_by column to articles
ALTER TABLE articles
ADD COLUMN listed_by text;

-- (Optional) Update existing documents to track listed_by if known, or leave as null.
