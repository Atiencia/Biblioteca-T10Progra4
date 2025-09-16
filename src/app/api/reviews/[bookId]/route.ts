// app/api/reviews/[bookId]/route.ts
import { NextResponse } from 'next/server';
import { getReviews, addReview } from '@/lib/reviews';
import { getUserFromRequestCookie } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: Request, { params }: { params: { bookId: string } }) {
  const bookId = params.bookId;
  const items = await getReviews(bookId);
  // orden ya aplicado en getReviews pero aseguramos
  items.sort((a, b) => (b.likes - a.likes) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  return NextResponse.json(items);
}

const postSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: { bookId: string } }) {
  const user = await getUserFromRequestCookie() as { _id: string; name?: string; email: string } | null;
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const review = await addReview(params.bookId, {
    userId: String(user._id),
    userName: user.name || user.email,
    rating: parsed.data.rating,
    text: parsed.data.text,
    bookTitle: ''
  });

  return NextResponse.json(review, { status: 201 });
}
