// app/api/reviews/[bookId]/[reviewId]/route.ts
import { NextResponse } from 'next/server';
import { getUserFromRequestCookie } from '@/lib/auth';
import { editReview, deleteReview } from '@/lib/reviews';
import { z } from 'zod';

export async function PATCH(req: Request) {
  const user = await getUserFromRequestCookie() as { _id: string } | null;
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json();
  const schema = z.object({ text: z.string().optional(), rating: z.number().min(1).max(5).optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  // Extraer reviewId de la URL
  const url = new URL(req.url);
  const paths = url.pathname.split('/');
  const reviewId = paths[paths.length - 1];

  try {
    const updated = await editReview(reviewId, String(user._id), parsed.data);
    if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'message' in e && (e as { message?: string }).message === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw e;
  }
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequestCookie() as { _id: string } | null;
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Extraer reviewId de la URL
  const url = new URL(req.url);
  const paths = url.pathname.split('/');
  const reviewId = paths[paths.length - 1];

  try {
    const ok = await deleteReview(reviewId, String(user._id));
    if (!ok) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'message' in e && (e as { message?: string }).message === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw e;
  }
}
