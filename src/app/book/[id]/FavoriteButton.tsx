"use client";
import React, { useState, useTransition } from "react";

interface FavoriteButtonProps {
  bookId: string;
  initialFavorite: boolean;
  bookTitle: string;
}

export default function FavoriteButton({ bookId, initialFavorite, bookTitle }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  async function handleToggle() {
    startTransition(async () => {
      const res = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, bookTitle, action: favorite ? "remove" : "add" }),
      });
      if (res.ok) {
        setFavorite((prev) => !prev);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={
        favorite
          ? "rounded-lg bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
          : "rounded-lg bg-gray-300 px-3 py-1 text-black hover:bg-yellow-400"
      }
    >
      {favorite ? "★ Quitar de favoritos" : "☆ Añadir a favoritos"}
    </button>
  );
}
