-- Supabase Schema for Jinjood Rice Cake Shop
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('chapssaltteok', 'mepssaltteok', 'tteokguk', 'others')),
  tags TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  is_best BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Gift Sets Table
CREATE TABLE IF NOT EXISTS gift_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('gift_set', 'songpyeon_set', 'baekil_dol_set')),
  items TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reciprocation Items Table
CREATE TABLE IF NOT EXISTS reciprocate_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ibaji', 'daprye')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT,
  link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Site Settings Table (for contact info, social links, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Cart Items Table (장바구니)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('menu_item', 'gift_set', 'reciprocate_item')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id, product_type)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_sets_updated_at
  BEFORE UPDATE ON gift_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reciprocate_items_updated_at
  BEFORE UPDATE ON reciprocate_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reciprocate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on menu_items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow public read access on gift_sets"
  ON gift_sets FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow public read access on reciprocate_items"
  ON reciprocate_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow public read access on banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow public read access on site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cart items policies (사용자 본인의 장바구니만 접근 가능)
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO site_settings (key, value) VALUES
  ('contact_info', '{
    "address": "부산광역시 수영구 황령대로 481번길 10-3",
    "phone": ["051-621-5108", "010-4728-6922", "010-6251-5108"],
    "email": "jea6922@naver.com",
    "bank_account": "112-2038-7604-08",
    "bank_name": "부산은행",
    "account_holder": "정은아",
    "business_hours": {
      "weekday": "오전 7시 - 오후 7시",
      "saturday": "오전 7시 - 오후 5시",
      "sunday": "휴무"
    },
    "call_hours": "매일 오전 7시 - 오후 9시",
    "map_coordinates": {
      "lat": 35.1595,
      "lng": 129.1015
    }
  }'),
  ('social_links', '{
    "instagram": "https://www.instagram.com/busan_jinjoods_rice_cake",
    "kakao_channel": "https://pf.kakao.com/_zsKlb",
    "naver_band": "https://band.us/band/77842984",
    "naver_blog": "https://m.blog.naver.com/jinjoo_ricecake"
  }');

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX idx_gift_sets_category ON gift_sets(category);
CREATE INDEX idx_gift_sets_is_active ON gift_sets(is_active);
CREATE INDEX idx_reciprocate_items_category ON reciprocate_items(category);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_display_order ON banners(display_order);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Storage bucket setup instructions
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket called 'images'
-- 3. Make it public
-- 4. Create folders: banners, menu, menu/giftset, menu/daprae, sns, videos
