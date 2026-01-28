-- Drop existing CHECK constraints
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_category_check;
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_tier_check;

-- Rename tier column to sub_category if it exists, or add sub_category if it doesn't
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier') THEN
        ALTER TABLE sponsors RENAME COLUMN tier TO sub_category;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'sub_category') THEN
        ALTER TABLE sponsors ADD COLUMN sub_category TEXT;
    END IF;
END $$;

-- Update category column to allow new values
ALTER TABLE sponsors 
ADD CONSTRAINT sponsors_category_check CHECK (
    category IN ('Sponsors', 'Partners', 'Media & Entertainment', 'Vendors', 'Product Showcase')
);

-- Update sub_category to allow all sub-category values
ALTER TABLE sponsors 
ADD CONSTRAINT sponsors_sub_category_check CHECK (
    sub_category IN (
        'Headline', 'Silver', 'Gold', 'Platinum', 'Diamond',
        'Principal', 'Community', 'Ecosystem', 'Brand Collaboration'
    )
);
