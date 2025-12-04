# Mediterra Admin Panel Guide

## 🎯 Quick Start

The admin panel allows you to easily update images and content on your Mediterra Mussel Farm website without touching any code.

### Accessing the Admin Panel

Open `admin.html` in your browser:
```
file:///path/to/your/project/admin.html
```

Or if deployed, visit:
```
https://your-domain.com/admin.html
```

---

## 📝 How to Update Your Website

### Method 1: Automated (Recommended)

1. **Edit Content**
   - Open `admin.html`
   - Navigate to "Images" or "Content" tab
   - Make your changes
   - Click "Update Preview" to see changes

2. **Save Changes**
   - Click the "Save Changes" button at the top
   - A `site-data.json` file will automatically download
   - A popup will show deployment instructions

3. **Deploy to Production**
   - Move the downloaded `site-data.json` to your project folder
   - Run the helper script:
     ```bash
     ./update-production.sh
     ```
   - Or manually:
     ```bash
     git add site-data.json
     git commit -m "Update site images and content"
     git push
     ```

4. **Done!** 🎉
   - Your changes will be live after deployment completes
   - Check your hosting platform for deployment status

### Method 2: Manual Export/Import

1. Make changes in admin panel
2. Go to "Settings" tab
3. Click "Export Settings (Download JSON)"
4. Save the file as `site-data.json` in your project folder
5. Commit and push to git

---

## 🖼️ Managing Images

### Option A: Upload from Computer
- Click the file upload button
- Select an image (max 5MB)
- Image will be converted to base64 and stored
- ⚠️ Base64 images increase file size - use URLs for production

### Option B: Use Image URLs (Recommended for Production)
- Find images on [Unsplash](https://unsplash.com) or other free image sites
- Copy the image URL
- Paste into the URL field
- Click "Update Preview"

### Recommended Image Sizes
- **Hero Background**: 1920x1080px or larger
- **Location/Method Images**: 800x600px
- **Gallery Images**: 600x400px

---

## 📋 Available Content Fields

### Images Tab
- Hero Background Image
- Location Section Image
- Method Section Image
- Gallery Images (6 images)

### Content Tab
- News Banner Text
- Hero Title
- Hero Subtitle
- Contact Phone
- Contact Email

---

## 🔄 How It Works

### Local Development
1. Changes are saved to your browser's `localStorage`
2. The main website reads from `localStorage` when available
3. Great for testing changes locally

### Production Deployment
1. Changes are exported to `site-data.json`
2. This file is committed to your git repository
3. The website loads from `site-data.json` in production
4. This ensures all visitors see the same content

---

## 🛠️ Troubleshooting

### Changes not showing on production
- Make sure you downloaded the `site-data.json` file
- Verify the file is in your project root folder
- Check that you committed and pushed the file to git
- Wait for deployment to complete on your hosting platform

### Images not loading
- Verify the image URL is accessible
- Check that the image URL uses `https://` (not `http://`)
- Try opening the URL directly in a browser
- Consider using a CDN like Unsplash for reliable hosting

### Lost my changes
- Changes are only saved when you click "Save Changes"
- Use "Export Settings" to create backups
- Production changes require committing `site-data.json`

---

## 📁 Files Overview

- `admin.html` - Admin panel interface
- `admin-styles.css` - Admin panel styling
- `admin-script.js` - Admin panel functionality
- `site-data.json` - Your saved content (created after first save)
- `update-production.sh` - Helper script for deploying changes

---

## 🚀 Tips for Best Results

1. **Always Preview**: Click "Update Preview" before saving
2. **Use High-Quality Images**: Visitors will notice the difference
3. **Keep File Sizes Reasonable**: Large images slow down your site
4. **Use URLs for Production**: Base64 images are convenient but increase file size
5. **Test Locally First**: Make changes, preview, then deploy
6. **Create Backups**: Use "Export Settings" regularly

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12 → Console)
2. Verify all files are in the correct location
3. Try clearing browser cache and reloading
4. Make sure your git repository is up to date

---

**Happy Editing! 🎨**
