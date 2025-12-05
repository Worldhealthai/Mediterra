// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadGitHubConfig();
    setupNavigation();
    setupImagePreviews();
});

// Navigation
function setupNavigation() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            showSection(target);

            // Update active state
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(id);
    if (section) section.classList.add('active');
}

// Image Previews
function setupImagePreviews() {
    const inputs = ['logo-img', 'location-img', 'method-img',
        'gallery1-img', 'gallery2-img', 'gallery3-img',
        'gallery4-img', 'gallery5-img', 'gallery6-img'];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const preview = document.getElementById(id.replace('-img', '-preview'));
                if (preview && input.value) {
                    preview.src = input.value;
                }
            });
        }
    });
}

// Save Changes
async function saveChanges() {
    const data = collectData();
    localStorage.setItem('mediterraAdminData', JSON.stringify(data));

    const token = localStorage.getItem('githubToken');
    const repo = localStorage.getItem('githubRepo');

    if (token && repo) {
        showToast('Deploying...');
        const success = await deployToGitHub(data, token, repo);
        showToast(success ? '✅ Deployed!' : '❌ Deploy failed', success ? 'success' : 'error');
    } else {
        showToast('✅ Saved locally');
    }
}

// Collect Data
function collectData() {
    return {
        logo: val('logo-img'),
        hero: {
            title: val('hero-title'),
            subtitle: val('hero-subtitle'),
            description: val('hero-description'),
            button: val('hero-button'),
            video: val('hero-video'),
            fallback: val('hero-fallback')
        },
        news: { text: val('news-text') },
        about: {
            title: val('about-title'),
            lead: val('about-lead'),
            p1: val('about-p1'),
            p2: val('about-p2'),
            philosophyTitle: val('about-philosophy-title'),
            philosophy: val('about-philosophy')
        },
        location: {
            title: val('location-title'),
            text: val('location-text'),
            image: val('location-img')
        },
        method: {
            title: val('method-title'),
            text: val('method-text'),
            image: val('method-img')
        },
        wholesale: {
            title: val('wholesale-title'),
            text: val('wholesale-text')
        },
        story: {
            title: val('story-title'),
            text: val('story-text')
        },
        eco: {
            title: val('eco-title'),
            text: val('eco-text')
        },
        gallery: [
            { url: val('gallery1-img'), alt: val('gallery1-alt') },
            { url: val('gallery2-img'), alt: val('gallery2-alt') },
            { url: val('gallery3-img'), alt: val('gallery3-alt') },
            { url: val('gallery4-img'), alt: val('gallery4-alt') },
            { url: val('gallery5-img'), alt: val('gallery5-alt') },
            { url: val('gallery6-img'), alt: val('gallery6-alt') }
        ],
        contact: {
            phone: val('contact-phone'),
            email: val('contact-email'),
            address: val('contact-address')
        }
    };
}

// Deploy to GitHub
async function deployToGitHub(data, token, repo) {
    try {
        const siteData = {
            images: {
                logo: data.logo,
                hero: data.hero.fallback,
                location: data.location.image,
                method: data.method.image,
                gallery: data.gallery
            },
            content: {
                news: data.news.text,
                heroTitle: data.hero.title,
                heroSubtitle: data.hero.subtitle,
                heroDescription: data.hero.description,
                heroButton: data.hero.button,
                heroVideo: data.hero.video,
                aboutTitle: data.about.title,
                aboutLead: data.about.lead,
                aboutP1: data.about.p1,
                aboutP2: data.about.p2,
                aboutPhilosophyTitle: data.about.philosophyTitle,
                aboutPhilosophy: data.about.philosophy,
                locationTitle: data.location.title,
                locationText: data.location.text,
                methodTitle: data.method.title,
                methodText: data.method.text,
                wholesaleTitle: data.wholesale.title,
                wholesaleText: data.wholesale.text,
                storyTitle: data.story.title,
                storyText: data.story.text,
                ecoTitle: data.eco.title,
                ecoText: data.eco.text,
                contactPhone: data.contact.phone,
                contactEmail: data.contact.email,
                contactAddress: data.contact.address
            }
        };

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(siteData, null, 2))));

        // Get SHA
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/site-data.json`, {
            headers: { 'Authorization': `token ${token}` }
        });
        const sha = getRes.ok ? (await getRes.json()).sha : null;

        // Update
        const branch = localStorage.getItem('githubBranch') || 'main';
        const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/site-data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update content via admin',
                content,
                sha,
                branch
            })
        });

        return updateRes.ok;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// GitHub Config
function saveGitHubConfig() {
    const repo = val('github-repo');
    const branch = val('github-branch') || 'main';
    const token = val('github-token');

    if (!repo || !token) {
        showStatus('Fill in all fields', 'error');
        return;
    }

    localStorage.setItem('githubRepo', repo);
    localStorage.setItem('githubBranch', branch);
    localStorage.setItem('githubToken', token);

    showStatus('✅ Configuration saved!', 'success');
    showToast('Auto-deploy enabled!');
}

function loadGitHubConfig() {
    set('github-repo', localStorage.getItem('githubRepo'));
    set('github-branch', localStorage.getItem('githubBranch') || 'main');
    set('github-token', localStorage.getItem('githubToken'));
}

// Load Data
function loadData() {
    const saved = localStorage.getItem('mediterraAdminData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            populateForm(data);
        } catch (e) {}
    } else {
        loadDefaults();
    }
}

function populateForm(data) {
    if (data.logo) {
        set('logo-img', data.logo);
        updatePreview('logo');
    }
    if (data.hero) {
        set('hero-title', data.hero.title);
        set('hero-subtitle', data.hero.subtitle);
        set('hero-description', data.hero.description);
        set('hero-button', data.hero.button);
        set('hero-video', data.hero.video);
        set('hero-fallback', data.hero.fallback);
    }
    if (data.news) set('news-text', data.news.text);
    if (data.about) {
        set('about-title', data.about.title);
        set('about-lead', data.about.lead);
        set('about-p1', data.about.p1);
        set('about-p2', data.about.p2);
        set('about-philosophy-title', data.about.philosophyTitle);
        set('about-philosophy', data.about.philosophy);
    }
    if (data.location) {
        set('location-title', data.location.title);
        set('location-text', data.location.text);
        set('location-img', data.location.image);
        updatePreview('location');
    }
    if (data.method) {
        set('method-title', data.method.title);
        set('method-text', data.method.text);
        set('method-img', data.method.image);
        updatePreview('method');
    }
    if (data.wholesale) {
        set('wholesale-title', data.wholesale.title);
        set('wholesale-text', data.wholesale.text);
    }
    if (data.story) {
        set('story-title', data.story.title);
        set('story-text', data.story.text);
    }
    if (data.eco) {
        set('eco-title', data.eco.title);
        set('eco-text', data.eco.text);
    }
    if (data.gallery) {
        data.gallery.forEach((img, i) => {
            set(`gallery${i+1}-img`, img.url);
            set(`gallery${i+1}-alt`, img.alt);
            updatePreview(`gallery${i+1}`);
        });
    }
    if (data.contact) {
        set('contact-phone', data.contact.phone);
        set('contact-email', data.contact.email);
        set('contact-address', data.contact.address);
    }
}

function loadDefaults() {
    set('logo-img', 'logo-transparent.png');
    set('hero-title', 'Where the Sea Crafts Its Own Masterpiece');
    set('hero-subtitle', 'In the moving depths of the Artemisium Strait, we cultivate Mediterranean mussels shaped by pure waters, natural forces, and a heritage refined through generations.');
    set('hero-description', 'A craft elevated by precision, guided by instinct, and grounded in a place with its own memory.');
    set('hero-button', 'Wholesale Enquiries');
    set('hero-video', 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4');
    set('hero-fallback', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80');
    set('news-text', 'Precision in Motion — Our New Dispatch Center Is Underway.');
    set('contact-phone', '+30 123 456 7890');
    set('contact-email', 'info@mediterramussel.com');
    updatePreview('logo');
}

// Utilities
function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function set(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
}

function updatePreview(prefix) {
    const img = document.getElementById(`${prefix}-preview`);
    const input = document.getElementById(`${prefix}-img`);
    if (img && input && input.value) {
        img.src = input.value;
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showStatus(msg, type) {
    const status = document.getElementById('deploy-status');
    if (status) {
        status.textContent = msg;
        status.className = type;
        status.style.display = 'block';
    }
}

function previewSite() {
    window.open('../index.html', '_blank');
}
