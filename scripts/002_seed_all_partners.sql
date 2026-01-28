-- Clear existing data
DELETE FROM sponsors;

-- Insert all 19 partners with correct categorization
-- All partners marked as featured=true for landing page carousel

-- 1. Finesser Ltd - Headline Sponsor
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Finesser Ltd',
    '/images/finesser-ltd.png',
    'https://finesser.co',
    'Sponsors',
    'Headline',
    'Premium creative and event solutions provider',
    true
);

-- 2. Finesser Ltd - Principal Partner (same company, different category)
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Finesser Ltd',
    '/images/finesser-ltd.png',
    'https://finesser.co',
    'Partners',
    'Principal',
    'Premium creative and event solutions provider',
    true
);

-- 3. Sterling Bank - Principal Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Sterling Bank',
    '/images/sterling-bank.png',
    'https://sterling.ng',
    'Partners',
    'Principal',
    'Your One Customer Bank - Providing innovative banking solutions',
    true
);

-- 4. Federal Ministry of Youth Development - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Federal Ministry of Youth Development',
    '/images/federal-ministry-of-youth-development.png',
    'https://fmyd.gov.ng',
    'Partners',
    'Ecosystem',
    'Empowering Nigerian youth through development programs and initiatives',
    true
);

-- 5. Lagos State Government - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Lagos State Government',
    '/images/lagos-state-government.png',
    'https://lagosstate.gov.ng',
    'Partners',
    'Ecosystem',
    'Government of Lagos State - Building a greater Lagos',
    true
);

-- 6. Nigerian Youth Academy - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Nigerian Youth Academy Community',
    '/images/nigerian-youth-academy.png',
    'https://niya.ng',
    'Partners',
    'Ecosystem',
    'Building capacity and empowering Nigerian youth for excellence',
    true
);

-- 7. Lagos State Tourism, Arts & Culture - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Lagos State Tourism, Arts & Culture',
    '/images/lagos-state-tourism-arts-and-culture.png',
    'https://tourism.lagosstate.gov.ng',
    'Partners',
    'Ecosystem',
    'Promoting tourism, arts and cultural heritage in Lagos State',
    true
);

-- 8. Afe Babalola & Co - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Afe Babalola & Co.',
    '/images/afe-babalola-co.png',
    'https://afebabalola.com',
    'Partners',
    'Ecosystem',
    'Leading law firm providing comprehensive legal services',
    true
);

-- 9. Ajike People Support Centre - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Ajike People Support Centre',
    '/images/ajike-people-support-centre.png',
    'https://ajikepsc.org',
    'Partners',
    'Ecosystem',
    'Community empowerment through sustainable support programs - We rise by lifting others',
    true
);

-- 10. Aristokrat - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Aristokrat',
    '/images/aristokrat.png',
    'https://aristokrat.com',
    'Partners',
    'Ecosystem',
    'Leading entertainment and music industry brand',
    true
);

-- 11. Asolar Nigeria - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Asolar Nigeria',
    '/images/asolar-nigeria.png',
    'https://asolar.ng',
    'Partners',
    'Ecosystem',
    'Providing sustainable solar energy solutions across emerging markets',
    true
);

-- 12. City FM - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'City FM 105.1',
    '/images/city-fm.png',
    'https://cityfm.ng',
    'Partners',
    'Ecosystem',
    'Lagos leading radio station - Your source for news, entertainment and music',
    true
);

-- 13. Emblue - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Emblue',
    '/images/emblue.png',
    'https://emblue.com',
    'Partners',
    'Ecosystem',
    'Digital marketing and communication solutions',
    true
);

-- 14. Future Africa - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Future Africa',
    '/images/future-africa.png',
    'https://future.africa',
    'Partners',
    'Ecosystem',
    'The Fund for Africa''s Future - Investing in African innovation and entrepreneurs',
    true
);

-- 15. Nelson Jack Solutions - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Nelson Jack Solutions',
    '/images/nelson-jack-solutions.png',
    'https://nelsonjack.com',
    'Partners',
    'Ecosystem',
    'Stage, Sound, Light, Screen - Premium event production services',
    true
);

-- 16. Pelham Solicitors & Advocates - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Pelham Solicitors & Advocates',
    '/images/pelham-solicitors-advocates.png',
    'https://pelhamsolicitors.com',
    'Partners',
    'Ecosystem',
    'Professional legal services and advocacy',
    true
);

-- 17. Sodium Brand Solutions - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Sodium Brand Solutions',
    '/images/sodium-brand-solutions.png',
    'https://sodiumbrandsolutions.com',
    'Partners',
    'Ecosystem',
    'Innovative branding and marketing solutions for businesses',
    true
);

-- 18. The Plug - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'The Plug',
    '/images/the-plug.png',
    'https://theplug.ng',
    'Partners',
    'Ecosystem',
    'Connecting brands with culture - Music industry insights and entertainment consulting',
    true
);

-- 19. Wakanow - Ecosystem Partner
INSERT INTO sponsors (name, logo_url, website_url, category, sub_category, bio, featured)
VALUES (
    'Wakanow',
    '/images/wakanow.png',
    'https://wakanow.com',
    'Partners',
    'Ecosystem',
    'Africa''s leading online travel company - Making travel accessible and affordable',
    true
);
