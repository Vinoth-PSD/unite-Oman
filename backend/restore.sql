-- ============================================================
-- UniteOman Database Restore Script
-- Run this with: psql -h localhost -p 5432 -U postgres -d unite_oman_ai -f restore.sql
-- ============================================================

-- Clean up existing objects first (safe to run multiple times)
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.governorates CASCADE;
DROP TYPE IF EXISTS public.businessstatus CASCADE;
DROP TYPE IF EXISTS public.listingtype CASCADE;
DROP TYPE IF EXISTS public.plantype CASCADE;

-- ── Types ─────────────────────────────────────────────────────

CREATE TYPE public.businessstatus AS ENUM (
    'pending', 'active', 'suspended', 'rejected'
);

CREATE TYPE public.listingtype AS ENUM (
    'standard', 'featured', 'sponsored'
);

CREATE TYPE public.plantype AS ENUM (
    'basic', 'professional', 'enterprise'
);

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10),
    cover_image_url TEXT,
    description TEXT,
    business_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.governorates (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    emoji VARCHAR(10),
    business_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

CREATE TABLE public.businesses (
    id UUID PRIMARY KEY,
    name_en VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(300),
    category_id INTEGER REFERENCES public.categories(id),
    governorate_id INTEGER REFERENCES public.governorates(id),
    tags TEXT[],
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(200),
    website VARCHAR(300),
    address TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_urls TEXT[],
    status public.businessstatus,
    plan public.plantype,
    listing_type public.listingtype,
    is_verified BOOLEAN,
    is_featured BOOLEAN,
    business_hours JSONB,
    view_count INTEGER,
    rating_avg NUMERIC(3,2),
    rating_count INTEGER,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID,
    reviewer_name VARCHAR(100),
    rating INTEGER,
    comment TEXT,
    is_verified BOOLEAN,
    is_approved BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.services (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Categories Data ───────────────────────────────────────────

INSERT INTO public.categories (id, name_en, name_ar, slug, icon, cover_image_url, description, business_count, is_featured, sort_order, created_at) VALUES
(1, 'Restaurants', 'مطاعم', 'restaurants', '🍔', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop', 'Find the best dining spots and cafes.', 2, true, 1, '2026-03-13 16:11:18.344839+05:30'),
(2, 'Automotive', 'السيارات', 'automotive', '🚗', 'https://images.unsplash.com/photo-1550305080-4cf019fab0c0?q=80&w=2000&auto=format&fit=crop', 'Car dealerships, rentals, and repair shops.', 1, true, 2, '2026-03-13 16:11:18.344839+05:30'),
(3, 'Retail & Shopping', 'التجزئة والتسوق', 'retail', '🛍️', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop', 'Malls, supermarkets, and local stores.', 0, true, 3, '2026-03-13 16:11:18.344839+05:30'),
(4, 'Health & Medical', 'الصحة والطب', 'health', '🏥', 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop', 'Hospitals, clinics, and pharmacies.', 1, true, 4, '2026-03-13 16:11:18.344839+05:30'),
(5, 'Real Estate', 'عقارات', 'real-estate', '🏢', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop', 'Properties for rent, sale, and real estate agencies.', 1, true, 5, '2026-03-13 16:11:18.344839+05:30'),
(6, 'IT & Software', 'تقنية المعلومات', 'it-software', '💻', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop', 'Tech companies, software development, and IT services.', 0, false, 6, '2026-03-13 16:11:18.344839+05:30');

SELECT setval('public.categories_id_seq', 6, true);

-- ── Governorates Data ─────────────────────────────────────────

INSERT INTO public.governorates (id, name_en, name_ar, slug, emoji, business_count, created_at) VALUES
(1,  'Muscat',              'مسقط',          'muscat',              '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(2,  'Dhofar',              'ظفار',           'dhofar',              '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(3,  'Musandam',            'مسندم',          'musandam',            '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(4,  'Al Buraymi',          'البريمي',        'al-buraymi',          '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(5,  'Ad Dakhiliyah',       'الداخلية',       'ad-dakhiliyah',       '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(6,  'Al Batinah North',    'شمال الباطنة',   'al-batinah-north',    '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(7,  'Al Batinah South',    'جنوب الباطنة',   'al-batinah-south',    '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(8,  'Ash Sharqiyah North', 'شمال الشرقية',   'ash-sharqiyah-north', '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(9,  'Ash Sharqiyah South', 'جنوب الشرقية',   'ash-sharqiyah-south', '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(10, 'Adh Dhahirah',        'الظاهرة',        'adh-dhahirah',        '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30'),
(11, 'Al Wusta',            'الوسطى',         'al-wusta',            '🇴🇲', 0, '2026-03-13 17:21:49.25146+05:30');

SELECT setval('public.governorates_id_seq', 11, true);

-- ── Users Data ────────────────────────────────────────────────

INSERT INTO public.users (id, email, password_hash, role, created_at, is_active) VALUES
('c19f8d81-27bf-40ff-9688-3d381094b267', 'shop1@gmail.com',                          '$2b$12$8AkaKCz4U8fr9L333aIZkuMygoM7XG/RAN8X32CBCh3wRpwOykh8a', 'vendor', '2026-03-14 13:34:11.959544+05:30', false),
('663ba31e-cd9f-4ed7-a909-b8c3430e052c', 'final_car@example.com',                    '$2b$12$wynmPAzr1J6hEeu1gpiWhOAasz1GsytYvQlKnE9niheiPrUbDFCXC', 'vendor', '2026-03-14 15:49:53.813159+05:30', true),
('bf5b03cc-00fb-4850-a0a3-ba845053f8e7', 'john_final@example.com',                   '$2b$12$YaH6einU41HSGjKpuBZJzOjJkbZA7hXAnofgj6Maa.G/wNCeQwXz.', 'vendor', '2026-03-14 16:06:27.991459+05:30', true),
('9eeea122-aa24-4b23-841c-62f121c6a580', 'final_car@example.comjohn_final@example.com','$2b$12$r3AG.cnujUgnjwEq5pfivenkVNdhy5SxyJcZ7rKHV7BBxh6JcrIL2', 'vendor', '2026-03-14 16:05:12.040411+05:30', true),
('f6136fed-f688-4a0c-8324-67677245cbf3', 'darshanshreedhev@gmail.com',               '$2b$12$Yxbq2CoVZsrwgvICePp.we6dUiE5PEBA57SE23sxBy4MSiIghrmz2', 'vendor', '2026-03-14 16:06:44.864608+05:30', true),
('9559fcc1-acfb-4b64-be8b-dc48e25b83e9', 'shop3@gmail.com',                          '$2b$12$cMuu/UZduKRHa0AOcjFV2.I3xqkO3ERoJ32oeBncxHr57fHZC2HXm', 'vendor', '2026-03-14 13:47:23.078448+05:30', true),
('d256570e-f5b2-4146-816b-3819234ec753', 'hotel@unite.om',                           '$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.', 'vendor', '2026-03-15 12:32:13.128319+05:30', true),
('5cf58263-9f8b-40df-9f98-19005b69dacf', 'foodtruck@unite.om',                       '$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.', 'vendor', '2026-03-15 12:32:13.128319+05:30', true),
('577cdc46-66fc-4df6-ae40-854b9272158f', 'medical@unite.om',                         '$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.', 'vendor', '2026-03-15 12:32:13.128319+05:30', true),
('cb34c71f-12c8-44b4-afff-e497949af7f8', 'autocare@unite.om',                        '$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.', 'vendor', '2026-03-15 12:32:13.128319+05:30', true),
('9d18cd48-8cab-423f-aa9d-76510588c254', 'cafe@gmail.com',                           '$2b$12$VKpw13f.W3a2j7.rrqP1yO9GVev.Ac79UbEAVhxwzqYspw7RMkxaq', 'vendor', '2026-03-15 13:22:10.919107+05:30', true);

-- ── Businesses Data ───────────────────────────────────────────

INSERT INTO public.businesses (id, name_en, name_ar, slug, description, short_description, category_id, governorate_id, tags, phone, whatsapp, email, website, address, latitude, longitude, logo_url, cover_image_url, gallery_urls, status, plan, listing_type, is_verified, is_featured, business_hours, view_count, rating_avg, rating_count, owner_id, created_at, updated_at) VALUES
(
  'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', 'Grand Oman Hotel', 'فندق عمان الكبير', 'grand-oman-hotel',
  'Luxury stay in the heart of Muscat.', '5-star luxury hotel', 5, NULL,
  '{"hotel","stay","luxury"}', '+968 24 123456', '+968 91234567', 'contact@grandoman.com', 'https://grandoman.com', 'Muscat, Oman',
  NULL, NULL,
  'https://images.unsplash.com/photo-1542314831-c6a4d4047338?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542314831-c6a4d4047338?q=80&w=2000&auto=format&fit=crop',
  '{"https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"}',
  'active', 'enterprise', 'sponsored', true, true,
  '{"friday":{"open":"02:00 PM","close":"11:00 PM"},"monday":{"open":"08:00 AM","close":"10:00 PM"},"sunday":{"open":"08:00 AM","close":"10:00 PM"},"tuesday":{"open":"08:00 AM","close":"10:00 PM"},"saturday":{"open":"08:00 AM","close":"11:00 PM"},"thursday":{"open":"08:00 AM","close":"10:00 PM"},"wednesday":{"open":"08:00 AM","close":"10:00 PM"}}',
  1515, 4.00, 5, 'd256570e-f5b2-4146-816b-3819234ec753', '2026-03-13 16:26:28.601577+05:30', '2026-03-15 12:33:04.469936+05:30'
),
(
  'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a3', 'Oman Bites Food Truck', 'عمان بايتس', 'oman-bites',
  'Street food and fast food burgers.', 'Fast food and burgers', 1, NULL,
  '{"food","fastfood","burgers"}', '+968 99 123123', '+968 99 123123', 'info@omanbites.com', '', 'Al Khuwair, Muscat',
  NULL, NULL,
  'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop',
  '{"https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1512413914561-12501a302638?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1508737804141-4c3b688e2546?q=80&w=800&auto=format&fit=crop"}',
  'active', 'basic', 'standard', false, false, '{}',
  811, 5.00, 1, '5cf58263-9f8b-40df-9f98-19005b69dacf', '2026-03-13 16:26:28.601577+05:30', '2026-03-15 12:32:13.128319+05:30'
),
(
  'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4', 'AutoCare Motors', 'العناية بالسيارات', 'autocare-motors',
  'Full service car repair and maintenance.', 'Car repair and maintenance', 2, NULL,
  '{"cars","repair","maintenance"}', '+968 24 555555', '+968 91 555555', 'support@autocare.om', 'https://autocare.om', 'Ruwi, Muscat',
  NULL, NULL,
  'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2000&auto=format&fit=crop',
  '{"https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1622321453982-1ebd92a2a7a4?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1579895066601-e23e2fb3eef1?q=80&w=800&auto=format&fit=crop"}',
  'active', 'professional', 'standard', true, false, '{}',
  1221, 4.00, 2, 'cb34c71f-12c8-44b4-afff-e497949af7f8', '2026-03-13 16:26:28.601577+05:30', '2026-03-15 12:32:13.128319+05:30'
),
(
  'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5', 'Al Maha Medical Center', 'مركز المها الطبي', 'al-maha-medical',
  'Specialized medical clinics and pharmacy.', 'Clinics and Pharmacy', 4, NULL,
  '{"health","clinic","pharmacy"}', '+968 24 888888', '+968 92 888888', 'contact@almaha.om', 'https://almaha.om', 'Bousher, Muscat',
  NULL, NULL,
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=200&auto=format&fit=crop',
  '/images/gallery/al-maha-medical/lobby.png',
  '{"/images/gallery/al-maha-medical/lobby.png"}',
  'active', 'enterprise', 'featured', true, true, '{}',
  4543, 5.00, 2, '577cdc46-66fc-4df6-ae40-854b9272158f', '2026-03-13 16:26:28.601577+05:30', '2026-03-15 12:32:13.128319+05:30'
),
(
  '85b3c79d-f2ef-45c9-b134-15938dd0561c', 'clothing store', '', 'final-car-wash',
  '', '', 3, 2,
  '{}', '9715078103', '12345678', 'cloth@gmail.com', '', '',
  NULL, NULL,
  'http://localhost:8000/uploads/8b1d2f76-4706-443b-ba30-07440dd7e29d.jpg',
  'http://localhost:8000/uploads/69de1990-0d61-4535-b74e-907dcbeea45e.jpg',
  '{"http://localhost:8000/uploads/adf05bd0-b150-497a-8b79-a4a8a842a60c.jpg","http://localhost:8000/uploads/b1a6dd7a-4e27-4a9e-9073-481cea1bc730.jpg","http://localhost:8000/uploads/7bbd9a25-1a3d-47c1-bf59-5b19ee039a0b.jpg"}',
  'active', 'basic', 'standard', true, false,
  '{"friday":{"open":"09:00","close":"18:00","closed":false},"monday":{"open":"09:00","close":"18:00","closed":false},"sunday":{"open":"09:00","close":"18:00","closed":false},"tuesday":{"open":"09:00","close":"18:00","closed":false},"saturday":{"open":"09:00","close":"18:00","closed":false},"thursday":{"open":"09:00","close":"18:00","closed":false},"wednesday":{"open":"09:00","close":"18:00","closed":false}}',
  51, 4.00, 2, '663ba31e-cd9f-4ed7-a909-b8c3430e052c', '2026-03-14 15:49:53.813159+05:30', '2026-03-15 13:24:17.468223+05:30'
),
(
  'fce63e77-aad3-409c-b4e3-d73b91fe11d7', 'foodcafe', NULL, 'foodcafe',
  NULL, NULL, 1, 3,
  '{}', NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, '{}',
  'active', 'basic', 'standard', false, false, '{}',
  2, 0.00, 0, '9d18cd48-8cab-423f-aa9d-76510588c254', '2026-03-15 13:22:10.919107+05:30', '2026-03-15 13:26:35.76635+05:30'
);

-- ── Reviews Data ──────────────────────────────────────────────

INSERT INTO public.reviews (id, business_id, user_id, reviewer_name, rating, comment, is_verified, is_approved, created_at) VALUES
('aba8184e-37eb-4d26-8694-283737e49420', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', NULL, 'Ahmed S.', 5, 'Absolutely magnificent experience! The views from the room were breathtaking and the staff was extremely accommodating.', NULL, true, '2026-03-11 16:30:09.611524+05:30'),
('91ee8878-ad2d-41fe-ae02-f7b8c9a77122', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', NULL, 'Fatima A.', 4, 'Very comfortable stay at Grand Oman. The breakfast buffet could use a bit more variety, but overall it was a great experience.', NULL, true, '2026-03-08 16:30:09.611524+05:30'),
('af84e93b-5e63-43b8-b21a-4c5e2c835758', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', NULL, 'rr', 5, 'rrr', false, true, '2026-03-13 17:54:32.648604+05:30'),
('173066c3-fecc-4173-b1b1-9a02840d3c48', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', NULL, 'rrrrr', 1, 'rrrr', false, true, '2026-03-13 17:54:42.660639+05:30'),
('6bdf1690-3295-4ffa-a2f0-b0a9e95644eb', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1', NULL, 'rrr', 5, 'rr', false, true, '2026-03-13 17:54:46.83149+05:30'),
('ab160dc9-4b85-416a-ac22-680ce457b838', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5', NULL, 'darshan', 5, '1', false, true, '2026-03-13 19:02:14.25238+05:30'),
('c6310133-b422-4fdd-9fc2-af5b04473278', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5', NULL, 'darshan', 5, '13e', false, true, '2026-03-13 19:02:58.115863+05:30'),
('651148d1-5d0a-4cea-b6e5-9f89bc4f2638', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4', NULL, 'mjio', 3, 'superj', false, true, '2026-03-13 19:08:11.65396+05:30'),
('5d3c9c2c-f624-4d7c-9ecf-c986591a25fa', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4', NULL, 'dev', 5, 'best', false, true, '2026-03-13 19:08:28.279147+05:30'),
('abbfbbc1-3d89-40e9-9767-f56daf7171cc', 'b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a3', NULL, 'test', 5, 'sb', false, true, '2026-03-14 10:24:43.786364+05:30'),
('eba0a6cc-7746-4e95-b3f6-d7d6bba2d0b5', '85b3c79d-f2ef-45c9-b134-15938dd0561c', NULL, 'rjr', 5, 'jf', false, true, '2026-03-14 17:15:24.631259+05:30'),
('7cc7b889-bb24-472d-9af4-08258f933ee8', '85b3c79d-f2ef-45c9-b134-15938dd0561c', NULL, 'n ', 3, 'j3', false, true, '2026-03-14 17:15:36.206199+05:30');

-- ── Services Data ─────────────────────────────────────────────

INSERT INTO public.services (id, business_id, name, description, price, created_at) VALUES
('d0e956d0-8db1-4050-9855-a5236ff4aa49', '85b3c79d-f2ef-45c9-b134-15938dd0561c', 'car wash', 'g', '5omr', '2026-03-14 17:10:07.421496+05:30'),
('990b1a8c-e4d6-475c-9989-ec38a1c7eb7a', '85b3c79d-f2ef-45c9-b134-15938dd0561c', 'bike wash', 'clean and good', '10omr ', '2026-03-14 17:14:58.12557+05:30');

-- Done!
SELECT 'Database restore complete!' AS status;
