import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  rating: number;
  title?: string;
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'UserEnhanced', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
