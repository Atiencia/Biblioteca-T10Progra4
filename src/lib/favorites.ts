import { connectToDatabase } from './mongo';
import { Favorite } from './models/favorite';
import { Types } from 'mongoose';

export async function addFavorite(userId: string, bookId: string, bookTitle: string) {
  await connectToDatabase();
  return Favorite.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), bookId },
    { $set: { createdAt: new Date(), bookTitle } },
    { upsert: true, new: true }
  );
}

export async function removeFavorite(userId: string, bookId: string) {
  await connectToDatabase();
  return Favorite.deleteOne({ userId: new Types.ObjectId(userId), bookId });
}

export async function isFavorite(userId: string, bookId: string) {
  await connectToDatabase();
  return !!(await Favorite.findOne({ userId: new Types.ObjectId(userId), bookId }));
}

export async function getFavoritesByUser(userId: string) {
  await connectToDatabase();
  return Favorite.find({ userId: new Types.ObjectId(userId) }).lean();
}
