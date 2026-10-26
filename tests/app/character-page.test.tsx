import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CharacterPage from "@/app/character/[id]/page";
import { ApiError, getCharacter, getEpisodes } from "@/lib/api";
import { makeCharacter, makeEpisode } from "../fixtures/rickandmorty";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  getCharacter: vi.fn(),
  getEpisodes: vi.fn(),
}));
const getCharacterMock = vi.mocked(getCharacter);
const getEpisodesMock = vi.mocked(getEpisodes);

// notFound() de Next.js lanza un error especial con este digest.
const NOT_FOUND = { digest: "NEXT_HTTP_ERROR_FALLBACK;404" };

async function renderCharacterPage(id: string) {
  render(await CharacterPage({ params: Promise.resolve({ id }) }));
}

beforeEach(() => {
  getCharacterMock.mockResolvedValue(makeCharacter());
  getEpisodesMock.mockResolvedValue([
    makeEpisode({ id: 1, name: "Pilot", episode: "S01E01", air_date: "December 2, 2013" }),
    makeEpisode({ id: 2, name: "Lawnmower Dog", episode: "S01E02", air_date: "December 9, 2013" }),
  ]);
});

describe("Página de detalle del personaje", () => {
  it("muestra los datos del personaje", async () => {
    await renderCharacterPage("1");

    expect(screen.getByRole("heading", { level: 1, name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByText("Alive - Human")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
    expect(screen.getByText("November 4, 2017")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Characters/ })).toHaveAttribute("href", "/");
  });

  it("pide los episodios usando los ids de sus URLs y los lista", async () => {
    await renderCharacterPage("1");

    expect(getCharacterMock).toHaveBeenCalledExactlyOnceWith("1");
    expect(getEpisodesMock).toHaveBeenCalledExactlyOnceWith(["1", "2"]);
    expect(screen.getByRole("heading", { name: "Episodes (2)" })).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toHaveAttribute("title", "Pilot - December 2, 2013");
    expect(screen.getByText("S01E02")).toBeInTheDocument();
  });

  it("muestra «Unknown» cuando el personaje no tiene tipo", async () => {
    getCharacterMock.mockResolvedValueOnce(makeCharacter({ type: "" }));
    await renderCharacterPage("1");

    expect(screen.getByText("Type").nextElementSibling).toHaveTextContent("Unknown");
  });

  it("muestra el tipo cuando la API lo informa", async () => {
    getCharacterMock.mockResolvedValueOnce(makeCharacter({ type: "Parasite" }));
    await renderCharacterPage("1");

    expect(screen.getByText("Parasite")).toBeInTheDocument();
  });

  it("tolera un personaje sin episodios ni fecha válida", async () => {
    getCharacterMock.mockResolvedValueOnce(makeCharacter({ episode: [], created: "" }));
    getEpisodesMock.mockResolvedValueOnce([]);

    await renderCharacterPage("1");

    expect(getEpisodesMock).toHaveBeenCalledWith([]);
    expect(screen.getByRole("heading", { name: "Episodes (0)" })).toBeInTheDocument();
    expect(screen.getByText("Created").nextElementSibling).toHaveTextContent("Unknown");
  });

  it.each([
    ["Dead", "bg-red-500"],
    ["unknown", "bg-gray-500"],
  ] as const)("el indicador de estado %s usa el color %s", async (status, colorClass) => {
    getCharacterMock.mockResolvedValueOnce(makeCharacter({ status }));
    await renderCharacterPage("1");

    expect(screen.getByText(`${status} - Human`).previousElementSibling).toHaveClass(colorClass);
  });

  it.each(["abc", "0", "-1"])("con el id inválido %j responde 404 sin llamar a la API", async (id) => {
    await expect(renderCharacterPage(id)).rejects.toMatchObject(NOT_FOUND);
    expect(getCharacterMock).not.toHaveBeenCalled();
  });

  it("responde 404 si la API no encuentra el personaje", async () => {
    getCharacterMock.mockRejectedValueOnce(new ApiError("Failed to fetch character details", 404));

    await expect(renderCharacterPage("99999")).rejects.toMatchObject(NOT_FOUND);
    expect(getEpisodesMock).not.toHaveBeenCalled();
  });

  it("deja pasar un error del servidor para que lo muestre error.tsx", async () => {
    getCharacterMock.mockRejectedValueOnce(new ApiError("Failed to fetch character details", 500));

    await expect(renderCharacterPage("1")).rejects.toThrow("Failed to fetch character details");
  });

  it("deja pasar el error si fallan los episodios", async () => {
    getEpisodesMock.mockRejectedValueOnce(new ApiError("Failed to fetch episodes", 500));

    await expect(renderCharacterPage("1")).rejects.toThrow("Failed to fetch episodes");
  });
});
