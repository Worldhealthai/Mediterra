# Supabase Integration Setup Guide

## ✅ What's Been Completed

### 1. Configuration Files Created
- ✅ `supabase-config.js` - Client configuration with your credentials
- ✅ `supabase-setup.sql` - Complete database setup script
- ✅ Both HTML files updated to include Supabase library

### 2. Your Credentials (Configured)
- Project URL: `https://tgbvjmknsjiutksucbnt.supabase.co`
- Anon Key: Configured in `supabase-config.js`
- Bucket Name: `mediterra-images`

---

## 🚀 Next Steps

### Step 1: Run the SQL Setup (5 minutes)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your Mediterra project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-setup.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

**What this does:**
- Creates storage bucket `mediterra-images`
- Sets up public access policies for images
- Creates `site_images` database table
- Enables Row Level Security (RLS)
- Creates automatic timestamp updates

**Verify it worked:**
- Go to **Storage** → You should see `mediterra-images` bucket
- Go to **Table Editor** → You should see `site_images` table

---

### Step 2: Update Admin Panel Script

The admin panel needs to be updated to upload images to Supabase instead of localStorage.

**Current behavior:** Images stored in browser localStorage (not persistent)
**New behavior:** Images uploaded to Supabase Storage (permanent, works everywhere)

**Required changes in `admin-script.js`:**

1. **Initialize Supabase client** (add after password constant):
```javascript
// Initialize Supabase
let supabase = null;
document.addEventListener('DOMContentLoaded', () => {
    supabase = initSupabase();
});
```

2. **Update `saveAllChanges()` function** to:
   - Upload each image to Supabase Storage
   - Get public URL for each uploaded image
   - Save URLs to `site_images` database table
   - Show progress during upload

3. **Update `loadExistingImages()` function** to:
   - Fetch image URLs from Supabase database
   - Load them into the admin panel for editing

---

### Step 3: Update Main Site Script

The main site needs to load images from Supabase instead of localStorage.

**Required changes in `script.js`:**

1. **Update `loadAdminData()` function** to:
   - Initialize Supabase client
   - Fetch active images from `site_images` table
   - Apply image URLs to the page

2. **Remove localStorage dependency**:
   - Keep as fallback but prioritize Supabase
   - Check Supabase first, then localStorage

---

## 📋 Implementation Checklist

- [x] Supabase configuration file created
- [x] SQL setup script created
- [x] HTML files updated with Supabase library
- [ ] Run SQL setup in Supabase dashboard
- [ ] Update `admin-script.js` for Supabase uploads
- [ ] Update `script.js` for Supabase loading
- [ ] Test image upload in admin panel
- [ ] Test image loading on main site
- [ ] Test persistence across browsers
- [ ] Deploy to production

---

## 🔍 Testing the Integration

### Test 1: Upload Works
1. Go to `/admin.html` (password: `Kayak`)
2. Upload a test image
3. Check Supabase Dashboard → Storage → `mediterra-images`
4. You should see your uploaded image

### Test 2: Database Record Created
1. After uploading, check Supabase Dashboard → Table Editor → `site_images`
2. You should see a new row with the image URL

### Test 3: Images Load on Main Site
1. Go to main page (`index.html`)
2. Open browser console (F12)
3. Look for "✅ Images loaded from Supabase"
4. Images should display correctly

### Test 4: Cross-Browser Persistence
1. Upload images in Chrome
2. Open site in Firefox/Safari
3. Images should appear (they won't with localStorage!)

---

## 🎯 Benefits of This Implementation

| Feature | localStorage | Supabase |
|---------|-------------|----------|
| **Persistence** | Browser-specific | ✅ Global |
| **Cross-browser** | ❌ No | ✅ Yes |
| **Cross-device** | ❌ No | ✅ Yes |
| **Size limit** | ~5-10MB | ✅ 50MB+ |
| **CDN delivery** | ❌ No | ✅ Yes |
| **Professional** | ❌ No | ✅ Yes |

---

## 🛠️ Need Help?

If you encounter any issues:

1. **Check Supabase Dashboard:**
   - Storage → Verify bucket exists
   - Table Editor → Verify `site_images` table exists
   - SQL Editor → Re-run setup if needed

2. **Check Browser Console:**
   - Open developer tools (F12)
   - Look for error messages
   - Check network tab for failed uploads

3. **Common Issues:**
   - **"Bucket not found"** → Run SQL setup script
   - **"Permission denied"** → Check RLS policies in setup script
   - **"Upload failed"** → Check file size (<50MB) and format (jpg/png)

---

## 📝 Next Implementation Session

When you're ready to implement the actual upload/download logic, we'll need to:

1. Write the Supabase upload function in `admin-script.js`
2. Write the Supabase fetch function in `script.js`
3. Add progress indicators for uploads
4. Add error handling
5. Test thoroughly
6. Deploy!

**Estimated time:** 30-45 minutes for full implementation and testing

---

## 🔐 Security Notes

- ✅ Anon key is safe to use client-side
- ✅ RLS policies control who can read/write
- ❌ **NEVER** commit the service_role secret key to git
- 💡 Later, you can add authentication to restrict who can upload

---

**Status:** Foundation complete, ready for implementation! 🚀
