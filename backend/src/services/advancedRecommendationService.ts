import { UserEnhanced } from '../models/UserEnhanced';
import { ProductEnhanced } from '../models/ProductEnhanced';
import { Interaction } from '../models/Interaction';
import { OrderEnhanced } from '../models/OrderEnhanced';
import { cacheService } from './cacheService';
import { ollamaService } from './ollamaService';

interface RecommendationRequest {
  userId: string;
  productId?: string;
  category?: string;
  limit?: number;
  type: 'user_based' | 'item_based' | 'content_based' | 'hybrid' | 'trending' | 'personalized';
  context?: {
    currentSession?: string[];
    timeOfDay?: string;
    device?: string;
    location?: string;
    occasion?: string;
  };
}

interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
  algorithm: string;
  metadata?: any;
  product?: any;
}

interface UserProfile {
  demographics: any;
  preferences: any;
  behaviorProfile: any;
  purchaseHistory: any[];
  interactionHistory: any[];
  clusterGroup?: string;
  lifetimeValue?: number;
}

interface ProductSimilarity {
  productId: string;
  similarity: number;
  features: string[];
}

export class AdvancedRecommendationService {
  private similarityThreshold = 0.1;
  private maxRecommendations = 50;
  private cacheTTL = 3600; // 1 hour

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return this.enrichRecommendations(cached);
      }

      let recommendations: RecommendationResult[] = [];

      switch (request.type) {
        case 'user_based':
          recommendations = await this.getUserBasedRecommendations(request);
          break;
        case 'item_based':
          recommendations = await this.getItemBasedRecommendations(request);
          break;
        case 'content_based':
          recommendations = await this.getContentBasedRecommendations(request);
          break;
        case 'hybrid':
          recommendations = await this.getHybridRecommendations(request);
          break;
        case 'trending':
          recommendations = await this.getTrendingRecommendations(request);
          break;
        case 'personalized':
          recommendations = await this.getPersonalizedRecommendations(request);
          break;
        default:
          recommendations = await this.getHybridRecommendations(request);
      }

      // Apply business rules and filters
      recommendations = await this.applyBusinessRules(recommendations, request);

      // Diversify recommendations
      recommendations = this.diversifyRecommendations(recommendations);

      // Limit results
      recommendations = recommendations.slice(0, request.limit || 10);

      // Cache results
      await cacheService.set(cacheKey, recommendations, this.cacheTTL);

      return this.enrichRecommendations(recommendations);
    } catch (error) {
      console.error('Recommendation error:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  // Collaborative Filtering - User-Based
  private async getUserBasedRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const user = await UserEnhanced.findById(request.userId);
    if (!user) return [];

    // Find similar users based on purchase history and preferences
    const similarUsers = await this.findSimilarUsers(user);
    const recommendations: RecommendationResult[] = [];

    for (const similarUser of similarUsers) {
      // Get products liked by similar users but not by current user
      const userOrders = await OrderEnhanced.find({ 
        customerId: similarUser.userId,
        status: 'delivered'
      }).populate('items.productId');

      for (const order of userOrders) {
        for (const item of order.items) {
          // Check if user hasn't purchased this product
          const userHasProduct = await this.userHasProduct(request.userId, item.productId);
          if (!userHasProduct) {
            recommendations.push({
              productId: item.productId,
              score: similarUser.similarity * 0.8,
              reason: 'Users with similar preferences also bought this',
              algorithm: 'collaborative_filtering_user'
            });
          }
        }
      }
    }

    return this.deduplicateAndSort(recommendations);
  }

  // Collaborative Filtering - Item-Based
  private async getItemBasedRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    if (!request.productId) return [];

    // Find products frequently bought together
    const coOccurrences = await this.findProductCoOccurrences(request.productId);
    const recommendations: RecommendationResult[] = [];

    for (const coOccurrence of coOccurrences) {
      recommendations.push({
        productId: coOccurrence.productId,
        score: coOccurrence.frequency * 0.9,
        reason: 'Frequently bought together',
        algorithm: 'collaborative_filtering_item',
        metadata: { frequency: coOccurrence.frequency }
      });
    }

    return this.deduplicateAndSort(recommendations);
  }

  // Content-Based Filtering
  private async getContentBasedRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const user = await UserEnhanced.findById(request.userId);
    if (!user) return [];

    const userProfile = this.buildUserProfile(user);
    const recommendations: RecommendationResult[] = [];

    // Find products matching user preferences
    const matchingProducts = await ProductEnhanced.find({
      status: 'active',
      category: { $in: userProfile.preferredCategories },
      price: {
        $gte: userProfile.priceRange.min,
        $lte: userProfile.priceRange.max
      }
    }).limit(50);

    for (const product of matchingProducts) {
      const score = this.calculateContentScore(product, userProfile);
      if (score > this.similarityThreshold) {
        recommendations.push({
          productId: product._id.toString(),
          score,
          reason: 'Matches your preferences',
          algorithm: 'content_based',
          metadata: { matchedFeatures: this.getMatchedFeatures(product, userProfile) }
        });
      }
    }

    return this.deduplicateAndSort(recommendations);
  }

  // Hybrid Recommendations (combines multiple algorithms)
  private async getHybridRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const [userBased, itemBased, contentBased, trending] = await Promise.all([
      this.getUserBasedRecommendations(request).catch(() => []),
      this.getItemBasedRecommendations(request).catch(() => []),
      this.getContentBasedRecommendations(request).catch(() => []),
      this.getTrendingRecommendations(request).catch(() => [])
    ]);

    // Weighted combination of algorithms
    const weights = {
      user_based: 0.3,
      item_based: 0.3,
      content_based: 0.25,
      trending: 0.15
    };

    const combinedScores = new Map<string, RecommendationResult>();

    // Combine user-based recommendations
    userBased.forEach(rec => {
      const existing = combinedScores.get(rec.productId);
      if (existing) {
        existing.score += rec.score * weights.user_based;
        existing.reason += ', ' + rec.reason;
      } else {
        combinedScores.set(rec.productId, {
          ...rec,
          score: rec.score * weights.user_based,
          algorithm: 'hybrid'
        });
      }
    });

    // Combine item-based recommendations
    itemBased.forEach(rec => {
      const existing = combinedScores.get(rec.productId);
      if (existing) {
        existing.score += rec.score * weights.item_based;
        existing.reason += ', ' + rec.reason;
      } else {
        combinedScores.set(rec.productId, {
          ...rec,
          score: rec.score * weights.item_based,
          algorithm: 'hybrid'
        });
      }
    });

    // Combine content-based recommendations
    contentBased.forEach(rec => {
      const existing = combinedScores.get(rec.productId);
      if (existing) {
        existing.score += rec.score * weights.content_based;
        existing.reason += ', ' + rec.reason;
      } else {
        combinedScores.set(rec.productId, {
          ...rec,
          score: rec.score * weights.content_based,
          algorithm: 'hybrid'
        });
      }
    });

    // Combine trending recommendations
    trending.forEach(rec => {
      const existing = combinedScores.get(rec.productId);
      if (existing) {
        existing.score += rec.score * weights.trending;
        existing.reason += ', ' + rec.reason;
      } else {
        combinedScores.set(rec.productId, {
          ...rec,
          score: rec.score * weights.trending,
          algorithm: 'hybrid'
        });
      }
    });

    return Array.from(combinedScores.values())
      .sort((a, b) => b.score - a.score);
  }

  // Trending Products
  private async getTrendingRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    const trendingProducts = await ProductEnhanced.find({
      status: 'active',
      trending: true
    })
    .sort({ 'analytics.views': -1, 'analytics.purchases': -1 })
    .limit(20);

    return trendingProducts.map(product => ({
      productId: product._id.toString(),
      score: 0.8,
      reason: 'Trending now',
      algorithm: 'trending',
      metadata: {
        views: product.analytics.views,
        purchases: product.analytics.purchases
      }
    }));
  }

  // AI-Powered Personalized Recommendations
  private async getPersonalizedRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    try {
      const user = await UserEnhanced.findById(request.userId);
      if (!user) return [];

      // Build context for AI
      const context = {
        userId: request.userId,
        categories: user.preferences?.categories || [],
        priceRange: user.preferences?.priceRange || { min: 0, max: 10000 },
        recentViews: (user.recentViews || []).slice(0, 5).map(v => v.productId),
        behaviorProfile: user.behaviorProfile
      };

      // Get AI recommendations
      const aiRecommendations = await ollamaService.generateRecommendations(context);

      // Convert AI suggestions to product recommendations
      const recommendations: RecommendationResult[] = [];
      
      for (const suggestion of aiRecommendations) {
        // Search for products matching AI suggestions
        const products = await ProductEnhanced.find({
          $text: { $search: suggestion },
          status: 'active'
        }).limit(3);

        products.forEach(product => {
          recommendations.push({
            productId: product._id.toString(),
            score: 0.85,
            reason: `AI suggestion: ${suggestion}`,
            algorithm: 'ai_personalized',
            metadata: { aiSuggestion: suggestion }
          });
        });
      }

      return recommendations;
    } catch (error) {
      console.error('AI personalized recommendations error:', error);
      return [];
    }
  }

  // Helper Methods
  private async findSimilarUsers(user: any): Promise<{ userId: string; similarity: number }[]> {
    // Find users with similar preferences and behavior
    const similarUsers = await UserEnhanced.find({
      _id: { $ne: user._id },
      'preferences.categories': { $in: user.profile.preferences.categories },
      'behaviorProfile.favoriteCategories': { $in: user.behaviorProfile.favoriteCategories }
    }).limit(20);

    return similarUsers.map(similarUser => ({
      userId: similarUser._id.toString(),
      similarity: this.calculateUserSimilarity(user, similarUser)
    })).filter(u => u.similarity > 0.3);
  }

  private calculateUserSimilarity(user1: any, user2: any): number {
    // Calculate Jaccard similarity for categories
    const categories1 = new Set(user1.profile.preferences.categories);
    const categories2 = new Set(user2.profile.preferences.categories);
    const intersection = new Set([...categories1].filter(x => categories2.has(x)));
    const union = new Set([...categories1, ...categories2]);
    
    const categorySimilarity = intersection.size / union.size;

    // Calculate price range similarity
    const priceRange1 = user1.profile.preferences.priceRange;
    const priceRange2 = user2.profile.preferences.priceRange;
    const priceOverlap = Math.max(0, 
      Math.min(priceRange1.max, priceRange2.max) - Math.max(priceRange1.min, priceRange2.min)
    );
    const priceUnion = Math.max(priceRange1.max, priceRange2.max) - Math.min(priceRange1.min, priceRange2.min);
    const priceSimilarity = priceOverlap / priceUnion;

    return (categorySimilarity * 0.7) + (priceSimilarity * 0.3);
  }

  private async findProductCoOccurrences(productId: string): Promise<{ productId: string; frequency: number }[]> {
    // Find products frequently bought together
    const orders = await OrderEnhanced.find({
      'items.productId': productId,
      status: 'delivered'
    });

    const coOccurrences = new Map<string, number>();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId !== productId) {
          const current = coOccurrences.get(item.productId) || 0;
          coOccurrences.set(item.productId, current + 1);
        }
      });
    });

    return Array.from(coOccurrences.entries())
      .map(([productId, frequency]) => ({ productId, frequency: frequency / orders.length }))
      .filter(item => item.frequency > 0.1)
      .sort((a, b) => b.frequency - a.frequency);
  }

  private buildUserProfile(user: any): any {
    return {
      preferredCategories: user.profile.preferences.categories,
      priceRange: user.profile.preferences.priceRange,
      favoriteCategories: user.behaviorProfile.favoriteCategories,
      devicePreference: user.behaviorProfile.devicePreference,
      timePreference: user.behaviorProfile.timePreference
    };
  }

  private calculateContentScore(product: any, userProfile: any): number {
    let score = 0;

    // Category match
    if (userProfile.preferredCategories.includes(product.category)) {
      score += 0.4;
    }

    // Price range match
    if (product.price >= userProfile.priceRange.min && product.price <= userProfile.priceRange.max) {
      score += 0.3;
    }

    // Brand preference (if available)
    if (userProfile.preferredBrands && userProfile.preferredBrands.includes(product.brand)) {
      score += 0.2;
    }

    // Rating boost
    if (product.rating.average >= 4.0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private getMatchedFeatures(product: any, userProfile: any): string[] {
    const features = [];

    if (userProfile.preferredCategories.includes(product.category)) {
      features.push('category');
    }

    if (product.price >= userProfile.priceRange.min && product.price <= userProfile.priceRange.max) {
      features.push('price_range');
    }

    if (product.rating.average >= 4.0) {
      features.push('high_rating');
    }

    return features;
  }

  private async userHasProduct(userId: string, productId: string): Promise<boolean> {
    const order = await OrderEnhanced.findOne({
      customerId: userId,
      'items.productId': productId,
      status: { $in: ['delivered', 'shipped'] }
    });

    return !!order;
  }

  private deduplicateAndSort(recommendations: RecommendationResult[]): RecommendationResult[] {
    const uniqueRecommendations = new Map<string, RecommendationResult>();

    recommendations.forEach(rec => {
      const existing = uniqueRecommendations.get(rec.productId);
      if (!existing || rec.score > existing.score) {
        uniqueRecommendations.set(rec.productId, rec);
      }
    });

    return Array.from(uniqueRecommendations.values())
      .sort((a, b) => b.score - a.score);
  }

  private diversifyRecommendations(recommendations: RecommendationResult[]): RecommendationResult[] {
    // Implement diversity to avoid showing too many similar products
    const diversified: RecommendationResult[] = [];
    const categorySeen = new Set<string>();
    const brandSeen = new Set<string>();

    for (const rec of recommendations) {
      // Add logic to check category/brand diversity
      // For now, just return as is
      diversified.push(rec);
    }

    return diversified;
  }

  private async applyBusinessRules(recommendations: RecommendationResult[], request: RecommendationRequest): Promise<RecommendationResult[]> {
    // Filter out out-of-stock products
    const activeProductIds = new Set();
    const activeProducts = await ProductEnhanced.find({
      _id: { $in: recommendations.map(r => r.productId) },
      status: 'active',
      'inventory.totalQuantity': { $gt: 0 }
    }).select('_id');

    activeProducts.forEach(p => activeProductIds.add(p._id.toString()));

    return recommendations.filter(rec => activeProductIds.has(rec.productId));
  }

  private async enrichRecommendations(recommendations: RecommendationResult[]): Promise<RecommendationResult[]> {
    // Add product details to recommendations
    const productIds = recommendations.map(r => r.productId);
    const products = await ProductEnhanced.find({
      _id: { $in: productIds }
    }).lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    return recommendations.map(rec => ({
      ...rec,
      product: productMap.get(rec.productId)
    }));
  }

  private async getFallbackRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
    // Return popular products as fallback
    const popularProducts = await ProductEnhanced.find({
      status: 'active',
      featured: true
    })
    .sort({ 'analytics.purchases': -1 })
    .limit(request.limit || 10);

    return popularProducts.map(product => ({
      productId: product._id.toString(),
      score: 0.5,
      reason: 'Popular product',
      algorithm: 'fallback',
      product
    }));
  }

  private generateCacheKey(request: RecommendationRequest): string {
    const keyParts = [
      'recommendations',
      request.type,
      request.userId,
      request.productId || 'none',
      request.category || 'none',
      request.limit || 10
    ];

    if (request.context) {
      keyParts.push(JSON.stringify(request.context));
    }

    return keyParts.join(':');
  }

  // Real-time recommendation updates
  async updateUserInteraction(userId: string, productId: string, interactionType: string, metadata: any = {}): Promise<void> {
    try {
      // Log interaction
      await Interaction.create({
        userId,
        productId,
        type: interactionType,
        metadata,
        timestamp: new Date()
      });

      // Update user behavior profile
      const user = await UserEnhanced.findById(userId);
      if (user) {
        user.updateBehaviorProfile({
          type: interactionType,
          productId,
          ...metadata
        });
        await user.save();
      }

      // Update product analytics
      const product = await ProductEnhanced.findById(productId);
      if (product) {
        product.updateAnalytics(interactionType, metadata);
        await product.save();
      }

      // Invalidate relevant caches
      const cacheKeys = [
        `recommendations:*:${userId}:*`,
        `recommendations:*:*:${productId}:*`
      ];

      for (const pattern of cacheKeys) {
        await cacheService.deletePattern(pattern);
      }

    } catch (error) {
      console.error('Update user interaction error:', error);
    }
  }
}

export const advancedRecommendationService = new AdvancedRecommendationService();
