import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { VirtualFS } from "../vfs/VirtualFS";
import { getAutoSaveHandle } from "./diskAutoSave";
import { useProjectStore } from "./projectStore";
import type { ProjectFileChanged } from "./types";

export async function attachWatcherBridge(vfs: VirtualFS): Promise<() => void> {
  const unlisten = await listen<ProjectFileChanged>("project-file-changed", async (event) => {
    const { relPath, exists, projectId } = event.payload;
    const { projects, activeProjectId } = useProjectStore.getState();

    // Late event from a previous watcher? Rust captures the project id at
    // `watcher_start` time in the closure, so a debounced event for project
    // A may arrive after we have already switched to project B. Applying
    // the change to B's VFS would produce mysterious writes.
    if (projectId !== activeProjectId) return;

    const active = projects.find((p) => p.id === activeProjectId);
    if (!active) return;

    const autosave = getAutoSaveHandle();

    if (!exists) {
      if (vfs.readFile(relPath) === null) return;
      autosave?.markExternalDelete(relPath);
      try {
        vfs.deleteFile(relPath);
      } catch (err) {
        console.warn("watcher delete ignored", relPath, err);
      }
      return;
    }

    try {
      const content = await invoke<string>("fs_read_file", {
        projectPath: active.path,
        relPath,
      });
      // Re-check the active project after awaiting the read — the user may
      // have switched in the meantime.
      if (useProjectStore.getState().activeProjectId !== projectId) return;
      autosave?.markExternalWrite(relPath, content);
      vfs.writeFile(relPath, content);
    } catch (err) {
      console.warn("watcher read failed", relPath, err);
    }
  });
  return unlisten;
}
