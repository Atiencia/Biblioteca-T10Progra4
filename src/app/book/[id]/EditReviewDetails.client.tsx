"use client";
import React, { useRef } from "react";

import type { Review } from '@/types';
export default function EditReviewDetails({ handleEditReview, review, bookId }: {
  handleEditReview: (formData: FormData) => void,
  review: Review,
  bookId: string
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={detailsRef}>
      <summary className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">Editar</summary>
      <form
        action={async (formData) => {
          await handleEditReview(formData);
          // Cierra tras guardar
          if (detailsRef.current) detailsRef.current.open = false;
        }}
        className="mt-2 flex flex-col gap-2"
      >
        <input type="hidden" name="reviewId" value={review._id || review.id} />
        <input type="hidden" name="bookId" value={bookId} />
        <textarea name="text" defaultValue={review.text} className="rounded-lg border px-3 py-2" rows={2} required />
        <select name="rating" defaultValue={review.rating} className="rounded-lg border px-2 py-1">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">Guardar</button>
      </form>
    </details>
  );
}
