import { load, Store } from "@tauri-apps/plugin-store";

/**
 * Lazy loader for a `tauri-plugin-store` Store. Centralises the two options
 * we always want: `autoSave: false` (we trigger saves ourselves with an
 * explicit debounce) and `defaults: {}` (required by the plugin's types).
 */
export function persistedStore(path: string): () => Promise<Store> {
  let p: Promise<Store> | null = null;
  return () => {
    if (!p) p = load(path, { autoSave: false, defaults: {} });
    return p;
  };
}
