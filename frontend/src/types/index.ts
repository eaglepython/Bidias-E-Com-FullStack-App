export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'vendor';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  brand: string;
  category: string;
  subcategory?: string;
  tags: string[];
  sku: string;
  price: {
    original: number;
    current: number;
    currency: string;
  };
  inventory: {
    stock: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product?: Product;
  quantity: number;
  variant?: string;
  addedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  user: string;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingAddress: Address;
  billingAddress: Address;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  intent?: string;
  timestamp: string;
  isUser: boolean;
}

export interface Recommendation {
  id: string;
  product: Product;
  score: number;
  reason: string;
  algorithm: string;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'relevance';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
