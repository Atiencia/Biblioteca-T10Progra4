
import { Review } from '../types';

type DB = Record<string, Review[]>; // key: bookId
// Base de datos en memoria
export const db: DB = {};

export async function getReviews(bookId: string): Promise<Review[]> {
  return db[bookId] ?? [];
}

export async function addReview(bookId: string, input: Omit<Review, 'id' | 'votes' | 'createdAt'>): Promise<Review> {
  const newReview: Review = {
    ...input,
    id: crypto.randomUUID(),
    likes: 0,
    dislikes: 0,
    createdAt: new Date().toISOString(),
  };
  db[bookId] = db[bookId] ? [newReview, ...db[bookId]] : [newReview];
  return newReview;
}

export async function voteReview(bookId: string, reviewId: string, delta: 1 | -1): Promise<Review | null> {
  const list = db[bookId] ?? [];
  const idx = list.findIndex((r) => r.id === reviewId);
  if (idx === -1) return null;
  if (delta === 1) {
    list[idx] = { ...list[idx], likes: (list[idx].likes ?? 0) + 1 };
  } else {
    list[idx] = { ...list[idx], dislikes: (list[idx].dislikes ?? 0) + 1 };
  }
  db[bookId] = list;
  return list[idx];
}
