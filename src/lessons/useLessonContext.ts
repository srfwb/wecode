import { createContext, useContext } from "react";

import type { CheckpointState, LessonData } from "./types";

export interface LessonContextValue {
  lesson: LessonData;
  checkpoints: CheckpointState[];
  currentStepIndex: number;
  fileOpsLocked: boolean;
  progress: number;
  validateNow: () => void;
  exitLesson: () => void;
}

export const LessonContext = createContext<LessonContextValue | null>(null);

export function useLessonContext(): LessonContextValue | null {
  return useContext(LessonContext);
}
