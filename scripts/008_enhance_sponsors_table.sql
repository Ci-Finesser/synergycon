-- Enhance sponsors table with additional fields for the new partnership system
ALTER TABLE sponsors 
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('government', 'corporate', 'financial', 'community', 'entertainment', 'other')) DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS sub_category TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_sponsors_category ON sponsors(category);
CREATE INDEX IF NOT EXISTS idx_sponsors_featured ON sponsors(featured);

-- Create partnership_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS partnership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  company_description TEXT NOT NULL,
  partnership_interests TEXT,
  marketing_reach TEXT,
  why_partner TEXT,
  partnership_tier TEXT CHECK (partnership_tier IN ('silver', 'gold', 'platinum', 'diamond', 'none')),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on partnership_applications
ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for partnership_applications
CREATE POLICY "Anyone can submit partnership applications" 
  ON partnership_applications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications" 
  ON partnership_applications FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update applications" 
  ON partnership_applications FOR UPDATE 
  USING (auth.role() = 'authenticated');
