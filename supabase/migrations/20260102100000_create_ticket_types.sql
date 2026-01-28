-- Create ticket_types table for managing event tickets
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  benefits JSONB DEFAULT '[]'::jsonb,
  available_quantity INTEGER CHECK (available_quantity >= 0),
  sold_quantity INTEGER DEFAULT 0 CHECK (sold_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  category TEXT, -- 'standard', 'vip', 'early-bird', etc.
  duration TEXT, -- '1-day', '3-day', 'full-event'
  display_order INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ticket_types_ticket_id ON ticket_types(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_is_active ON ticket_types(is_active);
CREATE INDEX IF NOT EXISTS idx_ticket_types_category ON ticket_types(category);
CREATE INDEX IF NOT EXISTS idx_ticket_types_display_order ON ticket_types(display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ticket_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_types_updated_at
  BEFORE UPDATE ON ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_types_updated_at();

-- Insert default ticket types
INSERT INTO ticket_types (ticket_id, name, description, price, benefits, category, duration, display_order, is_active) VALUES
  (
    'standard-day',
    'Standard Day Pass',
    'For 1 day only, get 3 for the 3 days',
    20000,
    '["Day-specific sessions", "Exhibition area access", "Networking opportunities"]'::jsonb,
    'standard',
    '1-day',
    1,
    true
  ),
  (
    'vip-day',
    'VIP Day Pass',
    'For 1 day only, get 3 for the 3 days',
    50000,
    '["VIP lounge access", "Priority seating", "All standard benefits"]'::jsonb,
    'vip',
    '1-day',
    2,
    true
  ),
  (
    '3day-standard',
    '3-Day Standard Access Pass',
    'Full festival experience',
    50000,
    '["All 3 festival days", "All keynotes & panels", "Official swag bag"]'::jsonb,
    'standard',
    '3-day',
    3,
    true
  ),
  (
    '3day-vip',
    '3-Day VIP Access Pass',
    'Premium experience',
    150000,
    '["VIP lounge access", "Priority seating", "Speaker dinner invite"]'::jsonb,
    'vip',
    '3-day',
    4,
    true
  )
ON CONFLICT (ticket_id) DO NOTHING;

-- Add RLS policies
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

-- Allow public to read active tickets
CREATE POLICY "Public can view active tickets"
  ON ticket_types
  FOR SELECT
  USING (is_active = true);

-- Allow admins full access (you'll need to adjust based on your admin auth setup)
CREATE POLICY "Admins can manage all tickets"
  ON ticket_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create view for public ticket listing
CREATE OR REPLACE VIEW public_tickets AS
SELECT 
  id,
  ticket_id,
  name,
  description,
  price,
  benefits,
  available_quantity,
  sold_quantity,
  category,
  duration,
  display_order,
  (available_quantity IS NULL OR available_quantity > sold_quantity) as is_available
FROM ticket_types
WHERE is_active = true
ORDER BY display_order;

-- Grant access to view
GRANT SELECT ON public_tickets TO anon, authenticated;
