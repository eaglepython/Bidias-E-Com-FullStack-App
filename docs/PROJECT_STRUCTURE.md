# 🏗️ Bidias E-Commerce - Project Structure

## 📁 Root Directory Structure

```
sophisticated-ecommerce-capstone/
├── 📂 ai-services/                 # AI-powered services
│   ├── 📂 analytics-engine/        # Analytics and recommendations
│   ├── 📂 nlp-agent/              # Natural language processing
│   └── 📂 recommendation-engine/   # Product recommendations
├── 📂 backend/                    # Node.js/Express backend
│   ├── 📂 src/
│   │   ├── 📂 config/             # Configuration files
│   │   ├── 📂 controllers/        # Route controllers
│   │   ├── 📂 middleware/         # Custom middleware
│   │   ├── 📂 models/             # Database models
│   │   ├── 📂 routes/             # API routes
│   │   ├── 📂 scripts/            # Utility scripts (seeding, etc.)
│   │   ├── 📂 services/           # Business logic services
│   │   ├──  types/              # TypeScript type definitions
│   │   ├── 📂 utils/              # Utility functions
│   │   └── 📄 server.ts           # Main server entry point
│   ├── 📄 Dockerfile              # Docker configuration
│   ├── 📄 package.json            # Backend dependencies
│   └── 📄 tsconfig.json           # TypeScript configuration
├── 📂 frontend/                   # React frontend
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/         # Reusable components
│   │   │   ├── 📂 chat/           # Chat-related components
│   │   │   ├── 📂 common/         # Common UI components
│   │   │   └── 📂 Payment/        # Payment components
│   │   ├── 📂 pages/              # Page components
│   │   ├── 📂 services/           # API services
│   │   ├── 📂 store/              # Redux store & slices
│   │   ├── 📂 types/              # TypeScript interfaces
│   │   ├── � utils/              # Utility functions
│   │   ├── �📄 App.tsx             # Main app component
│   │   ├── 📄 index.css           # Global styles
│   │   ├── 📄 index.tsx           # App entry point
│   │   └── 📄 setupTests.ts       # Test setup
│   ├── 📄 Dockerfile              # Docker configuration
│   ├── 📄 nginx.conf              # Nginx configuration
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 tsconfig.json           # TypeScript configuration
│   ├── 📄 vite.config.ts          # Vite build configuration
│   └── 📄 index.html              # HTML template
├── 📂 infrastructure/             # Infrastructure as Code
│   ├── 📂 docker/                 # Docker configurations
│   ├── 📂 kubernetes/             # Kubernetes manifests
│   ├── 📂 logging/                # Logging configurations
│   └── � terraform/              # Terraform configurations
├── 📂 nginx/                      # Nginx reverse proxy
│   └── 📄 nginx.conf              # Production nginx config
├── 📂 shared/                     # Shared utilities
│   ├── 📂 constants/              # Application constants
│   ├── 📂 types/                  # Shared type definitions
│   └── 📂 utils/                  # Shared utility functions
├── 📂 tests/                      # Test suites
│   ├── 📂 ai-services/            # AI service tests
│   ├── 📂 backend/                # Backend tests
│   ├── 📂 e2e/                    # End-to-end tests
│   └── 📂 frontend/               # Frontend tests
├── 📂 docs/                       # Documentation
│   ├── 📄 DEPLOYMENT.md           # Deployment guide
│   ├── 📄 PROJECT_ARCHITECTURE.md # Architecture documentation
│   ├── 📄 PROJECT_STATUS.md       # Current project status
│   └── 📄 PROJECT_STRUCTURE.md    # This file
├── 📄 .dockerignore               # Docker ignore rules
├── 📄 .env.production.example     # Production environment template
├── 📄 .gitignore                  # Git ignore rules
├── 📄 docker-compose.yml          # Development docker setup
├── 📄 docker-compose.prod.yml     # Production docker setup
├── 📄 package.json                # Root workspace configuration
├── 📄 render.yaml                 # Render deployment config
├── 📄 vercel.json                 # Vercel deployment config
└── 📄 README.md                   # Main project README
```

## 🎯 Key Features

### Backend Architecture
- **Express.js** server with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication with OAuth support
- **Stripe** payment integration
- **WebSocket** real-time features
- **Redis** caching layer
- **AI-powered** chat assistant

### Frontend Architecture
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Material-UI** component library
- **Vite** for fast development
- **Stripe Elements** for payments
- **WebSocket** client for real-time features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)
- Stripe account

### Installation
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup
Copy `.env.example` files and configure:
- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

### Running the Application
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## 📝 Important Notes

- **Single .gitignore**: Only one .gitignore file at the root level
- **Scripts Location**: All database seeding and utility scripts in `backend/src/scripts/`
- **Documentation**: All project documentation in `docs/` directory
- **Environment Files**: Keep `.env.example` files for reference, never commit actual `.env` files
- **TypeScript**: Strict TypeScript configuration across both frontend and backend

## 🔧 Development Guidelines

1. **Backend**: Follow RESTful API design patterns
2. **Frontend**: Use functional components with hooks
3. **State**: Manage global state with Redux Toolkit
4. **Styling**: Use Material-UI components with custom theming
5. **Testing**: Write tests for critical business logic
6. **Security**: Follow security best practices for authentication and data handling
