# Deployment Guide for Hostinger

## Prerequisites
- Hostinger hosting account with Node.js support
- Cloudinary account (already configured)
- Domain name (optional)

## Step 1: Prepare Files
1. Upload all project files to your Hostinger public_html directory
2. Ensure all files are uploaded correctly

## Step 2: Configure Environment
1. In Hostinger control panel, go to Node.js settings
2. Set the following environment variables:
   - NODE_ENV=production
   - PORT=3001
   - CLOUDINARY_CLOUD_NAME=dyntgql7u
   - CLOUDINARY_API_KEY=685218155257279
   - CLOUDINARY_API_SECRET=sqS1HDzwZoONY8od-mMUlfuOitM

## Step 3: Install Dependencies
1. In Hostinger terminal, navigate to your project directory
2. Run: `npm install --production`

## Step 4: Start Application
1. Use PM2 to manage the Node.js process
2. Run: `pm2 start server.js --name "webp-converter"`
3. Set PM2 to start on boot: `pm2 startup`

## Step 5: Configure Domain (Optional)
1. Point your domain to the Hostinger server
2. Update CORS settings in server.js if using custom domain

## Step 6: SSL Certificate
1. Enable SSL in Hostinger control panel
2. Force HTTPS redirects (already configured in server.js)

## Step 7: Test Application
1. Visit your domain or IP address
2. Test file upload and conversion
3. Verify PWA installation works

## Monitoring
- Use PM2 monitoring: `pm2 monit`
- Check logs: `pm2 logs webp-converter`
- Monitor server resources in Hostinger panel

## Troubleshooting
- Check PM2 status: `pm2 status`
- Restart application: `pm2 restart webp-converter`
- Check error logs: `pm2 logs webp-converter --err`
