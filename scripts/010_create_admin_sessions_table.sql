-- Create admin_sessions table for tracking active sessions across devices
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location_city TEXT,
  location_country TEXT,
  is_current BOOLEAN DEFAULT false,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_activity ON admin_sessions(last_activity);

-- Enable Row Level Security
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can only view their own sessions
CREATE POLICY admin_sessions_select_policy ON admin_sessions
  FOR SELECT
  USING (auth.uid() = admin_id);

-- Policy: Admins can delete their own sessions (for logout/revoke)
CREATE POLICY admin_sessions_delete_policy ON admin_sessions
  FOR DELETE
  USING (auth.uid() = admin_id);

-- Policy: System can insert sessions (via service role)
CREATE POLICY admin_sessions_insert_policy ON admin_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update sessions (via service role for last_activity)
CREATE POLICY admin_sessions_update_policy ON admin_sessions
  FOR UPDATE
  USING (auth.uid() = admin_id OR auth.role() = 'service_role');

-- Function to automatically clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- Uncomment if your Supabase project has pg_cron enabled:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions()');

COMMENT ON TABLE admin_sessions IS 'Tracks active admin sessions across multiple devices';
COMMENT ON COLUMN admin_sessions.session_token IS 'Unique token for session validation';
COMMENT ON COLUMN admin_sessions.is_current IS 'Indicates if this is the current session for the device viewing the dashboard';
COMMENT ON COLUMN admin_sessions.last_activity IS 'Timestamp of last API request made with this session';
COMMENT ON COLUMN admin_sessions.expires_at IS 'When this session expires (typically 7-30 days from login)';
