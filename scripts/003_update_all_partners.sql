-- Clear existing data and insert correct partner information
DELETE FROM sponsors;

-- Insert all partners with correct data
INSERT INTO sponsors (name, logo_url, tier, category, sub_category, bio, website, featured)
VALUES
-- STERLING BANK - Principal Partner
('Sterling Bank', '/images/sterling-bank.png', 'principal', 'Partners', 'Principal', 
'Sterling Bank is one of Nigeria''s leading full service financial institutions, known for its strong commitment to innovation, digital transformation and responsible banking. The bank supports high impact national programs by providing secure financial infrastructure, scalable payment systems and compliance oversight. Sterling is a strategic financial partner for youth, creative and social development initiatives across Nigeria.',
'https://www.sterling.ng/', true),

-- FEDERAL MINISTRY OF YOUTH DEVELOPMENT - Ecosystem Partner
('Federal Ministry of Youth Development', '/images/federal-ministry-of-youth-development.png', 'ecosystem', 'Partners', 'Ecosystem',
'The Federal Ministry of Youth Development is the primary government institution responsible for empowering Nigerian youth through national programs, policy development and capacity building. The Ministry provides institutional support, national reach and strategic alignment for initiatives that promote digital skills, employment creation, entrepreneurship and civic participation.',
'https://fmyd.gov.ng/', true),

-- LAGOS STATE GOVERNMENT - Ecosystem Partner
('Lagos State Government', '/images/lagos-state-government.png', 'ecosystem', 'Partners', 'Ecosystem',
'The Lagos State Government drives major social and economic development programs within the state. Through its ministries and agencies, the government supports creative, tourism and youth focused initiatives that reach millions of residents. Lagos State provides policy support, infrastructure and implementation structures that enable impactful community and creative sector programs.',
'https://lagosstate.gov.ng/', true),

-- NIGERIAN YOUTH ACADEMY - Ecosystem Partner
('Nigerian Youth Academy', '/images/nigerian-youth-academy.png', 'ecosystem', 'Partners', 'Ecosystem',
'The Nigerian Youth Academy is a national development platform focused on equipping young Nigerians with essential skills, training opportunities and mentorship. The Academy supports digital literacy, leadership development and creative industry capacity building. It works with government and private sector partners to expand access to education and career opportunities for youth across the country.',
'https://www.niya.gov.ng', true),

-- LAGOS STATE TOURISM, ARTS & CULTURE - Ecosystem Partner
('Lagos State Tourism, Arts & Culture', '/images/lagos-state-tourism-arts-and-culture.png', 'ecosystem', 'Partners', 'Ecosystem',
'The Lagos State Ministry of Tourism, Arts and Culture promotes the state''s creative industries and cultural ecosystem. The Ministry supports programs that empower artists, cultural institutions and entertainment communities. Its initiatives strengthen Lagos as a global cultural hub and help scale creative entrepreneurship and cultural preservation across the state.',
'https://lagosstate.gov.ng/services/tourism_culture', true),

-- AFE BABALOLA & CO - Ecosystem Partner
('Afe Babalola & Co', '/images/afe-babalola-co.png', 'ecosystem', 'Partners', 'Ecosystem',
'Afe Babalola & Co. is a leading full-service international law firm with nearly six decades of excellence in delivering innovative, world-class legal representation across Nigeria, Nigeria, and global markets. Renowned for landmark victories that have shaped the nation''s legal landscape, the firm combines deep expertise with a tradition of professionalism and exceptional client service. With the highest number of Senior Advocates of Nigeria (SANs) in any Nigerian law firm and a team of distinguished arbitrators, litigators, and commercial lawyers, Afe Babalola & Co. provides unmatched counsel in complex transactions, high-stakes disputes, and multi-sector advisory.',
'https://afebabalola.com/', true),

-- AJIKE PEOPLE CENTRE - Ecosystem Partner
('Ajike People Support Centre', '/images/ajike-people-support-centre.png', 'ecosystem', 'Partners', 'Ecosystem',
'Ajike People Support Centre is a non-profit organization dedicated to raising consciousness on the rights, safety, and development of women, youth, and children in Nigeria. Founded to address the social issues that threaten the progress and well-being of vulnerable groups, the Centre champions advocacy, empowerment, and community-driven interventions. With a small but committed team, the organization works across communities to promote protection, inclusion, and sustainable development, advancing its mission to create a safer and more equitable society for all.',
'https://www.linkedin.com/company/ajike-people-support-centre/', true),

-- ARISTOKRAT - Ecosystem Partner
('Aristokrat', '/images/aristokrat.png', 'ecosystem', 'Partners', 'Ecosystem',
'Aristokrat Records is a pioneering Nigerian entertainment company known for discovering, developing, and launching some of the continent''s most influential music talents. Founded in Nigeria, the label has built a reputation for shaping the modern Afrobeats sound through its artist-first approach, innovative production culture, and commitment to global music excellence.',
'http://aristokratrecords.com/', true),

-- ASOLAR - Ecosystem Partner
('Asolar Nigeria', '/images/asolar-nigeria.png', 'ecosystem', 'Partners', 'Ecosystem',
'A forward-looking renewable-energy company committed to accelerating the adoption of solar technology across emerging markets. Guided by a vision to harness innovative technologies for sustainable power, the business delivers world-class solar distribution supported by seamless post-deployment services. With a mission to expand renewable energy generation from under 10% in 2015 to more than 40% by 2030, the company is driving environmental protection, energy security, and long-term economic resilience.',
'https://asolarnig.com/', true),

-- CITY FM - Ecosystem Partner
('City FM', '/images/city-fm.png', 'ecosystem', 'Partners', 'Ecosystem',
'City 105.1 FM is a leading urban contemporary radio station in Lagos, Nigeria, delivering premium music, entertainment, news, and culture to a vibrant metropolitan audience. Known for its energetic programming and the signature tagline #WeRunThisCity, the station offers a dynamic mix of shows from morning drive-time to late-night entertainment, hosted by some of Lagos'' most engaging on-air personalities. With a strong digital presence, live streaming capabilities, and a lineup that includes music, sports, lifestyle content, and exclusive interviews, City 105.1 FM has become a cultural hub for young, influential listeners.',
'https://city1051fm.com/', true),

-- EMBLUE - Ecosystem Partner
('Emblue', '/images/emblue.png', 'ecosystem', 'Partners', 'Ecosystem',
'Emblue Nigeria is a premier media and technology hub shaping the future of connectivity across Nigeria and the Nigerian continent. Positioned at the intersection of strategy, technology, and media, the company delivers innovative branding, marketing, and digital solutions that help brands build meaningful consumer connections and penetrate global markets. Trusted by leading brands and agencies, Emblue specializes in content creation, go-to-market strategy, technology-driven marketing, and business intelligence.',
'https://emblue.com.ng/', true),

-- FINESSER LTD - Principal Partner
('Finesser Ltd', '/images/finesser-ltd.png', 'principal', 'Partners', 'Principal',
'Finesser is a Nigerian innovation company transforming the nation''s creative and technological landscape through cutting-edge digital solutions, talent development, and financial empowerment. Founded in 2021, the company bridges the gap between creativity, technology, finance, and legal support. Equipping creatives, entrepreneurs, and small businesses with the tools they need to grow, protect, and scale their work.',
'https://www.finesser.co/', true),

-- FINESSER LTD - Headline Sponsor
('Finesser Ltd', '/images/finesser-ltd.png', 'headline', 'Sponsors', 'Headline',
'Finesser is a Nigerian innovation company transforming the nation''s creative and technological landscape through cutting-edge digital solutions, talent development, and financial empowerment. Founded in 2021, the company bridges the gap between creativity, technology, finance, and legal support. Equipping creatives, entrepreneurs, and small businesses with the tools they need to grow, protect, and scale their work.',
'https://www.finesser.co/', true),

-- FUTURE Nigeria - Ecosystem Partner
('Future Nigeria', '/images/future-Nigeria.png', 'ecosystem', 'Partners', 'Ecosystem',
'Future Nigeria is an investment firm backing visionary founders building solutions to Nigeria''s biggest challenges. With a strong track record of funding and scaling high-impact technology companies, the firm provides capital, expertise, and a global community to help entrepreneurs create transformative, globally competitive businesses across the continent.',
'https://www.future.Nigeria/', true),

-- NELSON JACK SOLUTIONS - Ecosystem Partner
('Nelson Jack Solutions', '/images/nelson-jack-solutions.png', 'ecosystem', 'Partners', 'Ecosystem',
'Nelson Jack is an accomplished event technical consultant specializing in stage design, sound engineering, lighting, and LED screen production. With extensive experience delivering high-impact event environments, he has become a trusted name in Nigeria''s entertainment and corporate event ecosystem.',
'https://www.linkedin.com/in/nelson-jack-45b3a256/?originalSubdomain=ng', true),

-- PELHAM SOLICITORS - Ecosystem Partner
('Pelham Solicitors', '/images/pelham-solicitors-advocates.png', 'ecosystem', 'Partners', 'Ecosystem',
'From land and property acquisition, relevant permits and approvals to, structuring Public-Private Partnerships (PPP) in diverse areas, to securing incentives for investments. Pelham Solicitors believes that promoting cutting edge, pro-active information on relevant and national legislation that may affect their business is a critical support provided in legal service delivery.',
'https://www.pelhamsolicitors.com/', true),

-- SODIUM BRAND SOLUTIONS - Ecosystem Partner
('Sodium Brand Solutions', '/images/sodium-brand-solutions.png', 'ecosystem', 'Partners', 'Ecosystem',
'Sodium Brand Solutions is a leading integrated marketing communications agency transforming ideas into high-performance brand experiences across Nigeria and global markets. For more than 16 years, the Lagos-based firm has delivered strategic, creative, and insight-driven solutions that help brands stand out, stay relevant, and achieve measurable growth. With expertise spanning brand strategy, experiential marketing, product launches, media activation, consumer insight, and retail visibility, Sodium creates memorable campaigns that connect emotionally, visually, and intellectually.',
'https://sodiumng.com/', true),

-- THE PLUG - Ecosystem Partner
('The Plug', '/images/the-plug.png', 'ecosystem', 'Partners', 'Ecosystem',
'The Plug Global Agency is a leading entertainment company expanding the possibilities of music, sports, and culture across borders. Based in Lagos, the firm operates as a full-service music distribution, licensing, and publishing powerhouse, managing some of Nigeria''s biggest and most influential talents. With a growing team and a strong industry presence, The Plug curates world-class creative experiences and builds pathways that elevate Nigerian voices from Nigeria to the global stage.',
'https://www.plugglobal.com/', true),

-- WAKANOW - Ecosystem Partner
('Wakanow', '/images/wakanow.png', 'ecosystem', 'Partners', 'Ecosystem',
'Wakanow is Nigeria''s premier online travel agency, providing seamless access to the best deals on flights, hotels, visa assistance, holiday packages, and travel services. Founded in 2008 and headquartered in Lagos, the company has grown into a leading travel solutions provider with 32 physical travel centers and international offices across the UK, UAE, and multiple Nigerian countries. With a mission to make travel affordable and stress-free, Wakanow offers competitive pricing, transparent booking, flexible payment plans like "Pay Small Small," and 24/7 customer support.',
'https://www.wakanow.com/', true);
