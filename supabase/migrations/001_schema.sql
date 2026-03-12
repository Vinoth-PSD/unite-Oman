-- ============================================================
-- UniteOman Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE business_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE plan_type AS ENUM ('basic', 'professional', 'enterprise');
CREATE TYPE listing_type AS ENUM ('standard', 'featured', 'sponsored');

-- ============================================================
-- GOVERNORATES
-- ============================================================
CREATE TABLE governorates (
  id          SERIAL PRIMARY KEY,
  name_en     VARCHAR(100) NOT NULL,
  name_ar     VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  emoji       VARCHAR(10),
  business_count INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO governorates (name_en, name_ar, slug, emoji) VALUES
  ('Muscat',          'مسقط',           'muscat',         '🏙️'),
  ('Dhofar',          'ظفار',           'dhofar',         '🌴'),
  ('Al Batinah North','شمال الباطنة',   'al-batinah-north','⚓'),
  ('Al Batinah South','جنوب الباطنة',   'al-batinah-south','⚓'),
  ('Al Dakhiliyah',   'الداخلية',       'al-dakhiliyah',  '🏔️'),
  ('Al Sharqiyah North','شمال الشرقية', 'al-sharqiyah-north','🏜️'),
  ('Al Sharqiyah South','جنوب الشرقية', 'al-sharqiyah-south','🌅'),
  ('Al Dhahirah',     'الظاهرة',        'al-dhahirah',    '🌾'),
  ('Al Buraymi',      'البريمي',        'al-buraymi',     '🏛️'),
  ('Musandam',        'مسندم',          'musandam',       '🌊'),
  ('Al Wusta',        'الوسطى',         'al-wusta',       '🏝️');

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  name_en         VARCHAR(100) NOT NULL,
  name_ar         VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  icon            VARCHAR(10),
  cover_image_url TEXT,
  description     TEXT,
  business_count  INT DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name_en, name_ar, slug, icon, is_featured, sort_order) VALUES
  ('Construction & Contractors', 'البناء والمقاولات',    'construction',  '🏗️', true,  1),
  ('Healthcare & Clinics',       'الرعاية الصحية',       'healthcare',    '🏥', true,  2),
  ('Restaurants & Cafes',        'المطاعم والمقاهي',     'restaurants',   '🍽️', true,  3),
  ('Legal & Consultancy',        'القانون والاستشارات',  'legal',         '⚖️', true,  4),
  ('Real Estate',                'العقارات',             'real-estate',   '🏠', true,  5),
  ('IT & Software',              'تقنية المعلومات',      'it-software',   '💻', true,  6),
  ('Education & Training',       'التعليم والتدريب',     'education',     '🎓', true,  7),
  ('Automotive',                 'السيارات',             'automotive',    '🚗', false, 8),
  ('Finance & Banking',          'المال والمصارف',       'finance',       '🏦', false, 9),
  ('Hotels & Tourism',           'الفنادق والسياحة',     'tourism',       '🏨', false, 10),
  ('Retail & Shopping',          'التجزئة والتسوق',      'retail',        '🛍️', false, 11),
  ('Logistics & Transport',      'اللوجستيات والنقل',   'logistics',     '🚚', false, 12);

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE businesses (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en           VARCHAR(200) NOT NULL,
  name_ar           VARCHAR(200),
  slug              VARCHAR(200) UNIQUE NOT NULL,
  description       TEXT,
  short_description VARCHAR(300),

  -- Classification
  category_id       INT REFERENCES categories(id) ON DELETE SET NULL,
  governorate_id    INT REFERENCES governorates(id) ON DELETE SET NULL,
  tags              TEXT[] DEFAULT '{}',

  -- Contact
  phone             VARCHAR(20),
  whatsapp          VARCHAR(20),
  email             VARCHAR(200),
  website           VARCHAR(300),
  address           TEXT,
  latitude          DECIMAL(10, 8),
  longitude         DECIMAL(11, 8),

  -- Media
  logo_url          TEXT,
  cover_image_url   TEXT,
  gallery_urls      TEXT[] DEFAULT '{}',

  -- Status & Plan
  status            business_status DEFAULT 'pending',
  plan              plan_type DEFAULT 'basic',
  listing_type      listing_type DEFAULT 'standard',
  is_verified       BOOLEAN DEFAULT FALSE,
  is_featured       BOOLEAN DEFAULT FALSE,

  -- Business Hours (JSON)
  business_hours    JSONB DEFAULT '{}',

  -- Stats
  view_count        INT DEFAULT 0,
  rating_avg        DECIMAL(3,2) DEFAULT 0,
  rating_count      INT DEFAULT 0,

  -- Ownership
  owner_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Search index
CREATE INDEX idx_businesses_search ON businesses USING gin(
  to_tsvector('english', coalesce(name_en,'') || ' ' || coalesce(description,'') || ' ' || coalesce(short_description,''))
);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_governorate ON businesses(governorate_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_featured ON businesses(is_featured);
CREATE INDEX idx_businesses_plan ON businesses(plan);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name VARCHAR(100),
  rating        INT CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_approved   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_business ON reviews(business_id);

-- ============================================================
-- BUSINESS HOURS HELPER VIEW
-- ============================================================
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses SET
    rating_avg = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE business_id = NEW.business_id AND is_approved = TRUE),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id AND is_approved = TRUE)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================================
-- UPDATE CATEGORY/GOVERNORATE COUNTS
-- ============================================================
CREATE OR REPLACE FUNCTION update_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category count
  UPDATE categories SET business_count = (
    SELECT COUNT(*) FROM businesses WHERE category_id = categories.id AND status = 'active'
  );
  -- Update governorate count
  UPDATE governorates SET business_count = (
    SELECT COUNT(*) FROM businesses WHERE governorate_id = governorates.id AND status = 'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_counts
AFTER INSERT OR UPDATE OR DELETE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_counts();

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
CREATE TABLE admin_profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   VARCHAR(200),
  role        VARCHAR(50) DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read active businesses
CREATE POLICY "Public read active businesses" ON businesses
  FOR SELECT USING (status = 'active');

-- Owners can update their own
CREATE POLICY "Owners can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Public can read approved reviews
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (is_approved = TRUE);

-- Users can insert reviews
CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED SAMPLE DATA
-- ============================================================
-- Note: Run after creating an admin user via Supabase Auth
-- UPDATE businesses SET owner_id = 'your-admin-uuid' WHERE ...

INSERT INTO businesses (name_en, name_ar, slug, description, short_description, category_id, governorate_id, phone, whatsapp, email, status, plan, listing_type, is_verified, is_featured, rating_avg, rating_count) VALUES
(
  'Al Harthy Engineering LLC', 'شركة الحارثي للهندسة',
  'al-harthy-engineering',
  'Leading construction and engineering firm in Oman with over 20 years of experience in residential, commercial and infrastructure projects across all governorates.',
  'Leading construction firm with 20+ years experience in Oman.',
  1, 1, '+968 2412 3456', '+968 9812 3456', 'info@alharthy-eng.com',
  'active', 'professional', 'sponsored', true, true, 4.9, 128
),
(
  'Muscat Private Hospital', 'مستشفى مسقط الخاص',
  'muscat-private-hospital',
  'State-of-the-art private hospital offering comprehensive medical services including emergency care, surgery, diagnostics and specialist consultations.',
  'Comprehensive private healthcare in the heart of Muscat.',
  2, 1, '+968 2459 8800', '+968 9559 8800', 'info@mphospital.com',
  'active', 'enterprise', 'sponsored', true, true, 4.6, 94
),
(
  'Al Busaidi Law Firm', 'مكتب البوسعيدي للمحاماة',
  'al-busaidi-law-firm',
  'Premier legal consultancy specializing in corporate law, real estate, commercial disputes and government contracts in Oman.',
  'Premier legal consultancy for corporate and commercial law.',
  4, 1, '+968 2470 1234', '+968 9370 1234', 'legal@albusaidi-law.com',
  'active', 'professional', 'featured', true, true, 4.9, 56
);
