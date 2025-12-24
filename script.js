// ===========================
// LOAD ADMIN PANEL DATA
// ===========================
// Note: Splash screen is now handled by inline script in index.html

// Initialize Supabase client
let supabase = null;

// Initialize Supabase when library is ready (non-blocking)
function initSupabaseIfReady() {
    try {
        if (typeof initSupabase === 'function') {
            supabase = initSupabase();
            console.log('✅ Supabase initialized');
        } else {
            console.log('⚠️ Supabase config not loaded yet');
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
}

// Load images from Supabase
async function loadImagesFromSupabase() {
    if (!supabase) {
        console.log('⚠️ Supabase client not initialized, skipping...');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('site_images')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;

        console.log('✅ Loaded images from Supabase:', data);
        return data;

    } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
        return null;
    }
}

// Apply custom images as soon as DOM is ready
async function loadAdminData() {
    console.log('🔍 [MEDITERRA] Loading custom images...');

    try {
        // Initialize Supabase first
        initSupabaseIfReady();

        // Try to load from Supabase first (only if initialized)
        if (supabase) {
            const supabaseImages = await loadImagesFromSupabase();

            if (supabaseImages && supabaseImages.length > 0) {
                console.log(`✅ Found ${supabaseImages.length} images in Supabase`);

                // Convert Supabase data to config format
                const config = {
                    images: {
                        hero: null,
                        logo: null,
                        location: null,
                        method: null,
                        gallery: []
                    },
                    lastUpdated: new Date().toISOString()
                };

                supabaseImages.forEach(img => {
                    const type = img.image_type;

                    if (type.startsWith('gallery-')) {
                        config.images.gallery.push({
                            src: img.image_url,
                            alt: img.alt_text
                        });
                    } else {
                        config.images[type] = img.image_url;
                    }
                });

                applyNewAdminData(config);
                console.log('✅ Custom images from Supabase applied successfully');
                return;
            }
        }
    } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
    }

    // Fallback to localStorage
    console.log('⚠️ Falling back to localStorage...');
    const newAdminData = localStorage.getItem('mediterra_site_config');
    if (newAdminData) {
        try {
            const data = JSON.parse(newAdminData);
            applyNewAdminData(data);
            console.log('✅ Custom images from localStorage applied successfully');
            return;
        } catch (error) {
            console.error('❌ Error loading localStorage data:', error);
        }
    }

    // Try to load from site-data.json (for Vercel deployment)
    try {
        const response = await fetch('site-data.json');
        if (response.ok) {
            const data = await response.json();
            applyAdminData(data);
            return;
        }
    } catch (error) {
        console.log('No site-data.json found');
    }

    // Fallback to old localStorage format
    const savedData = localStorage.getItem('mediterraData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            applyAdminData(data);
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Load admin data when DOM is ready (non-blocking)
document.addEventListener('DOMContentLoaded', () => {
    loadAdminData().catch(error => {
        console.error('❌ Error in loadAdminData:', error);
    });
});

// Apply data from new admin panel
function applyNewAdminData(config) {
    if (!config || !config.images) {
        console.log('ℹ️ No admin config to apply');
        return;
    }

    let imagesApplied = 0;

    try {
        // Hero background
        if (config.images.hero) {
            const heroBg = document.querySelector('.hero-bg-image');
            if (heroBg) {
                heroBg.style.backgroundImage = `url('${config.images.hero}')`;
                heroBg.style.opacity = '1';
                imagesApplied++;
                console.log('✓ Hero background updated');
            }
        }

        // Logo (navbar and splash screen)
        if (config.images.logo) {
            const logoImgs = document.querySelectorAll('.logo-img');
            logoImgs.forEach(img => {
                if (img) {
                    img.src = config.images.logo;
                    imagesApplied++;
                }
            });
            // Also update splash logo if it still exists
            const splashLogo = document.querySelector('.splash-logo');
            if (splashLogo) {
                splashLogo.src = config.images.logo;
                imagesApplied++;
            }
            console.log('✓ Logo images updated');
        }

        // Location image
        if (config.images.location) {
            const locationImg = document.querySelector('.location-img');
            if (locationImg) {
                locationImg.src = config.images.location;
                imagesApplied++;
                console.log('✓ Location image updated');
            }
        }

        // Method image
        if (config.images.method) {
            const methodImg = document.querySelector('.method-img');
            if (methodImg) {
                methodImg.src = config.images.method;
                imagesApplied++;
                console.log('✓ Method image updated');
            }
        }

        // Gallery images
        if (config.images.gallery && config.images.gallery.length > 0) {
            const galleryImgs = document.querySelectorAll('.gallery-img');
            config.images.gallery.forEach((img, index) => {
                if (galleryImgs[index] && img.src) {
                    galleryImgs[index].src = img.src;
                    if (img.alt) {
                        galleryImgs[index].alt = img.alt;
                    }
                    imagesApplied++;
                }
            });
            console.log(`✓ ${config.images.gallery.length} gallery images updated`);
        }

        console.log(`✅ Successfully applied ${imagesApplied} custom images`);

        // Show a subtle notification that custom images are loaded
        if (imagesApplied > 0) {
            const notification = document.createElement('div');
            notification.textContent = '✓ Custom images loaded';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(212, 175, 55, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
            `;
            document.body.appendChild(notification);

            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

    } catch (error) {
        console.error('❌ Error applying custom images:', error);
        alert('Error loading custom images. Please try uploading them again in the admin panel.');
    }
}

function applyAdminData(data) {
    if (data) {
        try {

            // Update images
            if (data.images) {
                // Hero background
                if (data.images.hero) {
                    const heroBg = document.querySelector('.hero-bg-image');
                    if (heroBg) {
                        heroBg.style.backgroundImage = `url('${data.images.hero}')`;
                    }
                }

                // Location image
                if (data.images.location) {
                    const locationImg = document.querySelector('.location-img');
                    if (locationImg) {
                        locationImg.src = data.images.location;
                    }
                }

                // Method image
                if (data.images.method) {
                    const methodImg = document.querySelector('.method-img');
                    if (methodImg) {
                        methodImg.src = data.images.method;
                    }
                }

                // Gallery images
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

            // Update content
            if (data.content) {
                // News banner
                if (data.content.news) {
                    const newsText = document.querySelector('.news-text');
                    if (newsText) {
                        newsText.textContent = data.content.news;
                    }
                }

                // Hero title
                if (data.content.heroTitle) {
                    const heroTitle = document.querySelector('.hero-title');
                    if (heroTitle) {
                        heroTitle.textContent = data.content.heroTitle;
                    }
                }

                // Hero subtitle
                if (data.content.heroSubtitle) {
                    const heroSubtitle = document.querySelector('.hero-subtitle');
                    if (heroSubtitle) {
                        heroSubtitle.textContent = data.content.heroSubtitle;
                    }
                }

                // Contact info
                if (data.content.contactPhone) {
                    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
                    phoneLinks.forEach(link => {
                        link.href = `tel:${data.content.contactPhone}`;
                        link.textContent = data.content.contactPhone;
                    });
                }

                if (data.content.contactEmail) {
                    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
                    emailLinks.forEach(link => {
                        link.href = `mailto:${data.content.contactEmail}`;
                        link.textContent = data.content.contactEmail;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
}

// ===========================
// NAVIGATION FUNCTIONALITY
// ===========================

const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-menu a');

// Navbar scroll effect with fade on scroll down
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for background effect
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Hide navbar when scrolling down, show when scrolling up
    if (currentScroll > lastScroll && currentScroll > 150) {
        // Scrolling down & past threshold
        navbar.classList.add('hidden');
    } else if (currentScroll < lastScroll) {
        // Scrolling up
        navbar.classList.remove('hidden');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// ===========================
// SMOOTH SCROLLING
// ===========================

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');

        // Only handle internal anchor links (starting with #)
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
        // For external links (like insights.html), let default navigation happen
    });
});

// Smooth scroll for buttons
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Only handle internal links
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===========================
// SCROLL ANIMATIONS
// ===========================

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// Observe individual elements
const elementsToAnimate = document.querySelectorAll(
    '.about-content, .location-text, .location-visual, .method-text, .method-visual, ' +
    '.wholesale-content, .story-content, .eco-hub-content, .contact-info, .contact-actions'
);

elementsToAnimate.forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
});

// ===========================
// GALLERY INTERACTIONS
// ===========================

const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });

    item.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// ===========================
// PARALLAX EFFECT FOR HERO
// ===========================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero) {
        // Parallax for content (subtle fade)
        const heroContent = hero.querySelector('.hero-content');
        if (scrolled < hero.offsetHeight) {
            // Subtle parallax - only slight fade, no transform to keep button accessible
            const fadeAmount = Math.min(scrolled / (hero.offsetHeight * 1.5), 0.3);
            heroContent.style.opacity = 1 - fadeAmount;
        }

        // Parallax for video/background (scrolls down slower for depth effect)
        const heroVideo = hero.querySelector('.hero-video');
        const heroBgImage = hero.querySelector('.hero-bg-image');

        if (scrolled < hero.offsetHeight) {
            // Move background down at 40% of scroll speed for parallax effect
            const parallaxOffset = scrolled * 0.4;

            if (heroVideo) {
                heroVideo.style.transform = `translate(-50%, calc(-50% + ${parallaxOffset}px))`;
            }

            if (heroBgImage) {
                heroBgImage.style.transform = `translateY(${parallaxOffset}px)`;
            }
        }
    }
});

// ===========================
// NEWS BANNER ANIMATION
// ===========================

const newsBanner = document.querySelector('.news-banner');
if (newsBanner) {
    setTimeout(() => {
        newsBanner.style.opacity = '1';
    }, 500);
}

// ===========================
// LOADING ANIMATION
// ===========================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// ACTIVE NAV LINK HIGHLIGHT
// ===========================

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= (sectionTop - 150)) {
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

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Apply debounce to scroll-heavy operations
const debouncedScroll = debounce(() => {
    // Scroll-dependent operations
}, 15);

window.addEventListener('scroll', debouncedScroll);

// ===========================
// ACCESSIBILITY ENHANCEMENTS
// ===========================

// Skip to content link
const skipLink = document.createElement('a');
skipLink.href = '#about';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to content';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--gold);
    color: var(--navy-dark);
    padding: 8px;
    text-decoration: none;
    z-index: 100;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});
document.body.insertBefore(skipLink, document.body.firstChild);

// ===========================
// CONSOLE MESSAGE
// ===========================

console.log('%cMediterra Mussel Farm', 'font-size: 24px; font-weight: bold; color: #c9a961;');
console.log('%cPremium Mediterranean Mussels from Greece', 'font-size: 14px; color: #1c2541;');
console.log('%cWebsite crafted with precision and care', 'font-size: 12px; color: #666;');

// ===========================
// FLOATING CTA BUTTON
// ===========================

const floatingCta = document.getElementById('floatingCta');

if (floatingCta) {
    // Hide floating CTA initially
    floatingCta.classList.add('hidden');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        const heroHeight = document.querySelector('.hero')?.offsetHeight || 600;

        // Show floating CTA after scrolling past hero section
        if (scrollPosition > heroHeight) {
            floatingCta.classList.remove('hidden');
        } else {
            floatingCta.classList.add('hidden');
        }
    });
}
