/**
 * Add partnership_type column to partnership_applications table
 * Allows categorization of partners by type: sponsor, exhibitor, media, vendor
 */

-- Add partnership_type column
ALTER TABLE partnership_applications 
ADD COLUMN IF NOT EXISTS partnership_type TEXT 
CHECK (partnership_type IN ('sponsor', 'exhibitor', 'media', 'vendor'));

-- Create index for partnership_type filtering
CREATE INDEX IF NOT EXISTS idx_partnership_applications_type ON partnership_applications(partnership_type);

-- Add comment for documentation
COMMENT ON COLUMN partnership_applications.partnership_type IS 'Type of partnership: sponsor, exhibitor, media, or vendor';
