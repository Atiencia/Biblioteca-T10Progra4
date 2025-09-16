import mongoose, { Schema, model, models, Types } from 'mongoose';

export interface IReview {
  bookId: string;
  bookTitle: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;      
  text: string;
  likes: number;
  dislikes: number;
  createdAt: Date;  
}

const reviewSchema = new Schema<IReview>({
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Review = models.Review || model<IReview>('Review', reviewSchema);