-- Add status column to speakers table
ALTER TABLE speakers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'live'
CHECK (status IN ('draft', 'live'));

-- Add status column to sponsors table
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'live'
CHECK (status IN ('draft', 'live'));

-- Update existing records to be 'live'
UPDATE speakers SET status = 'live' WHERE status IS NULL;
UPDATE sponsors SET status = 'live' WHERE status IS NULL;

-- Add application_id to track which application created this entry
ALTER TABLE speakers
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES speaker_applications(id) ON DELETE SET NULL;

ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES partnership_applications(id) ON DELETE SET NULL;

SELECT 'Successfully added status columns and application tracking to speakers and sponsors tables' as result;
