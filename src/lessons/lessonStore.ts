import { create } from "zustand";

import { useIdeStore } from "../state/ideStore";
import { vfs } from "../vfs/VirtualFS";
import { getLessonById } from "./data";
import type { CheckpointStatus } from "./types";

interface LessonState {
  activeLessonId: string | null;
  checkpointStates: Record<string, CheckpointStatus>;

  startLesson: (id: string) => void;
  completeCheckpoint: (id: string) => void;
  resetLesson: (id: string) => void;
  exitLesson: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  activeLessonId: null,
  checkpointStates: {},

  startLesson: (id) => {
    const lesson = getLessonById(id);
    if (!lesson) return;

    // Hydrate VFS with starter files
    vfs.hydrate(lesson.starterFiles);

    // Initialize all checkpoints to "todo"
    const states: Record<string, CheckpointStatus> = {};
    for (const step of lesson.steps) {
      for (const cp of step.checkpoints) {
        states[cp.id] = "todo";
      }
    }

    set({ activeLessonId: id, checkpointStates: states });
    useIdeStore.getState().setView("lesson");
  },

  completeCheckpoint: (id) => {
    set((prev) => ({
      checkpointStates: { ...prev.checkpointStates, [id]: "done" },
    }));
  },

  resetLesson: (id) => {
    const lesson = getLessonById(id);
    if (!lesson) return;
    const states: Record<string, CheckpointStatus> = {};
    for (const step of lesson.steps) {
      for (const cp of step.checkpoints) {
        states[cp.id] = "todo";
      }
    }
    vfs.hydrate(lesson.starterFiles);
    set({ checkpointStates: states });
  },

  exitLesson: () => {
    set({ activeLessonId: null, checkpointStates: {} });
    useIdeStore.getState().setView("home");
  },
}));
