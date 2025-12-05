// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    loadGitHubConfig();
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
async function saveChanges() {
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

    // Save to localStorage for local preview
    localStorage.setItem('mediterraData', JSON.stringify(data));

    // Apply changes to main website (local)
    applyChangesToWebsite(data);

    // Check if GitHub auto-deploy is configured
    const githubToken = localStorage.getItem('githubToken');
    const githubRepo = localStorage.getItem('githubRepo');

    if (githubToken && githubRepo) {
        // Auto-deploy to production
        showNotification('Saving and deploying to production...', 'info');
        const success = await deployToGitHub(data, githubToken, githubRepo);

        if (success) {
            showNotification('✅ Changes saved and deployed! Vercel will update in ~30 seconds.', 'success');
        } else {
            showNotification('⚠️ Saved locally, but auto-deploy failed. Download and commit manually.', 'warning');
            autoExportForProduction(data);
        }
    } else {
        // No auto-deploy configured, download file
        showNotification('Changes saved! Download site-data.json to deploy manually.', 'success');
        autoExportForProduction(data);
    }
}

// Deploy changes directly to GitHub
async function deployToGitHub(data, token, repo) {
    try {
        const jsonContent = JSON.stringify(data, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

        // Get current file SHA (needed to update existing file)
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

        // Update or create file
        const updateResponse = await fetch(`https://api.github.com/repos/${repo}/contents/site-data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Update site images and content via admin panel`,
                content: base64Content,
                sha: sha,
                branch: getBranchName()
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

// Get the current branch name from localStorage or use main
function getBranchName() {
    return localStorage.getItem('githubBranch') || 'main';
}

// Automatically export data file for production deployment
function autoExportForProduction(data) {
    const jsonString = JSON.stringify(data, null, 2); // Pretty print with 2 space indentation
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show deployment instructions
    setTimeout(() => {
        showDeploymentInstructions();
    }, 1000);
}

// Show instructions for deploying to production
function showDeploymentInstructions() {
    const instructions = `
📦 To update your production website:

1. Save the downloaded 'site-data.json' file to your project folder
2. Run these commands in your terminal:

   git add site-data.json
   git commit -m "Update site images and content"
   git push

3. Your changes will be live on production after deployment!

💡 The file is already saved to your Downloads folder.
    `.trim();

    console.log(instructions);

    // You could also show this in a modal if you add one to the UI
    if (confirm('site-data.json downloaded!\n\nWould you like to see deployment instructions?')) {
        alert(instructions);
    }
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

// Export data as JSON file that can be committed to repo
function exportData() {
    const savedData = localStorage.getItem('mediterraData');

    if (savedData) {
        const blob = new Blob([savedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'site-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Data exported as site-data.json! Upload this file to your repository to sync across devices.', 'success');
    } else {
        showNotification('No data to export', 'error');
    }
}

// Import data from JSON file
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('mediterraData', JSON.stringify(data));
                    location.reload();
                    showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    showNotification('Error importing data: Invalid JSON file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
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

// ===========================
// GITHUB AUTO-DEPLOY CONFIG
// ===========================

// Save GitHub configuration
function saveGitHubConfig() {
    const repo = document.getElementById('github-repo').value.trim();
    const branch = document.getElementById('github-branch').value.trim() || 'main';
    const token = document.getElementById('github-token').value.trim();

    if (!repo) {
        showGitHubStatus('Please enter your GitHub repository (e.g., username/repo-name)', 'error');
        return;
    }

    if (!token) {
        showGitHubStatus('Please enter your GitHub personal access token', 'error');
        return;
    }

    // Validate repo format
    if (!repo.includes('/')) {
        showGitHubStatus('Repository must be in format: username/repository-name', 'error');
        return;
    }

    // Save to localStorage
    localStorage.setItem('githubRepo', repo);
    localStorage.setItem('githubBranch', branch);
    localStorage.setItem('githubToken', token);

    showGitHubStatus('✅ Auto-deploy configured! Click "Save Changes" to test it.', 'success');
    showNotification('GitHub auto-deploy enabled! 🚀', 'success');
}

// Load GitHub configuration
function loadGitHubConfig() {
    const repo = localStorage.getItem('githubRepo');
    const branch = localStorage.getItem('githubBranch');
    const token = localStorage.getItem('githubToken');

    const repoInput = document.getElementById('github-repo');
    const branchInput = document.getElementById('github-branch');
    const tokenInput = document.getElementById('github-token');

    if (repoInput && repo) {
        repoInput.value = repo;
    }
    if (branchInput && branch) {
        branchInput.value = branch;
    }
    if (tokenInput && token) {
        tokenInput.value = token;
        showGitHubStatus('✅ Auto-deploy is configured and ready!', 'success');
    }
}

// Show GitHub status message
function showGitHubStatus(message, type) {
    const statusDiv = document.getElementById('github-status');
    if (!statusDiv) return;

    const colors = {
        success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
        error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
    };

    const color = colors[type] || colors.info;

    statusDiv.style.display = 'block';
    statusDiv.style.background = color.bg;
    statusDiv.style.borderLeft = `4px solid ${color.border}`;
    statusDiv.style.color = color.text;
    statusDiv.textContent = message;
}
