import { within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import RootLayout, { metadata } from "@/app/layout";

// next/font solo funciona cuando Next.js compila la app; en las pruebas se
// reemplaza por la clase CSS que entregaría la fuente.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));

/** El layout genera <html> y <body>; se renderiza como HTML y se lee como documento. */
function renderLayout() {
  const html = renderToStaticMarkup(
    <RootLayout>
      <p>Contenido de la página</p>
    </RootLayout>,
  );
  return new DOMParser().parseFromString(html, "text/html");
}

/** Monta el contenido de <body> en el documento de jsdom para consultarlo como lo vería un usuario. */
function renderLayoutBody() {
  const container = document.createElement("div");
  container.innerHTML = renderLayout().body.innerHTML;
  document.body.appendChild(container);
  return within(container);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("RootLayout", () => {
  it("define el título y la descripción del sitio", () => {
    expect(metadata).toMatchObject({
      title: "Rick and Morty Explorer",
      description: "Explore the Rick and Morty universe",
    });
  });

  it("aplica el idioma y las fuentes al documento", () => {
    const doc = renderLayout();

    // Elementos de un documento aparte: se leen sus atributos directamente.
    expect(doc.documentElement.getAttribute("lang")).toBe("en");
    expect([...doc.body.classList]).toEqual(expect.arrayContaining(["font-geist-sans", "font-geist-mono"]));
  });

  it("muestra la cabecera con la navegación y el contenido de la página", () => {
    const page = renderLayoutBody();

    expect(page.getByRole("link", { name: /Rick & Morty App/ })).toHaveAttribute("href", "/");
    expect(page.getByRole("link", { name: "Characters" })).toHaveAttribute("href", "/");
    expect(page.getByRole("main")).toHaveTextContent("Contenido de la página");
  });

  it("abre los enlaces externos en otra pestaña de forma segura", () => {
    const page = renderLayoutBody();

    for (const link of [page.getByRole("link", { name: "API Docs" }), page.getByRole("link", { name: "The Rick and Morty API" })]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(page.getByRole("link", { name: "API Docs" })).toHaveAttribute("href", "https://rickandmortyapi.com/documentation");
  });
});
