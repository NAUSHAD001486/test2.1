// Global variables
let selectedFiles = [];
let isConverting = false;
let lastScrollY = 0;
let scrollTimeout;

// DOM elements (will be initialized after DOM loads)
let header, uploadBox, selectFilesBtn, fileSourceDropdown, fileListContainer;
let outputSettings, convertBtn, progressContainer, progressFill, progressText;
let loadingSpinner, urlModal, urlInput, addUrlBtn, closeUrlModal;
let settingsModal, closeSettingsModal, formatBtn, formatOptions, selectedFormat;
let fileInput;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeEventListeners();
    registerServiceWorker();
});

// Initialize DOM elements
function initializeDOMElements() {
    header = document.getElementById('header');
    uploadBox = document.getElementById('uploadBox');
    selectFilesBtn = document.getElementById('selectFilesBtn');
    fileSourceDropdown = document.getElementById('fileSourceDropdown');
    fileListContainer = document.getElementById('fileListContainer');
    outputSettings = document.getElementById('outputSettings');
    convertBtn = document.getElementById('convertBtn');
    progressContainer = document.getElementById('progressContainer');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    loadingSpinner = document.getElementById('loadingSpinner');
    urlModal = document.getElementById('urlModal');
    urlInput = document.getElementById('urlInput');
    addUrlBtn = document.getElementById('addUrlBtn');
    closeUrlModal = document.getElementById('closeUrlModal');
    settingsModal = document.getElementById('settingsModal');
    closeSettingsModal = document.getElementById('closeSettingsModal');
    formatBtn = document.getElementById('formatBtn');
    formatOptions = document.getElementById('formatOptions');
    selectedFormat = document.getElementById('selectedFormat');

    // File input (hidden)
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
}

// Event Listeners
function initializeEventListeners() {
    // Header scroll behavior
    window.addEventListener('scroll', handleScroll);
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    
    // File source dropdown
    fileSourceDropdown.addEventListener('click', handleFileSourceSelect);

    // Show dropdown when clicking the select files button
    selectFilesBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Select files button clicked!');
        console.log('File source dropdown element:', fileSourceDropdown);
        toggleFileSourceDropdown();
    });
    
    // Convert button
    convertBtn.addEventListener('click', handleConvert);
    
    // Format selection
    formatBtn.addEventListener('click', toggleFormatDropdown);
    formatOptions.addEventListener('click', handleFormatSelect);
    
    // URL modal
    addUrlBtn.addEventListener('click', handleAddUrl);
    closeUrlModal.addEventListener('click', closeModal);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAddUrl();
    });
    
    // Settings modal
    closeSettingsModal.addEventListener('click', closeModal);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.file-source-dropdown') && !e.target.closest('.select-files-btn')) {
            if (fileSourceDropdown) {
                fileSourceDropdown.classList.remove('show');
                selectFilesBtn.classList.remove('active');
            }
        }
        if (!e.target.closest('.format-options') && !e.target.closest('.format-btn')) {
            if (formatOptions) {
                formatOptions.classList.remove('show');
            }
        }
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Scroll handling for header
function handleScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        header.classList.add('hidden');
    } else {
        // Scrolling up
        header.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
}

// File source dropdown toggle
function toggleFileSourceDropdown() {
    console.log('toggleFileSourceDropdown called');
    console.log('fileSourceDropdown:', fileSourceDropdown);
    
    if (!fileSourceDropdown) {
        console.error('fileSourceDropdown element not found!');
        return;
    }
    
    const isShowing = fileSourceDropdown.classList.contains('show');
    console.log('isShowing:', isShowing);
    
    // Close all other dropdowns first
    if (formatOptions) {
        formatOptions.classList.remove('show');
    }
    
    if (isShowing) {
        fileSourceDropdown.classList.remove('show');
        selectFilesBtn.classList.remove('active');
        console.log('Dropdown hidden');
    } else {
        fileSourceDropdown.classList.add('show');
        selectFilesBtn.classList.add('active');
        console.log('Dropdown shown');
    }
}

// Format dropdown toggle
function toggleFormatDropdown() {
    formatOptions.classList.toggle('show');
}

// File source selection
function handleFileSourceSelect(e) {
    const source = e.target.closest('.dropdown-item')?.dataset.source;
    if (!source) return;
    
    fileSourceDropdown.classList.remove('show');
    selectFilesBtn.classList.remove('active');
    
    switch (source) {
        case 'device':
            fileInput.click();
            break;
        case 'url':
            showUrlModal();
            break;
        case 'googledrive':
        case 'onedrive':
        case 'dropbox':
            showCloudStorageModal(source);
            break;
    }
}

// Format selection
function handleFormatSelect(e) {
    const format = e.target.closest('.format-option')?.dataset.format;
    if (!format) return;
    
    selectedFormat.textContent = format.toUpperCase();
    formatOptions.classList.remove('show');
}

// URL modal
function showUrlModal() {
    urlModal.classList.add('show');
    urlInput.focus();
}

// Cloud storage modal (placeholder)
function showCloudStorageModal(provider) {
    alert(`${provider} integration coming soon! Please use "From Device" for now.`);
}

// Add URL
function handleAddUrl() {
    const url = urlInput.value.trim();
    if (!url) return;
    
    if (!isValidImageUrl(url)) {
        alert('Please enter a valid image URL');
        return;
    }
    
    const file = {
        name: url.split('/').pop() || 'image',
        size: 0,
        type: 'image/url',
        url: url,
        id: Date.now()
    };
    
    addFileToList(file);
    urlInput.value = '';
    closeModal();
}

// Validate image URL
function isValidImageUrl(url) {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|ico)$/i.test(url);
    } catch {
        return false;
    }
}

// Close modal
function closeModal() {
    urlModal.classList.remove('show');
    settingsModal.classList.remove('show');
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadBox.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
}

// File selection handler
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not a valid image file`);
            return false;
        }
        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
            alert(`${file.name} is too large. Maximum size is 2GB`);
            return false;
        }
        return true;
    });
    
    validFiles.forEach(file => {
        const fileObj = {
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            id: Date.now() + Math.random()
        };
        addFileToList(fileObj);
    });
}

// Add file to list
function addFileToList(file) {
    selectedFiles.push(file);
    updateFileList();
    updateConvertButton();
    showOutputSettings();
}

// Remove file from list
function removeFile(id) {
    selectedFiles = selectedFiles.filter(file => file.id !== id);
    updateFileList();
    updateConvertButton();
    if (selectedFiles.length === 0) {
        hideOutputSettings();
    }
}

// Update file list display
function updateFileList() {
    fileListContainer.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        fileListContainer.classList.remove('show');
        return;
    }
    
    fileListContainer.classList.add('show');
    
    selectedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                <button class="settings-btn" onclick="showSettingsModal(${file.id})" title="Settings">
                    ⚙️
                </button>
                <button class="delete-btn" onclick="removeFile(${file.id})" title="Delete">
                    ✕
                </button>
            </div>
        `;
        fileListContainer.appendChild(fileItem);
    });
}

// Show settings modal
function showSettingsModal(fileId) {
    settingsModal.classList.add('show');
    // Store current file ID for settings
    settingsModal.dataset.fileId = fileId;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return 'Unknown size';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update convert button state
function updateConvertButton() {
    if (selectedFiles.length > 0 && !isConverting) {
        convertBtn.disabled = false;
        convertBtn.querySelector('.btn-text').textContent = 'Convert';
        convertBtn.classList.remove('download');
        convertBtn.classList.add('show');
    } else if (selectedFiles.length === 0) {
        convertBtn.disabled = true;
        convertBtn.classList.remove('show');
    }
}

// Show/hide output settings
function showOutputSettings() {
    outputSettings.classList.add('show');
}

function hideOutputSettings() {
    outputSettings.classList.remove('show');
    convertBtn.classList.remove('show');
}

// Convert files
async function handleConvert() {
    if (isConverting || selectedFiles.length === 0) return;
    
    isConverting = true;
    convertBtn.disabled = true;
    convertBtn.querySelector('.btn-text').textContent = 'Converting...';
    loadingSpinner.classList.add('show');
    progressContainer.classList.add('show');
    
    try {
        const formData = new FormData();
        const format = selectedFormat.textContent.toLowerCase();
        
        selectedFiles.forEach((file, index) => {
            if (file.file) {
                formData.append('files', file.file);
            } else if (file.url) {
                formData.append('urls', file.url);
            }
        });
        
        formData.append('format', format);
        
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update UI for download
            convertBtn.querySelector('.btn-text').textContent = 'Download';
            convertBtn.classList.add('download');
            convertBtn.disabled = false;
            
            // Store download URL
            convertBtn.dataset.downloadUrl = result.downloadUrl;
            convertBtn.onclick = handleDownload;
            
            // Show success message
            showNotification('Conversion completed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Conversion failed');
        }
        
    } catch (error) {
        console.error('Conversion error:', error);
        showNotification(`Conversion failed: ${error.message}`, 'error');
        
        // Reset button
        convertBtn.querySelector('.btn-text').textContent = 'Convert';
        convertBtn.disabled = false;
    } finally {
        isConverting = false;
        loadingSpinner.classList.remove('show');
        progressContainer.classList.remove('show');
    }
}

// Handle download
function handleDownload() {
    const downloadUrl = convertBtn.dataset.downloadUrl;
    if (!downloadUrl) return;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `converted_files_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset UI
    selectedFiles = [];
    updateFileList();
    updateConvertButton();
    hideOutputSettings();
    convertBtn.onclick = handleConvert;
    convertBtn.dataset.downloadUrl = '';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed');
            });
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
