// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Add active class to clicked nav item
    event.target.classList.add('active');
}

// Handle image file upload
function handleImageUpload(imageType, fileInput) {
    const file = fileInput.files[0];

    if (file) {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            fileInput.value = '';
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            fileInput.value = '';
            return;
        }

        // Read and convert to base64
        const reader = new FileReader();

        reader.onload = function(e) {
            const base64Image = e.target.result;

            // Update preview
            const preview = document.getElementById(`${imageType}-preview`);
            if (preview) {
                preview.src = base64Image;
            }

            // Update the URL input with base64 data
            const urlInput = document.getElementById(`${imageType}-img`);
            if (urlInput) {
                urlInput.value = base64Image;
            }

            showNotification(`Image uploaded successfully! (${(file.size / 1024).toFixed(0)}KB)`, 'success');
        };

        reader.onerror = function() {
            showNotification('Error reading image file', 'error');
        };

        reader.readAsDataURL(file);
    }
}

// Update image preview
function updatePreview(imageType) {
    const input = document.getElementById(`${imageType}-img`);
    const preview = document.getElementById(`${imageType}-preview`);

    if (input && preview) {
        const imageUrl = input.value.trim();
        if (imageUrl) {
            preview.src = imageUrl;
            showNotification('Preview updated!', 'success');
        } else {
            showNotification('Please enter a valid image URL', 'error');
        }
    }
}

// Save all changes
function saveChanges() {
    const data = {
        images: {
            hero: document.getElementById('hero-img').value,
            location: document.getElementById('location-img').value,
            method: document.getElementById('method-img').value,
            gallery: [
                {
                    url: document.getElementById('gallery1-img').value,
                    alt: document.getElementById('gallery1-alt').value
                },
                {
                    url: document.getElementById('gallery2-img').value,
                    alt: document.getElementById('gallery2-alt').value
                },
                {
                    url: document.getElementById('gallery3-img').value,
                    alt: document.getElementById('gallery3-alt').value
                },
                {
                    url: document.getElementById('gallery4-img').value,
                    alt: document.getElementById('gallery4-alt').value
                },
                {
                    url: document.getElementById('gallery5-img').value,
                    alt: document.getElementById('gallery5-alt').value
                },
                {
                    url: document.getElementById('gallery6-img').value,
                    alt: document.getElementById('gallery6-alt').value
                }
            ]
        },
        content: {
            news: document.getElementById('news-text').value,
            heroTitle: document.getElementById('hero-title').value,
            heroSubtitle: document.getElementById('hero-subtitle').value,
            contactPhone: document.getElementById('contact-phone').value,
            contactEmail: document.getElementById('contact-email').value
        }
    };

    // Save to localStorage
    localStorage.setItem('mediterraData', JSON.stringify(data));

    // Apply changes to main website
    applyChangesToWebsite(data);

    showNotification('Changes saved successfully!', 'success');
}

// Apply changes to the main website
function applyChangesToWebsite(data) {
    // This function will update the main index.html file
    // Since we're using localStorage, the main website will read from it on load
    console.log('Applying changes:', data);
}

// Load saved data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('mediterraData');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);

            // Load images
            if (data.images) {
                if (data.images.hero) {
                    document.getElementById('hero-img').value = data.images.hero;
                    document.getElementById('hero-preview').src = data.images.hero;
                }
                if (data.images.location) {
                    document.getElementById('location-img').value = data.images.location;
                    document.getElementById('location-preview').src = data.images.location;
                }
                if (data.images.method) {
                    document.getElementById('method-img').value = data.images.method;
                    document.getElementById('method-preview').src = data.images.method;
                }
                if (data.images.gallery) {
                    data.images.gallery.forEach((img, index) => {
                        const num = index + 1;
                        document.getElementById(`gallery${num}-img`).value = img.url;
                        document.getElementById(`gallery${num}-alt`).value = img.alt;
                        document.getElementById(`gallery${num}-preview`).src = img.url;
                    });
                }
            }

            // Load content
            if (data.content) {
                if (data.content.news) {
                    document.getElementById('news-text').value = data.content.news;
                }
                if (data.content.heroTitle) {
                    document.getElementById('hero-title').value = data.content.heroTitle;
                }
                if (data.content.heroSubtitle) {
                    document.getElementById('hero-subtitle').value = data.content.heroSubtitle;
                }
                if (data.content.contactPhone) {
                    document.getElementById('contact-phone').value = data.content.contactPhone;
                }
                if (data.content.contactEmail) {
                    document.getElementById('contact-email').value = data.content.contactEmail;
                }
            }

            showNotification('Loaded saved data', 'success');
        } catch (error) {
            console.error('Error loading saved data:', error);
            showNotification('Error loading saved data', 'error');
        }
    }
}

// Export data as JSON file
function exportData() {
    const savedData = localStorage.getItem('mediterraData');

    if (savedData) {
        const blob = new Blob([savedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mediterra-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Data exported successfully!', 'success');
    } else {
        showNotification('No data to export', 'error');
    }
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        localStorage.removeItem('mediterraData');
        location.reload();
        showNotification('Reset to defaults', 'success');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Generate HTML for main website
function generateHTML() {
    const data = JSON.parse(localStorage.getItem('mediterraData') || '{}');

    // This function would generate the updated HTML
    // For now, we'll just provide the data structure
    return data;
}
