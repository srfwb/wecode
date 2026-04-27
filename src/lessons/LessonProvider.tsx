import { useCallback, useEffect, useMemo, useRef } from "react";

import { vfs } from "../vfs/VirtualFS";
import { getLessonById } from "./data";
import { useLessonStore } from "./lessonStore";
import { markLessonCompleted } from "./progressPersistence";
import type { CheckpointState } from "./types";
import { LessonContext } from "./useLessonContext";
import type { LessonContextValue } from "./useLessonContext";
import { validateCheckpoints } from "./validation/validate";

interface LessonProviderProps {
  children: React.ReactNode;
}

export function LessonProvider({ children }: LessonProviderProps) {
  const activeLessonId = useLessonStore((s) => s.activeLessonId);
  const checkpointStates = useLessonStore((s) => s.checkpointStates);
  const lesson = activeLessonId ? getLessonById(activeLessonId) : undefined;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runValidation = useCallback(() => {
    if (!lesson) return;

    const allCheckpoints = lesson.steps.flatMap((step) => step.checkpoints);
    const files = vfs.snapshot();
    const results = validateCheckpoints(allCheckpoints, files);
    const { completeCheckpoint, checkpointStates: currentStates } = useLessonStore.getState();

    for (const result of results) {
      if (result.passed && currentStates[result.checkpointId] !== "done") {
        completeCheckpoint(result.checkpointId);
      }
    }

    // Check if all checkpoints are now done → persist completion
    const updatedStates = useLessonStore.getState().checkpointStates;
    const allDone = allCheckpoints.every((cp) => updatedStates[cp.id] === "done");
    if (allDone && activeLessonId) {
      const doneIds = allCheckpoints.map((cp) => cp.id);
      void markLessonCompleted(activeLessonId, doneIds);
    }
  }, [lesson, activeLessonId]);

  // Subscribe to VFS changes with 300ms debounce
  useEffect(() => {
    if (!lesson) return;

    // Run an initial validation on mount
    runValidation();

    const unsub = vfs.on("change", () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(runValidation, 300);
    });

    return () => {
      unsub();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [lesson, runValidation]);

  const value = useMemo((): LessonContextValue | null => {
    if (!lesson) return null;

    const allCheckpoints = lesson.steps.flatMap((step) => step.checkpoints);

    const checkpoints: CheckpointState[] = allCheckpoints.map((cp) => ({
      id: cp.id,
      status: checkpointStates[cp.id] ?? "todo",
    }));

    const doneCount = checkpoints.filter((cp) => cp.status === "done").length;
    const total = checkpoints.length;
    const progress = total > 0 ? doneCount / total : 0;

    return {
      lesson,
      checkpoints,
      currentStepIndex: 0,
      fileOpsLocked: !lesson.allowFileOps,
      progress,
      validateNow: runValidation,
      exitLesson: () => useLessonStore.getState().exitLesson(),
    };
  }, [lesson, checkpointStates, runValidation]);

  if (!value) return null;

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
