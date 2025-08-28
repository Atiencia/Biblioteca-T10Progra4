import { describe, it, expect, vi, beforeEach } from "vitest";
import * as reviews from "../lib/reviews";
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

describe("reviews lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- getReviews ----
  it("getReviews devuelve lista vacía si no hay reseñas", async () => {
    (fs.readFile as any).mockRejectedValueOnce(new Error("no file"));
    const result = await reviews.getReviews("bookX");
    expect(result).toEqual([]);
  });

  it("getReviews devuelve reseñas de un libro", async () => {
    (fs.readFile as any).mockResolvedValueOnce(JSON.stringify(mockDB));
    const result = await reviews.getReviews("libro1");
    expect(result).toHaveLength(2);
    expect(result[0].user).toBe("Alice");
  });

  // ---- addReview ----
  it("addReview agrega una reseña nueva", async () => {
    (fs.readFile as any).mockResolvedValueOnce("{}"); // base vacía
    (fs.writeFile as any).mockResolvedValueOnce();

    const review = await reviews.addReview("libro2", {
      user: "Bob",
      rating: 4,
      text: "Interesante",
      bookId: "libro2",
      likes: 0,
      dislikes: 0,
    });

    expect(review.id).toBeDefined();
    expect(review.user).toBe("Bob");
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it("addReview lanza error si writeFile falla", async () => {
    (fs.readFile as any).mockResolvedValueOnce("{}");
    (fs.writeFile as any).mockRejectedValueOnce(new Error("disk full"));

    await expect(
      reviews.addReview("libro2", {
        user: "FailUser",
        rating: 3,
        text: "No se guarda",
        bookId: "libro2",
        likes: 0,
        dislikes: 0,
      })
    ).rejects.toThrow("disk full");
  });




  // ---- voteReview ----
  it("voteReview aumenta likes correctamente", async () => {
    (fs.readFile as any).mockResolvedValueOnce(JSON.stringify(mockDB));
    (fs.writeFile as any).mockResolvedValueOnce();

    const updated = await reviews.voteReview("libro1", "r1", 1);
    expect(updated?.likes).toBe(3);
  });

  it("voteReview aumenta dislikes correctamente", async () => {
    (fs.readFile as any).mockResolvedValueOnce(JSON.stringify(mockDB));
    (fs.writeFile as any).mockResolvedValueOnce();

    const updated = await reviews.voteReview("libro1", "r1", -1);
    expect(updated?.dislikes).toBe(1);
  });

  it("voteReview devuelve null si no encuentra reseña", async () => {
    (fs.readFile as any).mockResolvedValueOnce("{}");
    const result = await reviews.voteReview("bookX", "fakeId", 1);
    expect(result).toBeNull();
  });
});

  it("voteReview acumula likes en llamadas sucesivas", async () => {
    (fs.readFile as any).mockResolvedValue(JSON.stringify(mockDB));
    (fs.writeFile as any).mockResolvedValue();

    const first = await reviews.voteReview("libro1", "r1", 1);
    expect(first?.likes).toBe(3);

    // simulamos segunda lectura con valor actualizado
    const newDB = { ...mockDB, libro1: [{ ...mockDB.libro1[0], likes: 3 }] };
    (fs.readFile as any).mockResolvedValueOnce(JSON.stringify(newDB));

    const second = await reviews.voteReview("libro1", "r1", 1);
    expect(second?.likes).toBe(4);
  });




