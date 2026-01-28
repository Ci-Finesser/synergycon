-- Add Missing Tables, Views, and Functions

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device TEXT,
  location TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  fingerprint TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);

-- Ticket Orders Table
CREATE TABLE IF NOT EXISTS ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  ticket_type_id UUID REFERENCES ticket_types(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_id UUID REFERENCES payments(id),
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_order_number ON ticket_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_customer_email ON ticket_orders(customer_email);

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  session_id UUID REFERENCES schedule_sessions(id),
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT DEFAULT 'qr_scan',
  checked_in_by UUID REFERENCES admin_users(id),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attendance_records_ticket_id ON attendance_records(ticket_id);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- OTP Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);

-- Drop existing views if they have different columns
DROP VIEW IF EXISTS public_tickets;
DROP VIEW IF EXISTS validation_stats;

-- Public Tickets View
CREATE VIEW public_tickets AS
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.price,
  'NGN' as currency,
  tt.category as tier,
  tt.duration,
  tt.available_quantity as quantity_available,
  tt.sold_quantity as quantity_sold,
  (tt.available_quantity - COALESCE(tt.sold_quantity, 0)) as quantity_remaining,
  tt.valid_from as sale_start_date,
  tt.valid_until as sale_end_date,
  tt.is_active,
  tt.benefits as features,
  CASE 
    WHEN tt.valid_from > NOW() THEN 'upcoming'
    WHEN tt.valid_until < NOW() THEN 'ended'
    WHEN (tt.available_quantity - COALESCE(tt.sold_quantity, 0)) <= 0 THEN 'sold_out'
    ELSE 'on_sale'
  END as status
FROM ticket_types tt
WHERE tt.is_active = true;

-- Validation Stats View
CREATE VIEW validation_stats AS
SELECT
  DATE(tv.validated_at) as date,
  COUNT(*) as total_validations,
  COUNT(DISTINCT tv.ticket_number) as unique_tickets,
  COUNT(DISTINCT tv.validated_by) as validators,
  tt.name as ticket_type,
  tt.category as ticket_tier
FROM ticket_validations tv
LEFT JOIN ticket_types tt ON tv.ticket_type_id = tt.id
GROUP BY DATE(tv.validated_at), tt.name, tt.category
ORDER BY date DESC;

-- Drop existing admin functions first (to handle return type changes)
DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_admin_user(UUID);
DROP FUNCTION IF EXISTS get_all_admins();
DROP FUNCTION IF EXISTS verify_admin_login(TEXT, TEXT);

-- Admin Functions
CREATE FUNCTION create_admin_user(p_email TEXT, p_password_hash TEXT, p_name TEXT, p_role TEXT DEFAULT 'admin')
RETURNS UUID AS $$
DECLARE v_admin_id UUID;
BEGIN
  INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at)
  VALUES (p_email, p_password_hash, p_name, p_role, true, NOW())
  RETURNING id INTO v_admin_id;
  RETURN v_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION delete_admin_user(p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_users SET is_active = false, updated_at = NOW() WHERE id = p_admin_id;
  UPDATE admin_sessions SET is_active = false WHERE admin_id = p_admin_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION get_all_admins()
RETURNS TABLE (id UUID, email TEXT, name TEXT, role TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, last_login_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY SELECT a.id, a.email, a.name, a.role, a.is_active, a.created_at, a.last_login_at FROM admin_users a ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION verify_admin_login(p_email TEXT, p_password_hash TEXT)
RETURNS TABLE (id UUID, email TEXT, name TEXT, role TEXT, is_valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT a.id, a.email, a.name, a.role, (a.password_hash = p_password_hash AND a.is_active = true) as is_valid FROM admin_users a WHERE a.email = p_email LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System manages admin_sessions" ON admin_sessions FOR ALL TO service_role USING (true);
CREATE POLICY "System manages ticket_orders" ON ticket_orders FOR ALL TO service_role USING (true);
CREATE POLICY "System manages attendance_records" ON attendance_records FOR ALL TO service_role USING (true);
CREATE POLICY "System manages audit_logs" ON audit_logs FOR ALL TO service_role USING (true);
CREATE POLICY "System manages otp_codes" ON otp_codes FOR ALL TO service_role USING (true);

-- Grants
GRANT SELECT ON public_tickets TO anon, authenticated;
GRANT SELECT ON validation_stats TO authenticated;
GRANT ALL ON admin_sessions, ticket_orders, attendance_records, audit_logs, otp_codes TO service_role;
