
# 🛍️ Bidias E-Commerce Platform

<div align="center">
  
	<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
	<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
	<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
	<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
	<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
	<img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
	<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
	<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
	<img src="https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI" />

	<br />
	<br />
	<img src="https://user-images.githubusercontent.com/placeholder/architecture-diagram.png" alt="Architecture Diagram" width="700"/>
	<br />
	<b>Modern, full-stack e-commerce solution with AI features and beautiful UI</b>
</div>

---

<div align="center">
	<a href="#-features">Features</a> •
	<a href="#-quick-start">Quick Start</a> •
	<a href="#-api-endpoints">API</a> •
	<a href="#-project-structure">Project Structure</a> •
	<a href="#-screenshots">Screenshots</a> •
	<a href="#-deployment">Deployment</a>
</div>

---

## 📸 Screenshots

<div align="center">
	<img src="https://user-images.githubusercontent.com/placeholder/screenshot-home.png" alt="Home Screenshot" width="700"/>
	<br />
	<img src="https://user-images.githubusercontent.com/placeholder/screenshot-cart.png" alt="Cart Screenshot" width="700"/>
	<br />
	<img src="https://user-images.githubusercontent.com/placeholder/screenshot-checkout.png" alt="Checkout Screenshot" width="700"/>
</div>

---

```sh
# Seed database
npm run seed
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Health Check
- `GET /api/health` - Application health status

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Check code quality: `npm run lint`
6. Commit your changes: `git commit -m 'Add your feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Authoror=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**A modern, full-stack e-commerce solution with AI features and comprehensive functionality**

</div>

---

## ✨ Features

### 🛍️ Core E-Commerce
- 🏪 **Product Management** - Complete CRUD with categories and inventory
- 🛒 **Shopping Cart** - Real-time updates with session persistence  
- 💳 **Secure Payments** - Stripe integration with multiple payment methods
- 📦 **Order Tracking** - Comprehensive order management system
- 🔍 **Advanced Search** - Full-text search with filters and sorting

### 🤖 AI-Powered Features  
- 💬 **Smart Chat Assistant** - AI-powered shopping recommendations
- 🎯 **Personalized Suggestions** - Machine learning product recommendations
- 📊 **Analytics Dashboard** - Real-time business insights

### 🔐 Authentication & Security
- 🔑 **JWT Authentication** - Secure token-based auth
- 🌐 **OAuth Integration** - Google/GitHub social login
- 🛡️ **Security Middleware** - Rate limiting, CORS, data validation

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type-safe development
- **MongoDB** + **Mongoose** - Database and ODM
- **Redis** - Caching and session storage
- **Stripe** - Payment processing
- **JWT** - Authentication
- **WebSocket** - Real-time communication

### Frontend  
- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **Vite** - Build tool and dev server
- **Stripe Elements** - Payment UI components

## 🎯 Key Features

### 🛍️ E-Commerce Core
- **Product Catalog** - Advanced product management with categories, variants, and inventory
- **Smart Shopping Cart** - Persistent cart with real-time updates and guest checkout
- **Secure Payments** - Stripe integration with multiple payment methods and webhooks
- **Order Management** - Complete order lifecycle with tracking and notifications
- **Advanced Search** - Full-text search with filters, sorting, and faceted navigation

### 🤖 AI & Analytics
- **AI Chat Assistant** - Intelligent shopping recommendations and customer support
- **Personalized Suggestions** - Machine learning powered product recommendations
- **Analytics Dashboard** - Real-time business insights and performance metrics
- **Customer Insights** - Behavioral analytics and user segmentation

### 🔐 Security & Performance
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **OAuth Integration** - Social login with Google and GitHub
- **Rate Limiting** - DDoS protection and API abuse prevention
- **Data Validation** - Comprehensive input validation and sanitization
- **Redis Caching** - High-performance caching for improved response times

### 📱 User Experience
- **Responsive Design** - Mobile-first design with Material-UI components
- **Progressive Web App** - PWA capabilities for mobile app-like experience
- **Real-time Updates** - WebSocket integration for live notifications
- **Accessibility** - WCAG compliant with screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Redis (optional, for caching)
- Stripe Account (for payments)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

#### Option 1: Standard Installation
```bash
# Clone repository
git clone https://github.com/eaglepython/Bidias-E-Com-FullStack-App.git
cd sophisticated-ecommerce-capstone

# Install all dependencies (frontend + backend)
npm run install:all

# Setup environment variables
cp .env.production.example .env.production
# Edit .env.production with your actual configuration
```

#### Option 2: Docker Installation (Recommended)
```bash
# Clone repository
git clone https://github.com/eaglepython/Bidias-E-Com-FullStack-App.git
cd sophisticated-ecommerce-capstone

# Setup environment variables
cp .env.production.example .env.production
# Edit .env.production with your actual configuration

# Start all services with Docker
npm run dev:docker
```

### Running the Application

#### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3003
npm run dev:backend   # Backend on http://localhost:4001
```

#### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start
```

#### Docker Production
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Setup

Create a `.env.production` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/bidias_ecommerce?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secrets
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
JWT_RESET_SECRET=your_super_secure_reset_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://your-api-domain.com
```

The application will be available at:
- **Frontend**: http://localhost:3003 (dev) / http://localhost:3003 (prod with Docker)
- **Backend API**: http://localhost:4001 (dev) / http://localhost:4001 (prod with Docker)
- **Production**: https://yourdomain.com (with Nginx reverse proxy)

## 📁 Project Structure

For detailed project structure information, see [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

```
sophisticated-ecommerce-capstone/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration files
│   │   └── scripts/          # Database scripts
│   ├── Dockerfile           # Backend container config
│   └── package.json         # Backend dependencies
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── public/              # Public static files
│   ├── Dockerfile          # Frontend container config
│   └── package.json        # Frontend dependencies
├── docs/                    # Documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   ├── PROJECT_STRUCTURE.md # Detailed structure
│   └── project-status/     # Development status
├── nginx/                   # Reverse proxy config
│   ├── nginx.conf          # Nginx configuration
│   └── ssl/                # SSL certificates
├── infrastructure/         # Infrastructure as code
├── docker-compose.yml      # Development containers
├── docker-compose.prod.yml # Production containers
├── vercel.json            # Vercel deployment config
├── render.yaml            # Render deployment config
├── .env.production.example # Environment template
└── package.json           # Workspace configuration
```

## � Available Scripts

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only (port 3003)
npm run dev:backend      # Start backend only (port 4001)
npm run dev:docker       # Start all services with Docker
```

### Building
```bash
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend for production
npm run build:backend    # Build backend TypeScript
npm run build:docker     # Build Docker images
```

### Testing & Quality
```bash
npm test                 # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests
npm run lint            # Check code quality
npm run format          # Format code
npm run type-check      # TypeScript type checking
```

### Deployment
```bash
npm run deploy:vercel   # Deploy frontend to Vercel
npm run deploy:netlify  # Deploy to Netlify
npm run start:docker    # Start production containers
npm run stop:docker     # Stop all containers
```

### Maintenance
```bash
npm run clean           # Clean build artifacts
npm run docker:clean    # Clean Docker resources
npm run seed            # Seed database with sample data
```

## �📚 Documentation

- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Detailed file organization
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Status](./docs/project-status/)** - Current development status
- **[Architecture](./docs/PROJECT_ARCHITECTURE.md)** - System architecture overview

## 🌐 Deployment

### Docker Deployment (Recommended)
```bash
# Production deployment with Docker Compose
docker-compose -f docker-compose.prod.yml up --build -d

# Development deployment
docker-compose up --build -d

# View running services
docker-compose ps

# Stop all services
docker-compose down
```

### Cloud Platform Deployment

#### Vercel (Frontend)
```bash
# Deploy frontend to Vercel
npm run deploy:vercel
```

#### Render (Backend + Database)
```bash
# Deploy using Render dashboard
# Connect your GitHub repository to Render
# Use render.yaml configuration file
```

#### Netlify (Static Frontend)
```bash
# Build and deploy to Netlify
npm run deploy:netlify
```

### Manual Deployment
See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions including:
- Environment variable configuration
- SSL certificate setup
- Database migration
- Performance optimization
- Monitoring setup

## � Docker Development

### Quick Docker Setup
```bash
# Start all services
npm run dev:docker

# View logs
docker-compose logs -f

# Access services:
# Frontend: http://localhost:3003
# Backend: http://localhost:4001
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Docker Commands
```bash
# Rebuild and restart
npm run build:docker && npm run start:docker

# Clean up (remove containers, volumes, images)
npm run docker:clean

# View container status
docker-compose ps

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🔧 Troubleshooting

### Common Issues

**"Nothing showing on localhost:3003"**
```bash
# Check if services are running
docker-compose ps

# View frontend logs
docker-compose logs frontend

# Check backend health
curl http://localhost:4001/api/health

# Restart services
docker-compose restart
```

**"Database connection failed"**
```bash
# Check MongoDB container
docker-compose logs mongodb

# Verify environment variables
cat .env.production | grep MONGODB

# Test database connection
docker-compose exec backend npm run test:db
```

**"Build failed"**
```bash
# Clear build cache
npm run clean

# Rebuild from scratch
npm run build:docker

# Check for TypeScript errors
npm run type-check
```

### Useful Commands
```bash
# Run tests
npm test

# Check code quality
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Seed database
npm run seed
```

## �👨‍💻 Author

**Joseph Bidias**
- GitHub: [@eaglepython](https://github.com/eaglepython)
- Repository: [Bidias-E-Com-FullStack-App](https://github.com/eaglepython/Bidias-E-Com-FullStack-App)

---

<div align="center">

**Built with ❤️ using modern web technologies**

</div>
# Bidias-E-Com-FullStack-App
