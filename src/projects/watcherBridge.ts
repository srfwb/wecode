import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { VirtualFS } from "../vfs/VirtualFS";
import { getAutoSaveHandle } from "./diskAutoSave";
import { useProjectStore } from "./projectStore";
import type { ProjectFileChanged } from "./types";

export async function attachWatcherBridge(vfs: VirtualFS): Promise<() => void> {
  const unlisten = await listen<ProjectFileChanged>("project-file-changed", async (event) => {
    const { projects, activeProjectId } = useProjectStore.getState();
    const active = projects.find((p) => p.id === activeProjectId);
    if (!active) return;

    const { relPath, exists } = event.payload;
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
      autosave?.markExternalWrite(relPath, content);
      vfs.writeFile(relPath, content);
    } catch (err) {
      console.warn("watcher read failed", relPath, err);
    }
  });
  return unlisten;
}
