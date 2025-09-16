import { Schema, model, models, Types } from 'mongoose';


export interface IFavorite {
  userId: Types.ObjectId;
  bookId: string;
  bookTitle: string;
  createdAt: Date;
}


const FavoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

FavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const Favorite = models.Favorite || model<IFavorite>('Favorite', FavoriteSchema);
