import { invoke } from "@tauri-apps/api/core";

import { useIdeStore } from "../state/ideStore";
import { syncVfs } from "../tauri/bridge";
import { vfs } from "../vfs/VirtualFS";
import { getAutoSaveHandle } from "./diskAutoSave";
import { useProjectStore } from "./projectStore";
import type { ListedFile, ProjectMeta } from "./types";

export async function loadProjectFilesFromDisk(meta: ProjectMeta): Promise<Record<string, string>> {
  const listed = await invoke<ListedFile[]>("fs_list_project", { projectPath: meta.path });
  const files: Record<string, string> = {};
  for (const entry of listed) {
    if (entry.kind !== "file" || entry.binary) continue;
    const content = await invoke<string>("fs_read_file", {
      projectPath: meta.path,
      relPath: entry.relPath,
    });
    files[entry.relPath] = content;
  }
  return files;
}

export async function openProject(id: string): Promise<void> {
  const autosave = getAutoSaveHandle();
  if (autosave) await autosave.flush();

  try {
    await invoke("watcher_stop");
  } catch (err) {
    console.warn("watcher_stop failed (ignored)", err);
  }

  const meta = useProjectStore.getState().projects.find((p) => p.id === id);
  if (!meta) throw new Error(`unknown project: ${id}`);

  const files = await loadProjectFilesFromDisk(meta);
  vfs.hydrate(files);
  if (autosave) autosave.markBaseline(files);
  await syncVfs(vfs.snapshot());

  try {
    await invoke("watcher_start", { projectPath: meta.path });
  } catch (err) {
    console.warn("watcher_start failed (external changes will not be picked up)", err);
  }

  useProjectStore.getState().setActive(id, { touch: true });
  useIdeStore.getState().setView("ide");
}
