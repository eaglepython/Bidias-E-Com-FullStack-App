# 🛍️ Bidias E-Commerce Platform

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)
- Stripe Account

### Installation

```bash
# Clone repository
git clone https://github.com/eaglepython/Bidias-E-Com-FullStack-App.git
cd sophisticated-ecommerce-capstone

# Install dependencies
npm install

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Setup frontend  
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Start backend (from backend directory)
cd backend
npm run dev

# Start frontend (from frontend directory)  
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

For detailed project structure information, see [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

```
sophisticated-ecommerce-capstone/
├── backend/           # Node.js backend
├── frontend/          # React frontend  
├── docs/             # Documentation
├── README.md         # This file
└── package.json      # Workspace configuration
```

## 📚 Documentation

- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Detailed file organization
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Status](./docs/project-status/)** - Current development status
- **[Architecture](./docs/PROJECT_ARCHITECTURE.md)** - System architecture overview

## 🌐 Deployment

The app is configured for deployment on:
- **Vercel** (Frontend)
- **Render** (Backend)
- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions

## 👨‍💻 Author

**Joseph Bidias**
- GitHub: [@eaglepython](https://github.com/eaglepython)
- Repository: [Bidias-E-Com-FullStack-App](https://github.com/eaglepython/Bidias-E-Com-FullStack-App)

---

<div align="center">

**Built with ❤️ using modern web technologies**

</div>
