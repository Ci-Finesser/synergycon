-- ============================================================================
-- SEED CORE CONTENT DATA
-- Sample data for speakers, sponsors, schedule, and gallery
-- Created: 2026-01-29
-- ============================================================================

-- First, drop all problematic sponsor check constraints if they exist
DO $$
BEGIN
  -- Drop category check constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sponsors_category_check') THEN
    ALTER TABLE sponsors DROP CONSTRAINT sponsors_category_check;
  END IF;
  
  -- Drop sub_category check constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sponsors_sub_category_check') THEN
    ALTER TABLE sponsors DROP CONSTRAINT sponsors_sub_category_check;
  END IF;
  
  -- Drop tier check constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sponsors_tier_check') THEN
    ALTER TABLE sponsors DROP CONSTRAINT sponsors_tier_check;
  END IF;
END $$;

-- ============================================================================
-- SPEAKERS - Sample data
-- ============================================================================
INSERT INTO speakers (name, title, bio, company, image_url, topic, featured, display_order, event_day, status)
VALUES
  (
    'Dr. Ngozi Okonkwo',
    'CEO & Creative Director',
    'Dr. Ngozi Okonkwo is a visionary leader in Nigeria''s creative economy, with over 15 years of experience transforming African narratives through digital innovation. She has led multiple award-winning campaigns and is a frequent speaker at international conferences.',
    'Creative Africa Labs',
    '/images/speaker-1.jpg',
    'The Future of African Creative Industries',
    true,
    1,
    1,
    'live'
  ),
  (
    'Chukwuemeka Adeyemi',
    'Founder & Tech Innovator',
    'Chukwuemeka is the founder of TechBridge Africa, a platform connecting African creatives with global opportunities. His work has been featured in Forbes Africa and he has mentored over 500 young entrepreneurs.',
    'TechBridge Africa',
    '/images/speaker-2.jpg',
    'Building Sustainable Creative Businesses',
    true,
    2,
    1,
    'live'
  ),
  (
    'Amara Obi',
    'Fashion Designer & Entrepreneur',
    'Amara Obi is an internationally acclaimed fashion designer whose work celebrates African heritage while pushing contemporary boundaries. Her designs have graced runways in Paris, Milan, and Lagos.',
    'Amara Couture',
    '/images/speaker-3.jpg',
    'Fashion as Cultural Expression',
    true,
    3,
    2,
    'live'
  ),
  (
    'Oluwaseun Bakare',
    'Music Producer & Label Owner',
    'Oluwaseun has produced multiple platinum records and runs one of West Africa''s most successful independent labels. He is passionate about protecting artists'' rights and building sustainable music careers.',
    'Afrobeats Global',
    '/images/speaker-4.jpg',
    'The Business of Afrobeats',
    false,
    4,
    2,
    'live'
  ),
  (
    'Dr. Fatima Hassan',
    'Cultural Economist',
    'Dr. Hassan is a leading researcher on the economic impact of creative industries in Africa. Her work has informed policy decisions across multiple African nations.',
    'University of Lagos',
    '/images/speaker-5.jpg',
    'Measuring Creative Economy Impact',
    false,
    5,
    3,
    'live'
  ),
  (
    'Tunde Kelani',
    'Film Director & Storyteller',
    'A legendary figure in Nollywood, Tunde has directed over 30 films and is known for his commitment to authentic African storytelling. His films have won numerous international awards.',
    'Mainframe Productions',
    '/images/speaker-6.jpg',
    'Preserving Culture Through Film',
    true,
    6,
    3,
    'live'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SPONSORS - Sample data  
-- Using only core columns that definitely exist
-- ============================================================================
INSERT INTO sponsors (name, tier, logo_url, description, category, featured, display_order, status)
VALUES
  (
    'First Bank of Nigeria',
    'principal',
    '/images/sponsors/firstbank-logo.png',
    'Nigeria''s premier banking institution, supporting creative entrepreneurs and the arts.',
    'finance',
    true,
    1,
    'live'
  ),
  (
    'MTN Nigeria',
    'principal',
    '/images/sponsors/mtn-logo.png',
    'Connecting Africa through telecommunications and supporting digital creativity.',
    'technology',
    true,
    2,
    'live'
  ),
  (
    'Dangote Industries',
    'principal',
    '/images/sponsors/dangote-logo.png',
    'Africa''s largest industrial conglomerate, investing in Nigeria''s creative future.',
    'industry',
    true,
    3,
    'live'
  ),
  (
    'Access Bank',
    'ecosystem',
    '/images/sponsors/access-logo.png',
    'Empowering businesses and creatives across Africa.',
    'finance',
    false,
    4,
    'live'
  ),
  (
    'Nigerian Breweries',
    'ecosystem',
    '/images/sponsors/nb-logo.png',
    'Celebrating Nigerian culture and creativity.',
    'consumer',
    false,
    5,
    'live'
  ),
  (
    'Globacom',
    'ecosystem',
    '/images/sponsors/glo-logo.png',
    'Proudly Nigerian, connecting creatives worldwide.',
    'technology',
    false,
    6,
    'live'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SCHEDULE SESSIONS - Sample data
-- ============================================================================
INSERT INTO schedule_sessions (day, district, date, time, title, description, session_type, location, venue, speaker, capacity)
VALUES
  -- Day 1
  (1, 'Main Conference', '2026-03-15', '09:00', 'Opening Ceremony', 'Welcome to SynergyCon 2026! Join us for an inspiring opening ceremony celebrating Nigeria''s creative economy.', 'Keynote', 'Main Hall', 'Eko Convention Centre', 'Conference Host', 500),
  (1, 'Main Conference', '2026-03-15', '10:00', 'The Future of African Creative Industries', 'A deep dive into the trends shaping Africa''s creative future.', 'Keynote', 'Main Hall', 'Eko Convention Centre', 'Dr. Ngozi Okonkwo', 500),
  (1, 'Business Track', '2026-03-15', '11:30', 'Building Sustainable Creative Businesses', 'Learn how to build a creative business that lasts.', 'Panel', 'Room A', 'Eko Convention Centre', 'Chukwuemeka Adeyemi', 150),
  (1, 'Networking', '2026-03-15', '14:00', 'Networking Lunch', 'Connect with fellow creatives and industry leaders.', 'Networking', 'Garden Area', 'Eko Convention Centre', 'All Attendees', 500),
  (1, 'Workshop Zone', '2026-03-15', '15:30', 'Creative Tech Workshop', 'Hands-on workshop exploring AI and creative tools.', 'Workshop', 'Tech Lab', 'Eko Convention Centre', 'Tech Partners', 50),
  
  -- Day 2
  (2, 'Main Conference', '2026-03-16', '09:00', 'Fashion as Cultural Expression', 'Exploring the intersection of fashion, heritage, and innovation.', 'Keynote', 'Main Hall', 'Eko Convention Centre', 'Amara Obi', 500),
  (2, 'Main Conference', '2026-03-16', '10:30', 'The Business of Afrobeats', 'Understanding the global business of African music.', 'Panel', 'Main Hall', 'Eko Convention Centre', 'Oluwaseun Bakare', 500),
  (2, 'Workshop Zone', '2026-03-16', '12:00', 'Creative Financing Masterclass', 'How to fund your creative ventures.', 'Workshop', 'Room B', 'Eko Convention Centre', 'Finance Partners', 100),
  (2, 'Exhibition', '2026-03-16', '14:30', 'Product Showcase', 'Discover innovative products from Nigerian creatives.', 'Exhibition', 'Exhibition Hall', 'Eko Convention Centre', 'Various Exhibitors', 300),
  (2, 'Investor Zone', '2026-03-16', '16:00', 'Investor Pitch Session', 'Selected startups pitch to investors.', 'Pitch', 'Room A', 'Eko Convention Centre', 'Selected Startups', 150),
  
  -- Day 3
  (3, 'Main Conference', '2026-03-17', '09:00', 'Measuring Creative Economy Impact', 'Data-driven insights on the creative economy.', 'Keynote', 'Main Hall', 'Eko Convention Centre', 'Dr. Fatima Hassan', 500),
  (3, 'Main Conference', '2026-03-17', '10:30', 'Preserving Culture Through Film', 'The role of cinema in cultural preservation.', 'Keynote', 'Main Hall', 'Eko Convention Centre', 'Tunde Kelani', 500),
  (3, 'Exhibition', '2026-03-17', '12:00', 'Youth Creative Showcase', 'Celebrating the next generation of Nigerian creatives.', 'Showcase', 'Exhibition Hall', 'Eko Convention Centre', 'Young Creatives', 300),
  (3, 'Workshop Zone', '2026-03-17', '14:30', 'Industry Roundtables', 'Focused discussions on key creative sectors.', 'Workshop', 'Multiple Rooms', 'Eko Convention Centre', 'Industry Leaders', 200),
  (3, 'Main Conference', '2026-03-17', '17:00', 'Closing Ceremony & Awards', 'Celebrating achievements and looking ahead.', 'Ceremony', 'Main Hall', 'Eko Convention Centre', 'Conference Host', 500)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- GALLERY ITEMS - Sample data
-- ============================================================================
INSERT INTO gallery_items (title, description, type, media_url, youtube_url, category, display_order)
VALUES
  ('SynergyCon 2025 Highlights', 'Relive the best moments from last year''s conference.', 'video', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'past-events', 1),
  ('Opening Ceremony 2025', 'The grand opening of SynergyCon 2025.', 'image', '/images/gallery/opening-2025.jpg', NULL, 'past-events', 2),
  ('Keynote Sessions', 'Inspiring talks from industry leaders.', 'image', '/images/gallery/keynote-sessions.jpg', NULL, 'speakers', 3),
  ('Networking Event', 'Creatives connecting and collaborating.', 'image', '/images/gallery/networking.jpg', NULL, 'networking', 4),
  ('Product Showcase', 'Innovative products from Nigerian creatives.', 'image', '/images/gallery/products.jpg', NULL, 'exhibitions', 5),
  ('Fashion Show', 'African fashion on the global stage.', 'image', '/images/gallery/fashion-show.jpg', NULL, 'fashion', 6),
  ('Music Performance', 'Live performances celebrating African music.', 'image', '/images/gallery/music-performance.jpg', NULL, 'performances', 7),
  ('Awards Ceremony', 'Celebrating creative excellence.', 'image', '/images/gallery/awards.jpg', NULL, 'awards', 8),
  ('Behind the Scenes', 'A look at what goes into making SynergyCon happen.', 'video', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'behind-scenes', 9),
  ('Attendee Testimonials', 'Hear what our attendees have to say.', 'video', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'testimonials', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  speaker_count INT;
  sponsor_count INT;
  schedule_count INT;
  gallery_count INT;
BEGIN
  SELECT COUNT(*) INTO speaker_count FROM speakers;
  SELECT COUNT(*) INTO sponsor_count FROM sponsors;
  SELECT COUNT(*) INTO schedule_count FROM schedule_sessions;
  SELECT COUNT(*) INTO gallery_count FROM gallery_items;
  
  RAISE NOTICE 'Seed data verification:';
  RAISE NOTICE '  Speakers: %', speaker_count;
  RAISE NOTICE '  Sponsors: %', sponsor_count;
  RAISE NOTICE '  Schedule Sessions: %', schedule_count;
  RAISE NOTICE '  Gallery Items: %', gallery_count;
END $$;
