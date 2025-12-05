# 🖼️ Mediterra Admin Panel - User Guide

## Quick Start

The new admin panel provides a simple, intuitive way to manage images on your website.

### Accessing the Admin Panel

1. Navigate to: `https://your-domain.com/admin.html`
2. Enter the admin password: `mediterra2024`
3. Start uploading images!

---

## 🔑 Login Credentials

**Default Password:** `mediterra2024`

### Changing the Password

To change the admin password:
1. Open `admin-script.js`
2. Find line 3: `const ADMIN_PASSWORD = 'mediterra2024';`
3. Change `'mediterra2024'` to your desired password
4. Save the file

---

## 📸 Managing Images

### Supported Image Types
- ✅ JPG/JPEG
- ✅ PNG

### Image Sections You Can Manage

#### 1. **Hero Section Background**
- **Location:** Main homepage background
- **Recommended Size:** 1920x1080px or larger
- **Format:** JPG or PNG
- **Usage:** This is the main background image visitors see first

#### 2. **Logo**
- **Location:** Navigation bar and splash screen
- **Recommended Size:** 500x500px
- **Format:** PNG (transparent background recommended)
- **Usage:** Your brand logo displayed throughout the site

#### 3. **Location Section Image**
- **Location:** The "Artemisium Strait" section
- **Recommended Size:** 800x600px or larger
- **Format:** JPG or PNG
- **Usage:** Showcases the coastal location

#### 4. **Method Section Image**
- **Location:** The "Cultivation Method" section
- **Recommended Size:** 800x600px or larger
- **Format:** JPG or PNG
- **Usage:** Displays mussel farming methods

#### 5. **Gallery Images (6 images)**
- **Location:** Gallery section at bottom of homepage
- **Recommended Size:** 600x400px or larger
- **Format:** JPG or PNG
- **Usage:** Showcase your farm, mussels, and operations

---

## 🚀 How to Upload Images

### Method 1: Drag & Drop
1. Open admin panel
2. Drag your image file from your computer
3. Drop it onto the upload area for the desired section
4. Preview appears immediately
5. Click "Save All Changes" to apply

### Method 2: Click to Browse
1. Open admin panel
2. Click on the upload area for desired section
3. Select image file from your computer
4. Preview appears immediately
5. Click "Save All Changes" to apply

---

## 💾 Saving Changes

**IMPORTANT:** After uploading images, you MUST click the **"💾 Save All Changes"** button to apply them to your website.

### What Happens When You Save?
1. Images are stored in your browser's localStorage
2. Images are converted to base64 format for instant loading
3. The main website automatically loads these images on next page refresh
4. A success message confirms the save

---

## ✅ Verifying Changes

After saving:
1. Open your main website (`index.html`)
2. Refresh the page (press F5 or Ctrl+R)
3. Your new images should appear immediately
4. Check browser console for: `✅ Admin images loaded successfully`

---

## 🔧 Troubleshooting

### Images Not Showing After Save?
1. Make sure you clicked "Save All Changes"
2. Refresh your main website page
3. Clear browser cache if needed (Ctrl+Shift+Delete)
4. Check that image file sizes aren't too large (under 5MB recommended)

### Can't Login?
1. Verify password is correct (case-sensitive)
2. Check that JavaScript is enabled in your browser
3. Try a different browser

### Upload Not Working?
1. Check file format (only JPG/PNG supported)
2. Ensure file size is reasonable (under 10MB)
3. Try a different image file
4. Check browser console for errors (F12)

---

## 📱 Browser Compatibility

The admin panel works on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

---

## 🔒 Security Notes

### Current Setup
- Password protection prevents unauthorized access
- Images stored in browser localStorage
- No server-side authentication (yet)

### Recommendations
1. **Change the default password** immediately
2. Don't share admin URL publicly
3. Use HTTPS for your domain
4. Consider adding server-side authentication for production

---

## 💡 Tips & Best Practices

### Image Quality
- Use high-resolution images for best results
- Compress images before upload (TinyPNG, ImageOptim)
- Maintain consistent aspect ratios within each section

### File Naming
- Use descriptive names: `hero-beach.jpg` not `IMG_1234.jpg`
- Avoid spaces and special characters
- Use lowercase for consistency

### Performance
- Keep total image size reasonable
- Use JPG for photos, PNG for logos/graphics
- Optimize images before upload

### Workflow
1. Prepare all images in advance
2. Upload one section at a time
3. Preview before saving
4. Save all changes together
5. Verify on main website

---

## 🎯 Example Workflow

**Scenario:** Updating all gallery images

1. Prepare 6 images (optimized, 800x600px, JPG format)
2. Name them: `gallery-1.jpg`, `gallery-2.jpg`, etc.
3. Login to admin panel
4. Scroll to "Gallery (6 Images)" section
5. Drag and drop all 6 images at once
6. Preview appears showing all images
7. Click "💾 Save All Changes"
8. Success message appears
9. Open main website in new tab
10. Refresh to see new gallery images

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify file formats and sizes
3. Try a different browser
4. Clear browser cache and cookies
5. Contact your developer

---

## 🔄 Future Enhancements

Planned features:
- [ ] Image compression on upload
- [ ] Cropping and editing tools
- [ ] Undo/redo functionality
- [ ] Image library/history
- [ ] Multi-user support
- [ ] Cloud storage integration

---

**Last Updated:** December 5, 2025
**Version:** 1.0.0
