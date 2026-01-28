-- Create tickets table for individual ticket tracking
-- Links tickets to orders and users, tracks QR codes and status

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('early_bird', 'regular', 'vip', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled', 'expired')),
  qr_code TEXT UNIQUE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  event_date TEXT NOT NULL,
  seat_number TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ticket_number TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES admin_users(id),
  transferred_from UUID REFERENCES auth.users(id),
  transferred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table for enterprise ticket management
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ticket_transfers table for tracking ownership changes
CREATE TABLE IF NOT EXISTS ticket_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  transferred_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_email ON tickets(attendee_email);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_ticket_id ON team_members(ticket_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket_id ON ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_from_user ON ticket_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to_user ON ticket_transfers(to_user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();

CREATE TRIGGER trigger_update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();

-- RLS Policies for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own non-validated tickets"
  ON tickets
  FOR UPDATE
  USING (auth.uid() = user_id AND validated_at IS NULL);

CREATE POLICY "Admins can view all tickets"
  ON tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tickets"
  ON tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own team members"
  ON team_members
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own team members"
  ON team_members
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ticket_transfers
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers involving them"
  ON ticket_transfers
  FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Admins can view all transfers"
  ON ticket_transfers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Function to generate QR code data
CREATE OR REPLACE FUNCTION generate_ticket_qr_data(ticket_id UUID)
RETURNS TEXT AS $$
DECLARE
  ticket_data RECORD;
  qr_data TEXT;
BEGIN
  SELECT * INTO ticket_data FROM tickets WHERE id = ticket_id;
  
  qr_data := 'TICKET:' || ticket_data.ticket_number || 
             ':' || ticket_data.attendee_email ||
             ':' || ticket_data.event_date ||
             ':' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  RETURN qr_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check ticket validity
CREATE OR REPLACE FUNCTION is_ticket_valid(ticket_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ticket_data RECORD;
BEGIN
  SELECT * INTO ticket_data FROM tickets WHERE id = ticket_id;
  
  IF ticket_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF ticket_data.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  IF ticket_data.validated_at IS NOT NULL THEN
    RETURN FALSE; -- Already used
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO authenticated;
GRANT SELECT, INSERT ON ticket_transfers TO authenticated;
