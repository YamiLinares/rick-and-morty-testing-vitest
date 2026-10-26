import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

describe("error.tsx (estado de error)", () => {
  it("muestra el mensaje de error y registra el error en la consola", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Failed to fetch characters");

    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Something went wrong!" })).toBeInTheDocument();
    expect(screen.getByText("We couldn't load the characters. Please try again later.")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it("«Try again» llama a reset para volver a intentar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    const user = userEvent.setup();

    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});

describe("loading.tsx (estado de carga)", () => {
  it("muestra 8 tarjetas esqueleto mientras cargan los personajes", () => {
    const { container } = render(<Loading />);

    // Son bloques decorativos sin texto: se cuentan las tarjetas animadas del grid.
    expect(container.querySelectorAll(".grid > .animate-pulse")).toHaveLength(8);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("not-found.tsx (404)", () => {
  it("explica que el personaje no existe y enlaza al listado", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Not found" })).toBeInTheDocument();
    expect(screen.getByText("This character or page doesn't exist in this dimension.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Characters" })).toHaveAttribute("href", "/");
  });
});
