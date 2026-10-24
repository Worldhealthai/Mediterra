// ================================================================
// MEDITERRA — site interactions
// Every block checks for its own elements, so this file also runs
// on insights.html.
// ================================================================

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePtr  = matchMedia('(hover: hover) and (pointer: fine)').matches;

// ── Admin images (Supabase → localStorage fallback) ───────────
// supabase-config.js declares `let supabaseClient`, a global lexical
// binding — it is NOT a property of window, so reference it by name.

function getSupabase() {
    try {
        if (typeof initSupabase === 'function' && typeof supabase !== 'undefined') return initSupabase();
    } catch (e) { console.warn('Supabase init:', e); }
    return null;
}

function applyLocalConfig() {
    const stored = localStorage.getItem('mediterra_site_config');
    if (stored) { try { applyImages(JSON.parse(stored)); return; } catch (_) {} }

    const legacy = localStorage.getItem('mediterraData');
    if (legacy) {
        try {
            const d = JSON.parse(legacy);
            if (d?.images?.gallery) d.images.gallery = d.images.gallery.map(g => ({ src: g.url || g.src, alt: g.alt }));
            applyImages(d);
        } catch (_) {}
    }
}

// Local config applies instantly; Supabase (the source of truth) overrides
// it when it answers — supabase-js retries for seconds when offline.
async function loadAdminData() {
    applyLocalConfig();
    const client = getSupabase();
    if (client) {
        try {
            const { data, error } = await client.from('site_images').select('*').eq('is_active', true);
            if (error) throw error;
            if (data && data.length) {
                const cfg = { images: { gallery: [] } };
                data
                    .slice()
                    .sort((a, b) => (parseInt(a.image_type.split('-')[1], 10) || 0) - (parseInt(b.image_type.split('-')[1], 10) || 0))
                    .forEach(r => {
                        if (r.image_type.startsWith('gallery-')) cfg.images.gallery.push({ src: r.image_url, alt: r.alt_text });
                        else cfg.images[r.image_type] = r.image_url;
                    });
                applyImages(cfg);
                return;
            }
        } catch (e) { console.warn('Supabase load:', e); }
    }
}

function applyImages(cfg) {
    const im = cfg?.images;
    if (!im) return;
    if (im.hero) $$('.hero-img').forEach(el => { el.style.backgroundImage = `url('${im.hero}')`; });
    if (im.logo) $$('.logo-img').forEach(img => { img.src = im.logo; });
    if (im.location) $$('.location-img').forEach(img => { img.src = im.location; });
    if (im.method) $$('.method-img').forEach(img => { img.src = im.method; });
    if (im.gallery?.length) {
        const cells = $$('.g-cell');
        im.gallery.forEach((item, i) => {
            const cell = cells[i];
            if (!cell) return;
            const img = $('.g-img', cell);
            const cap = $('.g-overlay span', cell);
            if (img && item.src) img.src = item.src;
            if (item.alt && !/^Gallery image \d+$/.test(item.alt)) {
                if (img) img.alt = item.alt;
                if (cap) cap.textContent = item.alt;
            }
        });
    }
}

// ── Toast + clipboard ─────────────────────────────────────────

let toastTimer;
function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
}

async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    }
}

// ── Preloader ─────────────────────────────────────────────────

function initLoader() {
    const loader = $('#loader');
    const ready = () => document.body.classList.add('is-ready');
    if (!loader) { ready(); return; }

    let seen = false;
    try { seen = sessionStorage.getItem('mf_seen') === '1'; sessionStorage.setItem('mf_seen', '1'); } catch (_) {}

    if (seen || reduced) { loader.classList.add('gone'); ready(); return; }

    const num = $('#loaderNum'), bar = $('#loaderBar');
    const dur = 1500, t0 = performance.now();
    (function tick(now) {
        const p = clamp((now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        num.textContent = String(Math.round(e * 100)).padStart(2, '0');
        bar.style.transform = `scaleX(${e})`;
        if (p < 1) return requestAnimationFrame(tick);
        loader.classList.add('done');
        ready();
        setTimeout(() => loader.classList.add('gone'), 1150);
    })(t0);
}

// ── Cursor + magnetic buttons ─────────────────────────────────

function initCursor() {
    if (!finePtr || reduced) return;
    const cur = $('#cursor'), label = $('#cursorLabel');
    if (!cur) return;
    document.documentElement.classList.add('has-cursor');

    // Hidden until the first real mouse move, so it never parks mid-screen
    let x = -100, y = -100, cx = x, cy = y, seen = false;
    cur.classList.add('is-hidden');
    addEventListener('mousemove', e => {
        x = e.clientX; y = e.clientY;
        if (!seen) { seen = true; cx = x; cy = y; cur.classList.remove('is-hidden'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cur.classList.remove('is-hidden'));
    (function loop() {
        cx += (x - cx) * .2; cy += (y - cy) * .2;
        cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', e => {
        const lab = e.target.closest('[data-cursor]');
        const link = e.target.closest('a, button, label, input[type="range"]');
        cur.classList.toggle('is-label', !!lab);
        cur.classList.toggle('is-link', !lab && !!link);
        label.textContent = lab ? lab.dataset.cursor : '';
    });

    $$('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            el.style.transform = `translate(${dx * .22}px, ${dy * .3}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

// ── Navigation, menu, anchors ─────────────────────────────────

function initNav() {
    const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
    if (!nav) return;

    let last = scrollY;
    addEventListener('scroll', () => {
        const y = scrollY;
        nav.classList.toggle('is-solid', y > 40);
        const menuOpen = menu?.classList.contains('is-open');
        if (!menuOpen) nav.classList.toggle('is-hidden', y > last && y > 300);
        last = y;
    }, { passive: true });

    const setMenu = open => {
        if (!menu || !burger) return;
        menu.classList.toggle('is-open', open);
        menu.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('is-locked', open);
    };
    burger?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    $$('a', menu || document.createElement('div')).forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // Smooth in-page anchors
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const target = id.length > 1 ? $(id) : null;
        if (!target) return;
        e.preventDefault();
        const top = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - (nav.offsetHeight - 1);
        scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }));

    // Active chapter → rail + nav links
    const rail = $('.rail');
    const sections = $$('main section[id]');
    if (!sections.length) return;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        $$('.rail a').forEach(a => a.classList.toggle('is-active', a.dataset.target === id));
        $$('.nav-links a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        rail?.classList.toggle('is-visible', id !== 'top');
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
}

// ── Reveal on scroll + counters ───────────────────────────────

function initReveal() {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(el => io.observe(el));

    const cio = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, to = +el.dataset.to;
        cio.unobserve(el);
        if (reduced || !to) { el.textContent = to; return; }
        const t0 = performance.now(), dur = 1800;
        (function step(now) {
            const p = clamp((now - t0) / dur);
            el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * to);
            if (p < 1) requestAnimationFrame(step);
        })(t0);
    }), { threshold: .6 });
    $$('.count').forEach(el => cio.observe(el));
}

// ── Story: words light up as you read ─────────────────────────

function initStory() {
    const el = $('#storyText');
    if (!el) return null;
    const accent = /^(three|nothing\.)$/;
    el.innerHTML = el.textContent.trim().split(/\s+/)
        .map(w => `<span class="w${accent.test(w) ? ' accent' : ''}">${w}</span>`).join(' ');
    const words = $$('.w', el);
    if (reduced) { words.forEach(w => w.classList.add('lit')); return null; }
    return () => {
        const r = el.getBoundingClientRect();
        const p = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .35));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('lit', i < n));
    };
}

// ── Hero: animated sea currents ───────────────────────────────

function initCurrents() {
    const cv = $('#currents');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr, visible = true, mx = -9999, my = -9999, t = 0;

    const size = () => {
        dpr = Math.min(devicePixelRatio || 1, 2);
        w = cv.offsetWidth; h = cv.offsetHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', e => {
        const r = cv.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    cv.parentElement.addEventListener('pointerleave', () => { mx = my = -9999; });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(cv);

    const LINES = 18;
    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < LINES; i++) {
            const base = h * (.3 + (i / LINES) * .62);
            const amp = 10 + i * 1.4;
            const amber = i % 6 === 3;
            ctx.beginPath();
            for (let x = -20; x <= w + 20; x += 14) {
                const dx = x - mx, dy = base - my;
                const pull = Math.exp(-(dx * dx + dy * dy) / 26000) * 46;
                const y = base
                    + Math.sin(x * .0042 + t * (.6 + i * .03) + i) * amp
                    + Math.sin(x * .0011 - t * .25 + i * .5) * amp * .9
                    - pull;
                x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = amber ? 'rgba(233,162,59,.28)' : `rgba(237,231,220,${.04 + (i / LINES) * .07})`;
            ctx.lineWidth = amber ? 1.2 : 1;
            ctx.stroke();
        }
    };

    if (reduced) { draw(); return; }
    (function loop() {
        if (visible && !document.hidden) { t += .012; draw(); }
        requestAnimationFrame(loop);
    })();
}

// ── Marquee: drifts, speeds up with scroll velocity ───────────

function initMarquee() {
    const track = $('#marquee');
    if (!track || reduced) return;
    let x = 0, lastY = scrollY, vel = 0;
    (function loop() {
        const dy = scrollY - lastY; lastY = scrollY;
        vel += (Math.abs(dy) * .25 - vel) * .1;
        x -= .6 + vel;
        const half = track.scrollWidth / 2;
        if (-x >= half) x += half;
        track.style.transform = `translate3d(${x}px,0,0)`;
        requestAnimationFrame(loop);
    })();
}

// ── Origin: conditions tabs ───────────────────────────────────

function initTabs() {
    const chart = $('#chart');
    if (!chart) return;
    const tabs = $$('[role="tab"]', chart), panels = $$('.chart-panels p', chart);
    const select = i => {
        chart.dataset.active = i;
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
        panels.forEach((p, j) => p.classList.toggle('is-on', i === j));
    };
    tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(i));
        t.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
            select(n); tabs[n].focus();
        });
    });
}

// ── Descent: pinned journey through the four stages ───────────

function initDescent() {
    const track = $('#descentTrack');
    if (!track) return null;
    const section = $('#descent');
    const steps = $$('.dstep', section), num = $('#stageNum'), g = $('#clusters');

    // Build mussel clusters along the line
    const COUNT = 9;
    for (let i = 0; i < COUNT; i++) {
        const y = 60 + i * 50, side = i % 2 ? 1 : -1;
        g.insertAdjacentHTML('beforeend',
            `<g style="transform:scale(0)"><ellipse cx="${60 + side * 12}" cy="${y}" rx="7" ry="13" transform="rotate(${side * 24} ${60 + side * 12} ${y})"/>` +
            `<ellipse cx="${60 + side * 22}" cy="${y + 8}" rx="6" ry="11" transform="rotate(${side * 40} ${60 + side * 22} ${y + 8})"/>` +
            `<ellipse cx="${60 + side * 4}" cy="${y + 14}" rx="5" ry="10" transform="rotate(${side * 10} ${60 + side * 4} ${y + 14})"/></g>`);
    }
    const clusters = $$('g', g);
    let current = -1;

    return () => {
        const pinned = innerWidth > 960;
        let p = 1;
        if (pinned) {
            const r = track.getBoundingClientRect();
            p = clamp(-r.top / (r.height - innerHeight));
        }
        section.style.setProperty('--p', p.toFixed(4));
        clusters.forEach((c, i) => {
            const s = clamp((p * 1.12 - i / COUNT) * 5);
            c.style.transform = `scale(${s})`;
        });
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
        if (idx !== current) {
            current = idx;
            steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-past', i < idx); });
            num.textContent = String(idx + 1).padStart(2, '0');
        }
    };
}

// ── Harvest reel: drag, buttons, progress ─────────────────────

function initReel() {
    const reel = $('#reel');
    if (!reel) return;
    const cells = $$('.g-cell', reel), bar = $('#reelBar'), count = $('#reelCount');

    let down = false, moved = false, sx = 0, sl = 0;
    reel.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') return;
        down = true; moved = false; sx = e.clientX; sl = reel.scrollLeft;
    });
    addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (Math.abs(dx) > 4 && !moved) { moved = true; reel.classList.add('is-dragging'); }
        if (moved) reel.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        reel.classList.remove('is-dragging');
    });
    reel.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

    const step = dir => {
        const w = cells[0].getBoundingClientRect().width + parseFloat(getComputedStyle(reel).columnGap || 24);
        reel.scrollBy({ left: dir * w, behavior: reduced ? 'auto' : 'smooth' });
    };
    $('#reelPrev')?.addEventListener('click', () => step(-1));
    $('#reelNext')?.addEventListener('click', () => step(1));
    reel.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });

    const update = () => {
        const max = reel.scrollWidth - reel.clientWidth;
        bar.style.transform = `scaleX(${max > 0 ? reel.scrollLeft / max : 0})`;
        const mid = reel.scrollLeft + 40;
        let idx = 0;
        cells.forEach((c, i) => { if (c.offsetLeft - reel.offsetLeft <= mid) idx = i; });
        if (reel.scrollLeft >= max - 4) idx = cells.length - 1;
        count.textContent = String(idx + 1).padStart(2, '0');
    };
    reel.addEventListener('scroll', update, { passive: true });
    update();
}

// ── Partnership pillars ───────────────────────────────────────

function initPillars() {
    const pillars = $$('.pillar');
    const open = p => pillars.forEach(x => x.classList.toggle('is-open', x === p));
    pillars.forEach(p => {
        p.addEventListener('mouseenter', () => open(p));
        p.addEventListener('focus', () => open(p));
        p.addEventListener('click', () => open(p));
    });
}

// ── Enquiry composer ──────────────────────────────────────────

function initComposer() {
    const form = $('#composerForm');
    if (!form) return;
    const vol = $('#vol'), out = $('#volOut'), list = $('#briefList'), mail = $('#briefMail');
    const EMAIL = 'mediterramf@gmail.com';
    $('#briefDate').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const fmtVol = v => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)} t` : `${v} kg`;
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let prev = {};

    const build = () => {
        const fd = new FormData(form);
        const v = +vol.value;
        out.textContent = fmtVol(v);
        vol.style.setProperty('--fill', `${((v - vol.min) / (vol.max - vol.min)) * 100}%`);

        const rows = [
            ['Partner', fd.get('type')],
            ['Volume', `${fmtVol(v)} / week`],
            ['Delivery', fd.get('region')],
            ['Starting', fd.get('start')],
            ['Name', fd.get('name').trim()],
            ['Company', fd.get('company').trim()],
            ['Notes', fd.get('notes').trim()],
        ].filter(([, val]) => val);

        list.innerHTML = rows.map(([k, val]) =>
            `<div><dt>${k}</dt><dd class="${prev[k] !== undefined && prev[k] !== val ? 'flash' : ''}">${esc(val)}</dd></div>`).join('');
        prev = Object.fromEntries(rows);

        const text = rows.map(([k, val]) => `${k}: ${val}`).join('\n');
        const subject = `Wholesale enquiry: ${fd.get('type')}, ${fmtVol(v)}/week`;
        const body = `Hello Mediterra,\n\nI'd like to discuss a wholesale supply of mussels.\n\n${text}\n\nKind regards,\n${fd.get('name').trim() || ''}`;
        mail.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return `${subject}\n\n${text}`;
    };

    form.addEventListener('input', build);
    form.addEventListener('change', build);
    form.addEventListener('submit', e => e.preventDefault());
    $('#briefCopy')?.addEventListener('click', async () => {
        toast(await copyText(build()) ? 'Brief copied' : 'Copy failed. Select the text and copy it manually.');
    });
    build();
}

// ── Copy buttons + Athens clock ───────────────────────────────

function initContact() {
    $$('.copy[data-copy]').forEach(b => b.addEventListener('click', async () => {
        if (!(await copyText(b.dataset.copy))) return toast('Copy failed');
        b.classList.add('done'); b.textContent = 'Copied';
        toast('Copied to clipboard');
        setTimeout(() => { b.classList.remove('done'); b.textContent = 'Copy'; }, 1800);
    }));

    const clocks = $$('.athens-time');
    if (!clocks.length) return;
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Athens', hour: '2-digit', minute: '2-digit' });
    const tick = () => { const s = fmt.format(new Date()); clocks.forEach(c => { c.textContent = s; }); };
    tick();
    setInterval(tick, 15000);
}

// ── Insights filters ──────────────────────────────────────────

function initFilters() {
    const bar = $('#filters');
    if (!bar) return;
    const btns = $$('button', bar), arts = $$('.art[data-cat]');
    btns.forEach(b => b.addEventListener('click', () => {
        const cat = b.dataset.filter;
        btns.forEach(x => x.classList.toggle('is-on', x === b));
        arts.forEach(a => a.classList.toggle('is-hidden', cat !== 'all' && a.dataset.cat !== cat));
    }));
}

// ── Scroll-linked frame (progress bar, parallax, scrubs) ──────

function initScrollFrame(fns) {
    const bar = $('#progressBar'), heroImg = $('.hero .hero-img');
    let ticking = false;
    const frame = () => {
        ticking = false;
        const max = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        if (heroImg && !reduced && scrollY < innerHeight * 1.2) heroImg.parentElement.style.transform = `translate3d(0,${scrollY * .25}px,0)`;
        fns.forEach(fn => fn && fn());
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    frame();
}

// ── Boot ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadAdminData().catch(e => console.warn('Admin images:', e));
    initLoader();
    initCursor();
    initNav();
    initReveal();
    initCurrents();
    initMarquee();
    initTabs();
    initReel();
    initPillars();
    initComposer();
    initContact();
    initFilters();
    initScrollFrame([initStory(), initDescent()]);
});
