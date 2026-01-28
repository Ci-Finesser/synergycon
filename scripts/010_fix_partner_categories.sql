-- Fix the sponsors table to match the correct category structure
-- Categories: sponsors, partners, media_entertainment, vendors, product_showcase
-- Tiers for Sponsors: headline, silver, gold, platinum, diamond
-- Tiers for Partners: principal, community, ecosystem, brand_collaboration

ALTER TABLE sponsors 
  DROP CONSTRAINT IF EXISTS sponsors_category_check;

ALTER TABLE sponsors 
  ADD CONSTRAINT sponsors_category_check 
  CHECK (category IN ('sponsors', 'partners', 'media_entertainment', 'vendors', 'product_showcase'));

-- Update tier constraints
ALTER TABLE sponsors 
  DROP CONSTRAINT IF EXISTS sponsors_tier_check;

-- No tier constraint as tiers are category-specific

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsors_category_tier ON sponsors(category, tier);

COMMENT ON COLUMN sponsors.category IS 'Main category: sponsors, partners, media_entertainment, vendors, product_showcase';
COMMENT ON COLUMN sponsors.tier IS 'For sponsors: headline, silver, gold, platinum, diamond. For partners: principal, community, ecosystem, brand_collaboration';
