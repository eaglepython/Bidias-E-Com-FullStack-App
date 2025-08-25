# 🛒 Bidias E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, TypeScript, and MongoDB.

## 🚀 **Recent Updates (August 2025)**

### ✅ **Completed Features**
- **Full Stripe Payment Integration** - Working checkout with test cards
- **Buy Now Functionality** - Direct product-to-checkout flow  
- **Professional Notifications** - User-friendly snackbar alerts
- **Social Authentication** - Google & Facebook OAuth integration
- **AI Shopping Assistant** - Smart product recommendations
- **Email System** - Order confirmations and notifications
- **Real-time Chat** - WebSocket-powered customer support
- **Advanced Search & Filtering** - Category, price, and text search
- **Responsive Design** - Mobile-first UI with Material-UI

### 🔧 **Technical Stack**

**Frontend:**
- React 18 with TypeScript
- Material-UI (MUI) for components
- Redux Toolkit for state management
- Stripe Elements for payments
- React Router for navigation

**Backend:**
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose ODM
- Redis for caching and sessions
- Passport.js for authentication
- WebSocket for real-time features

### 🔌 **Ports & Services**
- **Frontend**: Port 3001 (auto-assigned)
- **Backend**: Port 4001 
- **MongoDB**: Atlas Cloud Database
- **Redis**: Local (localhost:6379)

## 🧪 **Testing**

### **Stripe Payment Testing**
Use these test card details:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### **OAuth Testing**
- Google OAuth configured and working
- Facebook OAuth configured and working

## 🛠 **Development Setup**

### **Prerequisites**
- Node.js 18+
- Redis server
- MongoDB Atlas account

### **Installation**

1. **Clone and Install**:
   ```bash
   git clone https://github.com/eaglepython/FullStack_E_com.git
   cd sophisticated-ecommerce-capstone
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

2. **Environment Setup**:
   
   **Backend (.env)**:
   ```env
   NODE_ENV=development
   PORT=4001
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=your_mongodb_connection_string
   REDIS_HOST=localhost
   REDIS_PORT=6379
   STRIPE_SECRET_KEY=your_stripe_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```
   
   **Frontend (.env)**:
   ```env
   REACT_APP_API_URL=http://localhost:4001/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   PORT=3000
   ```

3. **Start Development Servers**:
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev
   
   # Terminal 2: Start frontend  
   cd frontend && npm start
   ```

## 📁 **Project Structure**

```
sophisticated-ecommerce-capstone/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, auth configs
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── .env
├── vercel.json            # Vercel deployment config
└── README.md
```

## 🚀 **Deployment**

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### **Environment Variables for Production**
- Update all development URLs to production URLs
- Use production Stripe keys
- Configure production MongoDB cluster
- Set up production Redis instance

## 📈 **Key Features**

### **E-commerce Core**
- Product catalog with search and filtering
- Shopping cart with persistence
- Secure checkout with Stripe
- Order management and tracking
- User authentication and profiles

### **Advanced Features**
- AI-powered product recommendations
- Real-time chat support
- Email notifications
- Social media authentication
- Performance optimization with Redis caching
- Responsive mobile design

### **Developer Experience**
- Full TypeScript support
- ESLint and Prettier configuration
- Hot reloading in development
- Comprehensive error handling
- API documentation

## 🔒 **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Secure session management

## 🎯 **Performance**
- Redis caching for frequently accessed data
- Optimized database queries
- Image optimization
- Code splitting and lazy loading
- CDN integration ready

## 📝 **API Documentation**

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### **Product Endpoints**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search` - Search products
- `GET /api/products/category/:category` - Get products by category

### **Order Endpoints**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### **Payment Endpoints**
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `POST /api/payment/webhook` - Stripe webhook handler

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 👥 **Support**

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ by [Your Name]**
