// --- Mocks primero (antes de importar nada que los use) ---
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ value: "token" }) }),
}));

vi.mock("../lib/mongo", () => ({ connectToDatabase: vi.fn() }));

vi.mock("@/lib/reviews", () => ({
  addReview: vi.fn(),
  voteReview: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUserFromRequestCookie: vi.fn(() =>
    Promise.resolve({ _id: "u1", name: "Juan", email: "juan@test.com" })
  ),
}));

// --- Imports después de los mocks ---
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleCreateReview, handleVoteReview } from "@/app/book/[id]/reviews";
import { addReview, voteReview } from "@/lib/reviews";
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
      formData.set("bookTitle", "Mi Libro");
      formData.set("rating", "5");
      formData.set("text", "Excelente libro");

      await handleCreateReview(formData);

      expect(addReview).toHaveBeenCalledWith("123", {
        userId: "u1",
        userName: "Juan",
        rating: 5,
        text: "Excelente libro",
        bookTitle: "Mi Libro",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });

    it("no debería llamar a addReview ni revalidatePath si falta texto", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("bookTitle", "Mi Libro");
      formData.set("rating", "5");
      formData.set("text", ""); // texto vacío

      await handleCreateReview(formData);

      expect(addReview).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  // --- handleVoteReview ---
  describe("handleVoteReview", () => {
    it("debería llamar a voteReview con los datos correctos y revalidatePath (like)", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("reviewId", "r1");
      formData.set("delta", "1");

      await handleVoteReview(formData);

      expect(voteReview).toHaveBeenCalledWith("u1", "r1", 1);
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });

    it("debería manejar delta negativo correctamente (dislike)", async () => {
      const formData = new FormData();
      formData.set("bookId", "123");
      formData.set("reviewId", "r2");
      formData.set("delta", "-1");

      await handleVoteReview(formData);

      expect(voteReview).toHaveBeenCalledWith("u1", "r2", -1);
      expect(revalidatePath).toHaveBeenCalledWith("/book/123");
    });
  });
});
