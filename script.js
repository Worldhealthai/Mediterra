// ===========================
// SPLASH SCREEN
// ===========================

// Add splash-active class to body initially
document.body.classList.add('splash-active');

// Remove splash screen after animation completes
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.remove('splash-active');
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            setTimeout(() => {
                splashScreen.remove();
            }, 800);
        }
    }, 2500);
});

// ===========================
// LOAD ADMIN PANEL DATA
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
});

async function loadAdminData() {
    // Try to load from site-data.json first (for Vercel deployment)
    try {
        const response = await fetch('site-data.json');
        if (response.ok) {
            const data = await response.json();
            applyAdminData(data);
            return;
        }
    } catch (error) {
        // site-data.json doesn't exist, fall back to localStorage
        console.log('No site-data.json found, using localStorage');
    }

    // Fallback to localStorage
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
        const heroContent = hero.querySelector('.hero-content');
        if (scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight);
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
