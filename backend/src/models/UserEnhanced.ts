import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface ICartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface IRecentView {
  productId: string;
  viewedAt: Date;
  duration: number;
}

export interface IUserPreferences {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  size?: string;
  color?: string[];
  style?: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    recommendations: boolean;
    priceAlerts: boolean;
    orderUpdates: boolean;
  };
  privacy: {
    shareData: boolean;
    personalizedAds: boolean;
    trackingOptOut: boolean;
  };
}

export interface IBehaviorProfile {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  browsingSessions: number;
  conversionRate: number;
  lastPurchaseDate?: Date;
  purchaseFrequency: 'low' | 'medium' | 'high';
  seasonalTrends: any[];
  devicePreference: 'mobile' | 'desktop' | 'tablet';
  timePreference: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface INotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  recommendations: boolean;
  priceAlerts: boolean;
  orderUpdates: boolean;
  securityAlerts: boolean;
}

export interface IRecommendationProfile {
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  brandAffinity: { [brand: string]: number };
  stylePreferences: string[];
  seasonality: any;
}

export interface IUserEnhanced extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'customer' | 'admin' | 'vendor';
  
  // Address information
  addresses: IAddress[];
  defaultAddressId?: string;
  
  // Preferences and behavior
  preferences: IUserPreferences;
  behaviorProfile: IBehaviorProfile;
  
  // Shopping data
  wishlist: string[]; // Product IDs
  cart: ICartItem[];
  recentViews: IRecentView[];
  searchHistory: string[];
  
  // Account settings
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  marketingOptIn: boolean;
  notificationSettings: INotificationSettings;
  
  // ML/AI data
  embeddings?: number[];
  clusterGroup?: string;
  lifetimeValue?: number;
  churnRisk?: number;
  
  // Security and tracking
  lastLogin?: Date;
  loginAttempts: number;
  accountLocked: boolean;
  lockUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRecommendationProfile(): IRecommendationProfile;
  updateBehaviorProfile(interaction: any): void;
  addToWishlist(productId: string): void;
  removeFromWishlist(productId: string): void;
  addToCart(item: ICartItem): void;
  removeFromCart(productId: string): void;
  updateCartItem(productId: string, quantity: number): void;
  clearCart(): void;
  addRecentView(productId: string, duration: number): void;
  isAccountLocked(): boolean;
}

const addressSchema = new Schema<IAddress>({
  type: { type: String, enum: ['home', 'work', 'other'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  isDefault: { type: Boolean, default: false }
});

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now }
});

const recentViewSchema = new Schema<IRecentView>({
  productId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }
});

const userEnhancedSchema = new Schema<IUserEnhanced>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: { type: String },
  phone: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'vendor'],
    default: 'customer',
  },
  
  // Address information
  addresses: [addressSchema],
  defaultAddressId: { type: String },
  
  // Preferences and behavior
  preferences: {
    categories: [{ type: String }],
    brands: [{ type: String }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },
    size: { type: String },
    color: [{ type: String }],
    style: [{ type: String }],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true }
    },
    privacy: {
      shareData: { type: Boolean, default: true },
      personalizedAds: { type: Boolean, default: true },
      trackingOptOut: { type: Boolean, default: false }
    }
  },
  
  behaviorProfile: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    favoriteCategories: [{ type: String }],
    browsingSessions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date },
    purchaseFrequency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    seasonalTrends: [{ type: Schema.Types.Mixed }],
    devicePreference: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet'],
      default: 'desktop'
    },
    timePreference: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening'
    }
  },
  
  // Shopping data
  wishlist: [{ type: String }],
  cart: [cartItemSchema],
  recentViews: [recentViewSchema],
  searchHistory: [{ type: String }],
  
  // Account settings
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  marketingOptIn: { type: Boolean, default: false },
  notificationSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    recommendations: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true }
  },
  
  // ML/AI data
  embeddings: [{ type: Number }],
  clusterGroup: { type: String },
  lifetimeValue: { type: Number },
  churnRisk: { type: Number },
  
  // Security and tracking
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  accountLocked: { type: Boolean, default: false },
  lockUntil: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  emailVerificationToken: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userEnhancedSchema.index({ email: 1 });
userEnhancedSchema.index({ 'preferences.categories': 1 });
userEnhancedSchema.index({ clusterGroup: 1 });
userEnhancedSchema.index({ lifetimeValue: -1 });
userEnhancedSchema.index({ churnRisk: -1 });

// Pre-save middleware
userEnhancedSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userEnhancedSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userEnhancedSchema.methods.generateRecommendationProfile = function(): IRecommendationProfile {
  return {
    preferredCategories: this.profile.preferences.categories,
    priceRange: this.profile.preferences.priceRange,
    brandAffinity: this.profile.preferences.brands.reduce((acc: any, brand: string) => {
      acc[brand] = 1;
      return acc;
    }, {}),
    stylePreferences: this.profile.preferences.style || [],
    seasonality: this.behaviorProfile.seasonalTrends
  };
};

userEnhancedSchema.methods.updateBehaviorProfile = function(interaction: any): void {
  this.behaviorProfile.browsingSessions += 1;
  
  if (interaction.type === 'purchase') {
    this.behaviorProfile.totalOrders += 1;
    this.behaviorProfile.totalSpent += interaction.amount;
    this.behaviorProfile.averageOrderValue = this.behaviorProfile.totalSpent / this.behaviorProfile.totalOrders;
    this.behaviorProfile.lastPurchaseDate = new Date();
  }
  
  if (interaction.category && !this.behaviorProfile.favoriteCategories.includes(interaction.category)) {
    this.behaviorProfile.favoriteCategories.push(interaction.category);
  }
};

userEnhancedSchema.methods.addToWishlist = function(productId: string): void {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
};

userEnhancedSchema.methods.removeFromWishlist = function(productId: string): void {
  this.wishlist = this.wishlist.filter((id: string) => id !== productId);
};

userEnhancedSchema.methods.addToCart = function(item: ICartItem): void {
  const existingItem = this.cart.find((cartItem: ICartItem) => 
    cartItem.productId === item.productId && cartItem.variantId === item.variantId
  );
  
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    this.cart.push(item);
  }
};

userEnhancedSchema.methods.removeFromCart = function(productId: string): void {
  this.cart = this.cart.filter((item: ICartItem) => item.productId !== productId);
};

userEnhancedSchema.methods.updateCartItem = function(productId: string, quantity: number): void {
  const item = this.cart.find((cartItem: ICartItem) => cartItem.productId === productId);
  if (item) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      item.quantity = quantity;
    }
  }
};

userEnhancedSchema.methods.clearCart = function(): void {
  this.cart = [];
};

userEnhancedSchema.methods.addRecentView = function(productId: string, duration: number): void {
  // Remove existing view of same product
  this.recentViews = this.recentViews.filter((view: IRecentView) => view.productId !== productId);
  
  // Add new view at beginning
  this.recentViews.unshift({
    productId,
    viewedAt: new Date(),
    duration
  });
  
  // Keep only last 50 views
  this.recentViews = this.recentViews.slice(0, 50);
};

userEnhancedSchema.methods.isAccountLocked = function(): boolean {
  return this.accountLocked && this.lockUntil && this.lockUntil > new Date();
};

export const UserEnhanced = mongoose.model<IUserEnhanced>('UserEnhanced', userEnhancedSchema);
