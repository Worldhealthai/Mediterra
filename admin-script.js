// Admin Panel Script for Image Management
// Simple password-based authentication
const ADMIN_PASSWORD = 'Kayak'; // Change this to your desired password

// Storage for uploaded images
let imageData = {
    hero: null,
    logo: null,
    location: null,
    method: null,
    gallery: []
};

// Load existing images from localStorage on page load
function loadExistingImages() {
    // Check what's in localStorage for debugging
    console.log('🔍 Checking localStorage on admin panel load...');

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
        console.log('✅ Loaded existing images into admin panel');
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

// Save all changes
function saveAllChanges() {
    try {
        // Save to localStorage (for admin panel internal use)
        localStorage.setItem('mediterra_images', JSON.stringify(imageData));

        // Update the actual website by modifying the DOM
        updateWebsiteImages();

        // VERIFY the save worked
        const verification = localStorage.getItem('mediterra_site_config');
        if (verification) {
            console.log('✅ VERIFIED: Data saved to localStorage successfully');
            console.log('📊 Saved data size:', new Blob([verification]).size, 'bytes');
            console.log('🔑 localStorage key:', 'mediterra_site_config');

            // Parse and log what was saved
            try {
                const parsed = JSON.parse(verification);
                console.log('📸 Images saved:', {
                    hero: parsed.images?.hero ? '✓' : '✗',
                    logo: parsed.images?.logo ? '✓' : '✗',
                    location: parsed.images?.location ? '✓' : '✗',
                    method: parsed.images?.method ? '✓' : '✗',
                    gallery: parsed.images?.gallery?.length || 0
                });
            } catch (e) {
                console.error('Error parsing saved data:', e);
            }
        } else {
            console.error('❌ ERROR: Data was NOT saved to localStorage!');
            alert('WARNING: Failed to save to localStorage. Your images may not persist!');
            return;
        }

        // Show success message
        const successMsg = document.getElementById('successMessage');
        successMsg.classList.add('show');

        // Hide save button
        document.getElementById('saveBtn').classList.remove('show');

        // Update status indicators
        updateAllPreviews();

        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 5000);

        // Show additional success info
        alert('✅ Images saved successfully!\n\n' +
              'IMPORTANT: Your images are saved to this browser\'s localStorage.\n\n' +
              '⚠️ Note:\n' +
              '- Images only persist in THIS browser\n' +
              '- Different browsers won\'t see your custom images\n' +
              '- Private/Incognito mode clears data when closed\n' +
              '- Check browser settings if images don\'t persist\n\n' +
              'Check the browser console (F12) for detailed save info.');

    } catch (error) {
        console.error('❌ Error saving images:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Images are too large to save. Please try uploading smaller images or fewer gallery images. The admin panel automatically compresses images, but your current selection exceeds storage limits.');
        } else {
            alert('Error saving images: ' + error.message);
        }
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
