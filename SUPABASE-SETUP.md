# Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase storage for the Mediterra admin panel, replacing localStorage with a proper backend solution.

## Prerequisites
- Supabase account (already created ✓)
- Project URL: `https://tgbvjmknsjiutksucbnt.supabase.co` ✓

## Step 1: Get Your Anon Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Mediterra project
3. Click **Settings** → **API**
4. Copy the **"anon public"** key (starts with `eyJ...`)
   - ⚠️ **DO NOT** use the "service_role secret" key in client-side code!

## Step 2: Create Storage Bucket

Run this in your Supabase SQL Editor:

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mediterra-images', 'mediterra-images', true);

-- Set up public access policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'mediterra-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'mediterra-images' );

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'mediterra-images' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'mediterra-images' );
```

## Step 3: Create Database Table

Run this in your Supabase SQL Editor:

```sql
-- Create table to store image configuration
CREATE TABLE site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_type VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_site_images_type ON site_images(image_type, is_active);

-- Enable Row Level Security
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view active images"
ON site_images FOR SELECT
USING (is_active = true);

-- Authenticated users can insert/update
CREATE POLICY "Authenticated users can insert"
ON site_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update"
ON site_images FOR UPDATE
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_images_updated_at
    BEFORE UPDATE ON site_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Configuration File

Once you provide the anon key, I'll create a `config.js` file with:

```javascript
// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://tgbvjmknsjiutksucbnt.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE' // You need to provide this
};
```

## Benefits

✅ **Persistent**: Images work across all browsers and devices
✅ **Fast**: Delivered via Supabase CDN
✅ **Reliable**: Professional backend infrastructure
✅ **Scalable**: No size limitations
✅ **Secure**: Proper authentication and access control

## Next Steps

1. Get your anon key from Supabase dashboard
2. Share the anon key with me
3. I'll implement the full integration
4. Test and deploy!

---

**Security Note**: Never commit your secret/service_role key to git or expose it in client-side code!
