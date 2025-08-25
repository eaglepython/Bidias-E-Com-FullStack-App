import { Request, Response } from 'express';
import { ollamaService } from '../services/ollamaService';
import { Product } from '../models/Product';
import { User } from '../models/User';
import '../types/express';

export class AIController {
  // Health check for AI services
  static async healthCheck(req: Request, res: Response) {
    try {
      const health = await ollamaService.healthCheck();
      res.json({
        status: health.status ? 'healthy' : 'unhealthy',
        service: 'ollama',
        models: health.models,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'ollama',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate product description using AI
  static async generateProductDescription(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const description = await ollamaService.generateProductDescription({
        name: product.name,
        category: product.category,
        features: product.features,
        price: product.price,
        brand: product.brand
      });

      return res.json({
        productId,
        description,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Product description generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate product description'
      });
    }
  }

  // Get AI-powered product recommendations
  static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const { productId, category, priceMin, priceMax, limit = 5 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await User.findById(userId);
      const context = {
        userId,
        currentProduct: productId as string,
        categories: category ? [category as string] : user?.profile?.preferences?.categories || [],
        priceRange: priceMin && priceMax ? {
          min: parseInt(priceMin as string),
          max: parseInt(priceMax as string)
        } : user?.profile?.preferences?.priceRange,
        userPreferences: user?.profile?.preferences
      };

      const recommendations = await ollamaService.generateRecommendations(context);

      return res.json({
        recommendations: recommendations.slice(0, parseInt(limit as string)),
        userId,
        context: {
          categories: context.categories,
          priceRange: context.priceRange
        },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Recommendations error:', error);
      return res.status(500).json({
        error: 'Failed to generate recommendations'
      });
    }
  }

  // Analyze sentiment of product reviews
  static async analyzeSentiment(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required for sentiment analysis' });
      }

      const analysis = await ollamaService.analyzeSentiment(text);

      return res.json({
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), // Truncate for privacy
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        analyzedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return res.status(500).json({
        error: 'Failed to analyze sentiment'
      });
    }
  }

  // Generate product embeddings for similarity search
  static async generateEmbeddings(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required for embedding generation' });
      }

      const embeddings = await ollamaService.generateEmbeddings(text);

      return res.json({
        embeddings,
        dimensions: embeddings.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Embedding generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate embeddings'
      });
    }
  }

  // Chat with AI assistant (REST endpoint for non-WebSocket clients)
  static async chat(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      const { message, context } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const user = await User.findById(userId);
      const chatContext = {
        userId,
        conversationHistory: context?.history || [
          { role: 'user' as const, content: message }
        ],
        currentCart: context?.cart,
        userProfile: user
      };

      const response = await ollamaService.chatWithAssistant(chatContext);

      return res.json({
        message: response,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({
        error: 'Failed to process chat message'
      });
    }
  }
}
