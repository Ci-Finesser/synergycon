-- Create admin_2fa_secrets table
CREATE TABLE IF NOT EXISTS admin_2fa_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    secret TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id)
);

-- Create admin_2fa_codes table for storing OTP codes
CREATE TABLE IF NOT EXISTS admin_2fa_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_2fa_codes_admin_id ON admin_2fa_codes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_2fa_codes_expires_at ON admin_2fa_codes(expires_at);

-- Enable RLS
ALTER TABLE admin_2fa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_2fa_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_2fa_secrets
CREATE POLICY "Admins can view their own 2FA secrets"
    ON admin_2fa_secrets FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert their own 2FA secrets"
    ON admin_2fa_secrets FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update their own 2FA secrets"
    ON admin_2fa_secrets FOR UPDATE
    USING (true);

-- Create policies for admin_2fa_codes
CREATE POLICY "Admins can view their own 2FA codes"
    ON admin_2fa_codes FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert their own 2FA codes"
    ON admin_2fa_codes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update their own 2FA codes"
    ON admin_2fa_codes FOR UPDATE
    USING (true);

-- Function to generate a random 6-digit OTP code
CREATE OR REPLACE FUNCTION generate_2fa_code(p_admin_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate a random 6-digit code
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Set expiration to 10 minutes from now
    v_expires_at := NOW() + INTERVAL '10 minutes';
    
    -- Insert the code
    INSERT INTO admin_2fa_codes (admin_id, code, expires_at)
    VALUES (p_admin_id, v_code, v_expires_at);
    
    RETURN v_code;
END;
$$;

-- Function to verify 2FA code
CREATE OR REPLACE FUNCTION verify_2fa_code(p_admin_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_valid BOOLEAN;
BEGIN
    -- Check if code exists, is not used, and hasn't expired
    SELECT EXISTS(
        SELECT 1 FROM admin_2fa_codes
        WHERE admin_id = p_admin_id
        AND code = p_code
        AND is_used = false
        AND expires_at > NOW()
    ) INTO v_valid;
    
    -- If valid, mark as used
    IF v_valid THEN
        UPDATE admin_2fa_codes
        SET is_used = true, updated_at = NOW()
        WHERE admin_id = p_admin_id
        AND code = p_code
        AND is_used = false;
    END IF;
    
    RETURN v_valid;
END;
$$;

-- Function to enable 2FA for admin
CREATE OR REPLACE FUNCTION enable_admin_2fa(p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update 2FA secret
    INSERT INTO admin_2fa_secrets (admin_id, secret, is_enabled)
    VALUES (p_admin_id, encode(gen_random_bytes(32), 'base64'), true)
    ON CONFLICT (admin_id)
    DO UPDATE SET is_enabled = true, updated_at = NOW();
    
    RETURN true;
END;
$$;

-- Function to check if admin has 2FA enabled
CREATE OR REPLACE FUNCTION check_admin_2fa_status(p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enabled BOOLEAN;
BEGIN
    SELECT COALESCE(is_enabled, false)
    INTO v_enabled
    FROM admin_2fa_secrets
    WHERE admin_id = p_admin_id;
    
    RETURN COALESCE(v_enabled, false);
END;
$$;

-- Function to clean up expired codes (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM admin_2fa_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;
