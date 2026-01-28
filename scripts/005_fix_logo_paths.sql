-- Update logo paths to match uploaded filenames
UPDATE sponsors 
SET logo_url = '/images/lagos-state-tourism-arts-culture.png'
WHERE name = 'Lagos State Tourism, Arts & Culture';

UPDATE sponsors 
SET logo_url = '/images/nelson-jack.png'
WHERE name = 'Nelson Jack Solutions';
