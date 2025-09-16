// app/api/reviews/[bookId]/vote/route.ts
import { NextResponse } from 'next/server';
import { voteReview } from '@/lib/reviews';
import { getUserFromRequestCookie } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ reviewId: z.string(), delta: z.number().refine(n => n === 1 || n === -1) });

export async function POST(req: Request, p0: { params: { bookId: string; }; }) {
  const user = await getUserFromRequestCookie() as { _id: string } | null;
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const updated = await voteReview(String(user._id), parsed.data.reviewId, parsed.data.delta as 1 | -1);
  if (!updated) return NextResponse.json({ error: 'No encontrado o operación no permitida' }, { status: 404 });
  return NextResponse.json(updated);
}
