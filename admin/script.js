// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    loadGitHubConfig();
    setupImagePreviews();
    checkDeploymentStatus();
});

// ===========================
// NAVIGATION
// ===========================

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Add active class to nav item
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
}

// ===========================
// DATA COLLECTION
// ===========================

function collectData() {
    return {
        hero: {
            title: document.getElementById('hero-title')?.value || '',
            subtitle: document.getElementById('hero-subtitle')?.value || '',
            description: document.getElementById('hero-description')?.value || '',
            button: document.getElementById('hero-button')?.value || '',
            video: document.getElementById('hero-video')?.value || '',
            fallback: document.getElementById('hero-fallback')?.value || ''
        },
        news: {
            text: document.getElementById('news-text')?.value || ''
        },
        about: {
            title: document.getElementById('about-title')?.value || '',
            lead: document.getElementById('about-lead')?.value || '',
            p1: document.getElementById('about-p1')?.value || '',
            p2: document.getElementById('about-p2')?.value || '',
            philosophyTitle: document.getElementById('about-philosophy-title')?.value || '',
            philosophy: document.getElementById('about-philosophy')?.value || ''
        },
        location: {
            title: document.getElementById('location-title')?.value || '',
            text: document.getElementById('location-text')?.value || '',
            image: document.getElementById('location-img')?.value || ''
        },
        method: {
            title: document.getElementById('method-title')?.value || '',
            text: document.getElementById('method-text')?.value || '',
            image: document.getElementById('method-img')?.value || ''
        },
        wholesale: {
            title: document.getElementById('wholesale-title')?.value || '',
            text: document.getElementById('wholesale-text')?.value || ''
        },
        story: {
            title: document.getElementById('story-title')?.value || '',
            text: document.getElementById('story-text')?.value || ''
        },
        eco: {
            title: document.getElementById('eco-title')?.value || '',
            text: document.getElementById('eco-text')?.value || ''
        },
        gallery: [
            {
                url: document.getElementById('gallery1-img')?.value || '',
                alt: document.getElementById('gallery1-alt')?.value || ''
            },
            {
                url: document.getElementById('gallery2-img')?.value || '',
                alt: document.getElementById('gallery2-alt')?.value || ''
            },
            {
                url: document.getElementById('gallery3-img')?.value || '',
                alt: document.getElementById('gallery3-alt')?.value || ''
            },
            {
                url: document.getElementById('gallery4-img')?.value || '',
                alt: document.getElementById('gallery4-alt')?.value || ''
            },
            {
                url: document.getElementById('gallery5-img')?.value || '',
                alt: document.getElementById('gallery5-alt')?.value || ''
            },
            {
                url: document.getElementById('gallery6-img')?.value || '',
                alt: document.getElementById('gallery6-alt')?.value || ''
            }
        ],
        contact: {
            phone: document.getElementById('contact-phone')?.value || '',
            email: document.getElementById('contact-email')?.value || '',
            address: document.getElementById('contact-address')?.value || ''
        }
    };
}

// ===========================
// SAVE CHANGES
// ===========================

async function saveChanges() {
    const data = collectData();

    // Save to localStorage
    localStorage.setItem('mediterraAdminData', JSON.stringify(data));

    // Check if GitHub is configured
    const githubToken = localStorage.getItem('githubToken');
    const githubRepo = localStorage.getItem('githubRepo');

    if (githubToken && githubRepo) {
        // Auto-deploy to GitHub
        showLoadingOverlay(true);
        showToast('Deploying to production...', 'info');

        const success = await deployToGitHub(data, githubToken, githubRepo);

        showLoadingOverlay(false);

        if (success) {
            showToast('✅ Changes deployed! Live in ~30 seconds.', 'success');
        } else {
            showToast('⚠️ Deploy failed. Check console for errors.', 'error');
        }
    } else {
        // Just save locally
        showToast('✅ Changes saved locally', 'success');
    }
}

// ===========================
// GITHUB DEPLOYMENT
// ===========================

async function deployToGitHub(data, token, repo) {
    try {
        // Convert to site-data.json format
        const siteData = {
            images: {
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

        const jsonContent = JSON.stringify(siteData, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

        // Get current file SHA
        const getResponse = await fetch(`https://api.github.com/repos/${repo}/contents/site-data.json`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }

        // Update file
        const branch = localStorage.getItem('githubBranch') || 'main';
        const updateResponse = await fetch(`https://api.github.com/repos/${repo}/contents/site-data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'Update site content via admin panel',
                content: base64Content,
                sha: sha,
                branch: branch
            })
        });

        if (updateResponse.ok) {
            console.log('✅ Successfully deployed to GitHub');
            return true;
        } else {
            const error = await updateResponse.json();
            console.error('GitHub API error:', error);
            return false;
        }
    } catch (error) {
        console.error('Deploy error:', error);
        return false;
    }
}

// ===========================
// GITHUB CONFIGURATION
// ===========================

function saveGitHubConfig() {
    const repo = document.getElementById('github-repo')?.value.trim();
    const branch = document.getElementById('github-branch')?.value.trim() || 'main';
    const token = document.getElementById('github-token')?.value.trim();

    if (!repo) {
        showAlert('error', 'Please enter your GitHub repository');
        return;
    }

    if (!token) {
        showAlert('error', 'Please enter your GitHub token');
        return;
    }

    if (!repo.includes('/')) {
        showAlert('error', 'Repository must be in format: username/repository');
        return;
    }

    // Save to localStorage
    localStorage.setItem('githubRepo', repo);
    localStorage.setItem('githubBranch', branch);
    localStorage.setItem('githubToken', token);

    // Update UI
    updateDeploymentBadge(true);
    showAlert('success', '✅ Auto-deploy configured!');
    showToast('GitHub auto-deploy enabled! 🚀', 'success');
}

function loadGitHubConfig() {
    const repo = localStorage.getItem('githubRepo');
    const branch = localStorage.getItem('githubBranch');
    const token = localStorage.getItem('githubToken');

    if (document.getElementById('github-repo') && repo) {
        document.getElementById('github-repo').value = repo;
    }
    if (document.getElementById('github-branch') && branch) {
        document.getElementById('github-branch').value = branch;
    }
    if (document.getElementById('github-token') && token) {
        document.getElementById('github-token').value = token;
    }

    // Update badge
    updateDeploymentBadge(repo && token);
}

function checkDeploymentStatus() {
    const repo = localStorage.getItem('githubRepo');
    const token = localStorage.getItem('githubToken');
    updateDeploymentBadge(repo && token);
}

function updateDeploymentBadge(isConfigured) {
    const badge = document.getElementById('deploy-status');
    if (badge) {
        if (isConfigured) {
            badge.textContent = 'Configured';
            badge.classList.add('active');
        } else {
            badge.textContent = 'Not Configured';
            badge.classList.remove('active');
        }
    }
}

// ===========================
// LOAD SAVED DATA
// ===========================

function loadSavedData() {
    const savedData = localStorage.getItem('mediterraAdminData');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            populateForm(data);
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    } else {
        // Load defaults from current website
        loadDefaultsFromWebsite();
    }
}

function populateForm(data) {
    // Hero
    if (data.hero) {
        setValue('hero-title', data.hero.title);
        setValue('hero-subtitle', data.hero.subtitle);
        setValue('hero-description', data.hero.description);
        setValue('hero-button', data.hero.button);
        setValue('hero-video', data.hero.video);
        setValue('hero-fallback', data.hero.fallback);
    }

    // News
    if (data.news) {
        setValue('news-text', data.news.text);
    }

    // About
    if (data.about) {
        setValue('about-title', data.about.title);
        setValue('about-lead', data.about.lead);
        setValue('about-p1', data.about.p1);
        setValue('about-p2', data.about.p2);
        setValue('about-philosophy-title', data.about.philosophyTitle);
        setValue('about-philosophy', data.about.philosophy);
    }

    // Location
    if (data.location) {
        setValue('location-title', data.location.title);
        setValue('location-text', data.location.text);
        setValue('location-img', data.location.image);
        updateImagePreview('location');
    }

    // Method
    if (data.method) {
        setValue('method-title', data.method.title);
        setValue('method-text', data.method.text);
        setValue('method-img', data.method.image);
        updateImagePreview('method');
    }

    // Wholesale
    if (data.wholesale) {
        setValue('wholesale-title', data.wholesale.title);
        setValue('wholesale-text', data.wholesale.text);
    }

    // Story
    if (data.story) {
        setValue('story-title', data.story.title);
        setValue('story-text', data.story.text);
    }

    // Eco
    if (data.eco) {
        setValue('eco-title', data.eco.title);
        setValue('eco-text', data.eco.text);
    }

    // Gallery
    if (data.gallery) {
        data.gallery.forEach((img, index) => {
            const num = index + 1;
            setValue(`gallery${num}-img`, img.url);
            setValue(`gallery${num}-alt`, img.alt);
            updateImagePreview(`gallery${num}`);
        });
    }

    // Contact
    if (data.contact) {
        setValue('contact-phone', data.contact.phone);
        setValue('contact-email', data.contact.email);
        setValue('contact-address', data.contact.address);
    }
}

function loadDefaultsFromWebsite() {
    // Set defaults
    setValue('hero-title', 'Where the Sea Crafts Its Own Masterpiece');
    setValue('hero-subtitle', 'In the moving depths of the Artemisium Strait, we cultivate Mediterranean mussels shaped by pure waters, natural forces, and a heritage refined through generations.');
    setValue('hero-description', 'A craft elevated by precision, guided by instinct, and grounded in a place with its own memory.');
    setValue('hero-button', 'Wholesale Enquiries');
    setValue('hero-video', 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4');
    setValue('hero-fallback', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80');

    setValue('news-text', 'Precision in Motion — Our New Dispatch Center Is Underway.');

    setValue('about-title', 'Crafted by Nature. Refined Through Experience. Elevated by Purpose.');
    setValue('about-lead', 'Mediterra Mussel Farm is a family-owned aquaculture enterprise rooted in one of Greece\'s most exceptional marine landscapes.');
    setValue('about-p1', 'Here, powerful natural currents carve their own rhythm, renewing the waters and shaping the environment in which our mussels grow.');
    setValue('about-p2', 'We combine meticulous care, disciplined work, and a deep respect for the sea to offer premium Mediterranean mussels to select wholesale partners in Athens and throughout Greece.');
    setValue('about-philosophy-title', 'Our philosophy is simple:');
    setValue('about-philosophy', 'Let nature lead. We don't force growth. We create the conditions for it.');

    setValue('location-title', 'The Artemisium Strait');
    setValue('location-text', 'Our farm is situated in the Artemisium Strait between North Evia and Magnesia, where strong, nutrient-rich currents from the North Aegean pass through narrow channels...');
    setValue('location-img', 'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800&q=80');

    setValue('method-title', 'Longline Cultivation');
    setValue('method-text', 'We use the longline method, a proven aquaculture technique that suspends mussels on ropes in the water column...');
    setValue('method-img', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80');

    setValue('contact-phone', '+30 123 456 7890');
    setValue('contact-email', 'info@mediterramussel.com');
    setValue('contact-address', 'Artemisium Strait, North Evia, Greece');

    // Gallery defaults
    const galleryDefaults = [
        { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', alt: 'Fresh mussels in pristine waters' },
        { url: 'https://images.unsplash.com/photo-1583506897994-c2de2a2b5b27?w=600&q=80', alt: 'Greek coastal landscape at dawn' },
        { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', alt: 'Fresh mussels close-up' },
        { url: 'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=600&q=80', alt: 'Greek sea aerial view' },
        { url: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=600&q=80', alt: 'Greek strait and coastal waters' },
        { url: 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=600&q=80', alt: 'Sunset over Mediterranean waters' }
    ];

    galleryDefaults.forEach((img, index) => {
        const num = index + 1;
        setValue(`gallery${num}-img`, img.url);
        setValue(`gallery${num}-alt`, img.alt);
        updateImagePreview(`gallery${num}`);
    });

    // Update other previews
    updateImagePreview('location');
    updateImagePreview('method');
}

// ===========================
// UTILITIES
// ===========================

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || '';
    }
}

function setupImagePreviews() {
    // Setup listeners for all image inputs
    const imageInputs = [
        'location-img', 'method-img',
        'gallery1-img', 'gallery2-img', 'gallery3-img',
        'gallery4-img', 'gallery5-img', 'gallery6-img'
    ];

    imageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                const prefix = inputId.replace('-img', '');
                updateImagePreview(prefix);
            });
        }
    });
}

function updateImagePreview(prefix) {
    const input = document.getElementById(`${prefix}-img`);
    const preview = document.getElementById(`${prefix}-preview`);

    if (input && preview) {
        const url = input.value.trim();
        if (url) {
            preview.src = url;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function showAlert(type, message) {
    const alertDiv = document.getElementById('deploy-message');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.className = `alert ${type}`;
        alertDiv.style.display = 'block';

        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }
}

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

function previewSite() {
    window.open('../index.html', '_blank');
}
