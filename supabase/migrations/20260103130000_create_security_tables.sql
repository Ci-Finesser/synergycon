-- Create Security Tables Migration
-- Two-Factor Authentication, Sessions, and Login History

-- Table: user_2fa_secrets
-- Stores 2FA secrets and backup codes for users
CREATE TABLE IF NOT EXISTS user_2fa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table: user_sessions
-- Tracks active user sessions with device and location info
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  device TEXT NOT NULL,
  location TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_token)
);

-- Table: login_history
-- Records all login attempts (successful and failed)
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device TEXT NOT NULL,
  location TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_2fa_secrets_user_id ON user_2fa_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_timestamp ON login_history(timestamp DESC);

-- RLS Policies for user_2fa_secrets
ALTER TABLE user_2fa_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own 2FA settings"
  ON user_2fa_secrets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own 2FA settings"
  ON user_2fa_secrets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON user_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
  ON user_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sessions"
  ON user_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for login_history
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
  ON login_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
  ON login_history
  FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_2fa_secrets updated_at
CREATE TRIGGER update_user_2fa_secrets_updated_at
  BEFORE UPDATE ON user_2fa_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_sessions last_active
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_last_active
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_active();

-- Function to clean up old login history (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_login_history()
RETURNS void AS $$
BEGIN
  DELETE FROM login_history
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_2fa_secrets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT ON login_history TO authenticated;
