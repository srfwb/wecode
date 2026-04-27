// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useProjectStore } from "../projects/projectStore";
import { useProjectModalStore } from "../projects/ui/modalStore";
import { HomeShell } from "./HomeShell";

describe("HomeShell", () => {
  // Zustand stores are module-level singletons; they leak between test files
  // executed in the same worker. Reset the slices HomeShell reads so this
  // test is independent of any ordering or cross-suite state.
  beforeEach(() => {
    useProjectStore.setState({ projects: [], activeProjectId: null });
    useProjectModalStore.setState({
      createProject: null,
      renameProject: null,
      deleteProject: null,
    });
  });

  it("renders the welcome headline and the Recent projects section header", () => {
    render(<HomeShell />);

    expect(screen.getByText(/Welcome to/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Recent projects/i })).toBeTruthy();
  });
});
