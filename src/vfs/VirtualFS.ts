import type { VFSChange, VFSEventMap } from "./events";
import { normalize } from "./paths";

type Listener<K extends keyof VFSEventMap> = (event: VFSEventMap[K]) => void;

export class VirtualFS {
  private files = new Map<string, string>();
  private changeListeners = new Set<Listener<"change">>();

  readFile(rawPath: string): string | null {
    const p = normalize(rawPath);
    return this.files.get(p) ?? null;
  }

  writeFile(rawPath: string, content: string): void {
    const p = normalize(rawPath);
    const existed = this.files.has(p);
    this.files.set(p, content);
    this.emit({ kind: existed ? "write" : "create", path: p });
  }

  createFile(rawPath: string, content = ""): void {
    const p = normalize(rawPath);
    if (this.files.has(p)) {
      throw new Error(`file already exists: ${p}`);
    }
    this.files.set(p, content);
    this.emit({ kind: "create", path: p });
  }

  deleteFile(rawPath: string): void {
    const p = normalize(rawPath);
    if (!this.files.has(p)) {
      throw new Error(`file not found: ${p}`);
    }
    this.files.delete(p);
    this.emit({ kind: "delete", path: p });
  }

  renameFile(fromRaw: string, toRaw: string): void {
    const from = normalize(fromRaw);
    const to = normalize(toRaw);
    if (!this.files.has(from)) {
      throw new Error(`file not found: ${from}`);
    }
    if (this.files.has(to)) {
      throw new Error(`target already exists: ${to}`);
    }
    const content = this.files.get(from);
    if (content === undefined) {
      throw new Error(`file not found: ${from}`);
    }
    this.files.delete(from);
    this.files.set(to, content);
    this.emit({ kind: "rename", path: to, oldPath: from });
  }

  listFiles(): string[] {
    return Array.from(this.files.keys()).sort();
  }

  snapshot(): Record<string, string> {
    return Object.fromEntries(this.files);
  }

  hydrate(files: Record<string, string>): void {
    this.files.clear();
    for (const [rawPath, content] of Object.entries(files)) {
      const p = normalize(rawPath);
      this.files.set(p, content);
    }
  }

  on<K extends keyof VFSEventMap>(evt: K, cb: Listener<K>): () => void {
    if (evt !== "change") {
      throw new Error(`unknown event: ${String(evt)}`);
    }
    const listener = cb as Listener<"change">;
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  private emit(change: VFSChange): void {
    for (const cb of this.changeListeners) {
      cb(change);
    }
  }
}

export const vfs = new VirtualFS();
