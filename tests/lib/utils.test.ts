import { describe, expect, it } from "vitest";
import { formatCreatedDate, getEpisodeIds, getStatusColor, isValidCharacterId, parsePageParam } from "@/lib/utils";

describe("parsePageParam", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["42", 42],
    [" 7 ", 7],
  ])("convierte %j en la página %i", (value, expected) => {
    expect(parsePageParam(value)).toBe(expected);
  });

  it.each([
    ["sin parámetro", undefined],
    ["texto", "abc"],
    ["número con texto", "2abc"],
    ["cero", "0"],
    ["negativo", "-3"],
    ["decimal", "1.5"],
    ["vacío", ""],
    ["número demasiado grande", "99999999999999999999"],
    ["parámetro repetido (?page=1&page=2)", ["1", "2"]],
  ])("vuelve a la página 1 con un valor inválido: %s", (_caso, value) => {
    expect(parsePageParam(value)).toBe(1);
  });
});

describe("isValidCharacterId", () => {
  it.each(["1", "42", "826"])("acepta el id %s", (id) => {
    expect(isValidCharacterId(id)).toBe(true);
  });

  it.each(["0", "-1", "abc", "1.5", "01", "", "1,2"])("rechaza el id %j", (id) => {
    expect(isValidCharacterId(id)).toBe(false);
  });
});

describe("getEpisodeIds", () => {
  it("extrae el id del final de cada URL de episodio", () => {
    expect(
      getEpisodeIds([
        "https://rickandmortyapi.com/api/episode/1",
        "https://rickandmortyapi.com/api/episode/28",
      ]),
    ).toEqual(["1", "28"]);
  });

  it("tolera una barra final en la URL", () => {
    expect(getEpisodeIds(["https://rickandmortyapi.com/api/episode/5/"])).toEqual(["5"]);
  });

  it("devuelve una lista vacía si el personaje no tiene episodios", () => {
    expect(getEpisodeIds([])).toEqual([]);
  });

  it("descarta URLs vacías o sin id numérico", () => {
    expect(getEpisodeIds(["", "https://rickandmortyapi.com/api/episode/", "https://rickandmortyapi.com/api/episode/abc", "https://rickandmortyapi.com/api/episode/3"])).toEqual(["3"]);
  });
});

describe("getStatusColor", () => {
  it.each([
    ["Alive", "bg-green-500"],
    ["Dead", "bg-red-500"],
    ["unknown", "bg-gray-500"],
  ])("el estado %s usa la clase %s", (status, expected) => {
    expect(getStatusColor(status)).toBe(expected);
  });

  it("usa gris para un estado que la app no conoce", () => {
    expect(getStatusColor("Zombie")).toBe("bg-gray-500");
  });
});

describe("formatCreatedDate", () => {
  it("formatea la fecha ISO de la API en inglés", () => {
    expect(formatCreatedDate("2017-11-04T18:48:46.250Z")).toBe("November 4, 2017");
  });

  it("usa UTC: una fecha cerca de medianoche no cambia de día según la zona horaria", () => {
    expect(formatCreatedDate("2017-11-04T23:59:59.000Z")).toBe("November 4, 2017");
  });

  it.each(["", "not-a-date"])("devuelve Unknown si la fecha no es válida (%j)", (value) => {
    expect(formatCreatedDate(value)).toBe("Unknown");
  });
});
