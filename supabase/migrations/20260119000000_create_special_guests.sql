-- Migration: Create Special Guests Table
-- Description: Creates table for managing special guests / featured speakers
-- Date: 2026-01-19

-- ============================================================================
-- SPECIAL GUESTS TABLE (special_guests)
-- Stores featured speakers and special guests for the event
-- ============================================================================

CREATE TABLE IF NOT EXISTS special_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  image TEXT NOT NULL,
  
  -- Biography
  bio TEXT NOT NULL,
  short_bio TEXT,
  
  -- Achievements (stored as JSON array)
  achievements JSONB DEFAULT '[]'::JSONB,
  
  -- Session Information
  session_title TEXT,
  session_date TEXT,
  session_time TEXT,
  session_venue TEXT,
  
  -- Media Links
  video_url TEXT,
  website_url TEXT,
  
  -- Social Media Links
  socials JSONB DEFAULT '{}'::JSONB,
  -- Expected structure: { "twitter": "url", "linkedin": "url", "instagram": "url" }
  
  -- Categorization
  tags JSONB DEFAULT '[]'::JSONB,
  -- Expected structure: ["Keynote", "Tech", "Investment"]
  
  -- Display Settings
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_special_guests_featured ON special_guests(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_special_guests_is_active ON special_guests(is_active);
CREATE INDEX IF NOT EXISTS idx_special_guests_display_order ON special_guests(display_order);
CREATE INDEX IF NOT EXISTS idx_special_guests_name ON special_guests(name);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_special_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS special_guests_updated_at_trigger ON special_guests;
CREATE TRIGGER special_guests_updated_at_trigger
  BEFORE UPDATE ON special_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_special_guests_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE special_guests ENABLE ROW LEVEL SECURITY;

-- Public can read active guests
DROP POLICY IF EXISTS "Public can read active special guests" ON special_guests;
CREATE POLICY "Public can read active special guests" ON special_guests
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Service role has full access
DROP POLICY IF EXISTS "Service role manages special guests" ON special_guests;
CREATE POLICY "Service role manages special guests" ON special_guests
  FOR ALL TO service_role
  USING (true);

-- Admin users can manage guests
DROP POLICY IF EXISTS "Admins can manage special guests" ON special_guests;
CREATE POLICY "Admins can manage special guests" ON special_guests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = auth.uid() 
      AND au.is_active = true
    )
  );

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO special_guests (
  name, title, company, image, bio, short_bio, achievements, 
  session_title, session_date, session_time, session_venue, 
  socials, tags, featured, display_order, is_active
) VALUES
(
  'Adaeze Okonkwo',
  'Tech Entrepreneur & Investor',
  'Horizon Ventures Nigeria',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'Adaeze Okonkwo is a visionary tech entrepreneur who has built and scaled multiple startups across Nigeria. With over 15 years of experience in the technology sector, she has invested in more than 50 early-stage companies and mentored hundreds of founders. Her fund, Horizon Ventures Nigeria, focuses on empowering the next generation of Nigerian innovators. She is passionate about closing the gender gap in tech and has launched initiatives that have trained over 10,000 women in coding and entrepreneurship.',
  'Visionary tech investor empowering the next generation of Nigerian innovators.',
  '["Founded 3 successful tech startups", "Invested in 50+ Nigerian companies", "Forbes Nigeria 30 Under 30 Alumna", "Trained 10,000+ women in tech"]'::JSONB,
  'The Future of Tech Investment in Nigeria',
  'Day 1 (Date TBA)',
  '10:00 AM - 11:30 AM',
  'National Theatre - Main Stage',
  '{"twitter": "https://twitter.com/adaeze_tech", "linkedin": "https://linkedin.com/in/adaezeokonkwo", "instagram": "https://instagram.com/adaeze.okonkwo"}'::JSONB,
  '["Keynote", "Tech", "Investment"]'::JSONB,
  true,
  1,
  true
),
(
  'Emeka Nwosu',
  'Creative Director & Brand Strategist',
  'Pulse Creative Agency',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'Emeka Nwosu is an award-winning creative director who has shaped the visual identity of some of Nigeria''s most recognized brands. His work spans advertising, film, and digital media, earning him international recognition including Cannes Lions and One Show awards. Emeka believes in the power of Nigerian storytelling to connect with global audiences and has worked with major international brands looking to authentically engage Nigerian markets.',
  'Award-winning creative director shaping Nigeria''s most iconic brand identities.',
  '["Cannes Lions Award Winner", "One Show Gold Pencil", "Rebranded 100+ Nigerian companies", "TEDx Speaker on Nigerian Creativity"]'::JSONB,
  'Building Iconic Nigerian Brands',
  'Day 1 (Date TBA)',
  '2:00 PM - 3:30 PM',
  'National Theatre - Main Stage',
  '{"twitter": "https://twitter.com/emeka_creates", "instagram": "https://instagram.com/emekanwosu"}'::JSONB,
  '["Branding", "Design", "Strategy"]'::JSONB,
  true,
  2,
  true
),
(
  'Fatima Hassan',
  'Fashion Designer & Sustainability Advocate',
  'Sahel Couture',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'Fatima Hassan is a pioneering fashion designer known for blending traditional Nigerian textiles with contemporary silhouettes. Her brand, Sahel Couture, has been featured in Vogue, Elle, and has dressed celebrities on red carpets worldwide. Beyond fashion, Fatima is a passionate advocate for sustainable practices in the industry, working with artisan communities across West Nigeria to preserve traditional craftsmanship while providing fair wages.',
  'Pioneering sustainable fashion with traditional Nigerian craftsmanship.',
  '["Featured in Vogue & Elle Magazine", "Dressed 20+ A-list celebrities", "Employs 500+ local artisans", "UN Sustainability Ambassador"]'::JSONB,
  'Sustainable Fashion: The Nigerian Advantage',
  'Day 2 (Date TBA)',
  '11:00 AM - 12:30 PM',
  'Royal Box - Fashion Stage',
  '{"twitter": "https://twitter.com/sahel_couture", "linkedin": "https://linkedin.com/in/fatimahassan", "instagram": "https://instagram.com/sahelcouture"}'::JSONB,
  '["Fashion", "Sustainability", "Design"]'::JSONB,
  true,
  3,
  true
),
(
  'Chidi Amaechi',
  'Film Director & Producer',
  'Nollywood Studios International',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'Chidi Amaechi is a renowned film director whose works have premiered at major international film festivals including Toronto, Sundance, and Cannes. His storytelling captures the complexity of Nigerian experiences with cinematic brilliance. With over two decades in the industry, Chidi has directed 25+ feature films and mentored a new generation of Nigerian filmmakers. He is currently developing Nigeria''s largest film production hub.',
  'Acclaimed filmmaker bringing Nigerian stories to the global stage.',
  '["25+ Feature Films Directed", "Toronto Film Festival Selection", "Nigeria Movie Academy Award Winner", "Mentored 200+ filmmakers"]'::JSONB,
  'Nigerian Cinema: Beyond Borders',
  'Day 2 (Date TBA)',
  '3:00 PM - 4:30 PM',
  'Royal Box - Cinema Hall',
  '{"twitter": "https://twitter.com/chidiamaechi", "linkedin": "https://linkedin.com/in/chidiamaechi"}'::JSONB,
  '["Film", "Storytelling", "Production"]'::JSONB,
  true,
  4,
  true
),
(
  'Ngozi Eze',
  'Music Producer & Sound Engineer',
  'SoundWave Studios',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'Ngozi Eze is a Grammy-nominated music producer who has worked with top artists across Afrobeats, R&B, and Hip-Hop. Her production style seamlessly blends traditional Nigerian rhythms with modern sounds, creating chart-topping hits. She runs SoundWave Studios, one of Nigeria''s premier recording facilities, and is dedicated to developing the technical skills of upcoming producers through her annual masterclass series.',
  'Grammy-nominated producer crafting the future of Nigerian music.',
  '["Grammy Nomination for Best Nigerian Album", "Produced 50+ Gold/Platinum records", "Trained 500+ upcoming producers", "Built Nigeria''s top recording studio"]'::JSONB,
  'The Science of Sound: Producing Global Hits',
  'Day 2 (Date TBA)',
  '10:00 AM - 11:30 AM',
  'Lion Wonder Arena - Music Stage',
  '{"twitter": "https://twitter.com/ngozi_beats", "instagram": "https://instagram.com/soundwave_ngozi"}'::JSONB,
  '["Music", "Production", "Technology"]'::JSONB,
  true,
  5,
  true
),
(
  'Olumide Johnson',
  'Game Developer & XR Pioneer',
  'AfroGaming Labs',
  'https://randomuser.me/api/portraits/men/52.jpg',
  'Olumide Johnson is a pioneering game developer who founded AfroGaming Labs, a studio focused on creating games that celebrate Nigerian culture and mythology. His flagship title, "Kingdoms of Ife," has been downloaded over 5 million times globally. Olumide is also a leading voice in the XR (Extended Reality) space, developing immersive experiences that showcase Nigerian heritage. He actively contributes to growing the gaming ecosystem across the continent.',
  'Game developer bringing Nigerian mythology to the digital world.',
  '["5M+ Game Downloads Worldwide", "Unity Certified Developer", "Founded Nigeria''s largest game studio", "XR Nigeria Pioneer Award"]'::JSONB,
  'Gaming Nigeria: From Stories to Screens',
  'Day 3 (Date TBA)',
  '11:00 AM - 12:30 PM',
  'Lion Wonder Arena - Tech Stage',
  '{"twitter": "https://twitter.com/olumide_games", "linkedin": "https://linkedin.com/in/olumidejohnson"}'::JSONB,
  '["Gaming", "Tech", "XR"]'::JSONB,
  true,
  6,
  true
),
(
  'Amara Obi',
  'Visual Artist & Sculptor',
  'Obi Art Foundation',
  'https://randomuser.me/api/portraits/women/57.jpg',
  'Amara Obi is an internationally acclaimed visual artist and sculptor whose works have been exhibited at the Smithsonian, Tate Modern, and the Museum of Nigerian Art in Paris. Her large-scale installations explore themes of identity, migration, and cultural preservation. Through the Obi Art Foundation, she provides residencies and grants to emerging Nigerian artists, helping them gain international exposure and develop their craft.',
  'World-renowned sculptor exhibiting at major global museums.',
  '["Exhibited at Smithsonian & Tate Modern", "Installed 15+ public sculptures", "Founded arts residency program", "Nigerian Artist of the Year 2024"]'::JSONB,
  'Art as Activism: Sculpting Change',
  'Day 1 (Date TBA)',
  '4:00 PM - 5:30 PM',
  'J. Randle Centre - Main Gallery',
  '{"twitter": "https://twitter.com/amara_sculpts", "instagram": "https://instagram.com/amaraobi_art"}'::JSONB,
  '["Art", "Sculpture", "Culture"]'::JSONB,
  true,
  7,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  guest_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO guest_count FROM special_guests;
  RAISE NOTICE 'Special guests table created with % records', guest_count;
END $$;
