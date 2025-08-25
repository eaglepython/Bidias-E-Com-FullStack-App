import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.auth.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const state = store.getState();
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
              const response = await this.api.post('/auth/refresh', {
                refreshToken,
              });
              
              const { token } = response.data;
              localStorage.setItem('token', token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            store.dispatch(logout());
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api(config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload method
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
}

// Specialized API services
export class ProductAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async getProducts(params?: any) {
    return this.api.get('/products', { params });
  }

  async getProduct(id: string) {
    return this.api.get(`/products/${id}`);
  }

  async searchProducts(params: any) {
    return this.api.get('/products/search', { params });
  }

  async getTrendingProducts(params?: any) {
    return this.api.get('/products/trending', { params });
  }

  async getCategories() {
    return this.api.get('/products/categories');
  }

  async getRecommendations(productId: string, params?: any) {
    return this.api.get(`/products/${productId}/recommendations`, { params });
  }

  async addReview(productId: string, data: any) {
    return this.api.post(`/products/${productId}/reviews`, data);
  }

  async generateDescription(productId: string) {
    return this.api.post(`/products/${productId}/generate-description`);
  }

  async getAnalytics(productId: string, params?: any) {
    return this.api.get(`/products/${productId}/analytics`, { params });
  }
}

export class ChatAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async sendMessage(data: { message: string; context?: any }) {
    return this.api.post('/ai/chat', data);
  }

  async getRecommendations(params?: any) {
    return this.api.get('/ai/recommendations', { params });
  }

  async analyzeSentiment(data: { text: string }) {
    return this.api.post('/ai/sentiment', data);
  }

  async generateEmbeddings(data: { text: string }) {
    return this.api.post('/ai/embeddings', data);
  }

  async healthCheck() {
    return this.api.get('/ai/health');
  }
}

export class RecommendationAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async getRecommendations(params: {
    type?: 'user_based' | 'item_based' | 'content_based' | 'hybrid' | 'trending';
    productId?: string;
    category?: string;
    limit?: number;
  }) {
    return this.api.get('/ai/recommendations', { params });
  }

  async getPersonalizedRecommendations() {
    return this.api.get('/ai/recommendations', {
      params: { type: 'hybrid', limit: 12 }
    });
  }

  async getSimilarProducts(productId: string) {
    return this.api.get('/ai/recommendations', {
      params: { type: 'item_based', productId, limit: 6 }
    });
  }
}

export class OrderAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async createOrder(data: any) {
    return this.api.post('/orders', data);
  }

  async getOrders(params?: any) {
    return this.api.get('/orders', { params });
  }

  async getOrder(id: string) {
    return this.api.get(`/orders/${id}`);
  }

  async updateOrder(id: string, data: any) {
    return this.api.put(`/orders/${id}`, data);
  }

  async trackOrder(id: string) {
    return this.api.get(`/orders/${id}/track`);
  }

  async cancelOrder(id: string, data?: any) {
    return this.api.post(`/orders/${id}/cancel`, data);
  }

  async requestRefund(id: string, data: any) {
    return this.api.post(`/orders/${id}/refund`, data);
  }
}

export class PaymentAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async createPaymentIntent(data: any) {
    return this.api.post('/payments/create-intent', data);
  }

  async confirmPayment(data: any) {
    return this.api.post('/payments/confirm', data);
  }

  async processRefund(data: any) {
    return this.api.post('/payments/refund', data);
  }

  async getPaymentMethods() {
    return this.api.get('/payments/methods');
  }

  async addPaymentMethod(data: any) {
    return this.api.post('/payments/methods', data);
  }

  async removePaymentMethod(id: string) {
    return this.api.delete(`/payments/methods/${id}`);
  }
}

export class UserAPI {
  private api: ApiService;

  constructor() {
    this.api = apiService;
  }

  async getProfile() {
    return this.api.get('/users/profile');
  }

  async updateProfile(data: any) {
    return this.api.put('/users/profile', data);
  }

  async getAddresses() {
    return this.api.get('/users/addresses');
  }

  async addAddress(data: any) {
    return this.api.post('/users/addresses', data);
  }

  async updateAddress(id: string, data: any) {
    return this.api.put(`/users/addresses/${id}`, data);
  }

  async deleteAddress(id: string) {
    return this.api.delete(`/users/addresses/${id}`);
  }

  async getWishlist() {
    return this.api.get('/users/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.api.post('/users/wishlist', { productId });
  }

  async removeFromWishlist(productId: string) {
    return this.api.delete(`/users/wishlist/${productId}`);
  }

  async getRecentViews() {
    return this.api.get('/users/recent-views');
  }

  async updatePreferences(data: any) {
    return this.api.put('/users/preferences', data);
  }
}

// Export instances
export const apiService = new ApiService();
export const productAPI = new ProductAPI();
export const chatAPI = new ChatAPI();
export const recommendationAPI = new RecommendationAPI();
export const orderAPI = new OrderAPI();
export const paymentAPI = new PaymentAPI();
export const userAPI = new UserAPI();
