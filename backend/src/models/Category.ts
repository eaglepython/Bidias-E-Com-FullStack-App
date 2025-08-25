import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parentCategory?: string;
  subcategories: Array<{
    name: string;
    slug: string;
    description?: string;
  }>;
  image?: {
    url: string;
    alt: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  image: {
    url: String,
    alt: String
  },
  seo: {
    title: {
      type: String,
      maxlength: 60,
      default: function() { return this.name; }
    },
    description: {
      type: String,
      maxlength: 160,
      default: function() { return this.description; }
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for full category path
categorySchema.virtual('fullPath').get(function() {
  return this.parentCategory ? `${this.parentCategory}/${this.slug}` : this.slug;
});

// Static methods
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, isActive: true });
};

export const Category = mongoose.model<ICategory>('Category', categorySchema);
