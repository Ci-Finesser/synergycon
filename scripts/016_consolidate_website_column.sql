-- Drop the unused website_url column since all data is in the website column
ALTER TABLE sponsors DROP COLUMN IF EXISTS website_url;
