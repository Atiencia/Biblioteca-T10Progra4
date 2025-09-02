import { describe, it, expect, vi, beforeEach } from "vitest";

import * as reviews from "../lib/reviews";
import { db } from "../lib/reviews";


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
    // Reiniciar el estado del db en memoria
    for (const key in db) {
      delete db[key];
    }
  });

  it("getReviews devuelve lista vacía si no hay reseñas", async () => {
    const result = await reviews.getReviews("bookX");
    expect(result).toEqual([]);
  });

  it("getReviews devuelve reseñas de un libro", async () => {
    Object.assign(db, JSON.parse(JSON.stringify(mockDB)));
    const result = await reviews.getReviews("libro1");
    expect(result).toHaveLength(2);
    expect(result[0].user).toBe("Alice");
  });

  it("addReview agrega una reseña nueva", async () => {
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
  });

  it("voteReview aumenta likes correctamente", async () => {
    Object.assign(db, JSON.parse(JSON.stringify(mockDB)));
    const updated = await reviews.voteReview("libro1", "r1", 1);
    expect(updated?.likes).toBe(3);
  });

  it("voteReview aumenta dislikes correctamente", async () => {
    Object.assign(db, JSON.parse(JSON.stringify(mockDB)));
    const updated = await reviews.voteReview("libro1", "r1", -1);
    expect(updated?.dislikes).toBe(1);
  });

  it("voteReview devuelve null si no encuentra reseña", async () => {
    const result = await reviews.voteReview("bookX", "fakeId", 1);
    expect(result).toBeNull();
  });

  it("voteReview acumula likes en llamadas sucesivas", async () => {
    Object.assign(db, JSON.parse(JSON.stringify(mockDB)));
    const first = await reviews.voteReview("libro1", "r1", 1);
    expect(first?.likes).toBe(3);
    // Simular segunda llamada
    const second = await reviews.voteReview("libro1", "r1", 1);
    expect(second?.likes).toBe(4);
  });
})
