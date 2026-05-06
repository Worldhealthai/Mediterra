// ================================================================
// MEDITERRA — Dark Luxury Site Script
// ================================================================

// ── Supabase / Admin data ─────────────────────────────────────

function initSupabaseIfReady() {
    try { if (typeof initSupabase === 'function') initSupabase(); }
    catch (e) { console.warn('Supabase init:', e); }
}

async function loadImagesFromSupabase() {
    if (!window.supabaseClient) return null;
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
        if (window.supabaseClient) {
            const rows = await loadImagesFromSupabase();
            if (rows && rows.length) {
                const cfg = { images: { hero: null, logo: null, location: null, gallery: [] } };
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
        const el = document.querySelector('.hero-img');
        if (el) el.style.backgroundImage = `url('${cfg.images.hero}')`;
    }
    if (cfg.images.logo)
        document.querySelectorAll('.logo-img').forEach(img => { img.src = cfg.images.logo; });
    if (cfg.images.location) {
        const el = document.querySelector('.location-img');
        if (el) el.src = cfg.images.location;
    }
    if (cfg.images.gallery?.length) {
        const cells = document.querySelectorAll('.g-img');
        cfg.images.gallery.forEach((item, i) => {
            if (cells[i] && item.src) { cells[i].src = item.src; if (item.alt) cells[i].alt = item.alt; }
        });
    }
}

function applyLegacy(data) {
    if (!data?.images) return;
    if (data.images.hero) {
        const el = document.querySelector('.hero-img');
        if (el) el.style.backgroundImage = `url('${data.images.hero}')`;
    }
    if (data.images.location) {
        const el = document.querySelector('.location-img');
        if (el) el.src = data.images.location;
    }
    if (data.images.gallery) {
        const cells = document.querySelectorAll('.g-img');
        data.images.gallery.forEach((item, i) => {
            if (cells[i]) { cells[i].src = item.url; cells[i].alt = item.alt; }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { loadAdminData().catch(console.warn); });

// ── Navigation ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const nav    = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const links  = document.getElementById('navLinks');
    if (!nav) return;

    let lastY = 0;

    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        nav.classList.toggle('scrolled', y > 60);
        if (y > lastY && y > 120) nav.classList.add('hidden');
        else if (y < lastY)       nav.classList.remove('hidden');
        lastY = y;
    }, { passive: true });

    if (burger && links) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            links.classList.toggle('open');
        });
    }

    document.querySelectorAll('.nav-links a, .nav-cta').forEach(a =>
        a.addEventListener('click', () => {
            burger?.classList.remove('open');
            links?.classList.remove('open');
        })
    );

    document.addEventListener('click', e => {
        if (nav && !nav.contains(e.target)) {
            burger?.classList.remove('open');
            links?.classList.remove('open');
        }
    });
});

// ── Smooth scroll ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navH = parseInt(
                        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
                    ) || 80;
                    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
                }
            }
        });
    });
});

// ── Scroll reveal ─────────────────────────────────────────────

const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            revealIO.unobserve(e.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -56px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

// ── Hero parallax ─────────────────────────────────────────────

window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const y = window.pageYOffset;
    if (y > hero.offsetHeight) return;
    const bg   = hero.querySelector('.hero-img');
    const body = hero.querySelector('.hero-body');
    if (bg)   bg.style.transform  = `translateY(${y * 0.32}px)`;
    if (body) body.style.transform = `translateY(${y * 0.12}px)`;
    if (body) body.style.opacity   = Math.max(0, 1 - (y / (hero.offsetHeight * 0.65)));
}, { passive: true });

// ── Stat count-up ─────────────────────────────────────────────

function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

const statIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            animateCount(e.target);
            statIO.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-n[data-target]').forEach(el => statIO.observe(el));

// ── Active nav link on scroll ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navItems.length) return;

    window.addEventListener('scroll', () => {
        const navH = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
        ) || 80;
        let current = '';
        sections.forEach(s => {
            if (window.pageYOffset >= s.offsetTop - navH - 60) current = s.id;
        });
        navItems.forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`)
        );
    }, { passive: true });
});
