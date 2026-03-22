// ===========================
// LOAD ADMIN PANEL DATA
// ===========================

// Use Supabase client from supabase-config.js (already declared globally)
function initSupabaseIfReady() {
    try {
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

async function loadImagesFromSupabase() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient
            .from('site_images')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error loading from Supabase:', error);
        return null;
    }
}

async function loadAdminData() {
    try {
        initSupabaseIfReady();

        if (supabaseClient) {
            const supabaseImages = await loadImagesFromSupabase();
            if (supabaseImages && supabaseImages.length > 0) {
                const config = {
                    images: { hero: null, logo: null, location: null, method: null, gallery: [] }
                };
                supabaseImages.forEach(img => {
                    const type = img.image_type;
                    if (type.startsWith('gallery-')) {
                        config.images.gallery.push({ src: img.image_url, alt: img.alt_text });
                    } else {
                        config.images[type] = img.image_url;
                    }
                });
                applyNewAdminData(config);
                return;
            }
        }
    } catch (error) {
        console.error('Error in loadAdminData:', error);
    }

    // Fallback to localStorage
    const newAdminData = localStorage.getItem('mediterra_site_config');
    if (newAdminData) {
        try {
            applyNewAdminData(JSON.parse(newAdminData));
            return;
        } catch (error) {
            console.error('Error loading localStorage data:', error);
        }
    }

    try {
        const response = await fetch('site-data.json');
        if (response.ok) {
            applyAdminData(await response.json());
            return;
        }
    } catch (_) {}

    const savedData = localStorage.getItem('mediterraData');
    if (savedData) {
        try { applyAdminData(JSON.parse(savedData)); } catch (_) {}
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAdminData().catch(console.error);
});

function applyNewAdminData(config) {
    if (!config || !config.images) return;

    if (config.images.hero) {
        const heroBg = document.querySelector('.hero-bg-image');
        if (heroBg) heroBg.style.backgroundImage = `url('${config.images.hero}')`;
    }

    if (config.images.logo) {
        document.querySelectorAll('.logo-img').forEach(img => { img.src = config.images.logo; });
    }

    if (config.images.location) {
        const locationImg = document.querySelector('.location-img');
        if (locationImg) locationImg.src = config.images.location;
    }

    if (config.images.method) {
        const methodImg = document.querySelector('.method-img');
        if (methodImg) methodImg.src = config.images.method;
    }

    if (config.images.gallery && config.images.gallery.length > 0) {
        const galleryImgs = document.querySelectorAll('.gallery-img');
        config.images.gallery.forEach((img, index) => {
            if (galleryImgs[index] && img.src) {
                galleryImgs[index].src = img.src;
                if (img.alt) galleryImgs[index].alt = img.alt;
            }
        });
    }
}

function applyAdminData(data) {
    if (!data) return;
    if (data.images) {
        if (data.images.hero) {
            const heroBg = document.querySelector('.hero-bg-image');
            if (heroBg) heroBg.style.backgroundImage = `url('${data.images.hero}')`;
        }
        if (data.images.location) {
            const locationImg = document.querySelector('.location-img');
            if (locationImg) locationImg.src = data.images.location;
        }
        if (data.images.gallery) {
            const galleryImgs = document.querySelectorAll('.gallery-img');
            data.images.gallery.forEach((img, index) => {
                if (galleryImgs[index]) {
                    galleryImgs[index].src = img.url;
                    galleryImgs[index].alt = img.alt;
                }
            });
        }
    }
}

// ===========================
// NAVIGATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 120) {
            navbar.classList.add('hidden');
        } else if (currentScroll < lastScroll) {
            navbar.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle && navMenu) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            if (menuToggle && navMenu) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});

// ===========================
// SMOOTH SCROLLING
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 72,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// ===========================
// SCROLL ANIMATIONS
// ===========================
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ===========================
// HERO PARALLAX
// ===========================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const heroBgImage = hero.querySelector('.hero-bg-image');
    const heroContent = hero.querySelector('.hero-content');

    if (scrolled < hero.offsetHeight) {
        const heroVideo = hero.querySelector('.hero-video');
        const parallaxOffset = scrolled * 0.35;

        if (heroVideo) {
            heroVideo.style.transform = `translate(-50%, calc(-50% + ${parallaxOffset}px))`;
        }
        if (heroBgImage) {
            heroBgImage.style.transform = `translateY(${parallaxOffset}px)`;
        }
        if (heroContent) {
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.8;
        }
    }
});

// ===========================
// ACTIVE NAV LINK
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 140) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// ===========================
// GALLERY HOVER Z-INDEX
// ===========================
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', function() { this.style.zIndex = '10'; });
    item.addEventListener('mouseleave', function() { this.style.zIndex = ''; });
});

// ===========================
// ACCESSIBILITY
// ===========================
const skipLink = document.createElement('a');
skipLink.href = '#about';
skipLink.textContent = 'Skip to content';
skipLink.style.cssText = `
    position: absolute; top: -48px; left: 16px;
    background: #b5924c; color: #fff;
    padding: 10px 16px; font-size: 0.75rem;
    letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; z-index: 9999;
    transition: top 0.2s;
`;
skipLink.addEventListener('focus', () => { skipLink.style.top = '16px'; });
skipLink.addEventListener('blur',  () => { skipLink.style.top = '-48px'; });
document.body.insertBefore(skipLink, document.body.firstChild);
