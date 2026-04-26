import { persistedStore } from "../tauri/persistedStore";

const PROGRESS_KEY = "progress.v1";
const getStore = persistedStore("wecode.progress.json");

export interface ProgressData {
  version: 1;
  completed: Record<string, { completedAt: number }>;
  checkpoints: Record<string, string[]>;
}

export async function loadProgress(): Promise<ProgressData | null> {
  const store = await getStore();
  const data = await store.get<ProgressData>(PROGRESS_KEY);
  if (!data) return null;
  if (data.version !== 1) return null;
  return data;
}

export async function saveProgress(data: ProgressData): Promise<void> {
  const store = await getStore();
  await store.set(PROGRESS_KEY, data);
  await store.save();
}

export async function markLessonCompleted(
  lessonId: string,
  checkpointIds: string[],
): Promise<void> {
  const existing = await loadProgress();
  const data: ProgressData = existing ?? { version: 1, completed: {}, checkpoints: {} };
  data.completed[lessonId] = { completedAt: Date.now() };
  data.checkpoints[lessonId] = checkpointIds;
  await saveProgress(data);
}

export async function isLessonCompleted(lessonId: string): Promise<boolean> {
  const data = await loadProgress();
  if (!data) return false;
  return lessonId in data.completed;
}
