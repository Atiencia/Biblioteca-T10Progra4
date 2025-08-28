import React from "react";
import type { GoogleBook } from '../../../types';
import Reviews from '../[id]/reviews';

async function getBook(id: string): Promise<GoogleBook | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  if (!book) return <div className="py-6">Libro no encontrado.</div>;

  const info = book.volumeInfo;
  const cover = info.imageLinks?.thumbnail;

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {cover ? (
          <img className="h-56 w-40 rounded-md object-cover" src={cover} alt={info.title} />
        ) : (
          <div className="h-56 w-40 rounded-md bg-slate-200" />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{info.title}</h1>
          <p className="text-slate-700">{info.authors?.join(', ') ?? 'Autor desconocido'}</p>
          <p className="text-sm text-slate-600">
            {info.publisher ? `${info.publisher} • ` : ''}{info.publishedDate ?? ''}
            {info.pageCount ? ` • ${info.pageCount} páginas` : ''}
          </p>
          <div className="prose max-w-none">
            {info.description ? (
              <div dangerouslySetInnerHTML={{ __html: info.description }} />
            ) : (
              <p>Sin descripción.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <Reviews bookId={book.id} />
    </div>
  );
}
