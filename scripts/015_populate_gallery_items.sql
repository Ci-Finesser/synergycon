-- Populate gallery_items table with all images and videos from hardcoded data
-- This script adds all gallery content to the database for admin management

-- Clear existing gallery items (optional - comment out if you want to keep existing items)
DELETE FROM gallery_items;

-- All images now use "1.0 Highlights" as generic category
-- Insert all gallery images (39 images) with generic "1.0 Highlights" label
INSERT INTO gallery_items (type, media_url, title, description, category, display_order, created_at, updated_at)
VALUES
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058854/Synergycon_2_yh0krz.jpg', 'SynergyCon Event Moment', 'Capturing the energy and innovation at SynergyCon', '1.0 Highlights', 1, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058828/Synergycon_18_kcq3rx.jpg', 'SynergyCon Event Moment', 'Memorable moments from SynergyCon', '1.0 Highlights', 2, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058828/Synergycon_99_uere7e.jpg', 'SynergyCon Event Moment', 'Highlights from the conference', '1.0 Highlights', 3, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058824/Synergycon_131_1_zww3iy.jpg', 'SynergyCon Event Moment', 'Key moments captured at SynergyCon', '1.0 Highlights', 4, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058823/IMG-20250212-WA0211_1_zaypje.jpg', 'SynergyCon Event Moment', 'Community engagement at SynergyCon', '1.0 Highlights', 5, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058815/IMG-20250212-WA0232_yfzkmm.jpg', 'SynergyCon Event Moment', 'Building connections in the community', '1.0 Highlights', 6, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058815/IMG-20250212-WA0128_snxiok.jpg', 'SynergyCon Event Moment', 'Community networking moments', '1.0 Highlights', 7, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058815/IMG-20250212-WA0193_1_jh9eco.jpg', 'SynergyCon Event Moment', 'Learning and knowledge sharing', '1.0 Highlights', 8, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058815/IMG-20250212-WA0191_1_enirgc.jpg', 'SynergyCon Event Moment', 'Educational sessions', '1.0 Highlights', 9, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058815/IMG-20250212-WA0119_v6ixb7.jpg', 'SynergyCon Event Moment', 'Community collaboration', '1.0 Highlights', 10, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058814/IMG-20250212-WA0171_1_xtqilj.jpg', 'SynergyCon Event Moment', 'Learning from industry experts', '1.0 Highlights', 11, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058814/IMG-20250212-WA0159_pfe3tq.jpg', 'SynergyCon Event Moment', 'Connecting with the community', '1.0 Highlights', 12, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058813/IMG-20250212-WA0138_lwzdwv.jpg', 'SynergyCon Event Moment', 'Community engagement', '1.0 Highlights', 13, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058813/IMG-20250212-WA0152_soific.jpg', 'SynergyCon Event Moment', 'Knowledge sharing sessions', '1.0 Highlights', 14, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058813/IMG-20250212-WA0118_f94vge.jpg', 'SynergyCon Event Moment', 'Community members connecting', '1.0 Highlights', 15, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763058171/AKGpihazl8a5cwnrLkXjsADQhMP4hGEUDGC8Ln9ba14I4sxfOkRpdXf8SDyIc7k5kRFVfPlFBc-a80jBCdrBlPFFwG9CTnY2vYEs00U_s1600-rw-v1_ylgy8a.webp', 'SynergyCon Event Moment', 'Event highlights showcase', '1.0 Highlights', 16, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763057594/AKGpihaBTNKH1U1jOP6M-er30_zwp1WVSwzWxuIa0X2qeLFySrBqVDiu1LT5a-5F3hDBL4GUmj0rMTaAbydeV1g7AppWKZJITIrmHTE_s1600-rw-v1_pcruuq.webp', 'SynergyCon Event Moment', 'Leadership insights', '1.0 Highlights', 17, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763057457/AKGpihYJJMR-fThzXGTZ3lt-pwJ6EyKBtkxYFM-5Y72uIRqXE-ngMR1MIVI-IdZqvGHTDRCbQpIGqeeGzElVw_JSpNutSeS7IYP7C7A_s1600-rw-v1_kgmkby.webp', 'SynergyCon Event Moment', 'Leadership discussions', '1.0 Highlights', 18, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763057153/AKGpihakSWwBSHIgMQyjbfrkmeVrBn3lKRET7MaHxr59yQ50FtIFjI657oAHp3xHp1lv_EIPaI1_ioIcQQ8dWQqKl5AGOHCyo6Fhqu8_s1600-rw-v1_ybp1oy.webp', 'SynergyCon Event Moment', 'Community gathering', '1.0 Highlights', 19, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056865/AKGpihZDgYPgn52yuYUIXtz9mYVEtty7RBj8TV8Zbt8IeSJXrjKV1U6gHhkVhR2RaI_7Tk5wlNMxqR2dXb3MEAOpCq5YGChtTxlCc-0_s1600-rw-v1_jnuf3z.webp', 'SynergyCon Event Moment', 'Learning opportunities', '1.0 Highlights', 20, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056811/AKGpihbVkaNCUrgsfU31AjmozUBwBL3RbrNcfLGmaKlGLL7eYLyfmqJjeTbuOBrXhgrUAXTTjYKfqyHwBvVeQH61ElEMV1Io-pIom6k_s1600-rw-v1_eliadj.webp', 'SynergyCon Event Moment', 'Educational workshops', '1.0 Highlights', 21, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056633/AKGpihaB3KNwTMqHria0bBaxPJSOl3BQ094BoqF-HU6Jwb5GyVipPfhYL0mvFKDkmlxxtgP6N9hE121kX_8Uc10CoTyJ5Gx1B33Wt9E_s1600-rw-v1_a1eqdy.webp', 'SynergyCon Event Moment', 'Community interactions', '1.0 Highlights', 22, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056152/AKGpihaNs1L5qMl-Cb0jTLz67UHNcN5xudPe3FsAJiAYqX8ddQWUUkcBjFaGHcUVlp7GE_bt4f1hKPfeMdmoHAUlLNngP2WziHv3Cp8_s1600-rw-v1_d8ngnl.webp', 'SynergyCon Event Moment', 'Highlights from the conference floor', '1.0 Highlights', 23, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056101/AKGpihaS6coNYC38DcoPBI-FeYmyVrnUfVJfApeDy2l2RkOktghnXeS6f-Cv6L6EfQDpOzoxTynFzg11ooQ5esHh-sHOLhUANjDObPM_s1600-rw-v1_wbtjqg.webp', 'SynergyCon Event Moment', 'Leadership moments', '1.0 Highlights', 24, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056053/AKGpihbq9j65rjcZAZhtpl2qam9VZSP0Tk0OZKH9QTu5snSvaXUNvrjKT1sGb0qtZhimNdUoJCfPzuhaTI3PwvvRhnY3HYt3Mzi2wg_s1600-rw-v1_gyypkh.webp', 'SynergyCon Event Moment', 'Community bonding', '1.0 Highlights', 25, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763056000/AKGpihYcQS9lNKRf6jpL_NOlUrz5R5B9_xjrcivJz6DsBEiLTAxxwEAcCcDBmqT_bGl9lVjyZ7lvPBV13Ib-vD-VGmxLTjfPq_faNg_s1600-rw-v1_toavni.webp', 'SynergyCon Event Moment', 'Learning and development', '1.0 Highlights', 26, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055905/AKGpihZaLYnINovlmjRpK1JOzbvO0HhMEljmoxbCRM6W10qqHwFPztVx0E1nnGb3NTS7nxA1SC2VdaiB32JGiyeipFYbYUlUxuHhdNE_s1600-rw-v1_nborir.webp', 'SynergyCon Event Moment', 'Conference highlights', '1.0 Highlights', 27, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055758/AKGpihYOsOcrEISF2_zIfzpXi8HyxSmqw9QKaOC9NXJgaf6nMcgVhh6bdrz1N-TpvNPdQpo8o79vOvHxwWwhIN_6Trwlp2PYDfzfA0Q_s1600-rw-v1_p6rd3j.webp', 'SynergyCon Event Moment', 'Community engagement moments', '1.0 Highlights', 28, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055682/AKGpihbHHEA4cw-V0lQIXY2iePzlYBrZENXoHSgdF1bGaZAXG4lGdpeGu4UpxWBIX8xdmmzta3iX6a46g3-MeFRFZz0cFxgzW1HoNA_s1600-rw-v1_lnatyv.webp', 'SynergyCon Event Moment', 'Leadership talks', '1.0 Highlights', 29, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055613/AKGpihYFOu8xbb5g6hDJnt-lQnQRN2xI2KCMTn6EyY3p0UYrUVMfpnOd4mfo8ZwUByHc2lBgDxwN8REipTWhhMFi898DnzRnMlCHog0_s1600-rw-v1_dvjgpu.webp', 'SynergyCon Event Moment', 'Learning from speakers', '1.0 Highlights', 30, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055527/AKGpihY7qjEorbCjowa4gwaRtQd3EeZxyGAF_FNasVH3LUTyfa8TgaULVbelBlWFX6tidDlielOwETIQZnZ1j9gVYvGAfbDckdzKIA_s1600-rw-v1_bl1oua.webp', 'SynergyCon Event Moment', 'Building community connections', '1.0 Highlights', 31, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055485/AKGpihaPkp1-IyfIAEY7-2UyS3bgOdHo_EoEGsPZVNEh7BtERdsNEYySqbZVqgFDJVBudRZBjh6y-_rjsDJYthHFbWToeD0Wjj0kfA_s1600-rw-v1_ruiowi.webp', 'SynergyCon Event Moment', 'Notable event highlights', '1.0 Highlights', 32, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055435/AKGpiha1a9pqNwwTdYiDhKuMfdnpb1A4E7M8BI42uhDpPevNbwyWdQVA8ZlqiZlrrR-6ZvtBYoYws1mLWj-XL2ISmthhKtzvtQ0MECE_s1600-rw-v1_huirs9.webp', 'SynergyCon Event Moment', 'Leadership perspectives', '1.0 Highlights', 33, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055309/AKGpihaKZIlc1dlgtIG7BOI9sUxFfamoEJVBpCiStJDsG4JyHv-NxmFbv7d-XBToyJrjS3zGZyQ7hoKaGUoFw9NEhKogAZXeW9e_Hw_s1600-rw-v1_ivjxnv.webp', 'SynergyCon Event Moment', 'Community networking', '1.0 Highlights', 34, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055257/AKGpiha8OXN8sfIrQgmwmMP2XarDoNHQCP25HPS7ud_BEUjc9j5RvysSf5uz9GnxZ_s_66_FwOCLg6LNRC5fYjM8A3ajw9sa0k11bA_s1600-rw-v1_q4islf.webp', 'SynergyCon Event Moment', 'Knowledge exchange', '1.0 Highlights', 35, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055195/AKGpihYbrF8svMuyVvDZm3Sa9bj6v72NLTe3izlgALmmKLsL984_XF1-aGXksruXQijW5vydlQcG_eRqV0bZfYJAw9E9kO7I-7DIHZw_s1600-rw-v1_w3x8mr.webp', 'SynergyCon Event Moment', 'Memorable event highlights', '1.0 Highlights', 36, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055107/AKGpihZNxnyWKvWOjM4btWo0aguvQ7BS5PV2uFTUzZQSFW3M3FT0f4ObXmMh6BgNrPhYzjt25fd9n2sNmAlhqVOizGGDos96VwLEgg_s1600-rw-v1_vknn8x.webp', 'SynergyCon Event Moment', 'Community members at the event', '1.0 Highlights', 37, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763055055/AKGpihZtRMqkuY56268sXwBfyD-E6RNqW02F4b1ZfpD1-y3_jb83T1deceeYfb09J61fSjn5uS9Frc-fIX2zg68K3rID8aZ7BmgDRIc_s1600-rw-v1_ozjqjg.webp', 'SynergyCon Event Moment', 'Leadership sessions', '1.0 Highlights', 38, now(), now()),
  ('image', 'https://res.cloudinary.com/djafuqelg/image/upload/v1763054944/AKGpihaYWsReyxCFqn2Hz0Cqz1QkXjeSuqeh_ZxKtNSDt92re0HLcHfeK4RI7ncNkrB-twG_e9XeHILpyWxys0P6GidDg-UtGWmStw_s1600-rw-v1_x2sfuf.webp', 'SynergyCon Event Moment', 'Event highlights showcase', '1.0 Highlights', 39, now(), now());

-- Insert all 9 gallery videos with proper categorization based on content type
INSERT INTO gallery_items (type, youtube_url, title, description, category, display_order, created_at, updated_at)
VALUES
  -- Welcome Address (Speech)
  ('video', 'https://www.youtube.com/watch?v=cIMQkIKilBQ', 'Welcome Address by Engr. Femi Akinbote at SynergyCon 1.0', 'Opening remarks welcoming attendees and setting the stage for SynergyCon''s mission to advance Nigeria''s Creative Economy', 'Speech', 101, now(), now()),
  
  -- Government and Leadership Speeches
  ('video', 'https://www.youtube.com/watch?v=CVgSUMk5FvE', 'Speech by Erelu AMB. PROF. Olufolake Abdulrazaq, First Lady of Kwara State', 'First Lady of Kwara State shares insights on government support for the Creative Economy and cultural development', 'Speech', 102, now(), now()),
  ('video', 'https://www.youtube.com/watch?v=6-40NKkks04', 'Speech by Mr. Olatunbosun Alake, Lagos State Commissioner for Innovation, Science, & Technology', 'Lagos State Commissioner discusses the intersection of technology, innovation, and creativity in driving economic growth', 'Speech', 103, now(), now()),
  ('video', 'https://www.youtube.com/watch?v=97ZZWAGjgpE', 'Speech by Ms Chalya Shagaya, SNR Special Assistant to the President', 'Senior Special Assistant to the President on Creative Economy initiatives and federal government support', 'Speech', 104, now(), now()),
  ('video', 'https://www.youtube.com/watch?v=5PeJWm6K7co', 'Speech by Hon. Mobolaji Ogunlende, Lagos State Commissioner for Youth & Social Development', 'Lagos State Commissioner addresses youth empowerment and social development through creative industries', 'Speech', 105, now(), now()),
  
  -- Industry Expert Speeches
  ('video', 'https://www.youtube.com/watch?v=j3ehY-M5AfI', 'The Creator Economy Speech by Mr. Deji Fayose, GCFO FCMB', 'GCFO of FCMB explores the Creator Economy landscape, opportunities, and financial strategies for creative professionals', 'Speech', 106, now(), now()),
  
  -- Panel Discussions
  ('video', 'https://www.youtube.com/watch?v=DKtbvMKpbaU', 'The Business of Creativity: Funding, Security & Scaling for Success Panel at SynergyCon 1.0', 'Expert panel discussion on funding strategies, security measures, and scaling creative businesses in Nigeria', 'Panel', 107, now(), now()),
  ('video', 'https://www.youtube.com/watch?v=4H-RRyMoAlA', 'The Nigerian Creative Sector and its Numerous Challenges Panel at SynergyCon 1.0', 'Panel discussion addressing key challenges facing Nigeria''s Creative sector including infrastructure, funding, and policy gaps', 'Panel', 108, now(), now()),
  
  -- Keynote Address
  ('video', 'https://www.youtube.com/watch?v=KEwxkX-Bcl0', 'Keynote Speech by Hon. Justice Helen Moronkeji JSC, CFR at SynergyCon 1.0', 'Inspiring keynote address on legal frameworks, intellectual property rights, and protecting creative works in Nigeria', 'Keynote', 109, now(), now());
