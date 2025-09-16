import { connectToDatabase } from './mongo';
import { Review } from './models/review';
import { Vote } from './models/vote';
import { Types } from 'mongoose';
import { z } from 'zod';

export async function getReviews(bookId: string) {
  await connectToDatabase();
  return Review.find({ bookId }).sort({ likes: -1, createdAt: -1 }).lean();
}

export async function addReview(bookId: string, input: { userId: string; userName: string; rating: number; text: string; bookTitle: string; }) {
  await connectToDatabase();
  // Validar entrada
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Datos de reseña inválidos');
  }
  const rev = await Review.create({
    bookId,
    bookTitle: input.bookTitle,
    userId: new Types.ObjectId(input.userId),
    userName: input.userName,
    rating: input.rating,
    text: input.text,
    likes: 0,
    dislikes: 0,
  });
  return rev.toObject();
}

export async function voteReview(userId: string, reviewId: string, delta: 1 | -1) {
  await connectToDatabase();
  const rid = new Types.ObjectId(reviewId);
  const uid = new Types.ObjectId(userId);
  const existing = await Vote.findOne({ userId: uid, reviewId: rid });

  if (!existing) {
    await Vote.create({ userId: uid, reviewId: rid, delta });
    if (delta === 1) await Review.findByIdAndUpdate(rid, { $inc: { likes: 1 } });
    else await Review.findByIdAndUpdate(rid, { $inc: { dislikes: 1 } });
  } else if (existing.delta === delta) {
    // ya votó igual -> opcional: permitir "undo"
    return await Review.findById(rid).lean();
  } else {
    // cambiar voto
    await Vote.findByIdAndUpdate(existing._id, { delta });
    if (delta === 1) {
      await Review.findByIdAndUpdate(rid, { $inc: { likes: 1, dislikes: -1 } });
    } else {
      await Review.findByIdAndUpdate(rid, { $inc: { dislikes: 1, likes: -1 } });
    }
  }
  return Review.findById(rid).lean();
}

export async function editReview(reviewId: string, userId: string, update: { text?: string; rating?: number }) {
  await connectToDatabase();
  // Validar entrada
  const parsed = reviewEditSchema.safeParse(update);
  if (!parsed.success) {
    throw new Error('Datos de edición inválidos');
  }
  const r = await Review.findById(reviewId);
  if (!r) throw new Error('Reseña no encontrada');
  if (r.userId.toString() !== userId) throw new Error('No es tu reseña');
  if (update.text !== undefined) r.text = update.text;
  if (update.rating !== undefined) r.rating = update.rating;
  await r.save();
  return r.toObject();
}

// Esquema de validación para reseñas
const reviewInputSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().min(1).max(1000),
});

// Esquema de validación para edición de reseña
const reviewEditSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
});


export async function deleteReview(reviewId: string, userId: string) {
  await connectToDatabase();
  const r = await Review.findById(reviewId);
  if (!r) throw new Error('Reseña no encontrada');
  if (r.userId.toString() !== userId) throw new Error('No es tu reseña');
  await Vote.deleteMany({ reviewId: r._id });
  await Review.deleteOne({ _id: r._id });
  return true;
}

