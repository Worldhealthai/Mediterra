import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ===========================
   SUPABASE CONFIG
=========================== */

const supabaseUrl = "https://tgbvjmknsjiutksucbnt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnZqbWtuc2ppdXRrc3VjYm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Nzc5NjEsImV4cCI6MjA4MjE1Mzk2MX0.p4e4XMoWqVRBOS_-vqaSl44myRGy1HdGD5snvbBHQn4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ===========================
   LOAD IMAGES FROM SUPABASE
=========================== */

async function loadImagesFromSupabase() {
    const { data, error } = await supabase
        .from("content")
        .select("value")
        .eq("key", "site_images")
        .single();

    if (error || !data?.value?.images) {
        console.warn("ℹ️ No Supabase images found");
        return;
    }

    const images = data.value.images;

    // Hero background
    if (images.hero) {
        const heroBg = document.querySelector(".hero-bg-image");
        if (heroBg) {
            heroBg.style.backgroundImage = `url('${images.hero}')`;
            heroBg.style.opacity = "1";
        }
    }

    // Logo (navbar + splash)
    if (images.logo) {
        document.querySelectorAll(".logo-img").forEach(img => {
            img.src = images.logo;
        });

        const splashLogo = document.querySelector(".splash-logo");
        if (splashLogo) splashLogo.src = images.logo;
    }

    // Location image
    if (images.location) {
        const locationImg = document.querySelector(".location-img");
        if (locationImg) locationImg.src = images.location;
    }

    // Method image
    if (images.method) {
        const methodImg = document.querySelector(".method-img");
        if (methodImg) methodImg.src = images.method;
    }

    // Gallery
    if (images.gallery?.length) {
        const galleryImgs = document.querySelectorAll(".gallery-img");
        images.gallery.forEach((img, i) => {
            if (galleryImgs[i]) {
                galleryImgs[i].src = img.src;
                if (img.alt) galleryImgs[i].alt = img.alt;
            }
        });
    }

    console.log("✅ Images loaded from Supabase");
}

document.addEventListener("DOMContentLoaded", loadImagesFromSupabase);

/* ===========================
   SPLASH SCREEN
=========================== */

const splashShown = sessionStorage.getItem("splashShown");

if (!splashShown) {
    document.body.classList.add("splash-active");
    sessionStorage.setItem("splashShown", "true");

    window.addEventListener("load", () => {
        setTimeout(() => {
            document.body.classList.remove("splash-active");
            const splash = document.getElementById("splashScreen");
            if (splash) splash.remove();
        }, 2500);
    });
} else {
    const splash = document.getElementById("splashScreen");
    if (splash) splash.remove();
}

/* ===========================
   NAVIGATION
=========================== */

const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-menu a");

let lastScroll = 0;

window.addEventListener("scroll", () => {
    const current = window.pageYOffset;

    navbar.classList.toggle("scrolled", current > 100);
    navbar.classList.toggle("hidden", current > lastScroll && current > 150);

    lastScroll = current;
});

menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
});

navLinks.forEach(link =>
    link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
    })
);

/* ===========================
   SMOOTH SCROLL
=========================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: "smooth"
            });
        }
    });
});

/* ===========================
   SCROLL ANIMATIONS
=========================== */

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add("visible");
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll("section, .fade-in").forEach(el => {
    el.classList.add("fade-in");
    observer.observe(el);
});

/* ===========================
   HERO PARALLAX
=========================== */

window.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const scrolled = window.pageYOffset;
    const heroBg = hero.querySelector(".hero-bg-image");
    const heroContent = hero.querySelector(".hero-content");

    if (heroBg) heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
    if (heroContent)
        heroContent.style.opacity = 1 - Math.min(scrolled / (hero.offsetHeight * 1.5), 0.3);
});

/* ===========================
   GALLERY HOVER
=========================== */

document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("mouseenter", () => (item.style.zIndex = "10"));
    item.addEventListener("mouseleave", () => (item.style.zIndex = "1"));
});

/* ===========================
   PAGE FADE-IN
=========================== */

window.addEventListener("load", () => {
    document.body.style.opacity = "0";
    setTimeout(() => {
        document.body.style.transition = "opacity 0.5s ease-in";
        document.body.style.opacity = "1";
    }, 100);
});

/* ===========================
   CONSOLE BRANDING
=========================== */

console.log("%cMediterra Mussel Farm", "font-size:24px;font-weight:bold;color:#c9a961;");
console.log("%cPremium Mediterranean Mussels from Greece", "color:#1c2541;");
