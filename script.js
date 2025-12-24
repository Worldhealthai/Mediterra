// ===========================
// MAIN SITE SCRIPT - Mediterra
// ===========================

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    const siteConfigStr = localStorage.getItem('mediterra_site_config');
    let config = null;

    if (siteConfigStr) {
        try {
            config = JSON.parse(siteConfigStr);
        } catch (err) {
            console.warn('Failed to parse localStorage config:', err);
        }
    }

    // Default fallback images if nothing in localStorage
    if (!config) {
        config = {
            images: {
                hero: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
                logo: 'logo-transparent.png',
                location: 'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800&q=80',
                method: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
                gallery: [
                    { src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', alt: 'Gallery image 1' },
                    { src: 'https://images.unsplash.com/photo-1583506897994-c2de2a2b5b27?w=600&q=80', alt: 'Gallery image 2' },
                    { src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', alt: 'Gallery image 3' },
                    { src: 'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=600&q=80', alt: 'Gallery image 4' },
                    { src: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=600&q=80', alt: 'Gallery image 5' },
                    { src: 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=600&q=80', alt: 'Gallery image 6' }
                ]
            }
        };
    }

    // Apply images to DOM
    const applyImages = () => {
        const { images } = config;
        // Hero video fallback
        const heroVideoSource = document.querySelector('.hero-video source');
        if (heroVideoSource) heroVideoSource.src = images.hero;
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) heroVideo.load();

        // Logos
        document.querySelectorAll('.logo-img').forEach(img => { img.src = images.logo; });

        // Location image
        const locationImg = document.querySelector('#location .location-img');
        if (locationImg) locationImg.src = images.location;

        // Method image
        const methodImg = document.querySelector('#method .method-img');
        if (methodImg) methodImg.src = images.method;

        // Gallery
        const galleryContainer = document.querySelector('.gallery-grid');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            images.gallery.forEach(item => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                const imgEl = document.createElement('img');
                imgEl.src = item.src;
                imgEl.alt = item.alt;
                imgEl.className = 'gallery-img';
                div.appendChild(imgEl);
                galleryContainer.appendChild(div);
            });
        }
    };

    // Apply images
    applyImages();

    // Hide splash screen after 1.5s
    setTimeout(() => {
        if (splash) splash.style.display = 'none';
    }, 1500);
});
