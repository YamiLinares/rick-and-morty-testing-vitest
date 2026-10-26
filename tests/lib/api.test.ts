import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCharacter, getCharacters, getEpisodes } from "@/lib/api";
import { jsonResponse, makeCharacter, makeCharacterResponse, makeEpisode } from "../fixtures/rickandmorty";

const API = "https://rickandmortyapi.com/api";

// fetch se reemplaza en cada prueba: nunca se llama a la API real.
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

describe("getCharacters", () => {
  it("pide la página indicada y devuelve la respuesta de la API", async () => {
    const body = makeCharacterResponse([makeCharacter()], 42);
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    await expect(getCharacters(3)).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${API}/character?page=3`);
  });

  it("usa la página 1 cuando no se indica ninguna", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(makeCharacterResponse([])));

    await getCharacters();

    expect(fetchMock).toHaveBeenCalledWith(`${API}/character?page=1`);
  });

  it("devuelve una lista vacía sin fallar", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(makeCharacterResponse([], 0)));

    const data = await getCharacters(1);

    expect(data.results).toEqual([]);
    expect(data.info.pages).toBe(0);
  });

  it("lanza un error cuando la API responde con un estado HTTP de error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "There is nothing here" }, 404));

    await expect(getCharacters(999)).rejects.toThrow("Failed to fetch characters");
  });

  it("propaga el fallo de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(getCharacters(1)).rejects.toThrow("fetch failed");
  });
});

describe("getCharacter", () => {
  it("pide el personaje por id y devuelve sus datos", async () => {
    const rick = makeCharacter({ id: 1 });
    fetchMock.mockResolvedValueOnce(jsonResponse(rick));

    await expect(getCharacter("1")).resolves.toEqual(rick);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${API}/character/1`);
  });

  it("lanza un error si el personaje no existe (404)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Character not found" }, 404));

    await expect(getCharacter("99999")).rejects.toThrow("Failed to fetch character details");
  });

  it("lanza un error si el servidor falla (500)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getCharacter("1")).rejects.toThrow("Failed to fetch character details");
  });
});

describe("getEpisodes", () => {
  it("no llama a la API si no hay episodios", async () => {
    await expect(getEpisodes([])).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pide varios episodios en una sola petición separados por comas", async () => {
    const episodes = [makeEpisode({ id: 1 }), makeEpisode({ id: 2, episode: "S01E02" })];
    fetchMock.mockResolvedValueOnce(jsonResponse(episodes));

    await expect(getEpisodes(["1", "2"])).resolves.toEqual(episodes);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`${API}/episode/1,2`);
  });

  it("convierte en lista la respuesta de un solo episodio (la API devuelve un objeto)", async () => {
    const pilot = makeEpisode({ id: 1 });
    fetchMock.mockResolvedValueOnce(jsonResponse(pilot));

    await expect(getEpisodes(["1"])).resolves.toEqual([pilot]);
  });

  it("lanza un error cuando la API de episodios falla", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getEpisodes(["1", "2"])).rejects.toThrow("Failed to fetch episodes");
  });
});
