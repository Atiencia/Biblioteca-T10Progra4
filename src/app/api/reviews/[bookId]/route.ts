
import { NextRequest, NextResponse } from 'next/server';
import { addReview, getReviews } from '@/lib/reviews';

export async function GET(req: NextRequest) {
  let bookId = '';
  if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      bookId = url.pathname.split('/').pop() ?? '';
    } catch {
      bookId = '';
    }
  }
  const items = await getReviews(bookId);
  // orden por likes desc, luego fecha desc
  items.sort((a, b) => (b.likes - a.likes) || (b.createdAt.localeCompare(a.createdAt)));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const bookId = url.pathname.split('/').pop();
  const body = await req.json();
  const { user, rating, text } = body ?? {};
  if (!user || !text || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const review = await addReview(bookId ?? '', { user, rating, text, bookId: bookId ?? '', likes: 0, dislikes: 0 });
  return NextResponse.json(review, { status: 201 });
}
