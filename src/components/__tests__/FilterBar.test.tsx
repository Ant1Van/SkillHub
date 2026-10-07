import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "../FilterBar";

describe("FilterBar Component", () => {
  it("renders filter buttons with accurate counts", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        filterStatus="all"
        onFilterChange={onFilterChange}
        totalCount={43}
        activeCount={40}
        disabledCount={3}
      />
    );

    expect(screen.getByText("All (43)")).toBeInTheDocument();
    expect(screen.getByText("Active (40)")).toBeInTheDocument();
    expect(screen.getByText("Off (3)")).toBeInTheDocument();
  });

  it("triggers onFilterChange when a filter tab is clicked", () => {
    const onFilterChange = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        filterStatus="all"
        onFilterChange={onFilterChange}
        totalCount={10}
        activeCount={8}
        disabledCount={2}
      />
    );

    fireEvent.click(screen.getByText("Active (8)"));
    expect(onFilterChange).toHaveBeenCalledWith("active");
  });

  it("calls onSearchChange when user types in search input", () => {
    const onSearchChange = vi.fn();

    render(
      <FilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        filterStatus="all"
        onFilterChange={vi.fn()}
        totalCount={5}
        activeCount={5}
        disabledCount={0}
      />
    );

    const input = screen.getByPlaceholderText("Search skills (⌘K)...");
    fireEvent.change(input, { target: { value: "playwright" } });
    expect(onSearchChange).toHaveBeenCalledWith("playwright");
  });
});
