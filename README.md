# Love U Convert - WebP to PNG Converter

A professional, fast, and secure WebP to PNG converter with PWA support, built for modern web browsers and mobile devices.

## Features

- 🚀 **Lightning Fast**: Optimized for speed with Cloudinary integration
- 📱 **PWA Support**: Installable as a web app on any device
- 🔒 **Secure**: Server-side processing with secure API handling
- 📱 **Responsive**: Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI**: Clean, minimal design with smooth animations
- 🔄 **Multiple Formats**: Convert to PNG, JPEG, GIF, BMP, and more
- 📁 **Multiple Sources**: Upload from device, URL, or cloud storage
- ⚡ **Real-time Progress**: Visual feedback during conversion
- 🛡️ **Error Handling**: Comprehensive error management
- 🔍 **SEO Optimized**: Built for search engine visibility

## Supported Formats

### Input Formats
- WebP
- PNG
- JPEG/JPG
- GIF
- BMP
- SVG
- TIFF
- ICO
- EPS
- PSD
- TGA

### Output Formats
- PNG
- BMP
- EPS
- GIF
- ICO
- JPEG
- JPG
- ODD
- SVG
- PSD
- TGA
- TIFF
- WebP

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/webp-to-png-converter.git
cd webp-to-png-converter
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with your Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3001
NODE_ENV=production
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Configuration

The application uses Cloudinary for image processing. Update the `config.js` file with your Cloudinary credentials:

```javascript
module.exports = {
  cloudinary: {
    cloud_name: 'your_cloud_name',
    api_key: 'your_api_key',
    api_secret: 'your_api_secret'
  },
  port: process.env.PORT || 3001,
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    // ... other supported types
  ]
};
```

## API Endpoints

### POST /api/convert
Convert uploaded files to the specified format.

**Request:**
- `files`: Array of image files (multipart/form-data)
- `urls`: Array of image URLs (JSON string)
- `format`: Output format (string)

**Response:**
```json
{
  "success": true,
  "downloadUrl": "https://res.cloudinary.com/...",
  "convertedFiles": 3,
  "format": "png"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Basic offline functionality with cached UI
- **Service Worker**: Background processing and caching
- **Manifest**: Complete PWA manifest for app-like experience

## Security Features

- **HTTPS Only**: Enforced secure connections
- **HSTS**: HTTP Strict Transport Security enabled
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Validation**: Server-side file type and size validation
- **CORS**: Properly configured Cross-Origin Resource Sharing
- **Helmet**: Security headers and protection

## Performance Optimizations

- **Lazy Loading**: Images loaded on demand
- **Caching**: Aggressive caching strategy
- **Compression**: Gzip compression enabled
- **CDN**: Cloudinary CDN for fast image delivery
- **Minification**: Optimized CSS and JavaScript

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Hostinger Deployment

1. Upload all files to your Hostinger public_html directory
2. Ensure Node.js is enabled in your hosting panel
3. Set environment variables in your hosting control panel
4. Start the application using PM2 or similar process manager

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Node.js server
├── config.js           # Configuration file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── package.json        # Dependencies
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
└── browserconfig.xml   # Windows tile config
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@loveuconvert.com or create an issue on GitHub.

## Changelog

### v1.0.0
- Initial release
- WebP to PNG conversion
- PWA support
- Multiple format support
- Cloudinary integration
- Responsive design
- Security features
