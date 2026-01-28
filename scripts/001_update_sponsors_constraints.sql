-- Delete existing data before updating constraints to avoid conflicts
DELETE FROM sponsors;

-- Drop old CHECK constraints
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_category_check;
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_tier_check;

-- Add new CHECK constraints for the updated category system
ALTER TABLE sponsors ADD CONSTRAINT sponsors_category_check 
CHECK (category IN ('Sponsors', 'Partners', 'Media & Entertainment', 'Vendors', 'Product Showcase'));

ALTER TABLE sponsors ADD CONSTRAINT sponsors_sub_category_check 
CHECK (
  (category = 'Sponsors' AND sub_category IN ('Headline', 'Silver', 'Gold', 'Platinum', 'Diamond')) OR
  (category = 'Partners' AND sub_category IN ('Principal', 'Community', 'Ecosystem', 'Brand Collaboration')) OR
  (category IN ('Media & Entertainment', 'Vendors', 'Product Showcase') AND sub_category IS NULL)
);
