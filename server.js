const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.cloudinary.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://loveuconvert.com'] : true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
    secure: true
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize,
        files: 10 // Maximum 10 files per request
    },
    fileFilter: (req, file, cb) => {
        if (config.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }
    }
});

// Temporary storage for cleanup
const tempFiles = new Map();

// Cleanup function for temporary files
function cleanupTempFiles() {
    const now = Date.now();
    for (const [id, fileData] of tempFiles.entries()) {
        if (now - fileData.timestamp > config.cleanupInterval) {
            tempFiles.delete(id);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// File upload and conversion endpoint
app.post('/api/convert', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files || [];
        const urls = req.body.urls ? JSON.parse(req.body.urls) : [];
        const format = req.body.format || 'png';
        
        if (files.length === 0 && urls.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files provided for conversion'
            });
        }

        const conversionPromises = [];
        const fileIds = [];

        // Process uploaded files
        for (const file of files) {
            const fileId = uuidv4();
            fileIds.push(fileId);
            
            // Store file info for cleanup
            tempFiles.set(fileId, {
                timestamp: Date.now(),
                originalName: file.originalname
            });

            const conversionPromise = convertFile(file, format, fileId);
            conversionPromises.push(conversionPromise);
        }

        // Process URL files
        for (const url of urls) {
            const fileId = uuidv4();
            fileIds.push(fileId);
            
            tempFiles.set(fileId, {
                timestamp: Date.now(),
                originalName: url.split('/').pop() || 'image'
            });

            const conversionPromise = convertUrl(url, format, fileId);
            conversionPromises.push(conversionPromise);
        }

        // Wait for all conversions to complete
        const results = await Promise.all(conversionPromises);
        
        // Check if any conversions failed
        const failedConversions = results.filter(result => !result.success);
        if (failedConversions.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Failed to convert ${failedConversions.length} file(s)`,
                details: failedConversions.map(f => f.error)
            });
        }

        // Generate download URL
        const downloadUrl = generateDownloadUrl(fileIds, format);

        res.json({
            success: true,
            downloadUrl: downloadUrl,
            convertedFiles: results.length,
            format: format
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during conversion'
        });
    }
});

// Convert file using Cloudinary
async function convertFile(file, format, fileId) {
    try {
        // Upload file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `conversions/${fileId}`,
                    folder: 'webp-converter',
                    use_filename: true,
                    unique_filename: false
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(file.buffer);
        });

        // Transform the image to desired format
        const transformedUrl = cloudinary.url(uploadResult.public_id, {
            format: format,
            quality: 'auto',
            fetch_format: 'auto'
        });

        return {
            success: true,
            originalUrl: uploadResult.secure_url,
            convertedUrl: transformedUrl,
            fileId: fileId
        };

    } catch (error) {
        console.error('File conversion error:', error);
        return {
            success: false,
            error: error.message,
            fileId: fileId
        };
    }
}

// Convert URL using Cloudinary
async function convertUrl(url, format, fileId) {
    try {
        // Upload URL to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(url, {
            public_id: `conversions/${fileId}`,
            folder: 'webp-converter',
            resource_type: 'auto'
        });

        // Transform the image to desired format
        const transformedUrl = cloudinary.url(uploadResult.public_id, {
            format: format,
            quality: 'auto',
            fetch_format: 'auto'
        });

        return {
            success: true,
            originalUrl: uploadResult.secure_url,
            convertedUrl: transformedUrl,
            fileId: fileId
        };

    } catch (error) {
        console.error('URL conversion error:', error);
        return {
            success: false,
            error: error.message,
            fileId: fileId
        };
    }
}

// Generate download URL
function generateDownloadUrl(fileIds, format) {
    // For multiple files, we'll create a ZIP download
    if (fileIds.length > 1) {
        return `/api/download/zip/${fileIds.join(',')}/${format}`;
    } else {
        // For single file, return direct download
        return `/api/download/single/${fileIds[0]}/${format}`;
    }
}

// Download endpoints
app.get('/api/download/single/:fileId/:format', async (req, res) => {
    try {
        const { fileId, format } = req.params;
        
        // Generate the transformed URL
        const transformedUrl = cloudinary.url(`conversions/${fileId}`, {
            format: format,
            quality: 'auto',
            fetch_format: 'auto'
        });

        // Redirect to Cloudinary URL for download
        res.redirect(transformedUrl);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

app.get('/api/download/zip/:fileIds/:format', async (req, res) => {
    try {
        const { fileIds, format } = req.params;
        const fileIdArray = fileIds.split(',');
        
        // For now, redirect to the first file
        // In a production environment, you'd want to create an actual ZIP file
        const transformedUrl = cloudinary.url(`conversions/${fileIdArray[0]}`, {
            format: format,
            quality: 'auto',
            fetch_format: 'auto'
        });

        res.redirect(transformedUrl);

    } catch (error) {
        console.error('ZIP download error:', error);
        res.status(500).json({ error: 'ZIP download failed' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 2GB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 10 files per request.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Cloudinary configured: ${config.cloudinary.cloud_name}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
