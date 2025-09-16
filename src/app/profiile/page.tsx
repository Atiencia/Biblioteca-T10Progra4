import React from "react";
import { getUserFromRequestCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongo";
import { Review } from "@/lib/models/review";
import { Favorite } from "@/lib/models/favorite";


type User = {
  _id: string;
  email: string;
  name?: string;
};


type ReviewType = {
  _id: string;
  bookId: string;
  bookTitle?: string;
  text: string;
};

type FavoriteType = {
  _id: string;
  bookId: string;
  bookTitle?: string;
};


export default async function ProfilePage() {
  const user = (await getUserFromRequestCookie()) as User | null;
  if (!user) {
    return <div className="py-6">No estás autenticado.</div>;
  }

  await connectToDatabase();
  const reviews = (await Review.find({ userId: user._id }).sort({ createdAt: -1 }).lean()) as unknown as ReviewType[];
  const favorites = (await Favorite.find({ userId: user._id }).lean()) as unknown as FavoriteType[];
  // No mezclar títulos entre favoritos y reseñas: cada uno muestra su propio bookTitle

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 text-center">Perfil</h1>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-700 font-medium">Email:</p>
            <p className="text-lg mb-2">{user.email}</p>
            <p className="text-gray-700 font-medium">Nombre:</p>
            <p className="text-lg">{user.name ?? '-'}</p>
          </div>
        </div>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Tus reseñas</h2>
          {(!reviews || reviews.length === 0) ? <p className="text-gray-500">No has escrito reseñas aún.</p> : (
            <ul className="space-y-2">
              {reviews.map((r) => (
                <li key={r._id} className="border p-3 rounded bg-gray-50">
                  <span className="font-semibold text-blue-700">{r.bookTitle ? r.bookTitle : r.bookId}</span>
                  <span className="mx-2 text-gray-400">--- texto:</span>
                  <span className="text-gray-700">{r.text?.slice(0,120) ?? ''}{r.text && r.text.length > 120 ? '...' : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Favoritos</h2>
          {(!favorites || favorites.length === 0) ? <p className="text-gray-500">No tienes favoritos.</p> : (
            <ul className="space-y-2">
              {favorites.map((f) => (
                <li key={f._id} className="border p-3 rounded bg-gray-50">
                  <span className="font-semibold text-blue-700">{f.bookTitle ?? f.bookId}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
