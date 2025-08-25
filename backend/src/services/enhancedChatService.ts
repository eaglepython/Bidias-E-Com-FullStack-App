import { ollamaService } from './ollamaService';
import { advancedRecommendationService } from './advancedRecommendationService';
import { UserEnhanced } from '../models/UserEnhanced';
import { ProductEnhanced } from '../models/ProductEnhanced';
import { OrderEnhanced } from '../models/OrderEnhanced';
import { Interaction } from '../models/Interaction';
import { cacheService } from './cacheService';

interface ChatContext {
  userId: string;
  sessionId: string;
  conversationHistory: ChatMessage[];
  userProfile?: any;
  currentCart?: any;
  currentIntent?: Intent;
  contextData?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  type?: 'text' | 'product_card' | 'product_list' | 'order_status' | 'action_buttons';
}

interface Intent {
  type: 'product_search' | 'recommendation' | 'order_status' | 'support' | 'cart_management' | 'price_inquiry' | 'comparison' | 'general';
  confidence: number;
  entities: Entity[];
  parameters?: { [key: string]: any };
}

interface Entity {
  type: 'product' | 'category' | 'brand' | 'price' | 'order_number' | 'date' | 'size' | 'color';
  value: string;
  confidence: number;
}

interface AIResponse {
  message: string;
  intent: Intent;
  suggestions: string[];
  actions?: ChatAction[];
  products?: any[];
  metadata?: any;
}

interface ChatAction {
  type: 'add_to_cart' | 'view_product' | 'search_products' | 'track_order' | 'apply_coupon';
  label: string;
  data: any;
}

export class EnhancedChatService {
  private sessionTTL = 3600; // 1 hour
  private maxHistoryLength = 20;

  async processMessage(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Store user message
      await this.storeMessage(context.sessionId, 'user', message);

      // Analyze intent and extract entities
      const intent = await this.analyzeIntent(message, context);
      context.currentIntent = intent;

      // Get relevant context data
      const contextData = await this.gatherContext(intent, context);
      context.contextData = contextData;

      // Generate response based on intent
      let response: AIResponse;

      switch (intent.type) {
        case 'product_search':
          response = await this.handleProductSearch(message, context);
          break;
        case 'recommendation':
          response = await this.handleRecommendation(message, context);
          break;
        case 'order_status':
          response = await this.handleOrderStatus(message, context);
          break;
        case 'cart_management':
          response = await this.handleCartManagement(message, context);
          break;
        case 'price_inquiry':
          response = await this.handlePriceInquiry(message, context);
          break;
        case 'comparison':
          response = await this.handleProductComparison(message, context);
          break;
        case 'support':
          response = await this.handleSupport(message, context);
          break;
        default:
          response = await this.handleGeneral(message, context);
      }

      // Store assistant response
      await this.storeMessage(context.sessionId, 'assistant', response.message, {
        intent: response.intent,
        actions: response.actions,
        products: response.products
      });

      // Log interaction for analytics
      await this.logInteraction(context.userId, intent.type, {
        message,
        intent,
        response: response.message
      });

      return response;

    } catch (error) {
      console.error('Chat processing error:', error);
      return this.getErrorResponse();
    }
  }

  // Gather relevant context for the given intent
  private async gatherContext(intent: Intent, context: ChatContext): Promise<any> {
    try {
      const result: any = { intent: intent.type };
      if (intent.type === 'recommendation') {
        const user = await UserEnhanced.findById(context.userId);
        result.preferences = user?.preferences;
        result.behavior = user?.behaviorProfile;
      }
      if (intent.type === 'order_status') {
        const lastOrder = await OrderEnhanced.findOne({ customerId: context.userId }).sort({ placedAt: -1 });
        result.lastOrder = lastOrder ? {
          id: lastOrder._id,
          status: lastOrder.status,
          paymentStatus: lastOrder.paymentStatus,
          placedAt: lastOrder.placedAt
        } : null;
      }
      if (intent.type === 'product_search') {
        // could add popular categories etc.
        result.hints = ['category', 'brand', 'price'];
      }
      return result;
    } catch (error) {
      console.error('gatherContext error:', error);
      return {};
    }
  }

  private async analyzeIntent(message: string, context: ChatContext): Promise<Intent> {
    try {
      // Use AI to analyze intent
      const prompt = this.buildIntentAnalysisPrompt(message, context);
      const aiResponse = await ollamaService.chatWithAssistant({
        userId: context.userId,
        conversationHistory: [
          { role: 'system', content: prompt },
          { role: 'user', content: message }
        ],
        currentCart: context.currentCart,
        userProfile: context.userProfile
      });

      // Parse AI response to extract intent
      return this.parseIntentFromAI(aiResponse, message);
    } catch (error) {
      console.error('Intent analysis error:', error);
      return this.getFallbackIntent(message);
    }
  }

  private async handleProductSearch(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Extract search terms and filters
      const searchTerms = this.extractSearchTerms(message);
      const filters = this.extractFilters(message, context);

      // Search products
      const searchQuery: any = {
        $text: { $search: searchTerms },
        status: 'active'
      };

      if (filters.category) {
        searchQuery.category = filters.category;
      }

      if (filters.priceRange) {
        searchQuery.price = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      if (filters.brand) {
        searchQuery.brand = filters.brand;
      }

      const products = await ProductEnhanced.find(searchQuery)
        .sort({ 'rating.average': -1, 'analytics.purchases': -1 })
        .limit(6);

      if (products.length === 0) {
        return {
          message: `I couldn't find any products matching "${searchTerms}". Let me suggest some alternatives or try a different search.`,
          intent: context.currentIntent!,
          suggestions: [
            'Show me trending products',
            'What\'s on sale?',
            'Browse categories'
          ]
        };
      }

      const productSummary = products.length === 1 
        ? `I found a great product for you:`
        : `I found ${products.length} products matching your search:`;

      return {
        message: productSummary,
        intent: context.currentIntent!,
        products: products.map(p => this.formatProductForChat(p)),
        actions: products.map(p => ({
          type: 'view_product' as const,
          label: `View ${p.name}`,
          data: { productId: p._id }
        })),
        suggestions: [
          'Add to cart',
          'Compare products',
          'Show similar products',
          'Check reviews'
        ]
      };

    } catch (error) {
      console.error('Product search error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleRecommendation(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Determine recommendation type
      const recType = this.determineRecommendationType(message);
      
      const recommendations = await advancedRecommendationService.getRecommendations({
        userId: context.userId,
        type: recType,
        limit: 4,
        context: {
          currentSession: context.conversationHistory.map(msg => msg.content),
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
        }
      });

      if (recommendations.length === 0) {
        return {
          message: 'Let me find some great products for you based on trending items.',
          intent: context.currentIntent!,
          suggestions: [
            'Show me what\'s trending',
            'Browse by category',
            'Show me deals'
          ]
        };
      }

      const responseMessage = this.generateRecommendationMessage(recType, recommendations.length);

      return {
        message: responseMessage,
        intent: context.currentIntent!,
        products: recommendations.map(rec => ({
          ...this.formatProductForChat(rec.product),
          recommendationReason: rec.reason,
          score: rec.score
        })),
        suggestions: [
          'Tell me more about these',
          'Show me alternatives',
          'Add to wishlist',
          'Compare these products'
        ]
      };

    } catch (error) {
      console.error('Recommendation error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleOrderStatus(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Extract order number or find recent orders
      const orderNumber = this.extractOrderNumber(message);
      
      let orders;
      if (orderNumber) {
        orders = await OrderEnhanced.find({
          orderNumber,
          customerId: context.userId
        });
      } else {
        orders = await OrderEnhanced.find({
          customerId: context.userId
        })
        .sort({ placedAt: -1 })
        .limit(3);
      }

      if (orders.length === 0) {
        return {
          message: 'I couldn\'t find any orders for your account. Would you like to start shopping?',
          intent: context.currentIntent!,
          suggestions: [
            'Browse products',
            'Check my account',
            'Contact support'
          ]
        };
      }

      const order = orders[0];
      const statusMessage = this.generateOrderStatusMessage(order);

      return {
        message: statusMessage,
        intent: context.currentIntent!,
        metadata: {
          order: {
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.totalAmount,
            estimatedDelivery: order.shipping.estimatedDelivery
          }
        },
        suggestions: [
          'Track my shipment',
          'View order details',
          'Reorder these items',
          'Contact support'
        ]
      };

    } catch (error) {
      console.error('Order status error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleCartManagement(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      const user = await UserEnhanced.findById(context.userId);
      if (!user || user.cart.length === 0) {
        return {
          message: 'Your cart is empty. Would you like me to help you find some great products?',
          intent: context.currentIntent!,
          suggestions: [
            'Show me recommendations',
            'Browse categories',
            'View wishlist'
          ]
        };
      }

      const cartTotal = user.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const itemCount = user.cart.reduce((count, item) => count + item.quantity, 0);

      // Get product details for cart items
      const productIds = user.cart.map(item => item.productId);
      const products = await ProductEnhanced.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      const cartItems = user.cart.map(item => {
        const product = productMap.get(item.productId);
        return {
          ...item,
          product: product ? this.formatProductForChat(product) : null
        };
      });

      return {
        message: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart with a total of $${cartTotal.toFixed(2)}.`,
        intent: context.currentIntent!,
        metadata: {
          cart: {
            items: cartItems,
            total: cartTotal,
            itemCount
          }
        },
        actions: [
          {
            type: 'view_product' as const,
            label: 'Proceed to Checkout',
            data: { action: 'checkout' }
          }
        ],
        suggestions: [
          'Proceed to checkout',
          'Remove items',
          'Add more products',
          'Apply coupon code'
        ]
      };

    } catch (error) {
      console.error('Cart management error:', error);
      return this.getErrorResponse();
    }
  }

  private async handlePriceInquiry(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      const productName = this.extractProductName(message);
      
      if (!productName) {
        return {
          message: 'Which product would you like to know the price for?',
          intent: context.currentIntent!,
          suggestions: [
            'Search for a product',
            'Browse categories',
            'Show me deals'
          ]
        };
      }

      const products = await ProductEnhanced.find({
        $text: { $search: productName },
        status: 'active'
      }).limit(3);

      if (products.length === 0) {
        return {
          message: `I couldn't find any products matching "${productName}". Can you be more specific?`,
          intent: context.currentIntent!,
          suggestions: [
            'Try a different search',
            'Browse categories',
            'View trending products'
          ]
        };
      }

      const product = products[0];
      const priceMessage = this.generatePriceMessage(product);

      return {
        message: priceMessage,
        intent: context.currentIntent!,
        products: [this.formatProductForChat(product)],
        suggestions: [
          'Add to cart',
          'View product details',
          'Find similar products',
          'Check reviews'
        ]
      };

    } catch (error) {
      console.error('Price inquiry error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleProductComparison(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // This is a complex feature that would compare multiple products
      return {
        message: 'Product comparison is coming soon! For now, I can help you find products and show their details.',
        intent: context.currentIntent!,
        suggestions: [
          'Search for products',
          'Show me recommendations',
          'Browse categories'
        ]
      };
    } catch (error) {
      console.error('Product comparison error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleSupport(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Generate AI response for support
      const supportResponse = await ollamaService.chatWithAssistant({
        userId: context.userId,
        conversationHistory: [
          {
            role: 'system',
            content: 'You are a helpful customer support agent for an e-commerce platform. Provide helpful, friendly, and accurate information about orders, returns, shipping, and general shopping questions.'
          },
          { role: 'user', content: message }
        ],
        userProfile: context.userProfile
      });

      return {
        message: supportResponse,
        intent: context.currentIntent!,
        suggestions: [
          'Track my order',
          'Return policy',
          'Contact human agent',
          'Browse help center'
        ]
      };

    } catch (error) {
      console.error('Support handling error:', error);
      return this.getErrorResponse();
    }
  }

  private async handleGeneral(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Generate general AI response
      const generalResponse = await ollamaService.chatWithAssistant({
        userId: context.userId,
        conversationHistory: [
          {
            role: 'system',
            content: 'You are a friendly AI shopping assistant. Help users discover products, manage their shopping experience, and answer general questions about the e-commerce platform.'
          },
          ...context.conversationHistory.slice(-5),
          { role: 'user', content: message }
        ],
        userProfile: context.userProfile,
        currentCart: context.currentCart
      });

      return {
        message: generalResponse,
        intent: context.currentIntent!,
        suggestions: [
          'Show me recommendations',
          'Search for products',
          'Check my cart',
          'View my orders'
        ]
      };

    } catch (error) {
      console.error('General handling error:', error);
      return this.getErrorResponse();
    }
  }

  // Helper methods
  private buildIntentAnalysisPrompt(message: string, context: ChatContext): string {
    return `Analyze the following message and determine the user's intent. Respond with only the intent type:

Message: "${message}"

Possible intents:
- product_search: User wants to find specific products
- recommendation: User wants product suggestions
- order_status: User wants to check order information
- cart_management: User wants to manage their shopping cart
- price_inquiry: User wants to know product prices
- comparison: User wants to compare products
- support: User needs customer support
- general: General conversation

Intent:`;
  }

  private parseIntentFromAI(aiResponse: string, message: string): Intent {
    const intent = aiResponse.toLowerCase().trim();
    const entities = this.extractEntities(message);

    const intentMap: { [key: string]: string } = {
      'product_search': 'product_search',
      'recommendation': 'recommendation',
      'order_status': 'order_status',
      'cart_management': 'cart_management',
      'price_inquiry': 'price_inquiry',
      'comparison': 'comparison',
      'support': 'support'
    };

    return {
      type: intentMap[intent] as any || 'general',
      confidence: 0.8,
      entities
    };
  }

  private getFallbackIntent(message: string): Intent {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
      return { type: 'product_search', confidence: 0.6, entities: [] };
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return { type: 'recommendation', confidence: 0.6, entities: [] };
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return { type: 'order_status', confidence: 0.6, entities: [] };
    }
    
    if (lowerMessage.includes('cart') || lowerMessage.includes('checkout')) {
      return { type: 'cart_management', confidence: 0.6, entities: [] };
    }
    
    return { type: 'general', confidence: 0.5, entities: [] };
  }

  private extractEntities(message: string): Entity[] {
    const entities: Entity[] = [];
    // Basic entity extraction - in production, use NLP library
    
    // Extract prices
    const priceMatch = message.match(/\$(\d+(?:\.\d{2})?)/g);
    if (priceMatch) {
      priceMatch.forEach(price => {
        entities.push({
          type: 'price',
          value: price,
          confidence: 0.8
        });
      });
    }

    return entities;
  }

  private extractSearchTerms(message: string): string {
    // Remove common stop words and extract search terms
    const stopWords = ['i', 'want', 'need', 'looking', 'for', 'find', 'search', 'show', 'me'];
    const words = message.toLowerCase().split(' ');
    const searchTerms = words.filter(word => !stopWords.includes(word));
    return searchTerms.join(' ');
  }

  private extractFilters(message: string, context: ChatContext): any {
    const filters: any = {};
    
    // Extract price range
    const priceMatch = message.match(/under \$(\d+)|less than \$(\d+)|below \$(\d+)/i);
    if (priceMatch) {
      filters.priceRange = { min: 0, max: parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) };
    }

    return filters;
  }

  private determineRecommendationType(message: string): 'user_based' | 'item_based' | 'content_based' | 'hybrid' | 'trending' | 'personalized' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('trending') || lowerMessage.includes('popular')) {
      return 'trending';
    }
    
    if (lowerMessage.includes('similar') || lowerMessage.includes('like this')) {
      return 'item_based';
    }
    
    if (lowerMessage.includes('personal') || lowerMessage.includes('for me')) {
      return 'personalized';
    }
    
    return 'hybrid';
  }

  private generateRecommendationMessage(type: string, count: number): string {
    const messages = {
      trending: `Here are ${count} trending products you might love:`,
      item_based: `Based on similar products, here are ${count} recommendations:`,
      personalized: `I've personalized these ${count} recommendations just for you:`,
      hybrid: `Here are ${count} carefully selected recommendations for you:`
    };

    return messages[type as keyof typeof messages] || `Here are ${count} recommendations for you:`;
  }

  private extractOrderNumber(message: string): string | null {
    const orderMatch = message.match(/ORD-[\w-]+/i);
    return orderMatch ? orderMatch[0] : null;
  }

  private generateOrderStatusMessage(order: any): string {
    const statusMessages = {
      pending: 'Your order is being processed',
      confirmed: 'Your order has been confirmed and is being prepared',
      processing: 'Your order is currently being processed',
      shipped: 'Great news! Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    const baseMessage = statusMessages[order.status as keyof typeof statusMessages] || 'Order status updated';
    
    return `${baseMessage}. Order #${order.orderNumber} for $${order.totalAmount.toFixed(2)}.` +
           (order.shipping.trackingNumber ? ` Tracking: ${order.shipping.trackingNumber}` : '');
  }

  private extractProductName(message: string): string | null {
    // Basic product name extraction
    const patterns = [
      /price (?:of |for )?(.+?)(?:\?|$)/i,
      /cost (?:of |for )?(.+?)(?:\?|$)/i,
      /how much (?:is |does )?(.+?)(?:\?| cost)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private generatePriceMessage(product: any): string {
    let message = `${product.name} is priced at $${product.price.toFixed(2)}`;
    
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      message += ` (${discount}% off from $${product.compareAtPrice.toFixed(2)})`;
    }

    if (product.shipping.freeShipping) {
      message += ' with free shipping!';
    }

    return message;
  }

  private formatProductForChat(product: any): any {
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.images[0],
      rating: product.rating.average,
      reviewCount: product.rating.count,
      inStock: product.inventory.totalQuantity > 0,
      freeShipping: product.shipping.freeShipping
    };
  }

  private async storeMessage(sessionId: string, role: string, content: string, metadata?: any): Promise<void> {
    try {
      const key = `chat_session:${sessionId}`;
      const message = {
        id: `${Date.now()}_${Math.random()}`,
        role,
        content,
        timestamp: new Date(),
        metadata
      };

      const session = await cacheService.get(key) || { messages: [] };
      session.messages.push(message);
      
      // Keep only recent messages
      if (session.messages.length > this.maxHistoryLength) {
        session.messages = session.messages.slice(-this.maxHistoryLength);
      }

      await cacheService.set(key, session, this.sessionTTL);
    } catch (error) {
      console.error('Store message error:', error);
    }
  }

  private async logInteraction(userId: string, type: string, data: any): Promise<void> {
    try {
      await Interaction.create({
        userId,
        type: `chat_${type}`,
        metadata: data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Log interaction error:', error);
    }
  }

  private getErrorResponse(): AIResponse {
    return {
      message: 'I\'m sorry, I\'m having trouble processing your request right now. Please try again or contact support if the issue persists.',
      intent: { type: 'general', confidence: 0.5, entities: [] },
      suggestions: [
        'Try again',
        'Browse products',
        'Contact support',
        'View my account'
      ]
    };
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const session = await cacheService.get(`chat_session:${sessionId}`);
      return session?.messages || [];
    } catch (error) {
      console.error('Get chat history error:', error);
      return [];
    }
  }

  async clearChatHistory(sessionId: string): Promise<void> {
    try {
      await cacheService.delete(`chat_session:${sessionId}`);
    } catch (error) {
      console.error('Clear chat history error:', error);
    }
  }
}

export const enhancedChatService = new EnhancedChatService();
