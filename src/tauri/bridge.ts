import { convertFileSrc, invoke } from "@tauri-apps/api/core";

import type { VirtualFS } from "../vfs/VirtualFS";
import type { VfsSnapshot } from "./protocol";

const SYNC_DEBOUNCE_MS = 100;

export function previewUrl(): string {
  return convertFileSrc("preview/index.html", "wecode");
}

export async function syncVfs(snapshot: VfsSnapshot): Promise<void> {
  await invoke("sync_vfs", { files: snapshot });
}

export function attachVfsBridge(vfs: VirtualFS): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    try {
      await syncVfs(vfs.snapshot());
    } catch (err) {
      console.error("sync_vfs failed", err);
    }
  };

  // Push the initial snapshot immediately so the preview iframe has something
  // to serve on first render.
  void flush();

  return vfs.on("change", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SYNC_DEBOUNCE_MS);
  });
}
