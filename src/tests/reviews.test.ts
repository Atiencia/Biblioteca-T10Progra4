
vi.mock("../lib/mongo", () => ({ connectToDatabase: vi.fn() }));
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as reviews from "../lib/reviews";
vi.mock("../lib/models/review", () => ({
  Review: {
    find: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
  },
}));
vi.mock("../lib/models/vote", () => ({
  Vote: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
import { Review } from "../lib/models/review";
import { Vote } from "../lib/models/vote";

const validUserId = "507f1f77bcf86cd799439011";
const validReviewId1 = "507f1f77bcf86cd799439012";
const validReviewId2 = "507f1f77bcf86cd799439013";
const mockReviews = [
  {
    _id: validReviewId1,
    user: "Alice",
    text: "Buen libro",
    rating: 5,
    bookId: "libro1",
    likes: 2,
    dislikes: 0,
    createdAt: new Date("2025-01-01T10:00:00Z").toISOString(),
  },
  {
    _id: validReviewId2,
    user: "Bob",
    text: "Interesante",
    rating: 4,
    bookId: "libro1",
    likes: 2,
    dislikes: 0,
    createdAt: new Date("2025-01-02T10:00:00Z").toISOString(),
  },
];

describe("reviews lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReviews devuelve lista vacía si no hay reseñas", async () => {
    (Review.find as any).mockReturnValueOnce({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValueOnce([])
      })
    });
    const result = await reviews.getReviews("bookX");
    expect(result).toEqual([]);
  });

  it("getReviews devuelve reseñas de un libro", async () => {
    (Review.find as any).mockReturnValueOnce({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValueOnce(mockReviews)
      })
    });
    const result = await reviews.getReviews("libro1");
    expect(result).toHaveLength(2);
    expect(result[0].user).toBe("Alice");
  });

  it("addReview agrega una reseña nueva", async () => {
    const mockReview = {
      _id: validReviewId2,
      user: "Bob",
      rating: 4,
      text: "Interesante",
      bookId: "libro2",
      likes: 0,
      dislikes: 0,
      toObject: () => ({
        _id: validReviewId2,
        user: "Bob",
        rating: 4,
        text: "Interesante",
        bookId: "libro2",
        likes: 0,
        dislikes: 0,
      })
    };
    (Review.create as any).mockResolvedValueOnce(mockReview);

    const review = await reviews.addReview("libro2", {
      userName: "Bob",
      rating: 4,
      text: "Interesante",
      bookTitle: "Libro 2",
      userId: validUserId,
    });

    expect(review._id).toBeDefined();
    expect(review.user).toBe("Bob");
  });

  it("voteReview aumenta likes correctamente", async () => {
    (Vote.findOne as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(null); // Simula que no hay voto previo
    (Review.findByIdAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({});
    (Review.findById as unknown as { mockReturnValueOnce: Function }).mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({ ...mockReviews[0], likes: 3 })
    });
    const updatedReview = { ...mockReviews[0], likes: 3 };
    (Review.findOneAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(updatedReview);

    const updated = await reviews.voteReview(validUserId, validReviewId1, 1) as { likes: number } | null;
    expect(updated?.likes).toBe(3);
  });

  it("voteReview aumenta dislikes correctamente", async () => {
    (Vote.findOne as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(null);
    (Review.findByIdAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({});
    (Review.findById as unknown as { mockReturnValueOnce: Function }).mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({ ...mockReviews[0], dislikes: 1 })
    });
    const updatedReview = { ...mockReviews[0], dislikes: 1 };
    (Review.findOneAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(updatedReview);

    const updated = await reviews.voteReview(validUserId, validReviewId1, -1) as { dislikes: number } | null;
    expect(updated?.dislikes).toBe(1);
  });

  it("voteReview devuelve null si no encuentra reseña", async () => {
    (Vote.findOne as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(null);
    (Review.findByIdAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce({});
    (Review.findById as unknown as { mockReturnValueOnce: Function }).mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null)
    });
    (Review.findOneAndUpdate as unknown as { mockResolvedValueOnce: Function }).mockResolvedValueOnce(null);

    const result = await reviews.voteReview(validUserId, validReviewId1, 1);
    expect(result).toBeNull();
  });

  it("voteReview acumula likes en llamadas sucesivas", async () => {
    (Vote.findOne as unknown as { mockResolvedValue: Function }).mockResolvedValue(null);
    (Review.findByIdAndUpdate as unknown as { mockResolvedValue: Function }).mockResolvedValue({});
    (Review.findById as unknown as { mockReturnValueOnce: Function })
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce({ ...mockReviews[0], likes: 3 }) })
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValueOnce({ ...mockReviews[0], likes: 4 }) });
    const updatedReview1 = { ...mockReviews[0], likes: 3 };
    const updatedReview2 = { ...mockReviews[0], likes: 4 };
    (Review.findOneAndUpdate as unknown as { mockResolvedValueOnce: Function })
      .mockResolvedValueOnce(updatedReview1)
      .mockResolvedValueOnce(updatedReview2);

    const first = await reviews.voteReview(validUserId, validReviewId1, 1) as { likes: number } | null;
    expect(first?.likes).toBe(3);

    const second = await reviews.voteReview(validUserId, validReviewId1, 1) as { likes: number } | null;
    expect(second?.likes).toBe(4);
  });
});
