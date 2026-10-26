import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Transforma JSX/TSX igual que en la app (runtime automático de React).
  plugins: [react()],
  resolve: {
    // Mismo alias que tsconfig.json: "@/..." apunta a src/.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // jsdom simula el navegador para renderizar componentes con Testing Library.
    environment: "jsdom",
    // Necesario para que Testing Library limpie el DOM después de cada prueba.
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // Cada prueba empieza con mocks y variables globales limpias.
    restoreMocks: true,
    clearMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      // Se mide todo el código fuente, aunque ninguna prueba lo importe.
      include: ["src/**/*.{ts,tsx}"],
      // src/types solo tiene interfaces de TypeScript: no genera código ejecutable.
      exclude: ["src/types/**"],
      // "text" con skipFull: false lista todos los archivos, también los que tienen 100 %.
      // html: reporte navegable (coverage/index.html); lcovonly: lcov.info para CI.
      // (json-summary se omite porque guarda rutas absolutas del equipo.)
      reporter: [["text", { skipFull: false }], "html", "lcovonly"],
      reportsDirectory: "./coverage",
      // Si alguna métrica queda por debajo del 80 %, el comando termina con error.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
