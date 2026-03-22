// ================================================================
// MEDITERRA — Main Script
// ================================================================

// ---- SUPABASE / ADMIN IMAGE LOADING ----

function initSupabaseIfReady() {
    try {
        if (typeof initSupabase === 'function') initSupabase();
    } catch (e) {
        console.warn('Supabase init error:', e);
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
    } catch (e) {
        console.warn('Supabase load error:', e);
        return null;
    }
}

async function loadAdminData() {
    try {
        initSupabaseIfReady();
        if (supabaseClient) {
            const rows = await loadImagesFromSupabase();
            if (rows && rows.length > 0) {
                const cfg = { images: { hero: null, logo: null, location: null, method: null, gallery: [] } };
                rows.forEach(img => {
                    if (img.image_type.startsWith('gallery-')) {
                        cfg.images.gallery.push({ src: img.image_url, alt: img.alt_text });
                    } else {
                        cfg.images[img.image_type] = img.image_url;
                    }
                });
                applyAdminImages(cfg);
                return;
            }
        }
    } catch (e) {
        console.warn('Admin data load error:', e);
    }

    // localStorage fallback
    const stored = localStorage.getItem('mediterra_site_config');
    if (stored) {
        try { applyAdminImages(JSON.parse(stored)); return; } catch (_) {}
    }

    // Legacy fallback
    const legacy = localStorage.getItem('mediterraData');
    if (legacy) {
        try { applyAdminImagesLegacy(JSON.parse(legacy)); } catch (_) {}
    }
}

function applyAdminImages(cfg) {
    if (!cfg || !cfg.images) return;

    if (cfg.images.hero) {
        const el = document.querySelector('.hero-bg-image');
        if (el) el.style.backgroundImage = `url('${cfg.images.hero}')`;
    }

    if (cfg.images.logo) {
        document.querySelectorAll('.logo-img').forEach(img => { img.src = cfg.images.logo; });
    }

    if (cfg.images.location) {
        const el = document.querySelector('.location-img');
        if (el) el.src = cfg.images.location;
    }

    if (cfg.images.method) {
        const el = document.querySelector('.method-img');
        if (el) el.src = cfg.images.method;
    }

    if (cfg.images.gallery && cfg.images.gallery.length) {
        const imgs = document.querySelectorAll('.gallery-img');
        cfg.images.gallery.forEach((item, i) => {
            if (imgs[i] && item.src) {
                imgs[i].src = item.src;
                if (item.alt) imgs[i].alt = item.alt;
            }
        });
    }
}

function applyAdminImagesLegacy(data) {
    if (!data || !data.images) return;
    if (data.images.hero) {
        const el = document.querySelector('.hero-bg-image');
        if (el) el.style.backgroundImage = `url('${data.images.hero}')`;
    }
    if (data.images.location) {
        const el = document.querySelector('.location-img');
        if (el) el.src = data.images.location;
    }
    if (data.images.gallery) {
        const imgs = document.querySelectorAll('.gallery-img');
        data.images.gallery.forEach((item, i) => {
            if (imgs[i]) { imgs[i].src = item.url; imgs[i].alt = item.alt; }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAdminData().catch(console.warn);
});

// ---- NAVIGATION ----

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('menuToggle');
    const menu   = document.getElementById('navMenu');
    const links  = document.querySelectorAll('.nav-links a');

    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        navbar.classList.toggle('scrolled', y > 50);
        if (y > lastScroll && y > 140) {
            navbar.classList.add('hidden');
        } else if (y < lastScroll) {
            navbar.classList.remove('hidden');
        }
        lastScroll = y;
    }, { passive: true });

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
        });
    }

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (toggle) toggle.classList.remove('open');
            if (menu)   menu.classList.remove('open');
        });
    });

    document.addEventListener('click', e => {
        if (!navbar.contains(e.target)) {
            if (toggle) toggle.classList.remove('open');
            if (menu)   menu.classList.remove('open');
        }
    });
});

// ---- SMOOTH SCROLL ----

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
                    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
                }
            }
        });
    });
});

// ---- SCROLL REVEAL ----

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -70px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

// ---- HERO PARALLAX ----

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const y = window.pageYOffset;
    if (y > hero.offsetHeight) return;

    const video   = hero.querySelector('.hero-video');
    const bgImage = hero.querySelector('.hero-bg-image');
    const body    = hero.querySelector('.hero-body');
    const offset  = y * 0.38;

    if (video)   video.style.transform   = `translate(-50%, calc(-50% + ${offset}px))`;
    if (bgImage) bgImage.style.transform = `translateY(${offset}px)`;
    if (body)    body.style.opacity      = 1 - (y / hero.offsetHeight) * 0.85;
}, { passive: true });

// ---- ACTIVE NAV HIGHLIGHT ----

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a');
    if (!sections.length || !links.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.pageYOffset >= s.offsetTop - 140) current = s.id;
        });
        links.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });
});

// ---- ACCESSIBILITY SKIP LINK ----

const skip = document.createElement('a');
skip.href = '#about';
skip.textContent = 'Skip to content';
skip.style.cssText = `
    position: absolute; top: -50px; left: 1rem;
    background: #C9A84C; color: #030E1A;
    padding: 0.6rem 1.2rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    text-decoration: none; z-index: 9999;
    transition: top 0.2s;
`;
skip.addEventListener('focus', () => { skip.style.top = '1rem'; });
skip.addEventListener('blur',  () => { skip.style.top = '-50px'; });
document.body.insertBefore(skip, document.body.firstChild);
