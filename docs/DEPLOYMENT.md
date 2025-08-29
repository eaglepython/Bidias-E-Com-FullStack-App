# 🚀 Deployment Guide

This guide explains how to deploy your Bidias E-Commerce application to various platforms.

## 📋 Deployment Options

### 1. Vercel (Frontend)
- **Best for**: Frontend deployment
- **Free tier**: Available
- **URL**: https://vercel.com

### 2. Render (Backend)
- **Best for**: Backend API deployment
- **Free tier**: Available
- **URL**: https://render.com

### 3. Railway
- **Best for**: Full-stack deployment
- **Free tier**: Available
- **URL**: https://railway.app

## 🔧 Prerequisites

1. GitHub repository with your code
2. MongoDB Atlas account (for database)
3. Stripe account (for payments)
4. Environment variables configured

## 🌐 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-api.render.com/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

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
