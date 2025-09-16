import React from "react";
import Image from "next/image";
import Reviews from "./reviews";
import { isFavorite } from "@/lib/favorites";
import { getUserFromRequestCookie } from "@/lib/auth";
import FavoriteButton from "./FavoriteButton";
import type { GoogleBook } from "../../../types";

async function getBook(id: string): Promise<GoogleBook | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// 👇 así en lugar de definir una interfaz externa
export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const book = await getBook(id);

  if (!book) {
    return <div className="py-6">Libro no encontrado.</div>;
  }

  const info = book.volumeInfo;
  const cover = info.imageLinks?.thumbnail;

  // Favoritos
  const user = await getUserFromRequestCookie();
  let userId = "";
  let favorite = false;
  if (user) {
    userId = Array.isArray(user) ? String(user[0]?._id) : String(user._id);
    if (userId && userId !== "undefined") {
      favorite = await isFavorite(userId, book.id);
    }
  }

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
          {/* Botón favoritos */}
          {user && (
            <FavoriteButton
              bookId={book.id}
              initialFavorite={favorite}
              bookTitle={info.title}
            />
          )}
        </div>
      </div>
      <Reviews bookId={book.id} bookTitle={info.title} />
    </div>
  );
}
