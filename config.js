module.exports = {
  cloudinary: {
    cloud_name: 'dyntgql7u',
    api_key: '685218155257279',
    api_secret: 'sqS1HDzwZoONY8od-mMUlfuOitM'
  },
  port: process.env.PORT || 3001,
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/ico',
    'image/eps',
    'image/psd',
    'image/tga'
  ],
  cleanupInterval: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
};
