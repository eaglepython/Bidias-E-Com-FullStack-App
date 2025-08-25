import { Request, Response } from 'express';
import '../types/express';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { Interaction } from '../models/Interaction';
import { searchService } from '../services/searchService';
import { advancedRecommendationService } from '../services/advancedRecommendationService';
import { cacheService } from '../services/cacheService';
import { ollamaService } from '../services/ollamaService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class ProductController {
  // Get all products with advanced filtering and search
  static async getProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        q,
        category,
        brand,
        minPrice,
        maxPrice,
        rating,
        inStock,
        tags,
        sortBy,
        page = 1,
        limit = 20
      } = req.query;

      const searchQuery = {
        q: q as string,
        category: category as string,
        brand: brand as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        inStock: inStock === 'true',
        tags: tags ? (tags as string).split(',') : undefined,
        sortBy: sortBy as any,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await searchService.search(searchQuery, req.user?.id);

      return res.json({
        success: true,
        data: result,
        message: `Found ${result.totalCount} products`
      });
    } catch (error) {
      console.error('Get products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  // Get single product with recommendations and analytics
  static async getProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Get product
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Log view interaction
      if (userId) {
        await ProductController.logProductView(userId, id);
      }

      // Update product analytics
      await Product.findByIdAndUpdate(id, {
        $inc: { 'analytics.views': 1 }
      });

      // Get recommendations for this product
  let recommendations: any[] = [];
      if (userId) {
        try {
          recommendations = await advancedRecommendationService.getRecommendations({
            userId,
            productId: id,
            type: 'item_based',
            limit: 6
          });
        } catch (error) {
          console.error('Recommendation error:', error);
        }
      }

      // Get related products (same category)
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: id }
      })
      .limit(4)
      .select('name price images analytics.averageRating');

      // Get recently viewed products for this user
      let recentlyViewed = [];
      if (userId) {
        const user = await User.findById(userId).select('recentViews');
        if (user?.recentViews) {
          const recentIds = user.recentViews
            .filter(view => view.productId !== id)
            .slice(0, 4)
            .map(view => view.productId);
          
          recentlyViewed = await Product.find({
            _id: { $in: recentIds }
          }).select('name price images analytics.averageRating');
        }
      }

      return res.json({
        success: true,
        data: {
          product,
          recommendations,
          relatedProducts,
          recentlyViewed
        }
      });
    } catch (error) {
      console.error('Get product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  }

  // Search products with autocomplete
  static async searchProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const { q, autocomplete } = req.query;
      
      if (autocomplete === 'true') {
        const suggestions = await searchService.getAutoComplete(q as string);
        return res.json({
          success: true,
          data: { suggestions }
        });
      }

      // Full search with all parameters
      const searchQuery = { ...req.query } as any;
      const result = await searchService.search(searchQuery, req.user?.id);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Search failed'
      });
    }
  }

  // Get product recommendations
  static async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const {
        type = 'hybrid',
        productId,
        category,
        limit = 10
      } = req.query;

      const recommendations = await advancedRecommendationService.getRecommendations({
        userId,
        productId: productId as string,
        category: category as string,
        type: type as any,
        limit: parseInt(limit as string)
      });

      return res.json({
        success: true,
        data: { recommendations }
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  // Get trending products
  static async getTrendingProducts(req: Request, res: Response) {
    try {
      const { limit = 10, category } = req.query;
      
      const cacheKey = `trending_products:${category || 'all'}:${limit}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: { products: cached }
        });
      }

      const matchStage: any = {};
      if (category) {
        matchStage.category = category;
      }

      const trendingProducts = await Product.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ['$analytics.views', 0.3] },
                { $multiply: ['$analytics.purchases', 0.5] },
                { $multiply: ['$analytics.averageRating', 0.2] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: parseInt(limit as string) },
        {
          $project: {
            name: 1,
            price: 1,
            images: 1,
            category: 1,
            brand: 1,
            'analytics.averageRating': 1,
            'analytics.reviewCount': 1,
            discount: 1,
            trendingScore: 1
          }
        }
      ]);

      await cacheService.set(cacheKey, trendingProducts, 1800); // 30 minutes

      return res.json({
        success: true,
        data: { products: trendingProducts }
      });
    } catch (error) {
      console.error('Get trending products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get trending products'
      });
    }
  }

  // Get categories with product counts
  static async getCategories(req: Request, res: Response) {
    try {
      const cacheKey = 'product_categories';
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          data: { categories: cached }
        });
      }

      const categories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            maxPrice: { $max: '$price' },
            minPrice: { $min: '$price' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $project: {
            category: '$_id',
            productCount: '$count',
            priceRange: {
              min: '$minPrice',
              max: '$maxPrice',
              avg: '$avgPrice'
            },
            _id: 0
          }
        }
      ]);

      await cacheService.set(cacheKey, categories, 3600); // 1 hour

      return res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get categories'
      });
    }
  }

  // Generate AI product description
  static async generateDescription(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const description = await ollamaService.generateProductDescription({
        name: product.name,
        category: product.category,
        features: product.features,
        price: product.price,
        brand: product.brand
      });

      // Update product with AI-generated description
      await Product.findByIdAndUpdate(id, {
        'ai.generatedDescription': description,
        'ai.lastDescriptionUpdate': new Date()
      });

      return res.json({
        success: true,
        data: { description },
        message: 'Description generated successfully'
      });
    } catch (error) {
      console.error('Generate description error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate description'
      });
    }
  }

  // Add product review
  static async addReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { rating, comment, title } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId: id, userId });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }

      // Analyze sentiment of the review
      let sentiment = 'neutral';
      try {
        const sentimentAnalysis = await ollamaService.analyzeSentiment(comment);
        sentiment = sentimentAnalysis.sentiment;
      } catch (error) {
        console.error('Sentiment analysis error:', error);
      }

      // Add review
        const newReview = await Review.create({
          productId: id,
          userId,
          rating,
          comment,
          title,
          sentiment,
          helpfulCount: 0
        });

      await Product.findByIdAndUpdate(id, {
        $push: { reviews: newReview._id },
        $inc: { 'analytics.reviewCount': 1 }
      });

      // Recalculate average rating
        const updatedProduct = await Product.findById(id).populate('reviews');
        if (updatedProduct?.reviews && Array.isArray(updatedProduct.reviews) && updatedProduct.reviews.length > 0) {
          const reviewDocs = updatedProduct.reviews as any[];
          const avgRating = reviewDocs.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewDocs.length;
          await Product.findByIdAndUpdate(id, {
            'analytics.averageRating': parseFloat(avgRating.toFixed(2))
          });
        }

      // Log review interaction
      await Interaction.create({
        userId,
        type: 'review',
        productId: id,
        data: {
          rating,
          sentiment,
          timestamp: new Date()
        }
      });

        return res.json({
        success: true,
        message: 'Review added successfully',
        data: { review: newReview }
      });
    } catch (error) {
      console.error('Add review error:', error);
        return res.status(500).json({
        success: false,
        message: 'Failed to add review'
      });
    }
  }

  // Get product analytics (admin only)
  static async getProductAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { timeframe = '30d' } = req.query;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Calculate date range
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get interaction analytics
      const interactions = await Interaction.aggregate([
        {
          $match: {
            productId: id,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get daily views
      const dailyViews = await Interaction.aggregate([
        {
          $match: {
            productId: id,
            type: 'view',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            views: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

    return res.json({
        success: true,
        data: {
          product: {
            id: product._id,
            name: product.name,
            analytics: product.analytics
          },
          timeframe,
          interactions: interactions.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          dailyViews: dailyViews.map(item => ({
            date: item._id,
            views: item.views
          }))
        }
      });
    } catch (error) {
      console.error('Get product analytics error:', error);
    return res.status(500).json({
        success: false,
        message: 'Failed to get product analytics'
      });
    }
  }

  // Helper method to log product view
  private static async logProductView(userId: string, productId: string): Promise<void> {
    try {
      // Log interaction
      await Interaction.create({
        userId,
        type: 'view',
        productId,
        data: {
          timestamp: new Date()
        }
      });

      // Update user's recent views
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { recentViews: { productId } }, // Remove if exists
        }
      );

      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            recentViews: {
              $each: [{ productId, viewedAt: new Date() }],
              $position: 0,
              $slice: 20 // Keep only last 20 views
            }
          }
        }
      );
    } catch (error) {
      console.error('Log product view error:', error);
    }
  }
}
