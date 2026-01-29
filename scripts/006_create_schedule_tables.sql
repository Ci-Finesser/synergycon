-- Create schedule tables for managing event sessions

-- Schedule sessions table
CREATE TABLE IF NOT EXISTS schedule_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day INTEGER NOT NULL CHECK (day IN (1, 2, 3)),
    district TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    session_type TEXT NOT NULL,
    location TEXT NOT NULL,
    venue TEXT NOT NULL,
    speaker TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert current schedule data
INSERT INTO schedule_sessions (day, district, date, time, title, description, session_type, location, venue, speaker, capacity) VALUES
(1, 'Arts, Sculpture & Design', 'March 4, 2026', '9:00 AM - 10:30 AM', 'Opening Keynote: The Future of Nigerian Art', 'Explore the intersection of traditional and contemporary art forms in Nigeria''s evolving creative landscape.', 'Keynote', 'Federal Palace Hotel - Main Hall', 'Federal Palace Hotel', 'Speaker TBA', 500),
(1, 'Arts, Sculpture & Design', 'March 4, 2026', '11:00 AM - 12:30 PM', 'Masterclass: Digital Art & NFTs', 'Learn how to create, mint, and market your digital art in the Web3 space.', 'Masterclass', 'Federal Palace Hotel - Studio A', 'Federal Palace Hotel', 'Speaker TBA', 50),
(1, 'Arts, Sculpture & Design', 'March 4, 2026', '2:00 PM - 3:30 PM', 'Panel: Sustainable Art Practices', 'Industry leaders discuss eco-friendly approaches to art production and exhibition.', 'Panel', 'Federal Palace Hotel - Conference Room', 'Federal Palace Hotel', 'Speakers TBA', 200),
(2, 'Fashion, Film & Photography', 'March 5, 2026', '9:00 AM - 10:30 AM', 'Fashion Forward: Building Global Brands from Lagos', 'Success stories and strategies from Nigerian fashion designers making waves internationally.', 'Keynote', 'Royal Box Event Center - Main Stage', 'Royal Box Event Center', 'Speaker TBA', 400),
(2, 'Fashion, Film & Photography', 'March 5, 2026', '11:00 AM - 1:00 PM', 'Workshop: Cinematography Essentials', 'Hands-on training in camera work, lighting, and visual storytelling for filmmakers.', 'Workshop', 'Royal Box Event Center - Studio B', 'Royal Box Event Center', 'Speakers TBA', 30),
(2, 'Fashion, Film & Photography', 'March 5, 2026', '2:30 PM - 4:00 PM', 'Panel: The Business of Fashion', 'From design to retail: navigating the fashion industry value chain.', 'Panel', 'Royal Box Event Center - Forum Hall', 'Royal Box Event Center', 'Speakers TBA', 150),
(3, 'Music, Tech & Gaming', 'March 6, 2026', '10:00 AM - 11:30 AM', 'Tech Innovation: Building Solutions for Africa', 'How Nigerian tech entrepreneurs are solving local and global challenges.', 'Keynote', 'Police College Ground - Tech Arena', 'Police College Ground', 'Speaker TBA', 600),
(3, 'Music, Tech & Gaming', 'March 6, 2026', '12:00 PM - 2:00 PM', 'Masterclass: Music Production & Distribution', 'Master the art of producing and distributing music in the digital age.', 'Masterclass', 'Police College Ground - Studio C', 'Police College Ground', 'Speakers TBA', 40),
(3, 'Music, Tech & Gaming', 'March 6, 2026', '3:00 PM - 4:30 PM', 'Workshop: Game Development Fundamentals', 'Introduction to game design, development, and monetization strategies.', 'Workshop', 'Police College Ground - Gaming Lab', 'Police College Ground', 'Speakers TBA', 50);

-- Enable Row Level Security
ALTER TABLE schedule_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to schedule sessions"
ON schedule_sessions FOR SELECT
TO public
USING (true);

-- Create policy to allow admin users to manage schedule
CREATE POLICY "Allow admin users to manage schedule sessions"
ON schedule_sessions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_schedule_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_sessions_updated_at
BEFORE UPDATE ON schedule_sessions
FOR EACH ROW
EXECUTE FUNCTION update_schedule_sessions_updated_at();

SELECT 'Schedule tables created and data imported successfully' as status;
