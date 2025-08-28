import React from "react";
import { getReviews, addReview, voteReview } from '@/lib/reviews';
import type { Review } from '@/types';
import { revalidatePath } from 'next/cache'; 

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
// Server action para crear reseña
export async function handleCreateReview(formData: FormData) {
  'use server';
  const bookId = formData.get('bookId') as string;
  const user = formData.get('user') as string;
  const rating = Number(formData.get('rating'));
  const text = formData.get('text') as string;

  if (!user.trim() || !text.trim()) return;

  await addReview(bookId, { user, rating, text, bookId, likes: 0, dislikes: 0 });

  // Forzar actualización de la UI
  revalidatePath(`/book/${bookId}`);
}

// Server action para votar reseña
export async function handleVoteReview(formData: FormData) {
  'use server';
  const bookId = formData.get('bookId') as string;
  const reviewId = formData.get('reviewId') as string;
  const delta = Number(formData.get('delta')) as 1 | -1;

  await voteReview(bookId, reviewId, delta);

  //Refresca la lista de reseñas del libro
  revalidatePath(`/book/${bookId}`);
}

export default async function Reviews({ bookId }: { bookId: string }) {
  const items: Review[] = await getReviews(bookId);
  // Ordenar las reseñas por número de likes (descendente)
  const sortedItems = items.slice().sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Reseñas</h2>

      {/* Formulario */}
      <form
        action={handleCreateReview}
        className="rounded-xl border bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="user"
            placeholder="Tu nombre o alias"
            className="rounded-lg border px-3 py-2"
            required
          />
          <input type="hidden" name="bookId" value={bookId} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Calificación:</span>
            <select
              name="rating"
              defaultValue={5}
              className="rounded-lg border px-2 py-1"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="text"
            placeholder="Escribe tu reseña…"
            className="rounded-lg border px-3 py-2 sm:col-span-2"
            rows={3}
            required
          />
        </div>
        <div className="mt-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Publicar reseña
          </button>
        </div>
      </form>

      {/* Lista */}
      {sortedItems.length === 0 ? (
        <p className="text-slate-600">
          Sé la primera persona en reseñar este libro.
        </p>
      ) : (
        <ul className="space-y-3">
          {sortedItems.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <strong>{r.user}</strong>
                    <span className="text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-amber-500">
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{r.text}</p>
                </div>

                <form
                  action={handleVoteReview}
                  className="flex flex-col items-center gap-1"
                >
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input type="hidden" name="bookId" value={bookId} />
                  <button
                    type="submit"
                    name="delta"
                    value={1}
                    className="rounded-md border px-2 py-1 hover:bg-green-50"
                    aria-label="Like"
                  >
                    👍
                  </button>
                  <span className="w-10 text-center font-semibold text-green-700">
                    {r.likes ?? 0}
                  </span>
                  <button
                    type="submit"
                    name="delta"
                    value={-1}
                    className="rounded-md border px-2 py-1 hover:bg-red-50"
                    aria-label="Dislike"
                  >
                    👎
                  </button>
                  <span className="w-10 text-center font-semibold text-red-700">
                    {r.dislikes ?? 0}
                  </span>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
