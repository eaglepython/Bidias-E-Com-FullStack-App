import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'admin' | 'vendor';
  googleId?: string;
  facebookId?: string;
  authProvider?: 'local' | 'google' | 'facebook';
  avatar?: string;
  emailVerified?: boolean;
  profile: {
    avatar?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    preferences: {
      categories: string[];
      brands: string[];
      priceRange: {
        min: number;
        max: number;
      };
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
    };
  };
  addresses: Array<{
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  wishlist: string[];
  recentViews: Array<{
    productId: string;
    viewedAt: Date;
  }>;
  searchHistory: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId && !this.facebookId; // Password not required for OAuth users
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'vendor'],
    default: 'customer'
  },
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null
    },
    preferences: {
      categories: [{
        type: String
      }],
      brands: [{
        type: String
      }],
      priceRange: {
        min: {
          type: Number,
          default: 0
        },
        max: {
          type: Number,
          default: 1000
        }
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        },
        push: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'US'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: String
  }],
  recentViews: [{
    productId: {
      type: String,
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  searchHistory: [{
    type: String
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.preferences.categories': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing for OAuth users without password
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);