import React from "react";
import Image from "next/image";
import type { GoogleBook } from "../../../types";
import Reviews from "../[id]/reviews";

// Función para obtener el libro
async function getBook(id: string): Promise<GoogleBook | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// Definición correcta de props para Next.js 13.4+
interface BookPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookPage(props: BookPageProps) {
  // Desestructurar la promise de params
  const { id } = await props.params;
  
  const book = await getBook(id);

  if (!book) {
    return <div className="py-6">Libro no encontrado.</div>;
  }

  const info = book.volumeInfo;
  const cover = info.imageLinks?.thumbnail;

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {cover ? (
          <Image
            className="h-56 w-40 rounded-md object-cover"
            src={cover}
            alt={info.title}
            width={160}
            height={224}
          />
        ) : (
          <div className="h-56 w-40 rounded-md bg-slate-200" />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{info.title}</h1>
          <p className="text-slate-700">
            {info.authors?.join(", ") ?? "Autor desconocido"}
          </p>
          <p className="text-sm text-slate-600">
            {info.publisher ? `${info.publisher} • ` : ""}
            {info.publishedDate ?? ""}
            {info.pageCount ? ` • ${info.pageCount} páginas` : ""}
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