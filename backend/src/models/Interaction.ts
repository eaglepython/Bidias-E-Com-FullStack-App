import mongoose, { Document, Schema } from 'mongoose';

export interface IInteraction extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  sessionId: string;
  type: 'view' | 'click' | 'purchase' | 'cart_add' | 'cart_remove' | 'wishlist_add' | 'wishlist_remove' | 'search' | 'filter' | 'chat' | 'recommendation_click';
  product?: mongoose.Types.ObjectId;
  category?: string;
  searchQuery?: string;
  filters?: Map<string, any>;
  chatMessage?: {
    message: string;
    intent: string;
    response: string;
    satisfaction?: number;
  };
  recommendation?: {
    algorithm: string;
    position: number;
    clicked: boolean;
  };
  metadata: {
    page: string;
    referrer?: string;
    userAgent: string;
    device: 'mobile' | 'tablet' | 'desktop';
    location?: {
      country: string;
      city: string;
    };
    timestamp: Date;
    duration?: number;
  };
  aiContext: {
    userVector?: number[];
    itemVector?: number[];
    contextFeatures?: Map<string, any>;
    prediction?: number;
  };
  createdAt: Date;
}

const interactionSchema = new Schema<IInteraction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['view', 'click', 'purchase', 'cart_add', 'cart_remove', 'wishlist_add', 'wishlist_remove', 'search', 'filter', 'chat', 'recommendation_click'],
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  category: String,
  searchQuery: String,
  filters: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  chatMessage: {
    message: String,
    intent: String,
    response: String,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  recommendation: {
    algorithm: String,
    position: Number,
    clicked: {
      type: Boolean,
      default: false,
    },
  },
  metadata: {
    page: {
      type: String,
      required: true,
    },
    referrer: String,
    userAgent: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      required: true,
    },
    location: {
      country: String,
      city: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
  },
  aiContext: {
    userVector: [Number],
    itemVector: [Number],
    contextFeatures: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    prediction: Number,
  },
}, {
  timestamps: true,
});

// Indexes for analytics and ML
interactionSchema.index({ user: 1, createdAt: -1 });
interactionSchema.index({ sessionId: 1 });
interactionSchema.index({ type: 1, createdAt: -1 });
interactionSchema.index({ product: 1, type: 1 });
interactionSchema.index({ createdAt: -1 });
interactionSchema.index({ 'metadata.device': 1 });

export const Interaction = mongoose.model<IInteraction>('Interaction', interactionSchema);
