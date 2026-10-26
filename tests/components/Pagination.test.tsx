import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Pagination from "@/components/Pagination";

function renderPagination(currentPage: number, totalPages: number) {
  render(<Pagination currentPage={currentPage} totalPages={totalPages} />);
  return screen.getByRole("navigation", { name: "Pagination" });
}

describe("Pagination", () => {
  it("muestra la página actual y el total", () => {
    renderPagination(3, 42);

    expect(screen.getByText("Page 3 of 42")).toBeInTheDocument();
  });

  it("en una página intermedia enlaza a la anterior y a la siguiente", () => {
    renderPagination(3, 42);

    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/?page=2");
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/?page=4");
  });

  it("en la primera página desactiva «Previous»", () => {
    renderPagination(1, 42);

    expect(screen.queryByRole("link", { name: /Previous/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Previous/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/?page=2");
  });

  it("en la última página desactiva «Next»", () => {
    renderPagination(42, 42);

    expect(screen.queryByRole("link", { name: /Next/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Next/)).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/?page=41");
  });

  it("con una sola página no ofrece ningún enlace", () => {
    const nav = renderPagination(1, 1);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(nav).toHaveTextContent("Page 1 of 1");
  });
});
