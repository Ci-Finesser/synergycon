-- Migration: Enhance Partnership Applications Table
-- Description: Adds missing columns to partnership_applications based on PartnershipApplication TypeScript type
-- Date: 2026-01-08

-- ============================================================================
-- ADD MISSING COLUMNS TO PARTNERSHIP_APPLICATIONS
-- Based on types/user.ts PartnershipApplication interface
-- ============================================================================

-- Add partnership_type column (if not already added by previous migration)
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS partnership_type TEXT CHECK (partnership_type IN ('sponsor', 'exhibitor', 'media', 'vendor'));

-- Add message column for additional contact message
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Rename partnership_tier to match type (if needed, handle existing constraint)
DO $$
BEGIN
  -- Update constraint to include additional tier options
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partnership_applications_partnership_tier_check') THEN
    ALTER TABLE partnership_applications DROP CONSTRAINT partnership_applications_partnership_tier_check;
    ALTER TABLE partnership_applications ADD CONSTRAINT partnership_applications_partnership_tier_check 
      CHECK (partnership_tier IN ('silver', 'gold', 'platinum', 'diamond', 'ecosystem', 'principal', 'none'));
  END IF;
END $$;

-- ============================================================================
-- ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_partnership_applications_partnership_type ON partnership_applications(partnership_type);

-- ============================================================================
-- UPDATE DEFAULT PARTNERSHIP_TYPE BASED ON EXISTING DATA
-- ============================================================================

-- Set default partnership_type for existing records based on context
UPDATE partnership_applications
SET partnership_type = 
  CASE 
    WHEN partnership_tier IN ('silver', 'gold', 'platinum', 'diamond') THEN 'sponsor'
    WHEN partnership_interests ILIKE '%media%' THEN 'media'
    WHEN partnership_interests ILIKE '%exhibit%' THEN 'exhibitor'
    ELSE 'sponsor'
  END
WHERE partnership_type IS NULL;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN partnership_applications.partnership_type IS 'Type of partnership: sponsor, exhibitor, media, or vendor';
COMMENT ON COLUMN partnership_applications.message IS 'Additional message or notes from the applicant';
