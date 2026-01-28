-- Migration: Add registration source column
-- Description: Adds a column to identify whether registration came from ticket purchase or early access modal
-- Created: 2026-01-09

-- Add registration_source column to identify how the user registered
-- Values: 'ticket_purchase', 'early_access', 'waitlist', etc.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'registrations' 
    AND column_name = 'registration_source'
  ) THEN
    ALTER TABLE registrations 
    ADD COLUMN registration_source TEXT DEFAULT NULL;
    
    COMMENT ON COLUMN registrations.registration_source IS 'Source of registration: ticket_purchase, early_access, waitlist, admin_created';
  END IF;
END $$;

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations(registration_source);