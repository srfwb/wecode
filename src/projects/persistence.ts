import { persistedStore } from "../tauri/persistedStore";
import { useProjectStore } from "./projectStore";
import type { PersistedProjectsIndex } from "./types";

const INDEX_STORE_KEY = "projects.v1";
const SAVE_DEBOUNCE_MS = 300;

const getStore = persistedStore("wecode.projects.json");

export async function loadProjectsIndex(): Promise<PersistedProjectsIndex | null> {
  const store = await getStore();
  const persisted = await store.get<PersistedProjectsIndex>(INDEX_STORE_KEY);
  if (!persisted) return null;
  if (persisted.version !== 1) return null;
  return persisted;
}

export async function saveProjectsIndex(index: PersistedProjectsIndex): Promise<void> {
  const store = await getStore();
  await store.set(INDEX_STORE_KEY, index);
  await store.save();
}

export function attachProjectsIndexAutoSave(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    const { projects, activeProjectId } = useProjectStore.getState();
    await saveProjectsIndex({ version: 1, projects, activeProjectId });
  };

  return useProjectStore.subscribe((state, prev) => {
    if (state.projects === prev.projects && state.activeProjectId === prev.activeProjectId) {
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  });
}
