import { create } from "zustand";

import { vfs } from "../vfs/VirtualFS";

interface IdeState {
  openFiles: string[];
  activeFile: string | null;

  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  hydrate: (state: { openFiles: string[]; activeFile: string | null }) => void;
}

export const useIdeStore = create<IdeState>((set) => ({
  openFiles: [],
  activeFile: null,

  openFile: (path) =>
    set((prev) => {
      const openFiles = prev.openFiles.includes(path) ? prev.openFiles : [...prev.openFiles, path];
      return { openFiles, activeFile: path };
    }),

  closeFile: (path) =>
    set((prev) => {
      const idx = prev.openFiles.indexOf(path);
      if (idx === -1) return prev;
      const openFiles = prev.openFiles.filter((p) => p !== path);
      let activeFile = prev.activeFile;
      if (activeFile === path) {
        activeFile = openFiles[idx] ?? openFiles[idx - 1] ?? null;
      }
      return { openFiles, activeFile };
    }),

  setActiveFile: (path) => set({ activeFile: path }),

  hydrate: ({ openFiles, activeFile }) =>
    set(() => {
      const known = new Set(vfs.listFiles());
      const cleaned = openFiles.filter((p) => known.has(p));
      const active = activeFile && cleaned.includes(activeFile) ? activeFile : (cleaned[0] ?? null);
      return { openFiles: cleaned, activeFile: active };
    }),
}));

export function bootstrapIdeStore(): () => void {
  const store = useIdeStore.getState();
  if (store.openFiles.length === 0) {
    const all = vfs.listFiles();
    if (all.length > 0) {
      useIdeStore.setState({ openFiles: all, activeFile: all[0] });
    }
  }

  return vfs.on("change", (change) => {
    if (change.kind === "delete") {
      useIdeStore.getState().closeFile(change.path);
      return;
    }
    if (change.kind === "rename" && change.oldPath) {
      useIdeStore.setState((prev) => {
        const idx = prev.openFiles.indexOf(change.oldPath!);
        if (idx === -1) return prev;
        const openFiles = [...prev.openFiles];
        openFiles[idx] = change.path;
        const activeFile = prev.activeFile === change.oldPath ? change.path : prev.activeFile;
        return { openFiles, activeFile };
      });
    }
  });
}
