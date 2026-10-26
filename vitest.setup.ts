// Agrega los matchers de jest-dom (toBeInTheDocument, toHaveAttribute, ...) a expect de Vitest.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Desmonta lo renderizado en cada prueba para que ninguna dependa de otra.
afterEach(() => {
  cleanup();
});
