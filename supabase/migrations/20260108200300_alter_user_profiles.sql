-- Migration: Enhance User Profiles Table
-- Description: Adds missing columns to user_profiles based on UserProfile TypeScript type
-- Date: 2026-01-08

-- ============================================================================
-- ADD MISSING COLUMNS TO USER_PROFILES
-- Based on types/user.ts UserProfile interface
-- ============================================================================

-- Personal Information fields
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- Public Profile Fields (visible on shareable profile)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_name TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_title TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_company TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_bio TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_linkedin_url TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_twitter_url TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_instagram_url TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS public_website_url TEXT;

-- Private Information fields
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS industry TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- ============================================================================
-- SYNC PUBLIC FIELDS WITH PRIVATE EQUIVALENTS
-- ============================================================================

-- Update existing records to populate public fields from private equivalents
UPDATE user_profiles
SET 
  public_name = COALESCE(public_name, full_name),
  public_company = COALESCE(public_company, company),
  public_bio = COALESCE(public_bio, bio),
  public_linkedin_url = COALESCE(public_linkedin_url, linkedin_url),
  public_twitter_url = COALESCE(public_twitter_url, twitter_handle),
  public_instagram_url = COALESCE(public_instagram_url, instagram_handle)
WHERE public_name IS NULL OR public_company IS NULL;

-- ============================================================================
-- CREATE FUNCTION TO AUTO-SYNC PUBLIC PROFILE FIELDS
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_public_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if public field is null and private field has value
  IF NEW.public_name IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.public_name := NEW.full_name;
  END IF;
  IF NEW.public_company IS NULL AND NEW.company IS NOT NULL THEN
    NEW.public_company := NEW.company;
  END IF;
  IF NEW.public_bio IS NULL AND NEW.bio IS NOT NULL THEN
    NEW.public_bio := NEW.bio;
  END IF;
  IF NEW.public_linkedin_url IS NULL AND NEW.linkedin_url IS NOT NULL THEN
    NEW.public_linkedin_url := NEW.linkedin_url;
  END IF;
  IF NEW.public_twitter_url IS NULL AND NEW.twitter_handle IS NOT NULL THEN
    NEW.public_twitter_url := NEW.twitter_handle;
  END IF;
  IF NEW.public_instagram_url IS NULL AND NEW.instagram_handle IS NOT NULL THEN
    NEW.public_instagram_url := NEW.instagram_handle;
  END IF;
  IF NEW.public_website_url IS NULL AND NEW.website IS NOT NULL THEN
    NEW.public_website_url := NEW.website;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_public_profile_fields_trigger ON user_profiles;
CREATE TRIGGER sync_public_profile_fields_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_public_profile_fields();

-- ============================================================================
-- CREATE PUBLIC PROFILE VIEW (for shareable profile pages)
-- ============================================================================

CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
  id,
  user_id,
  profile_slug,
  profile_url,
  avatar_url,
  qr_code_url,
  public_name as name,
  public_title as title,
  public_company as company,
  public_bio as bio,
  public_linkedin_url as linkedin_url,
  public_twitter_url as twitter_url,
  public_instagram_url as instagram_url,
  public_website_url as website_url,
  user_type
FROM user_profiles
WHERE is_profile_public = true;

-- ============================================================================
-- ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON user_profiles(organization);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles(industry);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON public_user_profiles TO anon, authenticated;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN user_profiles.public_name IS 'Name shown on public/shareable profile';
COMMENT ON COLUMN user_profiles.public_title IS 'Job title shown on public profile';
COMMENT ON COLUMN user_profiles.public_company IS 'Company shown on public profile';
COMMENT ON COLUMN user_profiles.public_bio IS 'Bio shown on public profile';
COMMENT ON COLUMN user_profiles.organization IS 'Private organization/company field';
COMMENT ON COLUMN user_profiles.industry IS 'Industry sector for the user';
COMMENT ON COLUMN user_profiles.dietary_requirements IS 'Dietary requirements for event catering';
COMMENT ON COLUMN user_profiles.special_needs IS 'Special accessibility or other needs';
COMMENT ON VIEW public_user_profiles IS 'Public-facing view of user profiles for shareable profile pages';
