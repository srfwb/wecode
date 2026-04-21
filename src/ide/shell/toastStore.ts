import { create } from "zustand";

export type ToastKind = "info" | "success" | "error";

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastStoreShape {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const DURATION: Record<ToastKind, number> = {
  info: 3000,
  success: 3000,
  error: 6000,
};

export const useToastStore = create<ToastStoreShape>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((prev) => ({ toasts: [...prev.toasts, { ...t, id }] }));
    window.setTimeout(() => {
      set((prev) => ({ toasts: prev.toasts.filter((x) => x.id !== id) }));
    }, DURATION[t.kind]);
  },
  dismiss: (id) => set((prev) => ({ toasts: prev.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  info: (message: string) => useToastStore.getState().push({ kind: "info", message }),
  success: (message: string) => useToastStore.getState().push({ kind: "success", message }),
  error: (message: string) => useToastStore.getState().push({ kind: "error", message }),
};
