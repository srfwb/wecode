export type VFSChangeKind = "write" | "create" | "delete" | "rename";

export interface VFSChange {
  kind: VFSChangeKind;
  path: string;
  oldPath?: string;
}

export type VFSEventMap = {
  change: VFSChange;
};
