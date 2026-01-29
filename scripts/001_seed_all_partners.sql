-- Clear existing sponsors data
TRUNCATE TABLE sponsors CASCADE;

-- Insert all 19 partners with correct categorization

-- FINESSER LTD (appears in both Sponsor and Partner)
INSERT INTO sponsors (name, logo_url, tier, category, sub_category, description, website_url, display_order, featured) VALUES
('Finesser Ltd', '/images/finesser-ltd.png', 'headline', 'sponsors', 'headline', 'Headline Sponsor of SynergyCon 2025', 'https://finesser.co', 1, true),
('Finesser Ltd', '/images/finesser-ltd.png', 'principal', 'partners', 'principal', 'Principal Partner of SynergyCon 2025', 'https://finesser.co', 2, true);

-- STERLING BANK - Partner (Principal)
INSERT INTO sponsors (name, logo_url, tier, category, sub_category, description, display_order, featured) VALUES
('Sterling Bank', '/images/sterling-bank.png', 'principal', 'partners', 'principal', 'Your One Customer Bank', 3, true);

-- ECOSYSTEM PARTNERS
INSERT INTO sponsors (name, logo_url, tier, category, sub_category, description, display_order) VALUES
('Federal Ministry of Youth Development', '/images/federal-ministry-of-youth-development.png', 'ecosystem', 'partners', 'ecosystem', 'Supporting youth development across Nigeria', 4),
('Lagos State Government', '/images/lagos-state-government.png', 'ecosystem', 'partners', 'ecosystem', 'Centre of Excellence', 5),
('Nigerian Youth Academy', '/images/nigerian-youth-academy.png', 'ecosystem', 'partners', 'ecosystem', 'Building capacity for Nigerian youth', 6),
('Lagos State Tourism, Arts & Culture', '/images/lagos-state-tourism-arts-and-culture.png', 'ecosystem', 'partners', 'ecosystem', 'Promoting tourism, arts and culture in Lagos', 7),
('Afe Babalola & Co', '/images/afe-babalola-co.png', 'ecosystem', 'partners', 'ecosystem', 'Leading law firm in Nigeria', 8),
('Ajike People Support Centre', '/images/ajike-people-support-centre.png', 'ecosystem', 'partners', 'ecosystem', 'Empowering communities through support services', 9),
('Aristokrat', '/images/aristokrat.png', 'ecosystem', 'partners', 'ecosystem', 'Music and entertainment excellence', 10),
('Asolar Nigeria', '/images/asolar-nigeria.png', 'ecosystem', 'partners', 'ecosystem', 'Solar energy solutions', 11),
('City FM', '/images/city-fm.png', 'ecosystem', 'partners', 'ecosystem', 'Your number one radio station', 12),
('Emblue', '/images/emblue.png', 'ecosystem', 'partners', 'ecosystem', 'Digital marketing solutions', 13),
('Future Nigeria', '/images/future-Nigeria.png', 'ecosystem', 'partners', 'ecosystem', 'Investment fund for Nigerian startups', 14),
('Nelson Jack Solutions', '/images/nelson-jack-solutions.png', 'ecosystem', 'partners', 'ecosystem', 'Stage, Sound, Light, Screen solutions', 15),
('Pelham Solicitors & Advocates', '/images/pelham-solicitors-advocates.png', 'ecosystem', 'partners', 'ecosystem', 'Legal services and advocacy', 16),
('Sodium Brand Solutions', '/images/sodium-brand-solutions.png', 'ecosystem', 'partners', 'ecosystem', 'Creative brand solutions', 17),
('The Plug', '/images/the-plug.png', 'ecosystem', 'partners', 'ecosystem', 'Connecting opportunities', 18),
('Wakanow', '/images/wakanow.png', 'ecosystem', 'partners', 'ecosystem', 'Your trusted travel partner', 19);
