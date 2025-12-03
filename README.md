# Mediterra Mussel Farm Website

A luxurious, responsive website for Mediterra Mussel Farm - Premium Mediterranean Mussels from the Artemisium Strait, North Evia, Greece.

## Features

- **Elegant Design**: Sophisticated color palette with deep navy blues, gold accents, and cream/white tones
- **Responsive Layout**: Fully responsive design that works beautifully on all devices
- **Smooth Animations**: Fade-in animations, parallax effects, and smooth scrolling
- **Modern Typography**: Premium fonts (Cormorant Garamond & Montserrat)
- **Interactive Navigation**: Sticky navbar with smooth scroll to sections
- **Mobile-Friendly**: Hamburger menu for mobile devices
- **Admin Panel**: Easy-to-use admin interface for managing images and content

## Structure

```
Mediterra/
├── index.html          # Main website
├── styles.css          # Website styling
├── script.js           # Website functionality
├── admin.html          # Admin panel
├── admin-styles.css    # Admin panel styling
├── admin-script.js     # Admin panel functionality
└── README.md           # This file
```

## Admin Panel

The website includes a powerful admin panel that allows you to manage all images and content without editing code.

### How to Access

Open `admin.html` in your browser to access the admin panel.

### Features

**Image Management:**
- Change hero background image
- Update location section image
- Update method section image
- Manage all 6 gallery images with custom alt text

**Content Management:**
- Edit news banner text
- Update hero section title and subtitle
- Change contact information (phone & email)

**Data Management:**
- Export all settings as JSON backup
- Reset to default settings
- All changes saved to browser localStorage

### How to Use the Admin Panel

1. Open `admin.html` in your web browser
2. Navigate to the "Images" tab
3. Paste image URLs into the input fields
   - Use Unsplash.com for free high-quality images
   - Search for: "greek sea", "mediterranean", "mussels", "aquaculture"
4. Click "Update Preview" to see changes
5. Click "Save Changes" at the top to apply to your website
6. Open `index.html` to see your changes live

### Finding Images

**Recommended Sources:**
- [Unsplash](https://unsplash.com) - Free high-quality images
- [Pexels](https://pexels.com) - Free stock photos
- [Pixabay](https://pixabay.com) - Free images and videos

**Search Terms:**
- "greek sea" / "greece coastline"
- "mediterranean water" / "aegean sea"
- "mussels" / "shellfish"
- "aquaculture" / "ocean farming"
- "blue water" / "sea sunset"

**Getting Image URLs:**
1. Right-click on any image
2. Select "Copy image address"
3. Paste into admin panel
4. For Unsplash, add `?w=800&q=80` to optimize loading

## Sections

1. **News Banner** - Subtle announcement banner
2. **Hero Section** - Dramatic full-screen introduction
3. **About** - Company overview and philosophy
4. **Location** - Information about the Artemisium Strait
5. **Method** - Cultivation techniques
6. **Wholesale** - B2B partnership information
7. **Story** - Company heritage and values
8. **Eco Hub** - Future vision and development
9. **Gallery** - Visual showcase (placeholder for images)
10. **Contact** - Contact information and CTAs
11. **Footer** - Branding and copyright

## How to Use

1. **Local Development**:
   - Simply open `index.html` in a web browser
   - No build process or dependencies required

2. **Adding Real Images**:
   - Replace the `.visual-placeholder` elements in HTML with actual `<img>` tags
   - Update the corresponding CSS to style the images

3. **Customization**:
   - Colors: Edit CSS variables in `:root` section of `styles.css`
   - Content: Update text directly in `index.html`
   - Fonts: Change font imports in `<head>` and CSS variables

## Color Palette

- **Navy Dark**: #0a1128
- **Navy**: #1c2541
- **Navy Light**: #2d3e5f
- **Gold**: #c9a961
- **Gold Light**: #d4af37
- **Cream**: #fafafa
- **White**: #ffffff

## Typography

- **Headings**: Cormorant Garamond (serif)
- **Body**: Montserrat (sans-serif)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized animations with CSS transitions
- Debounced scroll events
- Efficient Intersection Observer for scroll animations
- Minimal JavaScript for fast loading

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Skip-to-content link
- Sufficient color contrast ratios

## Next Steps

1. Add real photographs to the gallery section
2. Connect social media links (Instagram, LinkedIn, TikTok)
3. Set up contact form (if needed)
4. Add Google Analytics or tracking (if needed)
5. Optimize images for web delivery
6. Set up hosting and domain

## Contact Information

- **Phone**: +30 6984092007
- **Email**: mediterramf@gmail.com
- **Location**: Artemisium Strait, North Evia, Greece

---

© 2025 Mediterra Mussel Farm - Premium Mediterranean Mussels from Greece
