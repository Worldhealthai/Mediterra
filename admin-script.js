// Admin Panel Script for Image Management
// Simple password-based authentication
const ADMIN_PASSWORD = 'Kayak'; // Change this to your desired password

// Initialize Supabase client
let supabase = null;
document.addEventListener('DOMContentLoaded', () => {
    supabase = initSupabase();
});

// Storage for uploaded images
let imageData = {
    hero: null,
    logo: null,
    location: null,
    method: null,
    gallery: []
};

// Load existing images from Supabase on page load
async function loadExistingImages() {
    console.log('🔍 Loading existing images from Supabase...');

    try {
        // Load from Supabase
        const supabaseImages = await loadImagesFromSupabase();

        if (supabaseImages && supabaseImages.length > 0) {
            console.log(`✅ Found ${supabaseImages.length} images in Supabase`);

            // Convert Supabase data back to imageData format
            supabaseImages.forEach(img => {
                const type = img.image_type;

                if (type.startsWith('gallery-')) {
                    // Gallery image
                    if (!imageData.gallery) imageData.gallery = [];
                    imageData.gallery.push({
                        data: img.image_url,
                        name: img.storage_path.split('/').pop(),
                        alt: img.alt_text
                    });
                } else {
                    // Single image (hero, logo, location, method)
                    imageData[type] = {
                        data: img.image_url,
                        name: img.storage_path.split('/').pop()
                    };
                }
            });

            updateAllPreviews();
            console.log('✅ Loaded existing images from Supabase into admin panel');
            return;
        }
    } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
    }

    // Fallback to localStorage if Supabase fails
    console.log('⚠️ Falling back to localStorage...');
    const stored = localStorage.getItem('mediterra_images');
    const siteConfig = localStorage.getItem('mediterra_site_config');

    console.log('Admin data (mediterra_images):', stored ? '✓ Found' : '✗ Not found');
    console.log('Site config (mediterra_site_config):', siteConfig ? '✓ Found' : '✗ Not found');

    if (siteConfig) {
        try {
            const config = JSON.parse(siteConfig);
            console.log('📸 Current saved images:', {
                hero: config.images?.hero ? '✓' : '✗',
                logo: config.images?.logo ? '✓' : '✗',
                location: config.images?.location ? '✓' : '✗',
                method: config.images?.method ? '✓' : '✗',
                gallery: config.images?.gallery?.length || 0,
                lastUpdated: config.lastUpdated
            });
        } catch (e) {
            console.error('❌ Error parsing site config:', e);
        }
    }

    if (stored) {
        imageData = JSON.parse(stored);
        updateAllPreviews();
        console.log('✅ Loaded existing images from localStorage into admin panel');
    } else {
        console.log('ℹ️ No existing admin data found - starting fresh');
    }
}

// Login handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminPanel').classList.add('active');
        loadExistingImages();
    } else {
        document.getElementById('loginError').classList.add('show');
        setTimeout(() => {
            document.getElementById('loginError').classList.remove('show');
        }, 3000);
    }
});

// Logout function
function logout() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('password').value = '';
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDrop(e, section) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFiles(files, section);
    }
}

// File selection handler
function handleFileSelect(e, section) {
    const files = e.target.files;
    if (files.length > 0) {
        processFiles(files, section);
    }
}

// Compress image before storing
function compressImage(file, section) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set max dimensions based on section
                let maxWidth, maxHeight;
                if (section === 'hero') {
                    maxWidth = 1920;
                    maxHeight = 1080;
                } else if (section === 'logo') {
                    maxWidth = 500;
                    maxHeight = 500;
                } else if (section === 'gallery') {
                    maxWidth = 800;
                    maxHeight = 600;
                } else {
                    maxWidth = 1200;
                    maxHeight = 900;
                }

                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with 0.8 quality for better compression
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Process uploaded files
function processFiles(files, section) {
    if (section === 'gallery') {
        // Handle multiple gallery images
        const maxImages = 6;
        const filesToProcess = Array.from(files).slice(0, maxImages);

        imageData.gallery = [];
        let processedCount = 0;

        filesToProcess.forEach((file, index) => {
            if (file.type.match(/image\/(jpeg|jpg|png)/)) {
                compressImage(file, 'gallery').then(compressedDataUrl => {
                    imageData.gallery.push({
                        data: compressedDataUrl,
                        name: file.name,
                        alt: `Gallery image ${index + 1}`
                    });

                    processedCount++;
                    if (processedCount === filesToProcess.length) {
                        updateGalleryPreviews();
                        showSaveButton();
                    }
                }).catch(error => {
                    console.error('Error compressing image:', error);
                    alert('Error processing image. Please try a different file.');
                });
            }
        });
    } else {
        // Handle single images
        const file = files[0];
        if (file.type.match(/image\/(jpeg|jpg|png)/)) {
            compressImage(file, section).then(compressedDataUrl => {
                imageData[section] = {
                    data: compressedDataUrl,
                    name: file.name
                };
                updatePreview(section, compressedDataUrl);
                showSaveButton();
            }).catch(error => {
                console.error('Error compressing image:', error);
                alert('Error processing image. Please try a different file.');
            });
        } else {
            alert('Please upload a JPG or PNG image file.');
        }
    }
}

// Update preview for single image
function updatePreview(section, dataUrl) {
    const preview = document.getElementById(`${section}Preview`);
    const status = document.getElementById(`${section}Status`);

    if (preview) {
        preview.src = dataUrl;
        preview.style.display = 'block';
    }

    if (status) {
        status.textContent = 'New image uploaded (not saved yet)';
        status.style.color = '#856404';
        status.style.fontWeight = 'bold';
    }
}

// Update gallery previews
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

// Update all previews when loading from storage
function updateAllPreviews() {
    ['hero', 'logo', 'location', 'method'].forEach(section => {
        if (imageData[section] && imageData[section].data) {
            const preview = document.getElementById(`${section}Preview`);
            const status = document.getElementById(`${section}Status`);

            if (preview) {
                preview.src = imageData[section].data;
                preview.style.display = 'block';
            }

            if (status) {
                status.textContent = imageData[section].name;
                status.style.color = '#28a745';
                status.style.fontWeight = 'normal';
            }
        }
    });

    if (imageData.gallery && imageData.gallery.length > 0) {
        updateGalleryPreviews();
    }
}

// Show save button
function showSaveButton() {
    document.getElementById('saveBtn').classList.add('show');
}

// ===========================
// SUPABASE HELPER FUNCTIONS
// ===========================

// Convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Upload image to Supabase Storage
async function uploadToSupabase(dataURL, fileName, imageType) {
    if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return null;
    }

    try {
        // Convert data URL to blob
        const blob = dataURLtoBlob(dataURL);

        // Create unique file path
        const timestamp = Date.now();
        const filePath = `${imageType}/${timestamp}-${fileName}`;

        console.log(`📤 Uploading ${imageType} to Supabase...`);

        // Upload to Supabase Storage
        const { data, error } = await supabase
            .storage
            .from(SUPABASE_CONFIG.bucketName)
            .upload(filePath, blob, {
                contentType: blob.type,
                upsert: false
            });

        if (error) {
            console.error('❌ Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from(SUPABASE_CONFIG.bucketName)
            .getPublicUrl(filePath);

        console.log(`✅ Uploaded successfully: ${publicUrl}`);

        return {
            url: publicUrl,
            path: filePath
        };

    } catch (error) {
        console.error('❌ Error uploading to Supabase:', error);
        return null;
    }
}

// Save image metadata to database
async function saveImageToDatabase(imageType, imageUrl, storagePath, altText = '') {
    if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return false;
    }

    try {
        // Upsert (insert or update) image record
        const { data, error } = await supabase
            .from('site_images')
            .upsert({
                image_type: imageType,
                image_url: imageUrl,
                storage_path: storagePath,
                alt_text: altText || `${imageType} image`,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'image_type'
            });

        if (error) {
            console.error('❌ Database save error:', error);
            throw error;
        }

        console.log(`✅ Saved ${imageType} to database`);
        return true;

    } catch (error) {
        console.error('❌ Error saving to database:', error);
        return false;
    }
}

// Load images from Supabase
async function loadImagesFromSupabase() {
    if (!supabase) {
        console.error('❌ Supabase client not initialized');
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

// Save all changes
async function saveAllChanges() {
    try {
        console.log('💾 Starting save process...');

        // Show loading indicator
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '⏳ Uploading to Supabase...';
        saveBtn.disabled = true;

        let uploadedCount = 0;
        let totalToUpload = 0;

        // Count images to upload
        ['hero', 'logo', 'location', 'method'].forEach(type => {
            if (imageData[type]?.data) totalToUpload++;
        });
        totalToUpload += imageData.gallery?.length || 0;

        console.log(`📊 Total images to upload: ${totalToUpload}`);

        // Upload single images
        for (const imageType of ['hero', 'logo', 'location', 'method']) {
            if (imageData[imageType] && imageData[imageType].data) {
                console.log(`🔄 Processing ${imageType}...`);

                const result = await uploadToSupabase(
                    imageData[imageType].data,
                    imageData[imageType].name,
                    imageType
                );

                if (result) {
                    await saveImageToDatabase(imageType, result.url, result.path);
                    uploadedCount++;
                    saveBtn.textContent = `⏳ Uploading... (${uploadedCount}/${totalToUpload})`;
                } else {
                    console.error(`❌ Failed to upload ${imageType}`);
                }
            }
        }

        // Upload gallery images
        if (imageData.gallery && imageData.gallery.length > 0) {
            for (let i = 0; i < imageData.gallery.length; i++) {
                const img = imageData.gallery[i];
                console.log(`🔄 Processing gallery image ${i + 1}...`);

                const result = await uploadToSupabase(
                    img.data,
                    img.name,
                    `gallery-${i + 1}`
                );

                if (result) {
                    await saveImageToDatabase(`gallery-${i + 1}`, result.url, result.path, img.alt);
                    uploadedCount++;
                    saveBtn.textContent = `⏳ Uploading... (${uploadedCount}/${totalToUpload})`;
                } else {
                    console.error(`❌ Failed to upload gallery image ${i + 1}`);
                }
            }
        }

        // Also save to localStorage as backup
        localStorage.setItem('mediterra_images', JSON.stringify(imageData));
        updateWebsiteImages();

        console.log(`✅ Successfully uploaded ${uploadedCount} of ${totalToUpload} images to Supabase`);

        // Show success message
        const successMsg = document.getElementById('successMessage');
        successMsg.classList.add('show');

        // Reset save button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        saveBtn.classList.remove('show');

        // Update status indicators
        updateAllPreviews();

        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 5000);

        // Show success alert
        alert(`✅ Images saved successfully to Supabase!\n\n` +
              `📤 Uploaded: ${uploadedCount} of ${totalToUpload} images\n\n` +
              `🌐 Your images are now stored in the cloud and will persist across all browsers and devices!\n\n` +
              `💡 Changes will be visible on your live website immediately.`);

    } catch (error) {
        console.error('❌ Error saving images:', error);

        // Reset save button
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.textContent = '💾 Save All Changes';
        saveBtn.disabled = false;

        alert('❌ Error saving images to Supabase: ' + error.message + '\n\n' +
              'Please check:\n' +
              '1. Supabase database is set up (run supabase-setup.sql)\n' +
              '2. Internet connection is working\n' +
              '3. Browser console (F12) for detailed error info\n\n' +
              'Images have been saved to localStorage as backup.');
    }
}

// Update website images (this writes to a JSON file that the main site will read)
function updateWebsiteImages() {
    // Create a configuration object that the main website will load
    const config = {
        images: {
            hero: imageData.hero ? imageData.hero.data : null,
            logo: imageData.logo ? imageData.logo.data : null,
            location: imageData.location ? imageData.location.data : null,
            method: imageData.method ? imageData.method.data : null,
            gallery: imageData.gallery.map(img => ({
                src: img.data,
                alt: img.alt
            }))
        },
        lastUpdated: new Date().toISOString()
    };

    // Save to localStorage for the main site to read
    localStorage.setItem('mediterra_site_config', JSON.stringify(config));

    // Also create a downloadable JSON file
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a hidden download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'site-images.json';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    // Optional: Uncomment to auto-download the JSON file
    // downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Add drag leave handler to remove dragover class
document.addEventListener('DOMContentLoaded', function() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        area.addEventListener('dragleave', function(e) {
            e.currentTarget.classList.remove('dragover');
        });
    });
});
