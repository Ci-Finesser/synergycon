-- Migration: Enhance Speaker Applications Table
-- Description: Adds missing columns to speaker_applications based on SpeakerApplication TypeScript type
-- Date: 2026-01-08

-- ============================================================================
-- ADD MISSING COLUMNS TO SPEAKER_APPLICATIONS
-- Based on types/user.ts SpeakerApplication interface
-- ============================================================================

-- Add full_name column (computed from first_name + last_name)
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add role column (speaker role type)
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('keynote', 'panelist', 'workshop_facilitator', 'moderator'));

-- Add twitter_url column
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Add website_url column
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add topic column (main topic title - alias for topic_title)
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS topic TEXT;

-- Add previous_speaking column for speaking history
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS previous_speaking TEXT;

-- Add headshot_url for speaker photo
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS headshot_url TEXT;

-- Add confirmed flag
ALTER TABLE speaker_applications
  ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false;

-- ============================================================================
-- SYNC full_name FROM first_name + last_name
-- ============================================================================

-- Update existing records to have full_name
UPDATE speaker_applications
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL;

-- Sync topic with topic_title
UPDATE speaker_applications
SET topic = topic_title
WHERE topic IS NULL AND topic_title IS NOT NULL;

-- Create trigger to auto-generate full_name
CREATE OR REPLACE FUNCTION sync_speaker_application_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
    NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  IF NEW.topic IS NULL AND NEW.topic_title IS NOT NULL THEN
    NEW.topic := NEW.topic_title;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_speaker_application_full_name_trigger ON speaker_applications;
CREATE TRIGGER sync_speaker_application_full_name_trigger
  BEFORE INSERT OR UPDATE ON speaker_applications
  FOR EACH ROW
  EXECUTE FUNCTION sync_speaker_application_full_name();

-- ============================================================================
-- ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_speaker_applications_role ON speaker_applications(role);
CREATE INDEX IF NOT EXISTS idx_speaker_applications_confirmed ON speaker_applications(confirmed);

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN speaker_applications.full_name IS 'Auto-generated from first_name + last_name';
COMMENT ON COLUMN speaker_applications.role IS 'Speaker role type: keynote, panelist, workshop_facilitator, moderator';
COMMENT ON COLUMN speaker_applications.topic IS 'Main topic title (synced with topic_title)';
COMMENT ON COLUMN speaker_applications.confirmed IS 'Whether speaker has confirmed their participation';
COMMENT ON COLUMN speaker_applications.headshot_url IS 'URL to speaker headshot/profile image';
