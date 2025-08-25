# Render Deployment Guide

This guide explains how to deploy your e-commerce application to Render.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a GitHub repository
3. MongoDB Atlas account for production database
4. Environment variables configured

## Deployment Steps

### 1. Prepare Your Environment Variables

Create these environment variables in Render for your backend service:

**Required:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Generate a secure random string
- `JWT_REFRESH_SECRET` - Generate another secure random string  
- `JWT_RESET_SECRET` - Generate another secure random string
- `FRONTEND_URL` - Will be your frontend Render URL
- `BACKEND_URL` - Will be your backend Render URL

**OAuth (Optional):**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `FACEBOOK_APP_ID` - From Facebook Developers
- `FACEBOOK_APP_SECRET` - From Facebook Developers

**Email (Optional):**
- `SMTP_USER` - Your email for sending notifications
- `SMTP_PASSWORD` - App password for your email

### 2. Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `your-app-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to root if needed)
   - **Health Check Path**: `/api/health`

5. Add environment variables (see list above)
6. Deploy

### 3. Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository  
3. Configure:
   - **Name**: `your-app-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

4. Add environment variable:
   - `REACT_APP_API_URL` - Set to your backend service URL

### 4. Setup MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string and add it as `MONGODB_URI` in your backend service

### 5. Update OAuth Redirect URIs

After deployment, update your OAuth provider settings:

**Google Cloud Console:**
- Add `https://your-backend-service.onrender.com/auth/google/callback`

**Facebook Developers:**
- Add `https://your-backend-service.onrender.com/auth/facebook/callback`

### 6. Seed Your Database

After deployment, you can seed your database by running:

```bash
# SSH into your backend service and run:
npm run seed
```

Or create an API endpoint to trigger seeding.

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- 750 hours per month of uptime
- First requests after sleep may be slow (cold starts)

### Environment-Specific URLs
The app automatically detects production environment and uses proper URLs for OAuth callbacks.

### File Uploads
Files are stored in `/tmp/uploads` which is ephemeral. For production, consider using cloud storage like AWS S3.

### Performance
- Enable caching where possible
- Use CDN for static assets
- Consider upgrading to paid plans for better performance

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check logs in Render dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist
4. **OAuth Errors**: Ensure redirect URIs match exactly

### Health Check
Your app includes a health check endpoint at `/api/health` that verifies:
- Database connection
- Redis connection (if configured)
- Basic service health

## Manual Deployment Commands

If you prefer manual deployment, you can use these commands:

```bash
# Build backend
cd backend && npm run build

# Build frontend  
cd frontend && npm run build

# Start production server
cd backend && npm start
```

## Post-Deployment

1. Test all functionality
2. Monitor logs for errors
3. Set up monitoring/alerting
4. Configure custom domain (optional)
5. Set up SSL certificate (automatic with Render)

Your application should now be live and accessible via the Render URLs!
