import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { cacheService } from './cacheService';
import { ollamaService } from './ollamaService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

class WebSocketService {
  private io: Server;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
        
        // Join user-specific room
        socket.join(`user:${socket.userId}`);
        
        // Join admin room if user is admin
        if (socket.user?.role === 'admin') {
          socket.join('admin');
        }
      }

      // Chat events
      socket.on('chat:message', async (data: any) => {
        await this.handleChatMessage(socket, data);
      });

      // Product events
      socket.on('product:view', async (data: any) => {
        await this.handleProductView(socket, data);
      });

      // Cart events
      socket.on('cart:update', async (data: any) => {
        await this.handleCartUpdate(socket, data);
      });

      // Order events
      socket.on('order:track', async (data: any) => {
        await this.handleOrderTracking(socket, data);
      });

      // Recommendation events
      socket.on('recommendation:request', async (data: any) => {
        await this.handleRecommendationRequest(socket, data);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { message, context } = data;
      
      // Process message through AI service (to be implemented)
      const response = await this.processAIMessage(message, context, socket.userId!);
      
      // Send response back to user
      socket.emit('chat:response', {
        message: response.message,
        intent: response.intent,
        suggestions: response.suggestions,
        timestamp: new Date()
      });

      // Log interaction for ML training
      await this.logInteraction(socket.userId!, 'chat', {
        message,
        response: response.message,
        intent: response.intent
      });

    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('chat:error', { message: 'Failed to process message' });
    }
  }

  private async handleProductView(socket: AuthenticatedSocket, data: any) {
    try {
      const { productId, timestamp, duration } = data;
      
      // Log interaction
      await this.logInteraction(socket.userId!, 'view', {
        productId,
        duration,
        timestamp: new Date(timestamp)
      });

      // Send real-time recommendations
      const recommendations = await this.getProductRecommendations(productId, socket.userId!);
      socket.emit('recommendations:update', recommendations);

    } catch (error) {
      console.error('Product view error:', error);
    }
  }

  private async handleCartUpdate(socket: AuthenticatedSocket, data: any) {
    try {
      const { action, productId, quantity } = data;
      
      // Log interaction
      await this.logInteraction(socket.userId!, `cart_${action}`, {
        productId,
        quantity
      });

      // Notify user of cart update
      socket.emit('cart:updated', {
        action,
        productId,
        quantity,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Cart update error:', error);
    }
  }

  private async handleOrderTracking(socket: AuthenticatedSocket, data: any) {
    try {
      const { orderId } = data;
      
      // Get order status (to be implemented)
      const orderStatus = await this.getOrderStatus(orderId);
      
      socket.emit('order:status', {
        orderId,
        status: orderStatus,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Order tracking error:', error);
    }
  }

  private async handleRecommendationRequest(socket: AuthenticatedSocket, data: any) {
    try {
      const { type, context } = data;
      
      // Get recommendations based on type and context
      const recommendations = await this.getRecommendations(socket.userId!, type, context);
      
      socket.emit('recommendations:response', {
        type,
        recommendations,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Recommendation request error:', error);
    }
  }

  // AI message processing using Ollama
  private async processAIMessage(message: string, context: any, userId: string): Promise<any> {
    try {
      // Get user profile and conversation history
      const user = await User.findById(userId);
      const conversationHistory = context.history || [];
      
      // Build chat context
      const chatContext = {
        userId,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user' as const, content: message }
        ],
        currentCart: context.cart,
        userProfile: user
      };

      // Get AI response
      const aiResponse = await ollamaService.chatWithAssistant(chatContext);

      // Determine intent (simplified)
      let intent = 'general_inquiry';
      if (message.toLowerCase().includes('recommend')) {
        intent = 'product_recommendation';
      } else if (message.toLowerCase().includes('order') || message.toLowerCase().includes('track')) {
        intent = 'order_inquiry';
      } else if (message.toLowerCase().includes('cart')) {
        intent = 'cart_assistance';
      }

      return {
        message: aiResponse,
        intent,
        suggestions: this.generateSuggestions(intent),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI message processing error:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        intent: "error",
        suggestions: ["How can I help you today?", "Show me your products"]
      };
    }
  }

  // Get product recommendations using Ollama
  private async getProductRecommendations(productId: string, userId: string): Promise<any[]> {
    try {
      // Check cache first
      const cached = await cacheService.get(`recommendations:product:${productId}:user:${userId}`);
      if (cached) return cached;

      // Get user preferences and current product info
      const user = await User.findById(userId);
      
      // Build recommendation context
      const context = {
        userId,
        currentProduct: productId,
        categories: user?.profile?.preferences?.categories || [],
        priceRange: user?.profile?.preferences?.priceRange,
        userPreferences: user?.profile?.preferences
      };

      // Get AI recommendations
      const aiRecommendations = await ollamaService.generateRecommendations(context);
      
      // Transform to expected format
      const recommendations = aiRecommendations.map((rec, index) => ({
        id: `rec_${Date.now()}_${index}`,
        title: rec,
        type: 'ai_suggestion',
        confidence: 0.8
      }));
      
      // Cache results
      await cacheService.set(`recommendations:product:${productId}:user:${userId}`, recommendations, 3600);
      
      return recommendations;
    } catch (error) {
      console.error('Product recommendations error:', error);
      return [];
    }
  }

  // Get general recommendations
  private async getRecommendations(userId: string, type: string, context: any): Promise<any[]> {
    // This will be implemented with actual recommendation service
    return [];
  }

  // Generate contextual suggestions based on intent
  private generateSuggestions(intent: string): string[] {
    const suggestionMap: { [key: string]: string[] } = {
      'product_recommendation': [
        "Show me trending products",
        "What's new in electronics?",
        "Find products under $50"
      ],
      'order_inquiry': [
        "Track my latest order",
        "Check order history",
        "Return or exchange item"
      ],
      'cart_assistance': [
        "View my cart",
        "Apply discount code",
        "Calculate shipping"
      ],
      'general_inquiry': [
        "Show me product recommendations",
        "How can I track my order?",
        "What are your return policies?"
      ]
    };

    return suggestionMap[intent] || suggestionMap['general_inquiry'];
  }

  // Get order status
  private async getOrderStatus(orderId: string): Promise<any> {
    // This will be implemented with actual order service
    return { status: 'processing', estimatedDelivery: new Date() };
  }

  // Log interaction for ML
  private async logInteraction(userId: string, type: string, data: any): Promise<void> {
    // This will be implemented with actual analytics service
    console.log(`Interaction logged: ${userId} - ${type}`, data);
  }

  // Public methods for other services to use
  public sendToUser(userId: string, event: string, data: any): void {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  public sendToAdmin(event: string, data: any): void {
    this.io.to('admin').emit(event, data);
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

let wsService: WebSocketService;

export function initializeWebSocketService(server: HttpServer): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export { WebSocketService, wsService };
