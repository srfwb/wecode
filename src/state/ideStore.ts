import { create } from "zustand";

import { vfs } from "../vfs/VirtualFS";

interface IdeState {
  openFiles: string[];
  activeFile: string | null;

  setActiveFile: (path: string) => void;
  syncOpenFiles: (paths: string[]) => void;
}

export const useIdeStore = create<IdeState>((set) => ({
  openFiles: [],
  activeFile: null,

  setActiveFile: (path) => set({ activeFile: path }),

  syncOpenFiles: (paths) =>
    set((prev) => {
      const next = [...paths];
      let active = prev.activeFile;
      if (!active || !next.includes(active)) {
        active = next[0] ?? null;
      }
      return { openFiles: next, activeFile: active };
    }),
}));

export function bootstrapIdeStore(): () => void {
  useIdeStore.getState().syncOpenFiles(vfs.listFiles());

  return vfs.on("change", () => {
    useIdeStore.getState().syncOpenFiles(vfs.listFiles());
  });
}
