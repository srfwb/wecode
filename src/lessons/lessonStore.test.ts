import { beforeEach, describe, expect, test } from "vitest";

import { useIdeStore } from "../state/ideStore";
import { vfs } from "../vfs/VirtualFS";
import { useLessonStore } from "./lessonStore";

describe("useLessonStore", () => {
  beforeEach(() => {
    useLessonStore.setState({ activeLessonId: null, checkpointStates: {} });
    useIdeStore.setState({ view: "home", openFiles: [], activeFile: null });
    vfs.hydrate({});
  });

  test("startLesson hydrates VFS and sets view to lesson", () => {
    useLessonStore.getState().startLesson("html-01-structure");
    expect(useLessonStore.getState().activeLessonId).toBe("html-01-structure");
    expect(useIdeStore.getState().view).toBe("lesson");
    // Starter files should be in VFS
    expect(vfs.listFiles().length).toBeGreaterThan(0);
  });

  test("startLesson initializes all checkpoints to todo", () => {
    useLessonStore.getState().startLesson("html-01-structure");
    const states = useLessonStore.getState().checkpointStates;
    expect(Object.keys(states).length).toBeGreaterThan(0);
    for (const status of Object.values(states)) {
      expect(status).toBe("todo");
    }
  });

  test("completeCheckpoint transitions a checkpoint to done", () => {
    useLessonStore.getState().startLesson("html-01-structure");
    useLessonStore.getState().completeCheckpoint("has-head");
    expect(useLessonStore.getState().checkpointStates["has-head"]).toBe("done");
  });

  test("exitLesson clears state and sets view to home", () => {
    useLessonStore.getState().startLesson("html-01-structure");
    useLessonStore.getState().exitLesson();
    expect(useLessonStore.getState().activeLessonId).toBeNull();
    expect(useIdeStore.getState().view).toBe("home");
  });

  test("resetLesson re-initializes checkpoints and re-hydrates VFS", () => {
    useLessonStore.getState().startLesson("html-01-structure");
    useLessonStore.getState().completeCheckpoint("has-head");
    useLessonStore.getState().resetLesson("html-01-structure");
    expect(useLessonStore.getState().checkpointStates["has-head"]).toBe("todo");
  });
});
