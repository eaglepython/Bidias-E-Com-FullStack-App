import { Product } from '../models/Product';
import { User } from '../models/User';
import { Interaction } from '../models/Interaction';
import { cacheService } from './cacheService';

interface SearchQuery {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
  filters?: any;
}

interface SearchResult {
  products: any[];
  totalCount: number;
  facets: any;
  suggestions: string[];
  searchTime: number;
  page: number;
  totalPages: number;
}

export class SearchService {
  private readonly CACHE_TTL = 300; // 5 minutes

  async search(query: SearchQuery, userId?: string): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(query);
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        // Log search interaction if user provided
        if (userId) {
          this.logSearchInteraction(userId, query);
        }
        
        return {
          ...cached,
          searchTime: Date.now() - startTime
        };
      }

      // Build MongoDB aggregation pipeline
      const pipeline = this.buildSearchPipeline(query);
      
      // Execute search
      const [results, countResult] = await Promise.all([
        Product.aggregate(pipeline),
        Product.aggregate([
          ...pipeline.slice(0, -2), // Remove pagination stages
          { $count: "total" }
        ])
      ]);

      const totalCount = countResult[0]?.total || 0;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const totalPages = Math.ceil(totalCount / limit);

      // Generate facets
      const facets = await this.generateFacets(query);
      
      // Generate search suggestions
      const suggestions = await this.generateSuggestions(query.q || '');

      const result: SearchResult = {
        products: results,
        totalCount,
        facets,
        suggestions,
        searchTime: Date.now() - startTime,
        page,
        totalPages
      };

      // Cache result
      await cacheService.set(cacheKey, result, this.CACHE_TTL);

      // Log search interaction
      if (userId) {
        await this.logSearchInteraction(userId, query, results.length);
      }

      return result;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search failed');
    }
  }

  private buildSearchPipeline(query: SearchQuery): any[] {
    const pipeline: any[] = [];

    // Text search stage
    if (query.q) {
      pipeline.push({
        $match: {
          $text: { $search: query.q }
        }
      });
      
      // Add text score for relevance
      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" }
        }
      });
    }

    // Filters
    const matchConditions: any = {};

    if (query.category) {
      matchConditions.category = query.category;
    }

    if (query.brand) {
      matchConditions.brand = { $regex: query.brand, $options: 'i' };
    }

    if (query.minPrice || query.maxPrice) {
      matchConditions.price = {};
      if (query.minPrice) matchConditions.price.$gte = query.minPrice;
      if (query.maxPrice) matchConditions.price.$lte = query.maxPrice;
    }

    if (query.rating) {
      matchConditions['analytics.averageRating'] = { $gte: query.rating };
    }

    if (query.inStock) {
      matchConditions['inventory.inStock'] = true;
      matchConditions['inventory.quantity'] = { $gt: 0 };
    }

    if (query.tags && query.tags.length > 0) {
      matchConditions.tags = { $in: query.tags };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Sorting
    const sortStage: any = {};
    switch (query.sortBy) {
      case 'price_asc':
        sortStage.price = 1;
        break;
      case 'price_desc':
        sortStage.price = -1;
        break;
      case 'rating':
        sortStage['analytics.averageRating'] = -1;
        break;
      case 'newest':
        sortStage.createdAt = -1;
        break;
      case 'popularity':
        sortStage['analytics.views'] = -1;
        break;
      case 'relevance':
      default:
        if (query.q) {
          sortStage.score = { $meta: "textScore" };
        } else {
          sortStage['analytics.popularityScore'] = -1;
        }
        break;
    }

    pipeline.push({ $sort: sortStage });

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project only needed fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        price: 1,
        images: 1,
        category: 1,
        brand: 1,
        tags: 1,
        'analytics.averageRating': 1,
        'analytics.reviewCount': 1,
        'inventory.inStock': 1,
        'inventory.quantity': 1,
        discount: 1,
        features: 1,
        createdAt: 1,
        score: 1
      }
    });

    return pipeline;
  }

  private async generateFacets(query: SearchQuery): Promise<any> {
    const facetPipeline: any[] = [];

    // Apply same initial filters
    if (query.q) {
      facetPipeline.push({
        $match: { $text: { $search: query.q } }
      });
    }

    const baseMatch: any = {};
    if (query.category) baseMatch.category = query.category;
    if (query.brand) baseMatch.brand = { $regex: query.brand, $options: 'i' };
    
    if (Object.keys(baseMatch).length > 0) {
      facetPipeline.push({ $match: baseMatch });
    }

    // Generate facets
    facetPipeline.push({
      $facet: {
        categories: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        brands: [
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        priceRanges: [
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $lt: ["$price", 25] }, then: "Under $25" },
                    { case: { $lt: ["$price", 50] }, then: "$25 - $50" },
                    { case: { $lt: ["$price", 100] }, then: "$50 - $100" },
                    { case: { $lt: ["$price", 200] }, then: "$100 - $200" },
                    { case: { $gte: ["$price", 200] }, then: "$200+" }
                  ]
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        ratings: [
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $gte: ["$analytics.averageRating", 4.5] }, then: "4.5+ stars" },
                    { case: { $gte: ["$analytics.averageRating", 4.0] }, then: "4.0+ stars" },
                    { case: { $gte: ["$analytics.averageRating", 3.5] }, then: "3.5+ stars" },
                    { case: { $gte: ["$analytics.averageRating", 3.0] }, then: "3.0+ stars" }
                  ],
                  default: "Under 3.0 stars"
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]
      }
    });

    const result = await Product.aggregate(facetPipeline);
    return result[0] || {};
  }

  private async generateSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 3) return [];

    try {
      // Search for similar product names and categories
      const suggestions = await Product.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { category: { $regex: query, $options: 'i' } },
              { brand: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            names: { $addToSet: "$name" },
            categories: { $addToSet: "$category" },
            brands: { $addToSet: "$brand" }
          }
        },
        {
          $project: {
            suggestions: {
              $concatArrays: ["$names", "$categories", "$brands"]
            }
          }
        }
      ]);

      if (suggestions.length > 0) {
        return suggestions[0].suggestions
          .filter((s: string) => s.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
      }

      return [];
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return [];
    }
  }

  private generateCacheKey(query: SearchQuery): string {
    const key = Object.keys(query)
      .sort()
      .map(k => `${k}:${query[k as keyof SearchQuery]}`)
      .join('|');
    return `search:${Buffer.from(key).toString('base64')}`;
  }

  private async logSearchInteraction(userId: string, query: SearchQuery, resultCount?: number): Promise<void> {
    try {
      await Interaction.create({
        userId,
        type: 'search',
        data: {
          query: query.q,
          filters: {
            category: query.category,
            brand: query.brand,
            priceRange: {
              min: query.minPrice,
              max: query.maxPrice
            }
          },
          resultCount,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Search interaction logging error:', error);
    }
  }

  // Auto-complete search suggestions
  async getAutoComplete(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `autocomplete:${query}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) return cached;

    try {
      const suggestions = await Product.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: `^${query}`, $options: 'i' } },
              { category: { $regex: `^${query}`, $options: 'i' } },
              { brand: { $regex: `^${query}`, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            suggestions: [
              "$name",
              "$category", 
              "$brand"
            ]
          }
        },
        {
          $unwind: "$suggestions"
        },
        {
          $match: {
            suggestions: { $regex: `^${query}`, $options: 'i' }
          }
        },
        {
          $group: {
            _id: "$suggestions"
          }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 0,
            suggestion: "$_id"
          }
        }
      ]);

      const result = suggestions.map(s => s.suggestion);
      await cacheService.set(cacheKey, result, 300); // Cache for 5 minutes
      
      return result;
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  // Trending searches
  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    const cacheKey = 'trending_searches';
    const cached = await cacheService.get(cacheKey);
    
    if (cached) return cached;

    try {
      const trending = await Interaction.aggregate([
        {
          $match: {
            type: 'search',
            timestamp: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        },
        {
          $group: {
            _id: "$data.query",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 0,
            query: "$_id"
          }
        }
      ]);

      const result = trending.map(t => t.query).filter(q => q && q.length > 0);
      await cacheService.set(cacheKey, result, 3600); // Cache for 1 hour
      
      return result;
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
