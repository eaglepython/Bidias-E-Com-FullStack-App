import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  _id?: string;
  sku: string;
  name: string;
  attributes: { [key: string]: string }; // e.g., { size: 'L', color: 'Red' }
  price: number;
  compareAtPrice?: number;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };
  images: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface IProductReview {
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: Date;
}

export interface IProductAnalytics {
  views: number;
  purchases: number;
  conversions: number;
  conversionRate: number;
  averageRating: number;
  totalReviews: number;
  wishlistCount: number;
  cartAdditions: number;
  cartAbandonments: number;
  dailyViews: { [date: string]: number };
  monthlyRevenue: { [month: string]: number };
  popularWith: string[]; // user segments
}

export interface ISEOData {
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  keywords: string[];
  canonicalUrl?: string;
}

export interface IShipping {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
  freeShipping: boolean;
  domesticShipping: {
    cost: number;
    estimatedDays: { min: number; max: number };
  };
  internationalShipping?: {
    cost: number;
    estimatedDays: { min: number; max: number };
    restrictions: string[];
  };
}

export interface IProductEnhanced extends Document {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  
  // Product organization
  category: string;
  subcategory?: string;
  brand: string;
  tags: string[];
  sku: string;
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  margin?: number;
  currency: string;
  taxable: boolean;
  
  // Media
  images: string[];
  videos?: string[];
  thumbnails: string[];
  
  // Inventory
  variants: IProductVariant[];
  inventory: {
    trackInventory: boolean;
    totalQuantity: number;
    lowStockThreshold: number;
    allowBackorders: boolean;
  };
  
  // Product details
  features: string[];
  specifications: { [key: string]: string };
  materials?: string[];
  careInstructions?: string[];
  warranty?: {
    duration: string;
    terms: string;
  };
  
  // SEO and marketing
  seo: ISEOData;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  onSale: boolean;
  
  // Shipping
  shipping: IShipping;
  
  // Reviews and ratings
  reviews: IProductReview[];
  rating: {
    average: number;
    count: number;
    distribution: { [star: number]: number };
  };
  
  // Analytics and ML
  analytics: IProductAnalytics;
  embeddings?: number[];
  similarProducts: string[];
  relatedProducts: string[];
  crossSellProducts: string[];
  upsellProducts: string[];
  
  // Recommendations metadata
  targetAudience: string[];
  seasonality: string[];
  occasions: string[];
  styleAttributes: string[];
  
  // Status
  status: 'active' | 'inactive' | 'archived' | 'draft';
  publishedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateAnalytics(event: string, metadata?: any): void;
  calculateAverageRating(): number;
  isInStock(): boolean;
  getVariantBySku(sku: string): IProductVariant | null;
  addReview(review: IProductReview): void;
  generateSimilarProducts(): Promise<string[]>;
}

const productVariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true }
  },
  images: [{ type: String }],
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }
});

const productReviewSchema = new Schema<IProductReview>({
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const productEnhancedSchema = new Schema<IProductEnhanced>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    index: 'text'
  },
  shortDescription: { type: String },
  
  // Product organization
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: { type: String, index: true },
  brand: {
    type: String,
    required: true,
    index: true
  },
  tags: {
    type: [String],
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  compareAtPrice: { type: Number },
  costPrice: { type: Number },
  margin: { type: Number },
  currency: { type: String, default: 'USD' },
  taxable: { type: Boolean, default: true },
  
  // Media
  images: {
    type: [String],
    required: true
  },
  videos: [{ type: String }],
  thumbnails: [{ type: String }],
  
  // Inventory
  variants: [productVariantSchema],
  inventory: {
    trackInventory: { type: Boolean, default: true },
    totalQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    allowBackorders: { type: Boolean, default: false }
  },
  
  // Product details
  features: [{ type: String }],
  specifications: { type: Schema.Types.Mixed, default: {} },
  materials: [{ type: String }],
  careInstructions: [{ type: String }],
  warranty: {
    duration: { type: String },
    terms: { type: String }
  },
  
  // SEO and marketing
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, required: true, unique: true },
    keywords: [{ type: String }],
    canonicalUrl: { type: String }
  },
  featured: { type: Boolean, default: false, index: true },
  trending: { type: Boolean, default: false, index: true },
  newArrival: { type: Boolean, default: false, index: true },
  onSale: { type: Boolean, default: false, index: true },
  
  // Shipping
  shipping: {
    weight: { type: Number, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    shippingClass: { type: String },
    freeShipping: { type: Boolean, default: false },
    domesticShipping: {
      cost: { type: Number, default: 0 },
      estimatedDays: {
        min: { type: Number, default: 3 },
        max: { type: Number, default: 7 }
      }
    },
    internationalShipping: {
      cost: { type: Number },
      estimatedDays: {
        min: { type: Number },
        max: { type: Number }
      },
      restrictions: [{ type: String }]
    }
  },
  
  // Reviews and ratings
  reviews: [productReviewSchema],
  rating: {
    average: { type: Number, default: 0, index: true },
    count: { type: Number, default: 0 },
    distribution: {
      type: Map,
      of: Number,
      default: () => new Map([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]])
    }
  },
  
  // Analytics and ML
  analytics: {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    cartAdditions: { type: Number, default: 0 },
    cartAbandonments: { type: Number, default: 0 },
    dailyViews: { type: Map, of: Number, default: new Map() },
    monthlyRevenue: { type: Map, of: Number, default: new Map() },
    popularWith: [{ type: String }]
  },
  embeddings: [{ type: Number }],
  similarProducts: [{ type: String }],
  relatedProducts: [{ type: String }],
  crossSellProducts: [{ type: String }],
  upsellProducts: [{ type: String }],
  
  // Recommendations metadata
  targetAudience: [{ type: String }],
  seasonality: [{ type: String }],
  occasions: [{ type: String }],
  styleAttributes: [{ type: String }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'draft'],
    default: 'draft',
    index: true
  },
  publishedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productEnhancedSchema.index({ name: 'text', description: 'text', tags: 'text' });
productEnhancedSchema.index({ category: 1, subcategory: 1 });
productEnhancedSchema.index({ brand: 1, price: 1 });
productEnhancedSchema.index({ 'rating.average': -1 });
productEnhancedSchema.index({ featured: 1, status: 1 });
productEnhancedSchema.index({ 'analytics.views': -1 });
productEnhancedSchema.index({ 'analytics.purchases': -1 });

// Virtual fields
productEnhancedSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

productEnhancedSchema.virtual('inStock').get(function() {
  return this.inventory.totalQuantity > 0;
});

// Instance methods
productEnhancedSchema.methods.updateAnalytics = function(event: string, metadata: any = {}): void {
  const today = new Date().toISOString().split('T')[0];
  
  switch (event) {
    case 'view':
      this.analytics.views += 1;
      const currentViews = this.analytics.dailyViews.get(today) || 0;
      this.analytics.dailyViews.set(today, currentViews + 1);
      break;
      
    case 'purchase':
      this.analytics.purchases += 1;
      const month = new Date().toISOString().substring(0, 7);
      const currentRevenue = this.analytics.monthlyRevenue.get(month) || 0;
      this.analytics.monthlyRevenue.set(month, currentRevenue + (metadata.amount || this.price));
      break;
      
    case 'cart_add':
      this.analytics.cartAdditions += 1;
      break;
      
    case 'cart_abandon':
      this.analytics.cartAbandonments += 1;
      break;
      
    case 'wishlist_add':
      this.analytics.wishlistCount += 1;
      break;
  }
  
  // Update conversion rate
  if (this.analytics.views > 0) {
    this.analytics.conversionRate = (this.analytics.purchases / this.analytics.views) * 100;
  }
};

productEnhancedSchema.methods.calculateAverageRating = function(): number {
  if (this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum: number, review: IProductReview) => sum + review.rating, 0);
  const average = totalRating / this.reviews.length;
  
  this.rating.average = Math.round(average * 10) / 10;
  this.rating.count = this.reviews.length;
  
  // Update distribution
  const distribution = new Map([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]);
  this.reviews.forEach((review: IProductReview) => {
    const current = distribution.get(review.rating) || 0;
    distribution.set(review.rating, current + 1);
  });
  this.rating.distribution = distribution;
  
  return this.rating.average;
};

productEnhancedSchema.methods.isInStock = function(): boolean {
  return this.inventory.totalQuantity > 0 || this.inventory.allowBackorders;
};

productEnhancedSchema.methods.getVariantBySku = function(sku: string): IProductVariant | null {
  return this.variants.find((variant: IProductVariant) => variant.sku === sku) || null;
};

productEnhancedSchema.methods.addReview = function(review: IProductReview): void {
  this.reviews.push(review);
  this.calculateAverageRating();
  this.analytics.totalReviews = this.reviews.length;
};

productEnhancedSchema.methods.generateSimilarProducts = async function(): Promise<string[]> {
  // This would integrate with ML service to find similar products
  // For now, return products with similar tags/category
  const similar = await ProductEnhanced.find({
    _id: { $ne: this._id },
    $or: [
      { category: this.category },
      { tags: { $in: this.tags } },
      { brand: this.brand }
    ],
    status: 'active'
  })
  .limit(10)
  .select('_id')
  .lean();
  
  return similar.map(p => p._id.toString());
};

// Pre-save middleware
productEnhancedSchema.pre('save', function(next) {
  // Auto-generate slug if not provided
  if (!this.seo.slug) {
    this.seo.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Update total inventory from variants
  if (this.variants.length > 0) {
    this.inventory.totalQuantity = this.variants.reduce((total, variant) => {
      return total + (variant.inventory.quantity || 0);
    }, 0);
  }
  
  next();
});

export const ProductEnhanced = mongoose.model<IProductEnhanced>('ProductEnhanced', productEnhancedSchema);
