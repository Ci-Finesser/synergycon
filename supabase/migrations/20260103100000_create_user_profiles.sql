/**
 * User Profiles System with Shareable URLs and QR Codes
 * Creates comprehensive user management system
 */

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('attendee', 'speaker', 'partner', 'admin')),
  
  -- Profile information
  phone TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  website TEXT,
  
  -- Social links
  twitter_handle TEXT,
  linkedin_url TEXT,
  instagram_handle TEXT,
  
  -- Shareable profile
  profile_slug TEXT UNIQUE NOT NULL,
  profile_url TEXT UNIQUE NOT NULL,
  qr_code_data TEXT, -- Base64 encoded QR code image
  qr_code_url TEXT, -- URL to stored QR code
  
  -- Avatar/Photo
  avatar_url TEXT,
  
  -- Preferences
  is_profile_public BOOLEAN DEFAULT true,
  allow_messaging BOOLEAN DEFAULT true,
  receive_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_slug ON user_profiles(profile_slug);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('login', 'registration', 'reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_code ON otp_verifications(code);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- NOTE: user_sessions table is now defined in 20260103130000_create_security_tables.sql
-- with a more complete schema including device, location, and last_active fields

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Generate unique profile slug
CREATE OR REPLACE FUNCTION generate_profile_slug(name TEXT, email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name or email
  IF name IS NOT NULL AND name != '' THEN
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  ELSE
    base_slug := lower(split_part(email, '@', 1));
  END IF;
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE profile_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate profile URL
CREATE OR REPLACE FUNCTION generate_profile_url(slug TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://synergycon.live/profile/' || slug;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies

-- user_profiles policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (is_profile_public = true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can create profiles
CREATE POLICY "Authenticated users can create profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- otp_verifications policies
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only service role can access OTPs
CREATE POLICY "Service role can manage OTPs"
ON otp_verifications FOR ALL
TO service_role
USING (true);

-- NOTE: user_sessions table and policies are now defined in 20260103130000_create_security_tables.sql

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON otp_verifications TO service_role;

COMMENT ON TABLE user_profiles IS 'User profiles with shareable URLs and QR codes';
COMMENT ON TABLE otp_verifications IS 'OTP codes for authentication';
COMMENT ON COLUMN user_profiles.profile_slug IS 'Unique slug for profile URL';
COMMENT ON COLUMN user_profiles.profile_url IS 'Full shareable profile URL';
COMMENT ON COLUMN user_profiles.qr_code_data IS 'Base64 encoded QR code';
