import { create } from "zustand";

import type { TemplateId } from "../templates";

export type CreateProjectPayload = { templateId: TemplateId };
export type RenameProjectPayload = { id: string };
export type DeleteProjectPayload = { id: string };

interface ModalState {
  createProject: CreateProjectPayload | null;
  renameProject: RenameProjectPayload | null;
  deleteProject: DeleteProjectPayload | null;

  openCreate: (payload: CreateProjectPayload) => void;
  openRename: (payload: RenameProjectPayload) => void;
  openDelete: (payload: DeleteProjectPayload) => void;
  closeAll: () => void;
}

export const useProjectModalStore = create<ModalState>((set) => ({
  createProject: null,
  renameProject: null,
  deleteProject: null,

  openCreate: (payload) => set({ createProject: payload }),
  openRename: (payload) => set({ renameProject: payload }),
  openDelete: (payload) => set({ deleteProject: payload }),
  closeAll: () => set({ createProject: null, renameProject: null, deleteProject: null }),
}));
