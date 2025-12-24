-- Mediterra Supabase Setup
-- Run these commands in your Supabase SQL Editor

-- ========================================
-- 1. CREATE STORAGE BUCKET
-- ========================================

-- Create the storage bucket for images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mediterra-images',
  'mediterra-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. STORAGE POLICIES
-- ========================================

-- Allow public read access to all images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'mediterra-images' );

-- Allow anyone to upload (you can make this more restrictive later)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'mediterra-images' );

-- Allow anyone to update
CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'mediterra-images' );

-- Allow anyone to delete
CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'mediterra-images' );

-- ========================================
-- 3. CREATE DATABASE TABLE
-- ========================================

-- Table to store image configuration and URLs
CREATE TABLE IF NOT EXISTS site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_type VARCHAR(50) NOT NULL UNIQUE, -- 'hero', 'logo', 'location', 'method', 'gallery-1', etc.
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- path in Supabase storage
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_images_type ON site_images(image_type, is_active);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on the table
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Allow public to read active images
CREATE POLICY "Public can view active images"
ON site_images FOR SELECT
USING (is_active = true);

-- Allow anyone to insert (you can restrict this later with authentication)
CREATE POLICY "Anyone can insert images"
ON site_images FOR INSERT
WITH CHECK (true);

-- Allow anyone to update
CREATE POLICY "Anyone can update images"
ON site_images FOR UPDATE
USING (true);

-- Allow anyone to delete
CREATE POLICY "Anyone can delete images"
ON site_images FOR DELETE
USING (true);

-- ========================================
-- 5. AUTOMATIC UPDATED_AT TRIGGER
-- ========================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for site_images table
DROP TRIGGER IF EXISTS update_site_images_updated_at ON site_images;
CREATE TRIGGER update_site_images_updated_at
    BEFORE UPDATE ON site_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SETUP COMPLETE!
-- ========================================

-- Verify the setup
SELECT 'Storage bucket created' AS status;
SELECT * FROM storage.buckets WHERE id = 'mediterra-images';
SELECT 'Database table created' AS status;
SELECT * FROM site_images LIMIT 1;
