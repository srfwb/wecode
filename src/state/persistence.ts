import { load, Store } from "@tauri-apps/plugin-store";

import { useIdeStore } from "./ideStore";

const STORE_PATH = "wecode.ide.json";
const STORE_KEY = "tabs.v1";
const SAVE_DEBOUNCE_MS = 300;

interface PersistedTabs {
  openFiles: string[];
  activeFile: string | null;
}

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load(STORE_PATH, { autoSave: false, defaults: {} });
  }
  return storePromise;
}

export async function loadIdeState(): Promise<void> {
  const store = await getStore();
  const persisted = await store.get<PersistedTabs>(STORE_KEY);
  if (persisted) {
    useIdeStore.getState().hydrate(persisted);
  }
}

export function attachIdeAutoSave(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    const { openFiles, activeFile } = useIdeStore.getState();
    const store = await getStore();
    await store.set(STORE_KEY, { openFiles, activeFile } satisfies PersistedTabs);
    await store.save();
  };

  return useIdeStore.subscribe((state, prev) => {
    if (state.openFiles === prev.openFiles && state.activeFile === prev.activeFile) {
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  });
}
