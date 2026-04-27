import { create } from "zustand";

export type HomeTab = "home" | "lessons" | "challenges";

interface HomeState {
  tab: HomeTab;
  setTab: (tab: HomeTab) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  tab: "home",
  setTab: (tab) => set({ tab }),
}));
