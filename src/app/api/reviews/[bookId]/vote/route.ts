import { NextRequest, NextResponse } from 'next/server';
import { voteReview } from '@/lib/reviews';

export async function POST(req: NextRequest, { params }: { params: { bookId: string } }) {
  const body = await req.json();
  const { reviewId, delta } = body ?? {};
  if (!reviewId || ![1, -1].includes(delta)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  const updated = await voteReview(params.bookId, reviewId, delta);
  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(updated);
}
