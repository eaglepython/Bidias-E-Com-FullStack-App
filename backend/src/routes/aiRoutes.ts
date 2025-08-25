import express from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Health check (public)
router.get('/health', AIController.healthCheck);

// Generate product description (admin only)
router.post('/products/:productId/description', authenticateToken, AIController.generateProductDescription);

// Get AI recommendations (authenticated users)
router.get('/recommendations', authenticateToken, AIController.getRecommendations);

// Sentiment analysis (authenticated users)
router.post('/sentiment', authenticateToken, AIController.analyzeSentiment);

// Generate embeddings (admin only)
router.post('/embeddings', authenticateToken, AIController.generateEmbeddings);

// Chat with AI assistant (authenticated users)
router.post('/chat', authenticateToken, AIController.chat);

export default router;
