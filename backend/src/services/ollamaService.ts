import { Ollama } from 'ollama';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ProductRecommendationContext {
  userId: string;
  currentProduct?: string;
  categories?: string[];
  priceRange?: { min: number; max: number };
  userPreferences?: any;
}

interface ChatContext {
  userId: string;
  conversationHistory: ChatMessage[];
  currentCart?: any[];
  userProfile?: any;
}

class OllamaService {
  private ollama: Ollama;
  private model: string;
  private embeddingModel: string;

  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    });
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
  }

  // Health check for Ollama service
  async healthCheck(): Promise<{ status: boolean; models?: string[] }> {
    try {
      const models = await this.ollama.list();
      return {
        status: true,
        models: models.models.map((m: any) => m.name)
      };
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return { status: false };
    }
  }

  // Chat with AI assistant for e-commerce help
  async chatWithAssistant(context: ChatContext): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-10) // Keep last 10 messages for context
      ];

      const response = await this.ollama.chat({
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 500
        }
      });

      return response.message.content;
    } catch (error) {
      console.error('Chat error:', error);
      return 'I apologize, but I\'m having trouble responding right now. Please try again.';
    }
  }

  // Generate product recommendations
  async generateRecommendations(context: ProductRecommendationContext): Promise<string[]> {
    try {
      const prompt = this.buildRecommendationPrompt(context);
      
      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        options: {
          temperature: 0.3,
          top_p: 0.8
        }
      });

      // Parse the response to extract product recommendations
      return this.parseRecommendations(response.response);
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }

  // Generate product descriptions
  async generateProductDescription(productData: any): Promise<string> {
    try {
      const prompt = `Create an engaging and detailed product description for the following product:
      
Product Name: ${productData.name}
Category: ${productData.category}
Key Features: ${productData.features?.join(', ') || 'N/A'}
Price: $${productData.price}
Brand: ${productData.brand || 'N/A'}

Write a compelling description that highlights the benefits, features, and value proposition. Keep it between 100-200 words and make it appealing to potential buyers.`;

      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        options: {
          temperature: 0.6,
          num_predict: 300
        }
      });

      return response.response.trim();
    } catch (error) {
      console.error('Product description generation error:', error);
      return 'Unable to generate product description at this time.';
    }
  }

  // Generate embeddings for product similarity
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await this.ollama.embeddings({
        model: this.embeddingModel,
        prompt: text
      });

      return response.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return [];
    }
  }

  // Analyze user sentiment from reviews/feedback
  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number }> {
    try {
      const prompt = `Analyze the sentiment of the following text and respond with only "positive", "negative", or "neutral":

"${text}"

Sentiment:`;

      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        options: {
          temperature: 0.1,
          num_predict: 10
        }
      });

      const sentiment = response.response.toLowerCase().trim();
      const validSentiments = ['positive', 'negative', 'neutral'];
      
      return {
        sentiment: validSentiments.includes(sentiment) ? sentiment as any : 'neutral',
        confidence: 0.8 // Placeholder confidence score
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  // Build system prompt for chat assistant
  private buildSystemPrompt(context: ChatContext): string {
    return `You are an AI shopping assistant for a sophisticated e-commerce platform. Your role is to help customers with:
- Product recommendations based on their needs and preferences
- Answering questions about products, orders, and policies
- Helping with cart management and checkout process
- Providing personalized shopping advice

User Context:
- User ID: ${context.userId}
- Current cart items: ${context.currentCart?.length || 0}
- User profile: ${context.userProfile ? 'Available' : 'Not available'}

Guidelines:
- Be helpful, friendly, and professional
- Focus on providing value to the customer
- Ask clarifying questions when needed
- Suggest relevant products when appropriate
- Keep responses concise but informative
- If you don't know something, admit it and offer to help find the information`;
  }

  // Build recommendation prompt
  private buildRecommendationPrompt(context: ProductRecommendationContext): string {
    return `Generate product recommendations for a user based on the following context:

User ID: ${context.userId}
Current Product: ${context.currentProduct || 'None'}
Interested Categories: ${context.categories?.join(', ') || 'None specified'}
Price Range: ${context.priceRange ? `$${context.priceRange.min} - $${context.priceRange.max}` : 'No preference'}
User Preferences: ${context.userPreferences ? JSON.stringify(context.userPreferences) : 'None'}

Please suggest 5 product types or categories that would be most relevant for this user. Focus on:
- Complementary products to their current interests
- Popular items in their preferred categories
- Items within their price range
- Products that match their preferences

Format your response as a simple list of product suggestions, one per line.`;
  }

  // Parse recommendations from AI response
  private parseRecommendations(response: string): string[] {
    try {
      // Extract lines that look like recommendations
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      const recommendations: string[] = [];

      for (const line of lines) {
        // Remove common list prefixes and clean up
        let cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-*•]\s*/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 100) {
          recommendations.push(cleaned);
        }
      }

      return recommendations.slice(0, 5); // Return max 5 recommendations
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }
}

export const ollamaService = new OllamaService();
