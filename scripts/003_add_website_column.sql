-- Add website column to sponsors table
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS website TEXT;
