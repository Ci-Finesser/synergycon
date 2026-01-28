-- Create Security Logs Table Migration
-- Stores security audit events for monitoring and compliance

-- Table: security_logs
-- Centralized storage for all security-related events
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  client_id TEXT,
  user_agent TEXT,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_client_id ON security_logs(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_logs_endpoint ON security_logs(endpoint);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_security_logs_type_time ON security_logs(event_type, created_at DESC);

-- RLS Policies for security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs (using service role for inserts)
CREATE POLICY "Admins can view security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Service role can insert logs (bypasses RLS)
-- Application uses service role for logging

-- Function to clean up old logs (keeps last 30 days by default)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security stats for a time window
CREATE OR REPLACE FUNCTION get_security_stats(time_window_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  first_occurrence TIMESTAMPTZ,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.event_type,
    COUNT(*)::BIGINT as event_count,
    MIN(sl.created_at) as first_occurrence,
    MAX(sl.created_at) as last_occurrence
  FROM security_logs sl
  WHERE sl.created_at >= NOW() - (time_window_hours || ' hours')::INTERVAL
  GROUP BY sl.event_type
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (for admin dashboard)
GRANT EXECUTE ON FUNCTION get_security_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_security_logs(INTEGER) TO authenticated;

COMMENT ON TABLE security_logs IS 'Centralized security audit log for all security-related events';
COMMENT ON COLUMN security_logs.event_type IS 'Type of security event (e.g., csrf_violation, successful_login)';
COMMENT ON COLUMN security_logs.endpoint IS 'API endpoint or URL where the event occurred';
COMMENT ON COLUMN security_logs.client_id IS 'Client identifier (IP address or session ID)';
COMMENT ON COLUMN security_logs.metadata IS 'Additional structured data about the event';
