import { NextRequest, NextResponse } from 'next/server';
import { addReview, getReviews } from '@/lib/reviews';

export async function GET(_: NextRequest, { params }: { params: { bookId: string } }) {
  const items = await getReviews(params.bookId);
  // orden por likes desc, luego fecha desc
  items.sort((a, b) => (b.likes - a.likes) || (b.createdAt.localeCompare(a.createdAt)));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: { bookId: string } }) {
  const body = await req.json();
  const { user, rating, text } = body ?? {};
  if (!user || !text || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const review = await addReview(params.bookId, { user, rating, text, bookId: params.bookId, likes: 0, dislikes: 0 });
  return NextResponse.json(review, { status: 201 });
}
