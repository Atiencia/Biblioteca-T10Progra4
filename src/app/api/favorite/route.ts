import { NextResponse } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";
import { addFavorite, removeFavorite } from "@/lib/favorites";

export async function POST(req: Request) {
  const user = await getUserFromRequestCookie();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = Array.isArray(user) ? String(user[0]?._id) : String(user._id);
  if (!userId || userId === "undefined") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { bookId, bookTitle, action } = await req.json();
  if (!bookId || !action) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  if (action === "add") {
    await addFavorite(userId, bookId, bookTitle);
    return NextResponse.json({ ok: true });
  } else if (action === "remove") {
    await removeFavorite(userId, bookId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
