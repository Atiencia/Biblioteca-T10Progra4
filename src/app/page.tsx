import React from "react";
import Link from "next/link";

async function searchBooks(q: string, type: "title" | "author" | "isbn") {
  if (!q) return [];
  let query = q.trim();
  if (type === "isbn") query = `isbn:${query}`;
  else if (type === "author") query = `inauthor:${query}`;

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=20`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.items || [];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; type?: "title" | "author" | "isbn" };
}) {
  const q = searchParams?.q ?? "";
  const type = searchParams?.type ?? "title";
  const results = q ? await searchBooks(q, type) : [];

  return (
    <div className="space-y-6">
      <form className="flex gap-2 items-center">
        <input
          name="q"
          defaultValue={q}
          // placeholder={
          //   type === "title"
          //     ? "Buscar por título (ej: harry potter)"
          //     : type === "author"
          //     ? "Buscar por autor (ej: rowling)"
          //     : "Buscar por ISBN (ej: 9780439708180)"
          // }
          placeholder="Buscar "
          className="flex-1 rounded-lg border px-3 py-2"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border px-2 py-2"
        >
          <option value="title">Título</option>
          <option value="author">Autor</option>
          <option value="isbn">ISBN</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {q && results.length === 0 && (
          <li className="col-span-full text-center text-slate-500 py-8">
            Sin coincidencias
          </li>
        )}
        {results.map((b: any) => {
          const img = b.volumeInfo.imageLinks?.thumbnail;
          return (
            <li key={b.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex gap-4">
                {img ? (
                  <img
                    src={img}
                    alt={b.volumeInfo.title}
                    className="h-28 w-20 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-28 w-20 rounded-md bg-slate-200" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{b.volumeInfo.title}</h3>
                  <p className="text-sm text-slate-600">
                    {b.volumeInfo.authors?.join(", ") ?? "Autor desconocido"}
                  </p>
                  <Link
                    href={`/book/${b.id}`}
                    className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-black"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
