-- Migration: Add roles column to user_profiles and users
-- Date: 2026-01-03
-- Description: Updates user system to support UserRoles with default and supplementary roles

-- Add roles column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '{"default": "attendee"}'::JSONB;

-- Create index on roles for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles ON user_profiles USING GIN (roles);

-- Update existing profiles to have default roles based on user_type
UPDATE user_profiles
SET roles = CASE 
  WHEN user_type = 'individual' THEN '{"default": "attendee"}'::JSONB
  WHEN user_type = 'enterprise' THEN '{"default": "sponsor"}'::JSONB
  ELSE '{"default": "attendee"}'::JSONB
END
WHERE roles IS NULL OR roles = '{}'::JSONB;

-- Add comment
COMMENT ON COLUMN user_profiles.roles IS 'User roles with default and optional supplementary roles: {"default": "attendee|speaker|sponsor|partner|admin", "supplementary": ["role1", "role2"]}';

-- Create function to validate roles structure
CREATE OR REPLACE FUNCTION validate_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if roles is a valid JSON object
  IF NEW.roles IS NULL THEN
    NEW.roles := '{"default": "attendee"}'::JSONB;
  END IF;

  -- Ensure default role exists
  IF NOT (NEW.roles ? 'default') THEN
    RAISE EXCEPTION 'roles must have a default key';
  END IF;

  -- Validate default role value
  IF NEW.roles->>'default' NOT IN ('attendee', 'speaker', 'sponsor', 'partner', 'admin') THEN
    RAISE EXCEPTION 'Invalid default role: %', NEW.roles->>'default';
  END IF;

  -- Validate supplementary roles if present
  IF NEW.roles ? 'supplementary' THEN
    IF jsonb_typeof(NEW.roles->'supplementary') != 'array' THEN
      RAISE EXCEPTION 'supplementary must be an array';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate roles on insert/update
DROP TRIGGER IF EXISTS validate_user_roles_trigger ON user_profiles;
CREATE TRIGGER validate_user_roles_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_roles();

-- Add helper function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(
  user_roles JSONB,
  check_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check default role
  IF user_roles->>'default' = check_role THEN
    RETURN TRUE;
  END IF;

  -- Check supplementary roles
  IF user_roles ? 'supplementary' THEN
    RETURN user_roles->'supplementary' @> to_jsonb(check_role);
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add helper function to add supplementary role
CREATE OR REPLACE FUNCTION add_supplementary_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS VOID AS $$
DECLARE
  current_roles JSONB;
  supplementary_roles JSONB;
BEGIN
  -- Get current roles
  SELECT roles INTO current_roles
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Validate role
  IF p_role NOT IN ('attendee', 'speaker', 'sponsor', 'partner', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Check if already default role
  IF current_roles->>'default' = p_role THEN
    RAISE EXCEPTION 'Role % is already the default role', p_role;
  END IF;

  -- Get current supplementary roles
  IF current_roles ? 'supplementary' THEN
    supplementary_roles := current_roles->'supplementary';
    
    -- Check if already exists
    IF supplementary_roles @> to_jsonb(p_role) THEN
      RAISE EXCEPTION 'Role % already exists in supplementary roles', p_role;
    END IF;
    
    -- Add new role
    supplementary_roles := supplementary_roles || to_jsonb(p_role);
  ELSE
    -- Create new supplementary array
    supplementary_roles := to_jsonb(ARRAY[p_role]);
  END IF;

  -- Update profile
  UPDATE user_profiles
  SET roles = jsonb_set(current_roles, '{supplementary}', supplementary_roles)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Add helper function to remove supplementary role
CREATE OR REPLACE FUNCTION remove_supplementary_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS VOID AS $$
DECLARE
  current_roles JSONB;
  supplementary_roles JSONB;
BEGIN
  -- Get current roles
  SELECT roles INTO current_roles
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Check if supplementary exists
  IF NOT (current_roles ? 'supplementary') THEN
    RAISE EXCEPTION 'No supplementary roles to remove';
  END IF;

  supplementary_roles := current_roles->'supplementary';

  -- Remove the role
  supplementary_roles := supplementary_roles - p_role;

  -- Update profile
  UPDATE user_profiles
  SET roles = CASE 
    WHEN jsonb_array_length(supplementary_roles) = 0 THEN current_roles - 'supplementary'
    ELSE jsonb_set(current_roles, '{supplementary}', supplementary_roles)
  END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT add_supplementary_role('user-uuid-here', 'speaker');
-- SELECT remove_supplementary_role('user-uuid-here', 'speaker');
-- SELECT user_has_role(roles, 'speaker') FROM user_profiles WHERE user_id = 'user-uuid-here';
