import express from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/trending', ProductController.getTrendingProducts);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getProduct);

// Protected routes (require authentication)
router.get('/:id/recommendations', authenticateToken, ProductController.getRecommendations);
router.post('/:id/reviews', authenticateToken, ProductController.addReview);

// Admin routes
router.post('/:id/generate-description', authenticateToken, requireAdmin, ProductController.generateDescription);
router.get('/:id/analytics', authenticateToken, requireAdmin, ProductController.getProductAnalytics);

export default router;
