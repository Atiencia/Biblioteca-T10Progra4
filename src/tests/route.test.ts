// Mock de getUserFromRequestCookie para simular usuario autenticado
vi.mock("../lib/auth", () => ({
  getUserFromRequestCookie: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", name: "Test User", email: "test@example.com" })
}));
// Mock de next/headers para evitar error de cookies fuera de contexto
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn().mockReturnValue({ value: "testtoken" })
  })
}));
vi.mock("../lib/mongo", () => ({ connectToDatabase: vi.fn() }));
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES_IN = '1h';
import { GET as ReviewsGET, POST as ReviewsPOST } from "../app/api/reviews/[bookId]/route";
import { POST as VotePOST } from "../app/api/reviews/[bookId]/vote/route";
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";
import fs from "fs/promises";






vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

vi.mock("../lib/models/review", () => ({
  Review: {
    find: vi.fn(),
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    create: vi.fn(),
  },
}));


const mockReviews = [
  {
    _id: "r1",
    user: "Alice",
    text: "Buen libro",
    rating: 5,
    bookId: "libro1",
    likes: 2,
    dislikes: 0,
    createdAt: new Date("2025-01-01T10:00:00Z").toISOString(),
  },
  {
    _id: "r2",
    user: "Bob",
    text: "Interesante",
    rating: 4,
    bookId: "libro1",
    likes: 2,
    dislikes: 0,
    createdAt: new Date("2025-01-02T10:00:00Z").toISOString(),
  },
];



describe("reviews API routes", () => {
  let Review: any;
  beforeEach(async () => {
    vi.clearAllMocks();
    Review = (await import("../lib/models/review")).Review;
  });

  it("GET ordena reviews por likes y luego fecha desc", async () => {
    // Mock de find/sort/lean para devolver mockReviews
    Review.find.mockReturnValueOnce({
      sort: () => ({
        lean: () => mockReviews,
      }),
    });
    const req = new NextRequest("http://localhost/api/reviews/libro1", { method: "GET" });
    const res = await ReviewsGET(req, { params: { bookId: "libro1" } });
    const data = await res.json();
    // tiene misma cantidad de likes pero fecha más reciente → va primero
    expect(data[0]._id).toBe("r2");
    expect(data[1]._id).toBe("r1");
  });

  it("POST rechaza review con datos inválidos", async () => {
    const req = new NextRequest("http://localhost/api/reviews/libro1", {
      method: "POST",
      body: JSON.stringify({ user: "", text: "", rating: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await ReviewsPOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });

  it("POST crea una reseña válida y devuelve 201", async () => {
    Review.create.mockResolvedValueOnce({
      _id: "r3",
      user: "Juan",
      text: "Muy bueno",
      rating: 5,
      bookId: "libroX",
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
      toObject: function() {
        return {
          _id: this._id,
          user: this.user,
          text: this.text,
          rating: this.rating,
          bookId: this.bookId,
          likes: this.likes,
          dislikes: this.dislikes,
          createdAt: this.createdAt,
        };
      }
    });
    const req = new NextRequest("http://localhost/api/reviews/libroX", {
      method: "POST",
      body: JSON.stringify({ user: "Juan", text: "Muy bueno", rating: 5 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await ReviewsPOST(req, { params: { bookId: "libroX" } });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.user).toBe("Juan");
    expect(data.rating).toBe(5);
  });

  it("POST rechaza review con rating fuera de rango", async () => {
    const req = new NextRequest("http://localhost/api/reviews/libro1", {
      method: "POST",
      body: JSON.stringify({ user: "Kati", text: "No sirve", rating: 99 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await ReviewsPOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });

  it("VotePOST rechaza si delta inválido", async () => {
    const req = new NextRequest("http://localhost/api/reviews/libro1/vote", {
      method: "POST",
      body: JSON.stringify({ reviewId: "r1", delta: 99 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await VotePOST(req, { params: { bookId: "libro1" } });
    expect(res.status).toBe(400);
  });
});


