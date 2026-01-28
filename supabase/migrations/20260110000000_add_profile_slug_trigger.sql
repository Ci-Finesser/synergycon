/**
 * Auto-generate profile_slug and profile_url on INSERT
 * 
 * This migration adds a BEFORE INSERT trigger to automatically generate
 * profile_slug and profile_url if not provided, solving the NOT NULL constraint error.
 * 
 * The trigger uses the existing generate_profile_slug() and generate_profile_url() functions.
 */

-- Create trigger function to auto-generate profile fields
CREATE OR REPLACE FUNCTION auto_generate_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided or empty
  IF NEW.profile_slug IS NULL OR NEW.profile_slug = '' THEN
    NEW.profile_slug := generate_profile_slug(NEW.full_name, NEW.email);
  END IF;
  
  -- Generate URL if not provided or empty
  IF NEW.profile_url IS NULL OR NEW.profile_url = '' THEN
    NEW.profile_url := generate_profile_url(NEW.profile_slug);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS auto_generate_profile_fields_trigger ON user_profiles;

-- Create BEFORE INSERT trigger
CREATE TRIGGER auto_generate_profile_fields_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_profile_fields();

-- Also handle UPDATE to regenerate URL if slug changes
CREATE OR REPLACE FUNCTION update_profile_url_on_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If slug changed, update the URL
  IF NEW.profile_slug IS DISTINCT FROM OLD.profile_slug THEN
    NEW.profile_url := generate_profile_url(NEW.profile_slug);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profile_url_trigger ON user_profiles;

CREATE TRIGGER update_profile_url_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_url_on_slug_change();

-- Backfill any existing records that may have NULL profile_slug or profile_url
-- (Safety measure for any records that slipped through)
UPDATE user_profiles
SET 
  profile_slug = generate_profile_slug(full_name, email),
  profile_url = generate_profile_url(generate_profile_slug(full_name, email))
WHERE profile_slug IS NULL OR profile_url IS NULL;

-- Add comment for documentation
COMMENT ON FUNCTION auto_generate_profile_fields() IS 
  'Trigger function to auto-generate profile_slug and profile_url on INSERT if not provided';

COMMENT ON TRIGGER auto_generate_profile_fields_trigger ON user_profiles IS 
  'Auto-generates profile_slug and profile_url when inserting new user profiles';
