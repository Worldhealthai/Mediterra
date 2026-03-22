// ================================================================
// MEDITERRA — Main Script
// ================================================================

// ── Supabase image loading ────────────────────────────────────

function initSupabaseIfReady() {
    try { if (typeof initSupabase === 'function') initSupabase(); }
    catch (e) { console.warn('Supabase init:', e); }
}

async function loadImagesFromSupabase() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient
            .from('site_images').select('*').eq('is_active', true);
        if (error) throw error;
        return data;
    } catch (e) { console.warn('Supabase load:', e); return null; }
}

async function loadAdminData() {
    try {
        initSupabaseIfReady();
        if (supabaseClient) {
            const rows = await loadImagesFromSupabase();
            if (rows && rows.length) {
                const cfg = { images: { hero: null, logo: null, location: null, method: null, gallery: [] } };
                rows.forEach(r => {
                    if (r.image_type.startsWith('gallery-'))
                        cfg.images.gallery.push({ src: r.image_url, alt: r.alt_text });
                    else cfg.images[r.image_type] = r.image_url;
                });
                applyImages(cfg); return;
            }
        }
    } catch (e) { console.warn('loadAdminData:', e); }

    const stored = localStorage.getItem('mediterra_site_config');
    if (stored) { try { applyImages(JSON.parse(stored)); return; } catch (_) {} }

    const legacy = localStorage.getItem('mediterraData');
    if (legacy) { try { applyLegacy(JSON.parse(legacy)); } catch (_) {} }
}

function applyImages(cfg) {
    if (!cfg?.images) return;
    if (cfg.images.hero) {
        const el = document.querySelector('.hero-bg');
        if (el) el.style.backgroundImage = `url('${cfg.images.hero}')`;
    }
    if (cfg.images.logo)
        document.querySelectorAll('.logo-img').forEach(img => { img.src = cfg.images.logo; });
    if (cfg.images.location) {
        const el = document.querySelector('.location-img');
        if (el) el.src = cfg.images.location;
    }
    if (cfg.images.method) {
        const el = document.querySelector('.method-img');
        if (el) el.src = cfg.images.method;
    }
    if (cfg.images.gallery?.length) {
        const imgs = document.querySelectorAll('.gallery-img');
        cfg.images.gallery.forEach((item, i) => {
            if (imgs[i] && item.src) { imgs[i].src = item.src; if (item.alt) imgs[i].alt = item.alt; }
        });
    }
}

function applyLegacy(data) {
    if (!data?.images) return;
    if (data.images.hero) {
        const el = document.querySelector('.hero-bg');
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

document.addEventListener('DOMContentLoaded', () => { loadAdminData().catch(console.warn); });

// ── Navigation ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('menuToggle');
    const menu   = document.getElementById('navMenu');
    if (!navbar) return;

    let last = 0;
    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        navbar.classList.toggle('scrolled', y > 40);
        if (y > last && y > 120) navbar.classList.add('hidden');
        else if (y < last) navbar.classList.remove('hidden');
        last = y;
    }, { passive: true });

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(a =>
        a.addEventListener('click', () => {
            toggle?.classList.remove('open');
            menu?.classList.remove('open');
        })
    );

    document.addEventListener('click', e => {
        if (!navbar.contains(e.target)) {
            toggle?.classList.remove('open');
            menu?.classList.remove('open');
        }
    });
});

// ── Smooth scroll ─────────────────────────────────────────────

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

// ── Scroll reveal ─────────────────────────────────────────────

const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ── Hero parallax ─────────────────────────────────────────────

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const y = window.pageYOffset;
    if (y > hero.offsetHeight) return;
    const bg   = hero.querySelector('.hero-bg');
    const body = hero.querySelector('.hero-content');
    if (bg)   bg.style.transform   = `translateY(${y * 0.35}px)`;
    if (body) body.style.opacity   = 1 - (y / hero.offsetHeight) * 0.9;
}, { passive: true });

// ── Active nav section highlight ──────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a');
    if (!sections.length || !links.length) return;
    window.addEventListener('scroll', () => {
        let cur = '';
        sections.forEach(s => { if (window.pageYOffset >= s.offsetTop - 130) cur = s.id; });
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
    }, { passive: true });
});
