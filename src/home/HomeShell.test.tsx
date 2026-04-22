// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeShell } from "./HomeShell";

describe("HomeShell", () => {
  it("renders the welcome headline and the Projets récents section header", () => {
    render(<HomeShell />);

    expect(screen.getByText(/Bienvenue dans/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Projets récents/i })).toBeTruthy();
  });
});
