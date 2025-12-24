import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ===============================
   SUPABASE SETUP
================================ */
const supabaseUrl = "https://tgbvjmknsjiutksucbnt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnZqbWtuc2ppdXRrc3VjYm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Nzc5NjEsImV4cCI6MjA4MjE1Mzk2MX0.p4e4XMoWqVRBOS_-vqaSl44myRGy1HdGD5snvbBHQn4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ===============================
   CONFIG
================================ */
const ADMIN_PASSWORD = "Kayak";

/* ===============================
   STATE
================================ */
let imageData = {
  hero: null,
  logo: null,
  location: null,
  method: null,
  gallery: []
};

/* ===============================
   SUPABASE HELPERS
================================ */
async function uploadImageToSupabase(section, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `images/${section}-${Date.now()}.jpg`;

  const { error } = await supabase
    .storage
    .from("assets")
    .upload(path, blob, { upsert: true });

  if (error) throw error;

  return supabase
    .storage
    .from("assets")
    .getPublicUrl(path).data.publicUrl;
}

async function saveConfigToSupabase(config) {
  const { error } = await supabase
    .from("content")
    .upsert(
      { key: "site_images", value: config },
      { onConflict: "key" }
    );

  if (error) throw error;
}

async function loadConfigFromSupabase() {
  const { data, error } = await supabase
    .from("content")
    .select("value")
    .eq("key", "site_images")
    .single();

  if (error) return null;
  return data.value;
}

/* ===============================
   LOGIN
================================ */
document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const password = document.getElementById("password").value;

  if (password !== ADMIN_PASSWORD) {
    document.getElementById("loginError").classList.add("show");
    setTimeout(() => {
      document.getElementById("loginError").classList.remove("show");
    }, 3000);
    return;
  }

  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("adminPanel").classList.add("active");
  await loadExistingImages();
});

function logout() {
  document.getElementById("loginContainer").style.display = "flex";
  document.getElementById("adminPanel").classList.remove("active");
  document.getElementById("password").value = "";
}

/* ===============================
   LOAD EXISTING IMAGES
================================ */
async function loadExistingImages() {
  const config = await loadConfigFromSupabase();
  if (!config?.images) return;

  imageData.hero = config.images.hero ? { data: config.images.hero } : null;
  imageData.logo = config.images.logo ? { data: config.images.logo } : null;
  imageData.location = config.images.location ? { data: config.images.location } : null;
  imageData.method = config.images.method ? { data: config.images.method } : null;
  imageData.gallery = config.images.gallery || [];

  updateAllPreviews();
}

/* ===============================
   IMAGE HANDLING
================================ */
function compressImage(file, section) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let maxW = 1200, maxH = 900;
        if (section === "hero") { maxW = 1920; maxH = 1080; }
        if (section === "logo") { maxW = 500; maxH = 500; }
        if (section === "gallery") { maxW = 800; maxH = 600; }

        let { width, height } = img;
        const ratio = Math.min(maxW / width, maxH / height, 1);
        width *= ratio;
        height *= ratio;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function processFiles(files, section) {
  if (section === "gallery") {
    imageData.gallery = [];
    Array.from(files).slice(0, 6).forEach(async (file, i) => {
      const data = await compressImage(file, "gallery");
      imageData.gallery.push({ data, alt: `Gallery image ${i + 1}` });
      updateGalleryPreviews();
      showSaveButton();
    });
  } else {
    compressImage(files[0], section).then(data => {
      imageData[section] = { data };
      updatePreview(section, data);
      showSaveButton();
    });
  }
}

/* ===============================
   PREVIEWS
================================ */
function updatePreview(section, data) {
  const img = document.getElementById(`${section}Preview`);
  if (img) {
    img.src = data;
    img.style.display = "block";
  }
}

function updateGalleryPreviews() {
  const container = document.getElementById("galleryPreviews");
  container.innerHTML = "";
  imageData.gallery.forEach(img => {
    const el = document.createElement("img");
    el.src = img.data;
    container.appendChild(el);
  });
}

function updateAllPreviews() {
  ["hero", "logo", "location", "method"].forEach(s => {
    if (imageData[s]) updatePreview(s, imageData[s].data);
  });
  if (imageData.gallery.length) updateGalleryPreviews();
}

/* ===============================
   SAVE
================================ */
function showSaveButton() {
  document.getElementById("saveBtn").classList.add("show");
}

async function saveAllChanges() {
  try {
    const config = {
      images: {
        hero: imageData.hero
          ? await uploadImageToSupabase("hero", imageData.hero.data)
          : null,
        logo: imageData.logo
          ? await uploadImageToSupabase("logo", imageData.logo.data)
          : null,
        location: imageData.location
          ? await uploadImageToSupabase("location", imageData.location.data)
          : null,
        method: imageData.method
          ? await uploadImageToSupabase("method", imageData.method.data)
          : null,
        gallery: await Promise.all(
          imageData.gallery.map((img, i) => ({
            src: await uploadImageToSupabase(`gallery-${i}`, img.data),
            alt: img.alt
          }))
        )
      },
      lastUpdated: new Date().toISOString()
    };

    await saveConfigToSupabase(config);

    document.getElementById("saveBtn").classList.remove("show");
    document.getElementById("successMessage").classList.add("show");

    setTimeout(() => {
      document.getElementById("successMessage").classList.remove("show");
    }, 4000);

    alert("✅ Images saved to Supabase successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to save images. Check console.");
  }
}

/* ===============================
   DRAG UI
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".upload-area").forEach(area => {
    area.addEventListener("dragleave", e => {
      e.currentTarget.classList.remove("dragover");
    });
  });
});
