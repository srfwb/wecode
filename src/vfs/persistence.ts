import { persistedStore } from "../tauri/persistedStore";
import { DEFAULT_FILES } from "./defaults";
import type { VirtualFS } from "./VirtualFS";

const STORE_KEY = "vfs.v1";
const SAVE_DEBOUNCE_MS = 500;

const getStore = persistedStore("wecode.store.json");

export async function loadIntoVfs(vfs: VirtualFS): Promise<void> {
  const store = await getStore();
  const persisted = await store.get<Record<string, string>>(STORE_KEY);
  if (persisted && Object.keys(persisted).length > 0) {
    vfs.hydrate(persisted);
    return;
  }
  vfs.hydrate(DEFAULT_FILES);
  await store.set(STORE_KEY, DEFAULT_FILES);
  await store.save();
}

export function attachAutoSave(vfs: VirtualFS): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    const store = await getStore();
    await store.set(STORE_KEY, vfs.snapshot());
    await store.save();
  };

  const off = vfs.on("change", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  });

  return () => {
    off();
    if (timer) clearTimeout(timer);
  };
}
