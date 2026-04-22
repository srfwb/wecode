import { create } from "zustand";

import type { PersistedProjectsIndex, ProjectMeta } from "./types";

interface ProjectState {
  projects: ProjectMeta[];
  activeProjectId: string | null;

  hydrate: (index: PersistedProjectsIndex) => void;
  setActive: (id: string, opts?: { touch?: boolean }) => void;
  upsert: (meta: ProjectMeta) => void;
  patchStats: (id: string, fileCount: number, lineCount: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,

  hydrate: (index) =>
    set({
      projects: index.projects,
      activeProjectId: index.activeProjectId,
    }),

  setActive: (id, opts) =>
    set((prev) => {
      const touch = opts?.touch === true;
      const projects = touch
        ? prev.projects.map((p) => (p.id === id ? { ...p, lastOpenedAt: Date.now() } : p))
        : prev.projects;
      return { projects, activeProjectId: id };
    }),

  upsert: (meta) =>
    set((prev) => {
      const idx = prev.projects.findIndex((p) => p.id === meta.id);
      const projects =
        idx === -1
          ? [...prev.projects, meta]
          : prev.projects.map((p) => (p.id === meta.id ? meta : p));
      return { projects };
    }),

  patchStats: (id, fileCount, lineCount) =>
    set((prev) => ({
      projects: prev.projects.map((p) => (p.id === id ? { ...p, fileCount, lineCount } : p)),
    })),
}));
