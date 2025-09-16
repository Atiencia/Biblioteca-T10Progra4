import React from "react";
import { revalidatePath } from 'next/cache';
import type { Review } from '@/types';
import { getReviews, addReview, voteReview, editReview, deleteReview } from '@/lib/reviews';
import EditReviewDetails from './EditReviewDetails.client';
// Server action para editar reseña
export async function handleEditReview(formData: FormData) {
  'use server';
  const user = await getUserFromRequestCookie();
  if (!user) return;
  const reviewId = String(formData.get('reviewId'));
  const bookId = String(formData.get('bookId'));
  const text = String(formData.get('text'));
  const rating = Number(formData.get('rating'));
  await editReview(reviewId, String(Array.isArray(user) ? user[0]?._id : user?._id), { text, rating });
  revalidatePath(`/book/${bookId}`);
}

// Server action para eliminar reseña
export async function handleDeleteReview(formData: FormData) {
  'use server';
  const user = await getUserFromRequestCookie();
  if (!user) return;
  const reviewId = String(formData.get('reviewId'));
  const bookId = String(formData.get('bookId'));
  await deleteReview(reviewId, String(Array.isArray(user) ? user[0]?._id : user?._id));
  revalidatePath(`/book/${bookId}`);
}
import { getUserFromRequestCookie } from '@/lib/auth';

// Simple Stars component (puedes moverlo a components)
export function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="text-2xl leading-none">
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

// Server action para crear reseña (usa funciones server-side y cookies)
export async function handleCreateReview(formData: FormData) {
  'use server';
  const user = await getUserFromRequestCookie();
  if (!user) return;
  const bookId = String(formData.get('bookId'));
  const bookTitle = String(formData.get('bookTitle'));
  const userName = (user as any).name || (user as any).email || '';
  const rating = Number(formData.get('rating'));
  const text = String(formData.get('text'));
  if (!text.trim()) return;
  await addReview(bookId, {
    userId: String(Array.isArray(user) ? user[0]?._id : user?._id),
    userName,
    rating,
    text,
    bookTitle
  });
  revalidatePath(`/book/${bookId}`);
}

// Server action para votar reseña (usa funciones server-side y cookies)
export async function handleVoteReview(formData: FormData) {
  'use server';
  const bookId = formData.get('bookId') as string;
  const reviewId = formData.get('reviewId') as string;
  const delta = Number(formData.get('delta')) as 1 | -1;
  const user = await getUserFromRequestCookie();
  if (!user) return;
  const userId = String(Array.isArray(user) ? user[0]?._id : user?._id);
  await voteReview(userId, reviewId, delta);
  revalidatePath(`/book/${bookId}`);
}

export default async function Reviews({ bookId, bookTitle }: { bookId: string, bookTitle: string }) {
  const rawItems = await getReviews(bookId);
  const items: Review[] = rawItems.map((r: any) => ({
    id: r._id?.toString?.() ?? r.id ?? '',
    bookId: r.bookId ?? '',
    userId: r.userId?.toString?.() ?? '',
    userName: r.userName ?? '',
    rating: r.rating ?? 0,
    text: r.text ?? '',
    createdAt: r.createdAt ?? '',
    likes: r.likes ?? 0,
    dislikes: r.dislikes ?? 0,
  }));

  const user = await getUserFromRequestCookie();
  const isLoggedIn = !!user;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Reseñas</h2>

      {!isLoggedIn && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Debes loguearte para poder realizar cualquier acción.
        </div>
      )}

      <form action={handleCreateReview} className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="bookId" value={bookId} />
          <input type="hidden" name="bookTitle" value={bookTitle} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Calificación:</span>
            <select name="rating" defaultValue={5} className="rounded-lg border px-2 py-1" disabled={!isLoggedIn}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <textarea name="text" placeholder="Escribe tu reseña…" className="rounded-lg border px-3 py-2 sm:col-span-2" rows={3} required disabled={!isLoggedIn} />
        </div>
        <div className="mt-3">
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" disabled={!isLoggedIn}>Publicar reseña</button>
        </div>
      </form>

      {items.length === 0 ? <p className="text-slate-600">Sé la primera persona en reseñar este libro.</p> : (
        <ul className="space-y-3">
          {items.map(r => {
            const currentUserId = isLoggedIn ? String(Array.isArray(user) ? user[0]?._id : user?._id) : '';
            const reviewUserId = r.userId;
            const isOwner = isLoggedIn && (reviewUserId === currentUserId);
            return (
              <li key={r._id || r.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong>{r.userName}</strong>
                      <span className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-amber-500"><Stars value={r.rating} /></div>
                    <p className="mt-1 whitespace-pre-wrap">{r.text}</p>
                    {isOwner && (
                      <div className="flex gap-2 mt-2">
                        {/* Editar reseña */}
                        <EditReviewDetails handleEditReview={handleEditReview} review={r} bookId={bookId} />
                        {/* Eliminar reseña */}
                        <form action={handleDeleteReview} style={{ display: "inline" }}>
                          <input type="hidden" name="reviewId" value={r._id || r.id} />
                          <input type="hidden" name="bookId" value={bookId} />
                          <button type="submit" className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700">Eliminar</button>
                        </form>
                      </div>
                    )}
                  </div>
                  <form action={handleVoteReview} className="flex flex-col items-center gap-1">
                    <input type="hidden" name="reviewId" value={r._id || r.id} />
                    <input type="hidden" name="bookId" value={bookId} />
                    <button type="submit" name="delta" value={1} className="rounded-md border px-2 py-1 hover:bg-green-50" aria-label="Like" disabled={!isLoggedIn}>👍</button>
                    <span className="w-10 text-center font-semibold text-green-700">{r.likes ?? 0}</span>
                    <button type="submit" name="delta" value={-1} className="rounded-md border px-2 py-1 hover:bg-red-50" aria-label="Dislike" disabled={!isLoggedIn}>👎</button>
                    <span className="w-10 text-center font-semibold text-red-700">{r.dislikes ?? 0}</span>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
