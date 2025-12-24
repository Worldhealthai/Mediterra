// ===========================
// Mediterra Site Script
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // ===========================
    // SPLASH SCREEN
    // ===========================
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.display = 'flex';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 2500); // hide after 2.5s
    }

    // ===========================
    // LOAD IMAGES FROM LOCALSTORAGE
    // ===========================
    const configRaw = localStorage.getItem('mediterra_site_config');
    if (!configRaw) return;

    let config;
    try {
        config = JSON.parse(configRaw);
    } catch (e) {
        console.error('Failed to parse site config from localStorage', e);
        return;
    }

    const images = config.images || {};

    // Hero Section Video/Image
    if (images.hero) {
        const heroVideoSource = document.querySelector('.hero-video source');
        if (heroVideoSource) heroVideoSource.src = images.hero;
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) heroVideo.load();
    }

    // Logo
    if (images.logo) {
        document.querySelectorAll('.logo-img').forEach(img => {
            img.src = images.logo;
        });
    }

    // Location Section
    if (images.location) {
        const locationImg = document.querySelector('#location .location-img');
        if (locationImg) locationImg.src = images.location;
    }

    // Method Section
    if (images.method) {
        const methodImg = document.querySelector('#method .method-img');
        if (methodImg) methodImg.src = images.method;
    }

    // Gallery Section
    if (images.gallery && images.gallery.length > 0) {
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
    }

    // ===========================
    // OPTIONAL: Floating CTA Button Behavior
    // ===========================
    const floatingCta = document.getElementById('floatingCta');
    if (floatingCta) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatingCta.style.opacity = '1';
                floatingCta.style.pointerEvents = 'auto';
            } else {
                floatingCta.style.opacity = '0';
                floatingCta.style.pointerEvents = 'none';
            }
        });
    }
});
