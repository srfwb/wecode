import { create } from "zustand";

export type HomeTab = "accueil" | "lessons" | "challenges";

interface HomeState {
  tab: HomeTab;
  setTab: (tab: HomeTab) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  tab: "accueil",
  setTab: (tab) => set({ tab }),
}));
