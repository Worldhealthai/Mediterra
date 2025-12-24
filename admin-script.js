// ===========================
// SUPABASE CONFIG
// ===========================
const supabaseUrl = "https://tgbvjmknsjiutksucbnt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnZqbWtuc2ppdXRrc3VjYm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Nzc5NjEsImV4cCI6MjA4MjE1Mzk2MX0.p4e4XMoWqVRBOS_-vqaSl44myRGy1HdGD5snvbBHQn4";
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// ===========================
// ADMIN PASSWORD
// ===========================
const ADMIN_PASSWORD = 'Kayak'; // change if needed

// ===========================
// IMAGE DATA STORAGE
// ===========================
let imageData = {
    hero: null,
    logo: null,
    location: null,
    method: null,
    gallery: []
};

// ===========================
// SUPABASE HELPERS
// ===========================
async function uploadImageToSupabase(section, fileDataUrl) {
    const blob = await (await fetch(fileDataUrl)).blob();
    const filePath = `images/${section}-${Date.now()}.jpg`;

    const { error } = await supabase.storage.from("assets").upload(filePath, blob, { upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
}

async function saveSiteConfigToSupabase(config) {
    const { error } = await supabase.from("content").upsert(
        { key: "site_images", value: config },
        { onConflict: "key" }
    );
    if (error) throw error;
}

async function loadSiteConfigFromSupabase() {
    const { data, error } = await supabase.from("content").select("value").eq("key", "site_images").single();
    if (error) return null;
    return data.value;
}

// ===========================
// LOGIN HANDLING
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            if (password === ADMIN_PASSWORD) {
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('adminPanel').classList.add('active');
                loadExistingImages();
            } else {
                const errorEl = document.getElementById('loginError');
                errorEl.classList.add('show');
                setTimeout(() => errorEl.classList.remove('show'), 3000);
            }
        });
    }
});

function logout() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('password').value = '';
}

// ===========================
// IMAGE PREVIEWS
// ===========================
function updatePreview(section, dataUrl) {
    const preview = document.getElementById(`${section}Preview`);
    const status = document.getElementById(`${section}Status`);
    if (preview) preview.src = dataUrl;
    if (status) {
        status.textContent = 'New image uploaded (not saved yet)';
        status.style.color = '#856404';
        status.style.fontWeight = 'bold';
    }
}

function updateGalleryPreviews() {
    const container = document.getElementById('galleryPreviews');
    container.innerHTML = '';
    imageData.gallery.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        const imgEl = document.createElement('img');
        imgEl.src = img.data;
        imgEl.alt = img.alt;
        const label = document.createElement('div');
        label.className = 'gallery-item-label';
        label.textContent = `Image ${index + 1}`;
        div.appendChild(imgEl);
        div.appendChild(label);
        container.appendChild(div);
    });
}

function updateAllPreviews() {
    ['hero', 'logo', 'location', 'method'].forEach(section => {
        if (imageData[section]?.data) updatePreview(section, imageData[section].data);
    });
    if (imageData.gallery?.length > 0) updateGalleryPreviews();
}

// ===========================
// IMAGE COMPRESSION
// ===========================
function compressImage(file, section) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let maxWidth = 1200, maxHeight = 900;
                if (section === 'hero') { maxWidth = 1920; maxHeight = 1080; }
                if (section === 'logo') { maxWidth = 500; maxHeight = 500; }
                if (section === 'gallery') { maxWidth = 800; maxHeight = 600; }

                let width = img.width, height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressed);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===========================
// FILE HANDLING
// ===========================
function processFiles(files, section) {
    if (section === 'gallery') {
        const maxImages = 6;
        const filesToProcess = Array.from(files).slice(0, maxImages);
        imageData.gallery = [];
        let count = 0;
        filesToProcess.forEach((file, i) => {
            if (file.type.match(/image\/(jpeg|jpg|png)/)) {
                compressImage(file, 'gallery').then(dataUrl => {
                    imageData.gallery.push({ data: dataUrl, alt: `Gallery image ${i + 1}` });
                    count++; if (count === filesToProcess.length) { updateGalleryPreviews(); showSaveButton(); }
                }).catch(err => { console.error(err); alert('Error processing image'); });
            }
        });
    } else {
        const file = files[0];
        if (file.type.match(/image\/(jpeg|jpg|png)/)) {
            compressImage(file, section).then(dataUrl => {
                imageData[section] = { data: dataUrl, name: file.name };
                updatePreview(section, dataUrl);
                showSaveButton();
            }).catch(err => { console.error(err); alert('Error processing image'); });
        } else alert('Please upload a JPG or PNG file.');
    }
}

// ===========================
// DRAG & DROP
// ===========================
function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('dragover'); }
function handleDrop(e, section) { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('dragover'); processFiles(e.dataTransfer.files, section); }
function handleFileSelect(e, section) { processFiles(e.target.files, section); }

// ===========================
// SAVE BUTTON
// ===========================
function showSaveButton() { document.getElementById('saveBtn')?.classList.add('show'); }

async function saveAllChanges() {
    try {
        const config = {
            images: {
                hero: imageData.hero ? await uploadImageToSupabase('hero', imageData.hero.data) : null,
                logo: imageData.logo ? await uploadImageToSupabase('logo', imageData.logo.data) : null,
                location: imageData.location ? await uploadImageToSupabase('location', imageData.location.data) : null,
                method: imageData.method ? await uploadImageToSupabase('method', imageData.method.data) : null,
                gallery: await Promise.all(imageData.gallery.map(async (img, i) => ({ src: await uploadImageToSupabase(`gallery-${i}`, img.data), alt: img.alt })))
            },
            lastUpdated: new Date().toISOString()
        };
        await saveSiteConfigToSupabase(config);
        updateAllPreviews();
        document.getElementById('saveBtn')?.classList.remove('show');
        const msg = document.getElementById('successMessage');
        msg?.classList.add('show');
        setTimeout(() => msg?.classList.remove('show'), 4000);
        updateWebsiteImages();
        alert('✅ Images saved successfully!');
    } catch (err) { console.error(err); alert('❌ Failed to save images'); }
}

// ===========================
// LOAD EXISTING IMAGES
// ===========================
async function loadExistingImages() {
    const config = await loadSiteConfigFromSupabase();
    if (!config?.images) return;
    imageData.hero = config.images.hero ? { data: config.images.hero } : null;
    imageData.logo = config.images.logo ? { data: config.images.logo } : null;
    imageData.location = config.images.location ? { data: config.images.location } : null;
    imageData.method = config.images.method ? { data: config.images.method } : null;
    imageData.gallery = config.images.gallery || [];
    updateAllPreviews();
}

// ===========================
// LOCALSTORAGE UPDATE FOR MAIN SITE
// ===========================
function updateWebsiteImages() {
    const config = {
        images: {
            hero: imageData.hero?.data || null,
            logo: imageData.logo?.data || null,
            location: imageData.location?.data || null,
            method: imageData.method?.data || null,
            gallery: imageData.gallery.map(img => ({ src: img.data, alt: img.alt }))
        },
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('mediterra_site_config', JSON.stringify(config));
}

// ===========================
// DRAG LEAVE HANDLER
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.upload-area').forEach(area => {
        area.addEventListener('dragleave', e => { e.currentTarget.classList.remove('dragover'); });
    });
});

