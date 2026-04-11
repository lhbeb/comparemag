-- Add specialty column to writers table (for editor expertise display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'writers' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE writers ADD COLUMN specialty TEXT;
  END IF;
END $$;
