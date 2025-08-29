# 🚀 Deployment Guide

## Overview

This guide covers deploying the Bidias E-Commerce platform to various cloud platforms. The application consists of a React frontend and Node.js/Express backend with MongoDB and Redis.

## 📋 Prerequisites

- Node.js 18+
- MongoDB database
- Redis (optional, for caching)
- Stripe account for payments
- SMTP service for emails

## 🏗️ Build Process

### Local Build

```bash
# Install all dependencies
npm run install:all

# Build both frontend and backend
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### Docker Build

```bash
# Build with Docker Compose
npm run build:docker

# Or manually
docker-compose build
```

## 🌐 Deployment Options

### 1. Vercel (Recommended for Frontend + Backend)

#### Automatic Deployment

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_RESET_SECRET=your_reset_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**
   ```bash
   npm run deploy:vercel
   ```

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Render

#### Using render.yaml

1. **Connect Repository**
   - Go to [Render](https://render.com)
   - Create new service from Git
   - Select your repository

2. **Services Created**
   - `ecommerce-backend` (Web Service)
   - `ecommerce-frontend` (Static Site)
   - `mongodb` (Database)
   - `redis` (Cache - optional)

3. **Environment Variables**
   Set in Render dashboard for backend service:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

### 3. Netlify (Frontend Only)

#### Deploy Frontend

```bash
# Build and deploy
npm run deploy:netlify

# Or manually
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

#### Environment Variables for Frontend

```bash
# In Netlify dashboard or netlify.toml
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Docker Deployment

#### Local Docker

```bash
# Start all services
npm run dev:docker

# Or
docker-compose up --build

# Stop services
npm run stop:docker
```

#### Production Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Get connection string

2. **Whitelist IPs**
   - For development: `0.0.0.0/0`
   - For production: Your server IPs

3. **Create Database User**
   - Database Access > Add New Database User
   - Choose authentication method

### Redis (Optional)

For production caching, use:
- **Redis Cloud** (managed)
- **AWS ElastiCache**
- **Google Cloud Memorystore**

## 💳 Stripe Configuration

1. **Get API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Get publishable key (frontend)
   - Get secret key (backend)

2. **Webhook Setup**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:4001/api/payments/webhook
   ```

## 📧 Email Configuration

### Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=4001
MONGODB_URI=mongodb+srv://...
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secure-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_RESET_SECRET=your-reset-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-frontend.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🚀 Post-Deployment

### 1. Database Seeding

```bash
# Seed initial data
npm run seed
```

### 2. Health Checks

```bash
# Backend health
curl https://your-backend.com/api/health

# Frontend check
curl https://your-frontend.com
```

### 3. SSL Certificate

- Vercel: Automatic
- Render: Automatic
- Netlify: Automatic
- Custom: Use Let's Encrypt

## 📊 Monitoring

### Application Monitoring

- **Vercel Analytics**: Built-in
- **Render Metrics**: Dashboard
- **Netlify Analytics**: Built-in

### Error Tracking

```bash
# Install error tracking (optional)
npm install @sentry/node @sentry/react
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm run install:all

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm run install:all
   npm run build
   ```

2. **Environment Variables**
   - Check all required env vars are set
   - Verify database connectivity
   - Test Stripe keys

3. **CORS Issues**
   - Update `FRONTEND_URL` in backend
   - Check CORS configuration

### Logs

```bash
# Vercel logs
vercel logs

# Render logs
# Check dashboard or use render CLI

# Docker logs
docker-compose logs
```

## 📞 Support

For deployment issues:
1. Check this guide
2. Review platform-specific documentation
3. Check application logs
4. Verify environment configuration

## 🔒 Security Checklist

- [ ] Environment variables not in code
- [ ] Database IP whitelisting
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Authentication working
- [ ] Authorization implemented
- [ ] Sensitive data encrypted

## 🚀 Quick Deployment

### Option 1: Vercel + Render (Recommended)

#### Step 1: Deploy Backend to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: bidias-ecommerce-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Click "Create Web Service"

#### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: frontend
   - **Build Settings**: Automatic
5. Add environment variables
6. Click "Deploy"

### Option 2: Railway (Full-Stack)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect and deploy both frontend and backend
5. Add environment variables in the dashboard

## 🔍 Testing Deployment

### Frontend Tests
```bash
# Test local frontend
cd frontend
npm run build
npm run preview
```

### Backend Tests
```bash
# Test local backend
cd backend
npm test
```

### API Endpoints to Test
- `GET /api/products` - Product listing
- `GET /api/products/:id` - Product details
- `POST /api/auth/login` - User authentication
- `POST /api/orders` - Order creation

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check that all dependencies are in `package.json`
- Ensure Node.js version compatibility
- Verify environment variables are set

#### 2. Database Connection
- Verify MongoDB Atlas connection string
- Check network access rules
- Ensure database user has correct permissions

#### 3. Payment Integration
- Verify Stripe keys are correct
- Check webhook endpoints
- Test with Stripe test cards

#### 4. CORS Issues
- Ensure `FRONTEND_URL` is correctly set
- Check CORS configuration in backend

## 📊 Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real-time error tracking
- Function execution logs

### Render Logs
- Application logs
- Build logs
- System metrics

### Railway Metrics
- CPU and memory usage
- Request/response metrics
- Database performance

## 🔄 Updates and Maintenance

### Updating Deployment
1. Push changes to GitHub
2. Vercel/Render will auto-deploy
3. Monitor logs for any issues
4. Test functionality after deployment

### Database Migrations
```bash
# Run migrations if needed
cd backend
npm run migrate
```

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check GitHub repository for updates

## 🎯 Best Practices

- Always test locally before deploying
- Use environment variables for sensitive data
- Monitor application logs regularly
- Keep dependencies updated
- Use proper error handling
- Implement health checks

---

**Happy Deploying! 🚀**
