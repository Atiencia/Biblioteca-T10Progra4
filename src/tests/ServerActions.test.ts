import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleCreateReview, handleVoteReview } from "@/app/book/[id]/reviews";
import { addReview, voteReview } from "@/lib/reviews";

// --- Mocks ---
vi.mock("@/lib/reviews", () => ({
  addReview: vi.fn(),
  voteReview: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";

describe("Server Actions: handleCreateReview y handleVoteReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- handleCreateReview ---
  describe("handleCreateReview", () => {
    it("debería llamar a addReview con los datos correctos y revalidatePath", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("user", "Juan");
      formData.set("text", "Excelente libro");
      formData.set("rating", "5");

      await handleCreateReview(formData);

      expect(addReview).toHaveBeenCalledWith("123", {
        user: "Juan",
        text: "Excelente libro",
        rating: 5,
        bookId: "123",
        likes: 0,
        dislikes: 0,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });

    it("no debería llamar a addReview ni revalidatePath si faltan user o text", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("user", "");
      formData.set("text", "");
      formData.set("rating", "5");

      await handleCreateReview(formData);

      expect(addReview).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  // --- handleVoteReview ---
  describe("handleVoteReview", () => {
    it("debería llamar a voteReview con los datos correctos y revalidatePath", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("reviewId", "r1");
      formData.set("delta", "1");

      await handleVoteReview(formData);

      expect(voteReview).toHaveBeenCalledWith("123", "r1", 1);
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });

    it("debería manejar delta negativo correctamente", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("reviewId", "r2");
      formData.set("delta", "-1");

      await handleVoteReview(formData);

      expect(voteReview).toHaveBeenCalledWith("123", "r2", -1);
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });
  });
});
