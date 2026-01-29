-- Seed speakers from SynergyCon 1.0
INSERT INTO speakers (name, title, bio, company, featured, display_order, image_url) VALUES
('Babajide Sanwo-Olu', 'Governor of Lagos State', 'His Excellency, Governor Babajide Sanwo-Olu is the Executive Governor of Lagos State. He is a passionate advocate for youth empowerment, creative industries, and technological innovation in Nigeria.', 'Lagos State Government', true, 1, '/professional-portrait-of-nigerian-governor.jpg'),
('Chalya Shagaya', 'Founder & Managing Partner', 'Ms. Chalya Shagaya is a leading tech investor and venture capitalist. She is the Founder and Managing Partner of Shagaya Ventures, focusing on early-stage investments in Nigerian tech startups.', 'Shagaya Ventures', true, 2, '/professional-portrait-of-Nigerian-female-tech-inves.jpg'),
('Iyinoluwa Aboyeji', 'Co-Founder & General Partner', 'Mr. Iyinoluwa Aboyeji (E) is a serial entrepreneur and investor. He co-founded Andela and Flutterwave, two of Nigeria''s most successful tech companies, and currently leads Future Nigeria, investing in mission-driven innovators.', 'Future Nigeria', true, 3, '/professional-portrait-of-nigerian-tech-entrepreneu.jpg'),
('Mobolaji Ogunlende', 'Member, Lagos State House of Assembly', 'Hon. Mobolaji Ogunlende represents Ikoyi-Obalende Constituency in the Lagos State House of Assembly. He is a strong advocate for policies that support creative entrepreneurs and the digital economy.', 'Lagos State House of Assembly', true, 4, '/professional-portrait-of-nigerian-politician.jpg'),
('Osayi Alile', 'Senior Partner', 'Ms. Osayi Alile is a Senior Partner at PWC Nigeria, specializing in consulting for creative industries, media, and entertainment. She advises on strategic growth and market expansion across Nigeria.', 'PWC Nigeria', true, 5, '/professional-portrait-of-Nigerian-female-consultant.jpg'),
('Segun Agbaje', 'Group Managing Director/CEO', 'Mr. Segun Agbaje is the Group MD/CEO of GTBank, one of Nigeria''s leading financial institutions. He champions digital banking innovation and supports entrepreneurship across various sectors.', 'GTBank', true, 6, '/professional-portrait-of-nigerian-fintech-ceo.jpg');

-- Seed testimonials
INSERT INTO testimonials (name, title, company, quote, display_order, image_url) VALUES
('Chalya Shagaya', 'Founder & Managing Partner', 'Shagaya Ventures', 'SynergyCon is exactly what Nigeria''s creative economy needs - a platform that brings together innovators, investors, and policymakers to drive real change.', 1, '/professional-portrait-of-Nigerian-female-tech-inves.jpg'),
('Iyinoluwa Aboyeji', 'Co-Founder', 'Future Nigeria', 'This conference showcases the incredible talent and innovation happening in Nigeria''s creative sector. The future is bright for our creative economy.', 2, '/professional-portrait-of-nigerian-tech-entrepreneu.jpg'),
('Mobolaji Ogunlende', 'Hon. Member', 'Lagos State House of Assembly', 'SynergyCon provides valuable insights that help us craft better policies to support creative entrepreneurs and build a thriving digital economy.', 3, '/professional-portrait-of-nigerian-politician.jpg'),
('Osayi Alile', 'Senior Partner', 'PWC Nigeria', 'An exceptional gathering of thought leaders and industry experts. The conversations here are shaping the future of Nigeria''s creative industries.', 4, '/professional-portrait-of-Nigerian-female-consultant.jpg');

-- Seed sponsors
INSERT INTO sponsors (name, logo_url, tier, website_url, display_order) VALUES
('Lagos State Government', '/lagos-state-government-logo.jpg', 'principal', 'https://lagosstate.gov.ng', 1),
('Access Bank', '/access-bank-nigeria-logo.jpg', 'principal', 'https://www.accessbankplc.com', 2),
('MTN Nigeria', '/mtn-nigeria-logo.png', 'principal', 'https://www.mtnonline.com', 3),
('Flutterwave', '/flutterwave-logo.png', 'principal', 'https://flutterwave.com', 4),
('Google', '/google-logo.png', 'principal', 'https://www.google.com', 5),
('Microsoft', '/microsoft-logo.png', 'principal', 'https://www.microsoft.com', 6),
('TechCabal', '/techcabal-logo.jpg', 'ecosystem', 'https://techcabal.com', 7),
('Ventures Platform', '/ventures-platform-logo.jpg', 'ecosystem', 'https://venturesplatform.com', 8),
('CcHub', '/cchub-logo.jpg', 'ecosystem', 'https://cchubnigeria.com', 9),
('Nigeria No Filter', '/Nigeria-no-filter-logo.jpg', 'ecosystem', 'https://Nigerianofilter.org', 10);

-- Seed gallery items
INSERT INTO gallery_items (title, description, type, media_url, category, display_order) VALUES
('Opening Keynote', 'Governor Babajide Sanwo-Olu delivers the opening keynote address', 'image', '/keynote-speaker-on-stage-at-tech-conference.jpg', 'Highlights', 1),
('Panel Discussion', 'Industry leaders discuss the future of Nigeria''s creative economy', 'image', '/panel-discussion-at-creative-industry-conference.jpg', 'Sessions', 2),
('Networking Session', 'Attendees connect and build meaningful relationships', 'image', '/networking-event-at-business-conference.jpg', 'Networking', 3),
('Workshop', 'Hands-on learning sessions with industry experts', 'image', '/workshop-session-at-tech-conference.jpg', 'Learning', 4),
('Startup Pitch', 'Creative startups present their innovative solutions', 'image', '/startup-pitch-competition.png', 'Competition', 5),
('Awards Ceremony', 'Celebrating excellence in Nigeria''s creative industries', 'image', '/award-ceremony-at-professional-conference.jpg', 'Highlights', 6);
