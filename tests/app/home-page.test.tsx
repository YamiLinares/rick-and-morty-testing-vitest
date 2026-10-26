import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { ApiError, getCharacters } from "@/lib/api";
import { makeCharacter, makeCharacterResponse } from "../fixtures/rickandmorty";

// Se simula solo getCharacters; ApiError sigue siendo la clase real.
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  getCharacters: vi.fn(),
}));
const getCharactersMock = vi.mocked(getCharacters);

/** Home es un Server Component asíncrono: se espera su JSX y luego se renderiza. */
async function renderHome(searchParams: Record<string, string | string[] | undefined> = {}) {
  render(await Home({ searchParams: Promise.resolve(searchParams) }));
}

const characters = [
  makeCharacter({ id: 1, name: "Rick Sanchez" }),
  makeCharacter({ id: 2, name: "Morty Smith" }),
  makeCharacter({ id: 3, name: "Summer Smith", status: "Dead" }),
];

beforeEach(() => {
  getCharactersMock.mockResolvedValue(makeCharacterResponse(characters, 42));
});

describe("Página principal", () => {
  it("muestra el título y una tarjeta por cada personaje", async () => {
    await renderHome();

    expect(screen.getByRole("heading", { level: 1, name: "Rick and Morty Characters" })).toBeInTheDocument();
    const names = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(names).toEqual(["Rick Sanchez", "Morty Smith", "Summer Smith"]);
  });

  it("sin ?page carga la página 1 y la paginación lo refleja", async () => {
    await renderHome();

    expect(getCharactersMock).toHaveBeenCalledExactlyOnceWith(1);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByText("Page 1 of 42")).toBeInTheDocument();
  });

  it("carga la página que llega en ?page", async () => {
    await renderHome({ page: "5" });

    expect(getCharactersMock).toHaveBeenCalledWith(5);
    expect(screen.getByText("Page 5 of 42")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/?page=4");
  });

  it.each([["abc"], ["0"], ["-3"]])("con ?page=%s inválido vuelve a la página 1 (antes llegaba a la API y a la paginación)", async (page) => {
    await renderHome({ page });

    expect(getCharactersMock).toHaveBeenCalledWith(1);
    expect(screen.getByText("Page 1 of 42")).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("muestra un estado vacío si la API no devuelve personajes", async () => {
    getCharactersMock.mockResolvedValueOnce(makeCharacterResponse([], 0));

    await renderHome();

    expect(screen.getByRole("status")).toHaveTextContent("No characters found on page 1.");
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });

  it("muestra un estado vacío con enlace a la página 1 si la página no existe (404)", async () => {
    getCharactersMock.mockRejectedValueOnce(new ApiError("Failed to fetch characters", 404));

    await renderHome({ page: "999" });

    expect(screen.getByRole("status")).toHaveTextContent("No characters found on page 999.");
    expect(screen.getByRole("link", { name: "Go to the first page" })).toHaveAttribute("href", "/");
  });

  it("deja pasar otros errores para que los muestre error.tsx", async () => {
    getCharactersMock.mockRejectedValueOnce(new ApiError("Failed to fetch characters", 500));

    await expect(renderHome()).rejects.toThrow("Failed to fetch characters");
  });

  it("deja pasar un fallo de red", async () => {
    getCharactersMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(renderHome()).rejects.toThrow("fetch failed");
  });
});
