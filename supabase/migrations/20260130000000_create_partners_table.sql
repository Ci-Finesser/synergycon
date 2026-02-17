-- Create Partners Table
-- This table stores partner/sponsor organization data for SynergyCon 2026

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  bio TEXT,
  tier VARCHAR(50) NOT NULL DEFAULT 'community',
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  contact_email VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_partners_tier ON public.partners(tier);
CREATE INDEX IF NOT EXISTS idx_partners_category ON public.partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_display_order ON public.partners(display_order);
CREATE INDEX IF NOT EXISTS idx_partners_featured ON public.partners(featured);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved/live partners
CREATE POLICY "Anyone can view live partners"
  ON public.partners
  FOR SELECT
  USING (status = 'live');

-- Policy: Admins can manage partners via service role (RLS bypassed)
-- Admin access is handled at the API level with service role key
-- Individual user access can be added later if needed via JSONB roles in user_profiles

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_partners_updated_at ON public.partners;
CREATE TRIGGER trigger_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- Comment on table
COMMENT ON TABLE public.partners IS 'Partner and sponsor organizations for SynergyCon 2026';
