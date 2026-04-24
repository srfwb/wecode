// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useProjectStore } from "../projects/projectStore";
import { useProjectModalStore } from "../projects/ui/modalStore";
import { useIdeStore } from "../state/ideStore";
import { CommandPalette } from "./CommandPalette";
import { usePaletteStore } from "./paletteStore";

describe("CommandPalette", () => {
  beforeEach(() => {
    // Reset all stores the palette reads so tests are order-independent.
    useProjectStore.setState({ projects: [], activeProjectId: null });
    useProjectModalStore.setState({
      createProject: null,
      renameProject: null,
      deleteProject: null,
    });
    useIdeStore.setState({ view: "home", openFiles: [], activeFile: null });
    usePaletteStore.setState({ open: false, query: "" });
  });

  afterEach(() => {
    // vitest doesn't auto-cleanup testing-library renders (no `globals: true`
    // in `vitest.config.ts`), so we do it manually to stop previous mounts
    // from leaking their DOM into the next test.
    cleanup();
  });

  test("renders nothing when the palette is closed", () => {
    const { container } = render(<CommandPalette />);
    expect(container.firstChild).toBeNull();
  });

  test("renders nothing when the view is not home even if the store is open", () => {
    useIdeStore.setState({ view: "ide" });
    usePaletteStore.setState({ open: true });
    const { container } = render(<CommandPalette />);
    expect(container.firstChild).toBeNull();
  });

  test("renders the dialog with the input focused when opened on home", () => {
    usePaletteStore.setState({ open: true });
    render(<CommandPalette />);
    const input = screen.getByRole("textbox", { name: /rechercher/i });
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  test("typing filters the visible items", () => {
    usePaletteStore.setState({ open: true });
    const { container } = render(<CommandPalette />);
    const input = screen.getByRole("textbox", { name: /rechercher/i }) as HTMLInputElement;
    // "Nouveau projet" is a command title; typing "nouv" should keep it.
    // The row renders with `<mark>` around the matched substring, so the
    // title is split across text nodes — use the aggregated textContent.
    fireEvent.change(input, { target: { value: "nouv" } });
    expect(container.textContent).toContain("Nouveau projet");
    // Typing a query that matches nothing should hit the empty-state copy.
    fireEvent.change(input, { target: { value: "xyzzy" } });
    expect(container.textContent).toContain("Aucun résultat");
  });

  test("Enter invokes the selected command and closes the palette", () => {
    const runSpy = vi.fn();
    useProjectModalStore.setState({
      openCreate: runSpy,
      openRename: () => {},
      openDelete: () => {},
      closeAll: () => {},
    } as unknown as ReturnType<typeof useProjectModalStore.getState>);
    usePaletteStore.setState({ open: true, query: "nouv" });
    render(<CommandPalette />);
    const input = screen.getByRole("textbox", { name: /rechercher/i }) as HTMLInputElement;
    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(usePaletteStore.getState().open).toBe(false);
  });

  test("Escape closes the palette via useModalA11y", () => {
    usePaletteStore.setState({ open: true });
    render(<CommandPalette />);
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(usePaletteStore.getState().open).toBe(false);
  });

  test("arrow down moves the selected row across groups", () => {
    // Seed a project so the "Reprendre" group has at least one row, giving
    // us two groups (Reprendre + Commandes + Leçons) to navigate across.
    useProjectStore.setState({
      projects: [
        {
          id: "p1",
          name: "alpha",
          path: "/tmp/alpha",
          kind: "blank",
          tags: [],
          createdAt: 0,
          lastOpenedAt: 1,
          fileCount: 0,
          lineCount: 0,
        },
      ],
      activeProjectId: null,
    });
    usePaletteStore.setState({ open: true });
    render(<CommandPalette />);
    const firstRow = document.querySelector(".palette-item--sel");
    expect(firstRow?.textContent).toContain("alpha");
    const input = screen.getByRole("textbox", { name: /rechercher/i }) as HTMLInputElement;
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    });
    const nextRow = document.querySelector(".palette-item--sel");
    expect(nextRow?.textContent).not.toContain("alpha");
  });
});
