import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../app/page";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
beforeEach(() => {
  vi.resetAllMocks();
});

describe("HomePage", () => {
  it("renderiza el formulario de búsqueda", async () => {
    render(await HomePage({}));
    expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
    expect(screen.getByText("Buscar")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("muestra 'Sin coincidencias' si no hay resultados", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [] })
    }));
    render(await HomePage({ searchParams: { q: "no existe", type: "title" } }));
    expect(await screen.findByText("Sin coincidencias")).toBeInTheDocument();
  });


  it("muestra resultados si la API devuelve libros", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [
        {
          id: "book1",
          volumeInfo: {
            title: "Libro de prueba",
            authors: ["Autor Uno"],
            imageLinks: { thumbnail: "img.jpg" }
          }
        }
      ] })
    }));
    render(await HomePage({ searchParams: { q: "libro", type: "title" } }));
    expect(await screen.findByText("Libro de prueba")).toBeInTheDocument();
    expect(screen.getByText("Autor Uno")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "img.jpg");
    expect(screen.getByText("Ver detalles")).toBeInTheDocument();
  });

  it("muestra 'Autor desconocido' si no hay autores", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [
        {
          id: "book2",
          volumeInfo: {
            title: "Sin autor"
          }
        }
      ] })
    }));
    render(await HomePage({ searchParams: { q: "libro", type: "title" } }));
    expect(await screen.findByText("Sin autor")).toBeInTheDocument();
    expect(screen.getByText("Autor desconocido")).toBeInTheDocument();
  });

  it("muestra placeholder de imagen si no hay imagen", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [
        {
          id: "book3",
          volumeInfo: {
            title: "Sin imagen",
            authors: ["Autor X"]
          }
        }
      ] })
    }));
    render(await HomePage({ searchParams: { q: "libro", type: "title" } }));
    expect(await screen.findByText("Sin imagen")).toBeInTheDocument();
    expect(screen.getByText("Sin imagen").parentElement?.parentElement?.querySelector(".bg-slate-200")).toBeInTheDocument();
  });

  it("muestra resultados al buscar por ISBN", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [
        {
          id: "book-isbn",
          volumeInfo: {
            title: "Libro por ISBN",
            authors: ["Autor ISBN"],
            imageLinks: { thumbnail: "isbn.jpg" }
          }
        }
      ] })
    }));
    render(await HomePage({ searchParams: { q: "9780439708180", type: "isbn" } }));
    expect(await screen.findByText("Libro por ISBN")).toBeInTheDocument();
    expect(screen.getByText("Autor ISBN")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "isbn.jpg");
    expect(screen.getByText("Ver detalles")).toBeInTheDocument();
  });

  it("muestra resultados al buscar por autor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ items: [
        {
          id: "book-author",
          volumeInfo: {
            title: "Libro por Autor",
            authors: ["Autor Buscado"],
            imageLinks: { thumbnail: "autor.jpg" }
          }
        }
      ] })
    }));
    render(await HomePage({ searchParams: { q: "rowling", type: "author" } }));
    expect(await screen.findByText("Libro por Autor")).toBeInTheDocument();
    expect(screen.getByText("Autor Buscado")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "autor.jpg");
    expect(screen.getByText("Ver detalles")).toBeInTheDocument();
  });
});
