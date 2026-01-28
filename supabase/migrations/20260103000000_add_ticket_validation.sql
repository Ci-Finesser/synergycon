-- Add ticket validation tracking system
-- This tracks individual ticket redemptions/check-ins

CREATE TABLE IF NOT EXISTS ticket_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL,
  order_id TEXT,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  attendee_name TEXT,
  attendee_email TEXT,
  validated_at TIMESTAMPTZ DEFAULT NOW(),
  validated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  validation_location TEXT,
  validation_notes TEXT,
  is_valid BOOLEAN DEFAULT true,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_validations_ticket_number ON ticket_validations(ticket_number);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_order_id ON ticket_validations(order_id);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_validated_at ON ticket_validations(validated_at);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_validated_by ON ticket_validations(validated_by);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_ticket_type ON ticket_validations(ticket_type_id);

-- Add validation status to track if ticket has been used
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT true;

-- Create view for validation statistics
CREATE OR REPLACE VIEW validation_stats AS
SELECT 
  tt.id as ticket_type_id,
  tt.name as ticket_type_name,
  tt.ticket_id,
  COUNT(tv.id) as total_validations,
  COUNT(DISTINCT tv.ticket_number) as unique_tickets_validated,
  COUNT(CASE WHEN tv.validated_at::date = CURRENT_DATE THEN 1 END) as validations_today,
  MAX(tv.validated_at) as last_validation
FROM ticket_types tt
LEFT JOIN ticket_validations tv ON tt.id = tv.ticket_type_id
GROUP BY tt.id, tt.name, tt.ticket_id;

-- Add RLS policies for ticket validations
ALTER TABLE ticket_validations ENABLE ROW LEVEL SECURITY;

-- Admins can view all validations
CREATE POLICY "Admins can view all validations"
  ON ticket_validations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can create validations
CREATE POLICY "Admins can create validations"
  ON ticket_validations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can update validations
CREATE POLICY "Admins can update validations"
  ON ticket_validations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Grant access to view
GRANT SELECT ON validation_stats TO authenticated;

-- Create function to check if ticket is already validated
CREATE OR REPLACE FUNCTION is_ticket_validated(ticket_num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ticket_validations
    WHERE ticket_number = ticket_num
    AND is_valid = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get ticket validation count
CREATE OR REPLACE FUNCTION get_ticket_validation_count(ticket_num TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM ticket_validations
    WHERE ticket_number = ticket_num
    AND is_valid = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
