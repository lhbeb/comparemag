-- Add soft delete capability to writers table
ALTER TABLE public.writers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
