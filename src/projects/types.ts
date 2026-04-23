export type ProjectKind = "html" | "css" | "js" | "game" | "blank";

export interface ProjectMeta {
  id: string;
  name: string;
  path: string;
  kind: ProjectKind;
  tags: string[];
  createdAt: number;
  lastOpenedAt: number;
  fileCount: number;
  lineCount: number;
}

export interface PersistedProjectsIndex {
  version: 1;
  projects: ProjectMeta[];
  activeProjectId: string | null;
}

export interface ListedFile {
  relPath: string;
  bytes: number;
  kind: "file" | "dir";
  binary: boolean;
}

export interface ProjectFileChanged {
  relPath: string;
  exists: boolean;
  // Project id captured at the Rust-side `watcher_start` call. The frontend
  // uses this to ignore late events from a watcher for a project that is no
  // longer active.
  projectId: string;
}
