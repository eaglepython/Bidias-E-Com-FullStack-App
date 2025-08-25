import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  brand: string;
  category: string;
  subcategory: string;
  tags: string[];
  sku: string;
  price: {
    original: number;
    current: number;
    currency: string;
  };
  inventory: {
    stock: number;
    lowStockThreshold: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  specifications: Map<string, any>;
  features: string[];
  dimensions: {
    weight: number;
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  ratings: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  reviews: mongoose.Types.ObjectId[];
  variants: Array<{
    name: string;
    options: string[];
    priceModifier: number;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  vendor: mongoose.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    freeShipping: boolean;
    shippingClass: string;
  };
  aiMetadata: {
    similarProducts: mongoose.Types.ObjectId[];
    recommendations: mongoose.Types.ObjectId[];
    searchKeywords: string[];
    visualFeatures: number[];
    categoryPrediction: number;
  };
  analytics: {
    views: number;
    clicks: number;
    purchases: number;
    wishlistAdds: number;
    cartAdds: number;
    conversionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 500,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  tags: [String],
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  price: {
    original: {
      type: Number,
      required: true,
      min: 0,
    },
    current: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  inventory: {
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
      default: 'in_stock',
    },
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  specifications: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  features: [String],
  dimensions: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm',
    },
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review',
  }],
  variants: [{
    name: String,
    options: [String],
    priceModifier: {
      type: Number,
      default: 0,
    },
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
    },
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isDigital: {
    type: Boolean,
    default: false,
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingClass: {
      type: String,
      default: 'standard',
    },
  },
  aiMetadata: {
    similarProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    recommendations: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    searchKeywords: [String],
    visualFeatures: [Number],
    categoryPrediction: Number,
  },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    cartAdds: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'price.current': 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'seo.slug': 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
