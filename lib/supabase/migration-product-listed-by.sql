-- Add listed_by column to product_cards table
ALTER TABLE product_cards
ADD COLUMN IF NOT EXISTS listed_by text;
