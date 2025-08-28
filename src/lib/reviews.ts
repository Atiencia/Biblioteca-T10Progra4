import fs from 'fs/promises';
import path from 'path';
import { Review } from '../types';

const file = path.join(process.cwd(), 'src', 'data', 'reviews.json');

type DB = Record<string, Review[]>; // key: bookId

async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

async function writeDB(db: DB) {
  await fs.writeFile(file, JSON.stringify(db, null, 2), 'utf-8');
}

export async function getReviews(bookId: string): Promise<Review[]> {
  const db = await readDB();
  return db[bookId] ?? [];
}

export async function addReview(bookId: string, input: Omit<Review, 'id' | 'votes' | 'createdAt'>): Promise<Review> {
  const db = await readDB();
  const newReview: Review = {
    ...input,
    id: crypto.randomUUID(),
    likes: 0,
    dislikes: 0,
    createdAt: new Date().toISOString(),
  };
  db[bookId] = db[bookId] ? [newReview, ...db[bookId]] : [newReview];
  await writeDB(db);
  return newReview;
}

export async function voteReview(bookId: string, reviewId: string, delta: 1 | -1): Promise<Review | null> {
  const db = await readDB();
  const list = db[bookId] ?? [];
  const idx = list.findIndex((r) => r.id === reviewId);
  if (idx === -1) return null;
  if (delta === 1) {
    list[idx] = { ...list[idx], likes: (list[idx].likes ?? 0) + 1 };
  } else {
    list[idx] = { ...list[idx], dislikes: (list[idx].dislikes ?? 0) + 1 };
  }
  db[bookId] = list;
  await writeDB(db);
  return list[idx];
}
