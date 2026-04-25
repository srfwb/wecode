import { create } from "zustand";

interface PaletteState {
  open: boolean;
  query: string;
  openPalette: () => void;
  closePalette: () => void;
  toggle: () => void;
  setQuery: (q: string) => void;
}

// Singleton open/close + query state. Kept tiny on purpose — the palette is
// otherwise stateless: every render derives its visible items from the
// current sources (projects store, VFS, commands registry).
export const usePaletteStore = create<PaletteState>((set, get) => ({
  open: false,
  query: "",
  openPalette: () => set({ open: true }),
  closePalette: () => set({ open: false, query: "" }),
  toggle: () => set({ open: !get().open, query: get().open ? "" : get().query }),
  setQuery: (query) => set({ query }),
}));
