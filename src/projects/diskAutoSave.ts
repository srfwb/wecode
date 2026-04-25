import { invoke } from "@tauri-apps/api/core";

import { toast } from "../ide/shell/toastStore";
import { persistenceEvents } from "../vfs/persistence";
import type { VirtualFS } from "../vfs/VirtualFS";
import { useProjectStore } from "./projectStore";

const SAVE_DEBOUNCE_MS = 500;

type Job = { kind: "write"; content: string } | { kind: "delete" };

interface AutoSaveHandle {
  dispose: () => void;
  flush: () => Promise<void>;
  markBaseline: (files: Record<string, string>) => void;
  markExternalWrite: (relPath: string, content: string) => void;
  markExternalDelete: (relPath: string) => void;
}

export function attachDiskAutoSave(vfs: VirtualFS): AutoSaveHandle {
  const queue = new Map<string, Job>();
  const lastSynced = new Map<string, string>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inflight: Promise<void> | null = null;

  const scheduleFlush = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  };

  const flush = async (): Promise<void> => {
    if (inflight) {
      await inflight;
      return;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (queue.size === 0) return;

    const { projects, activeProjectId } = useProjectStore.getState();
    const meta = projects.find((p) => p.id === activeProjectId);
    if (!meta) {
      queue.clear();
      return;
    }

    const jobs = Array.from(queue.entries());
    queue.clear();

    const run = async () => {
      for (const [relPath, op] of jobs) {
        try {
          if (op.kind === "write") {
            await invoke("fs_write_file", {
              projectPath: meta.path,
              relPath,
              content: op.content,
            });
            lastSynced.set(relPath, op.content);
          } else {
            await invoke("fs_delete_file", { projectPath: meta.path, relPath });
            lastSynced.delete(relPath);
          }
        } catch (err) {
          console.error("disk autosave job failed", relPath, err);
          toast.error(`Impossible de sauvegarder ${relPath} sur le disque.`);
        }
      }
      const paths = vfs.listFiles();
      const lineCount = paths.reduce(
        (acc, p) => acc + ((vfs.readFile(p) ?? "").match(/\n/g)?.length ?? 0),
        0,
      );
      useProjectStore.getState().patchStats(meta.id, paths.length, lineCount);
      persistenceEvents.dispatchEvent(new CustomEvent("saved", { detail: { at: Date.now() } }));
    };

    inflight = run().finally(() => {
      inflight = null;
    });
    await inflight;
  };

  const off = vfs.on("change", (ev) => {
    switch (ev.kind) {
      case "create":
      case "write": {
        const content = vfs.readFile(ev.path) ?? "";
        if (lastSynced.get(ev.path) === content) return;
        queue.set(ev.path, { kind: "write", content });
        break;
      }
      case "delete": {
        if (!lastSynced.has(ev.path) && !queue.has(ev.path)) return;
        queue.set(ev.path, { kind: "delete" });
        break;
      }
      case "rename": {
        const oldPath = ev.oldPath;
        if (oldPath && lastSynced.has(oldPath)) {
          queue.set(oldPath, { kind: "delete" });
        }
        const content = vfs.readFile(ev.path) ?? "";
        queue.set(ev.path, { kind: "write", content });
        break;
      }
    }
    scheduleFlush();
  });

  return {
    dispose: () => {
      off();
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    flush,
    markBaseline: (files) => {
      lastSynced.clear();
      for (const [path, content] of Object.entries(files)) {
        lastSynced.set(path, content);
      }
    },
    markExternalWrite: (relPath, content) => {
      lastSynced.set(relPath, content);
    },
    markExternalDelete: (relPath) => {
      lastSynced.delete(relPath);
    },
  };
}

let singleton: AutoSaveHandle | null = null;

export function setAutoSaveHandle(handle: AutoSaveHandle | null): void {
  singleton = handle;
}

export function getAutoSaveHandle(): AutoSaveHandle | null {
  return singleton;
}
