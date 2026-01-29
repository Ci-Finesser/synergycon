-- Clear and reseed all partners with correct categorization
TRUNCATE sponsors;

-- SPONSORS CATEGORY (Headline Sponsor)
INSERT INTO sponsors (name, logo_url, website_url, description, tier, category, sub_category, display_order, featured, bio) VALUES
(
  'Finesser Ltd',
  '/images/finesser-ltd.png',
  'https://synergycon.live',
  'Empowering Nigeria''s creative community by bridging gaps between creativity, technology, finance, and legal support.',
  'headline',
  'sponsors',
  'Creative Services',
  1,
  true,
  'Finesser Ltd is a pioneering organization dedicated to empowering Nigeria''s creative community through integrated support services. By bridging the gaps between creativity, technology, finance, and legal support, Finesser provides comprehensive solutions that enable creative professionals and businesses to thrive in the digital economy.'
);

-- PARTNERS CATEGORY
INSERT INTO sponsors (name, logo_url, website_url, description, tier, category, sub_category, display_order, featured, bio) VALUES
-- Principal Partners (Sterling Bank, Finesser Ltd, Federal Ministry, Lagos State Government)
(
  'Sterling Bank',
  '/images/sterling-bank.png',
  'https://sterling.ng',
  'Your One Customer Bank - Investing ₦2 billion in youth development through education scholarships and empowering Nigeria''s future workforce.',
  'principal',
  'partners',
  'Commercial Bank',
  2,
  true,
  'Sterling Bank is a full-service national commercial bank in Nigeria, with a strong commitment to youth development and creative economy growth. The bank has invested over ₦2 billion in education scholarships and youth empowerment programs, positioning itself as a key supporter of Nigeria''s next generation of leaders and innovators.'
),
(
  'Federal Ministry of Youth Development',
  '/images/federal-ministry-of-youth-development.png',
  'https://fmyd.gov.ng',
  'Formulating and implementing policies on youth development towards wealth creation, empowerment, and national unity.',
  'principal',
  'partners',
  'Federal Ministry',
  3,
  true,
  'The Federal Ministry of Youth Development is dedicated to creating opportunities for Nigerian youth through policy formulation, skills acquisition programs, and strategic partnerships. The ministry focuses on empowering young Nigerians to become productive citizens and contribute to national development.'
),
(
  'Lagos State Government',
  '/images/lagos-state-government.png',
  'https://lagosstate.gov.ng',
  'Driving youth employability through comprehensive training programs, entrepreneurship support, and MSME development.',
  'principal',
  'partners',
  'State Government',
  4,
  true,
  'The Lagos State Government is committed to transforming Lagos into a 21st-century economy through innovation, youth empowerment, and strategic partnerships. With a focus on developing the creative economy, the government provides comprehensive support for entrepreneurs, MSMEs, and creative professionals across the state.'
),
(
  'Finesser Ltd',
  '/images/finesser-ltd.png',
  'https://synergycon.live',
  'Principal partner empowering Nigeria''s creative community through technology, finance, and support services.',
  'principal',
  'partners',
  'Creative Services',
  5,
  true,
  'Finesser Ltd is a pioneering organization dedicated to empowering Nigeria''s creative community through integrated support services. By bridging the gaps between creativity, technology, finance, and legal support, Finesser provides comprehensive solutions that enable creative professionals and businesses to thrive in the digital economy.'
),
-- Ecosystem Partners (all the others)
(
  'Nigerian Youth Academy Community',
  '/images/nigerian-youth-academy.png',
  'https://niyacommunity.org',
  'Training 7 million young Nigerians through the ''One Youth, Two Skills'' initiative to create 5 million jobs.',
  'ecosystem',
  'partners',
  'Youth Development',
  6,
  true,
  'The Nigerian Youth Academy (NIYA) Community is an ambitious initiative aimed at training 7 million young Nigerians through the "One Youth, Two Skills" program. By equipping youth with practical skills and entrepreneurial knowledge, NIYA is working to create 5 million jobs and transform Nigeria''s economic landscape.'
),
(
  'Lagos State Tourism, Arts and Culture',
  '/images/lagos-state-tourism-arts-and-culture.png',
  'https://tourism.lagosstate.gov.ng',
  'Promoting and developing Lagos as a premier tourism, arts, and cultural destination in Nigeria.',
  'ecosystem',
  'partners',
  'State Ministry',
  7,
  false,
  'The Lagos State Ministry of Tourism, Arts and Culture is responsible for the development and promotion of tourism, arts, and cultural heritage in Lagos State. The ministry works to position Lagos as a major cultural and tourism hub in Nigeria.'
),
(
  'Afe Babalola & Co.',
  '/images/afe-babalola-co.png',
  'https://afebabalola.com',
  'Leading Nigerian law firm providing comprehensive legal services across commercial, corporate, and litigation matters.',
  'ecosystem',
  'partners',
  'Legal Services',
  8,
  false,
  'Afe Babalola & Co. is one of Nigeria''s most prestigious law firms, with a reputation for excellence in corporate law, litigation, and legal advisory services. The firm serves a diverse clientele including multinational corporations, government agencies, and creative enterprises.'
),
(
  'Ajike People Support Centre',
  '/images/ajike-people-support-centre.png',
  'https://ajikepsc.org',
  'Community-based organization dedicated to empowering underprivileged communities through education and skills development. We rise by lifting others.',
  'ecosystem',
  'partners',
  'NGO',
  9,
  false,
  'Ajike People Support Centre is a grassroots organization committed to community empowerment through education, skills training, and social support programs. With the motto "we rise by lifting others," APSC works tirelessly to create opportunities for underprivileged individuals and communities across Nigeria.'
),
(
  'Aristokrat',
  '/images/aristokrat.png',
  'https://aristokrat.com',
  'Leading music and entertainment company nurturing Nigeria''s most talented artists and shaping the sound of Nigerian music globally.',
  'ecosystem',
  'partners',
  'Music/Entertainment',
  10,
  false,
  'Aristokrat Records is a pioneering music and entertainment company that has played a significant role in shaping the Afrobeats sound. Known for discovering and nurturing exceptional talent, Aristokrat provides comprehensive artist management, music production, and distribution services.'
),
(
  'Asolar Nigeria',
  '/images/asolar-nigeria.png',
  'https://asolar.ng',
  'Leading provider of sustainable solar energy solutions for homes and businesses across Nigeria.',
  'ecosystem',
  'partners',
  'Energy/Solar',
  11,
  false,
  'Asolar Nigeria is a leading provider of sustainable solar energy solutions, committed to powering Nigeria''s future through clean, reliable, and affordable renewable energy. The company specializes in solar installations for residential, commercial, and industrial clients.'
),
(
  'City FM 105.1',
  '/images/city-fm.png',
  'https://cityfmlagos.com',
  'Lagos'' premier urban radio station delivering news, entertainment, and music to millions of listeners across Nigeria.',
  'ecosystem',
  'partners',
  'Radio/Broadcasting',
  12,
  false,
  'City FM 105.1 is one of Lagos'' most popular urban radio stations, known for its engaging content, breaking news coverage, and promotion of Nigerian music and culture. With millions of listeners across Nigeria, City FM has become a cultural institution in Lagos.'
),
(
  'emBlue',
  '/images/emblue.png',
  'https://embluemail.com',
  'Omnichannel marketing automation platform helping businesses engage customers across email, SMS, and social media.',
  'ecosystem',
  'partners',
  'Marketing Tech',
  13,
  false,
  'emBlue is a comprehensive omnichannel marketing automation platform that enables businesses to create, manage, and optimize campaigns across multiple channels including email, SMS, push notifications, and social media.'
),
(
  'Future Nigeria',
  '/images/future-Nigeria.png',
  'https://future.Nigeria',
  'The Fund for Nigeria''s Future - Investing in visionary founders building transformative companies across Nigeria.',
  'ecosystem',
  'partners',
  'Venture Capital',
  14,
  true,
  'Future Nigeria is a venture capital fund and community dedicated to supporting Nigeria''s most ambitious founders. With a focus on technology and innovation, Future Nigeria provides funding, mentorship, and strategic support to help Nigerian entrepreneurs build world-class companies that solve critical problems across the continent.'
),
(
  'Nelson Jack Solutions',
  '/images/nelson-jack-solutions.png',
  'https://nelsonjack.com',
  'Premium provider of stage, sound, light, and screen solutions for events and entertainment productions across Nigeria.',
  'ecosystem',
  'partners',
  'Events/Production',
  15,
  false,
  'Nelson Jack Solutions is a leading provider of event production services in Nigeria, specializing in stage setup, professional sound systems, lighting design, and screen installations. With cutting-edge equipment and experienced technicians, Nelson Jack delivers world-class production services for concerts, conferences, and major events.'
),
(
  'Pelham Solicitors & Advocates',
  '/images/pelham-solicitors-advocates.png',
  'https://pelhamsolicitors.com',
  'Boutique law firm specializing in intellectual property, entertainment law, and commercial transactions.',
  'ecosystem',
  'partners',
  'Legal Services',
  16,
  false,
  'Pelham Solicitors & Advocates is a boutique law firm with specialized expertise in intellectual property, entertainment law, and commercial transactions. The firm is committed to protecting the rights of creative professionals and businesses in Nigeria''s growing creative economy.'
),
(
  'Sodium Brand Solutions',
  '/images/sodium-brand-solutions.png',
  'https://sodiumbrand.com',
  'Strategic brand consultancy delivering innovative marketing and creative solutions for forward-thinking businesses.',
  'ecosystem',
  'partners',
  'Branding/Marketing',
  17,
  false,
  'Sodium Brand Solutions is a strategic brand consultancy that partners with businesses to create compelling brand identities, marketing strategies, and creative campaigns. With expertise in both traditional and digital marketing, Sodium helps brands connect with their audiences in meaningful ways.'
),
(
  'The Plug',
  '/images/the-plug.png',
  'https://theplug.ng',
  'Connecting Nigeria''s creative talent with opportunities through events, networking, and community building.',
  'ecosystem',
  'partners',
  'Events/Media',
  18,
  false,
  'The Plug is a dynamic platform connecting Nigeria''s creative professionals with opportunities, resources, and networks. Through events, content, and community initiatives, The Plug helps creatives showcase their work, collaborate, and grow their careers.'
),
(
  'Wakanow',
  '/images/wakanow.png',
  'https://wakanow.com',
  'Nigeria''s leading online travel company, making travel easy and accessible for everyone.',
  'ecosystem',
  'partners',
  'Travel/Tourism',
  19,
  false,
  'Wakanow is Nigeria''s leading online travel agency, providing seamless booking experiences for flights, hotels, visa services, and holiday packages. With a mission to make travel easy and accessible, Wakanow has become the go-to platform for millions of travelers across Nigeria.'
);

-- Note: Media & Entertainment, Vendors, and Product Showcase categories intentionally left empty
-- These will show empty states with "Apply Now" buttons
