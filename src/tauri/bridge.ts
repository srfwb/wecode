import { invoke } from "@tauri-apps/api/core";

import type { VirtualFS } from "../vfs/VirtualFS";
import type { VfsSnapshot } from "./protocol";

const SYNC_DEBOUNCE_MS = 30;

// Tauri exposes custom URI schemes differently per platform.
// Windows / Android: http://<scheme>.localhost/<path>
// macOS / iOS / Linux: <scheme>://localhost/<path>
// We construct the URL by hand because @tauri-apps/api `convertFileSrc`
// percent-encodes path separators (turning `preview/index.html` into
// `preview%2Findex.html`), which breaks both routing and relative-URL
// resolution inside the iframe.
function previewOrigin(): string {
  const ua = navigator.userAgent;
  if (/Windows|Android/i.test(ua)) {
    return "http://wecode.localhost";
  }
  return "wecode://localhost";
}

export function previewUrl(): string {
  return `${previewOrigin()}/preview/index.html`;
}

export async function syncVfs(snapshot: VfsSnapshot): Promise<void> {
  await invoke("sync_vfs", { files: snapshot });
}

// Bridge events — fires `synced` after every successful sync_vfs invoke so
// downstream consumers (the preview iframe) can reload as soon as the latest
// VFS snapshot has reached the Rust handler. Using a plain EventTarget avoids
// pulling in a state library for what is essentially a singleton signal.
export const bridgeEvents = new EventTarget();

export async function attachVfsBridge(vfs: VirtualFS): Promise<() => void> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    timer = null;
    try {
      await syncVfs(vfs.snapshot());
      bridgeEvents.dispatchEvent(new Event("synced"));
    } catch (err) {
      console.error("sync_vfs failed", err);
    }
  };

  // Await the initial snapshot so the preview iframe has something to serve
  // before the first render.
  await flush();

  return vfs.on("change", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SYNC_DEBOUNCE_MS);
  });
}
