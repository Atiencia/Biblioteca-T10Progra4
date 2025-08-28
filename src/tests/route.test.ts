import { GET as ReviewsGET, POST as ReviewsPOST } from "../app/api/reviews/[bookId]/route";
import { POST as VotePOST } from "../app/api/reviews/[bookId]/vote/route";
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs/promises";



vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

const mockDB = {
  libro1: [
    {
      id: "r1",
      user: "Alice",
      text: "Buen libro",
      rating: 5,
      bookId: "libro1",
      likes: 2,
      dislikes: 0,
      createdAt: new Date("2025-01-01T10:00:00Z").toISOString(),
    },
    {
      id: "r2",
      user: "Bob",
      text: "Interesante",
      rating: 4,
      bookId: "libro1",
      likes: 2,
      dislikes: 0,
      createdAt: new Date("2025-01-02T10:00:00Z").toISOString(),
    },
  ],
};

describe("reviews API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET ordena reviews por likes y luego fecha desc", async () => {
    (fs.readFile as any).mockResolvedValueOnce(JSON.stringify(mockDB));

    const res = await ReviewsGET({} as NextRequest, { params: { bookId: "libro1" } });
    const data = await res.json();

    // tiene misma cantidad de likes pero fecha más reciente → va primero
    expect(data[0].id).toBe("r2");
    expect(data[1].id).toBe("r1");
  });

  it("POST rechaza review con datos inválidos", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ user: "", text: "", rating: 0 }),
    }) as any;

    const res = await ReviewsPOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });

  it("POST crea una reseña válida y devuelve 201", async () => {
  (fs.readFile as any).mockResolvedValueOnce("{}");
  (fs.writeFile as any).mockResolvedValueOnce();

  const req = new NextRequest("http://localhost", {
    method: "POST",
    body: JSON.stringify({ user: "Juan", text: "Muy bueno", rating: 5 }),
  }) as any;

  const res = await ReviewsPOST(req, { params: { bookId: "libroX" } });
  const data = await res.json();

  expect(res.status).toBe(201);
  expect(data.user).toBe("Juan");
  expect(data.rating).toBe(5);
  });

  it("POST rechaza review con rating fuera de rango", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ user: "Kati", text: "No sirve", rating: 99 }),
    }) as any;

    const res = await ReviewsPOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });


  it("VotePOST rechaza si delta inválido", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ reviewId: "r1", delta: 99 }),
    }) as any;

    const res = await VotePOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });
});


