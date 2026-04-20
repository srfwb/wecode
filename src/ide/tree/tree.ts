export type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

interface FolderBuilder {
  type: "folder";
  name: string;
  path: string;
  children: Map<string, FolderBuilder | { type: "file"; name: string; path: string }>;
}

function emptyFolder(name: string, path: string): FolderBuilder {
  return { type: "folder", name, path, children: new Map() };
}

export function buildTree(paths: string[]): TreeNode[] {
  const root = emptyFolder("", "/");

  for (const fullPath of paths) {
    const segments = fullPath.split("/").slice(1);
    let cursor = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLeaf = i === segments.length - 1;
      const segPath = "/" + segments.slice(0, i + 1).join("/");

      if (isLeaf) {
        cursor.children.set(seg, { type: "file", name: seg, path: segPath });
      } else {
        let next = cursor.children.get(seg);
        if (!next || next.type !== "folder") {
          next = emptyFolder(seg, segPath);
          cursor.children.set(seg, next);
        }
        cursor = next;
      }
    }
  }

  return materialize(root.children);
}

function materialize(children: FolderBuilder["children"]): TreeNode[] {
  const folders: TreeNode[] = [];
  const files: TreeNode[] = [];
  for (const node of children.values()) {
    if (node.type === "folder") {
      folders.push({
        type: "folder",
        name: node.name,
        path: node.path,
        children: materialize(node.children),
      });
    } else {
      files.push(node);
    }
  }
  const byName = (a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name);
  folders.sort(byName);
  files.sort(byName);
  return [...folders, ...files];
}
