import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CharacterCard from "@/components/CharacterCard";
import { makeCharacter } from "../fixtures/rickandmorty";

describe("CharacterCard", () => {
  it("muestra el nombre, el estado, la especie y la última ubicación", () => {
    render(<CharacterCard character={makeCharacter()} />);

    expect(screen.getByRole("heading", { level: 2, name: "Rick Sanchez" })).toBeInTheDocument();
    expect(screen.getByText("Alive - Human")).toBeInTheDocument();
    expect(screen.getByText("Last known location:")).toBeInTheDocument();
    expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
  });

  it("enlaza a la página de detalle del personaje", () => {
    render(<CharacterCard character={makeCharacter({ id: 42, name: "Morty Smith" })} />);

    expect(screen.getByRole("link", { name: /Morty Smith/ })).toHaveAttribute("href", "/character/42");
  });

  it("muestra la imagen del personaje con su nombre como texto alternativo", () => {
    render(<CharacterCard character={makeCharacter({ name: "Summer Smith", image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg" })} />);

    const image = screen.getByRole("img", { name: "Summer Smith" });
    // next/image sirve la foto a través de su optimizador (/_next/image?url=...).
    expect(image.getAttribute("src")).toContain(encodeURIComponent("https://rickandmortyapi.com/api/character/avatar/3.jpeg"));
  });

  it.each([
    ["Alive", "bg-green-500"],
    ["Dead", "bg-red-500"],
    ["unknown", "bg-gray-500"],
  ] as const)("el indicador de estado %s usa el color %s", (status, colorClass) => {
    render(<CharacterCard character={makeCharacter({ status })} />);

    const statusText = screen.getByText(`${status} - Human`);
    const indicator = statusText.previousElementSibling;
    expect(indicator).toHaveClass(colorClass);
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });
});
