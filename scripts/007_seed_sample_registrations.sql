-- Add sample registration data for testing

INSERT INTO public.registrations (full_name, email, phone_number, organization, role, why_attend, status) VALUES
(
  'Chukwuemeka Okonkwo',
  'chukwuemeka.okonkwo@example.com',
  '+234 801 234 5678',
  'TechHub Lagos',
  'Software Developer',
  'I am passionate about the intersection of technology and creative industries. I want to learn how to leverage tech to build innovative solutions in the arts and entertainment space.',
  'confirmed'
),
(
  'Aisha Mohammed',
  'aisha.mohammed@example.com',
  '+234 802 345 6789',
  'Fashion Forward Nigeria',
  'Fashion Designer',
  'I am eager to connect with other creatives and learn about sustainable fashion practices and how to scale my brand internationally.',
  'confirmed'
),
(
  'Oluwaseun Adeyemi',
  'oluwaseun.adeyemi@example.com',
  '+234 803 456 7890',
  'SoundWave Studios',
  'Music Producer',
  'I want to explore the latest trends in music production and distribution. I am also interested in networking with fellow music professionals and learning about the business side of the industry.',
  'confirmed'
);

SELECT 'Sample registrations added successfully' as status;
