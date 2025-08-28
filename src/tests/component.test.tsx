import { render, screen } from "@testing-library/react";
import Reviews from "../app/book/[id]/reviews";
import * as reviews from "../lib/reviews";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

// Mock de la función getReviews
vi.mock("../lib/reviews");

describe("Reviews component", () => {
  it("muestra mensaje vacío cuando no hay reseñas", async () => {
    vi.spyOn(reviews, "getReviews").mockResolvedValueOnce([]);

    render(await Reviews({ bookId: "libro1" }));

    expect(
      await screen.findByText("Sé la primera persona en reseñar este libro.")
    ).toBeInTheDocument();
  });

      it("renderiza una reseña con estrellas y botones", async () => {
      vi.spyOn(reviews, "getReviews").mockResolvedValueOnce([{
        id: "r1", user: "Alice", text: "Muy bueno", rating: 4, bookId: "libro1", likes: 2, dislikes: 0, createdAt: new Date().toISOString(),
      }]);
      render(await Reviews({ bookId: "libro1" }));
      expect(await screen.findByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Muy bueno")).toBeInTheDocument();
      expect(screen.getByLabelText("Like")).toBeInTheDocument();
      expect(screen.getByLabelText("Dislike")).toBeInTheDocument();
      expect(screen.getAllByText("★")).toHaveLength(4);
      expect(screen.getAllByText("☆")).toHaveLength(1);
    });
  });
