import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { Stars } from "../app/book/[id]/reviews";

// Mock de la función getReviews
vi.mock("../lib/reviews");

it("renderiza 5 estrellas", () => {
  render(<Stars value={5} />);
  expect(screen.getAllByText("★")).toHaveLength(5);
});

it("muestra estrellas llenas según el valor", () => {
  render(<Stars value={4} />);
  const fullStars = screen.getAllByText("★");
  expect(fullStars).toHaveLength(4);
});