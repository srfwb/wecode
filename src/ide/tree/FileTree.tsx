import { useCallback, useEffect, useRef, useState } from "react";

import { useModalA11y } from "../../hooks/useModalA11y";
import { useLessonContext } from "../../lessons/useLessonContext";
import { useIdeStore } from "../../state/ideStore";
import { vfs } from "../../vfs/VirtualFS";
import { ConfirmDialog } from "../shell/ConfirmDialog";
import { localizeFileError } from "../shell/fileErrorMessages";
import { FileTypeIcon } from "../shell/FileTypeIcon";
import { SHORTCUT_NEW_FILE, shortcutEvents } from "../shell/shortcuts";
import { toast } from "../shell/toastStore";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { buildTree, type TreeNode } from "./tree";

interface MenuState {
  x: number;
  y: number;
  target: { kind: "file"; path: string } | { kind: "folder"; path: string };
}

interface PromptState {
  kind: "create" | "rename";
  parentPath: string; // folder path; for create-at-root, "/"
  initial: string;
  originalPath?: string; // for rename
}

export function FileTree() {
  const [version, setVersion] = useState(0);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const openFile = useIdeStore((s) => s.openFile);
  const activeFile = useIdeStore((s) => s.activeFile);
  const lessonCtx = useLessonContext();
  const fileOpsLocked = lessonCtx?.fileOpsLocked ?? false;

  // Only restructure the tree when file *set* changes. Ignore plain writes —
  // those fire on every keystroke in the editor and would force rebuildTree
  // / collectVisibleFiles to re-run for nothing.
  useEffect(() => {
    return vfs.on("change", (event) => {
      if (event.kind === "write") return;
      setVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    const onNewFile = () => setPrompt({ kind: "create", parentPath: "/", initial: "" });
    shortcutEvents.addEventListener(SHORTCUT_NEW_FILE, onNewFile);
    return () => shortcutEvents.removeEventListener(SHORTCUT_NEW_FILE, onNewFile);
  }, []);

  const nodes = buildTree(vfs.listFiles());

  const closeMenu = useCallback(() => setMenu(null), []);
  const closePrompt = useCallback(() => setPrompt(null), []);

  const submitPrompt = (name: string) => {
    if (!prompt) return;
    const trimmed = name.trim();
    if (trimmed === "") {
      closePrompt();
      return;
    }
    try {
      if (prompt.kind === "create") {
        const target =
          prompt.parentPath === "/" ? `/${trimmed}` : `${prompt.parentPath}/${trimmed}`;
        vfs.createFile(target);
        openFile(target);
      } else if (prompt.kind === "rename" && prompt.originalPath) {
        const target =
          prompt.parentPath === "/" ? `/${trimmed}` : `${prompt.parentPath}/${trimmed}`;
        vfs.renameFile(prompt.originalPath, target);
      }
    } catch (err) {
      toast.error(localizeFileError(err));
    }
    closePrompt();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    try {
      vfs.deleteFile(pendingDelete);
    } catch (err) {
      toast.error(localizeFileError(err));
    }
    setPendingDelete(null);
  };

  const onRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, target: { kind: "folder", path: "/" } });
  };

  const menuItems: ContextMenuItem[] = menu
    ? buildMenuItems(menu.target, fileOpsLocked, {
        startCreate: (parentPath) => setPrompt({ kind: "create", parentPath, initial: "" }),
        startRename: (path) => {
          const parent = path.includes("/", 1) ? path.slice(0, path.lastIndexOf("/")) || "/" : "/";
          const base = path.slice(path.lastIndexOf("/") + 1);
          setPrompt({ kind: "rename", parentPath: parent, initial: base, originalPath: path });
        },
        deletePath: (path) => setPendingDelete(path),
      })
    : [];

  const startNewFileAtRoot = () => setPrompt({ kind: "create", parentPath: "/", initial: "" });

  const visibleFiles = collectVisibleFiles(nodes);

  const onTreeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
    if (visibleFiles.length === 0) return;

    const index = activeFile ? visibleFiles.indexOf(activeFile) : -1;

    if (e.key === "Enter" && activeFile) {
      e.preventDefault();
      openFile(activeFile);
      return;
    }

    e.preventDefault();
    const step = e.key === "ArrowDown" ? 1 : -1;
    const nextIdx = (index === -1 ? 0 : index + step + visibleFiles.length) % visibleFiles.length;
    const next = visibleFiles[nextIdx];
    if (next) openFile(next);
  };

  return (
    <div
      className="file-tree"
      onContextMenu={onRootContextMenu}
      onKeyDown={onTreeKeyDown}
      tabIndex={0}
      role="tree"
      aria-label="Files"
      data-version={version}
    >
      <div className="sb-rail">
        <span className="label">Files</span>
        <div className="tools">
          {!fileOpsLocked && (
            <button
              type="button"
              className="ico-btn"
              title="New file"
              aria-label="New file"
              onClick={startNewFileAtRoot}
            >
              <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M12 12v6M9 15h6" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <ul className="file-tree__list">
        {nodes.map((node) => (
          <TreeRow
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            onSelect={openFile}
            onContextMenu={(e, target) => {
              e.preventDefault();
              e.stopPropagation();
              setMenu({ x: e.clientX, y: e.clientY, target });
            }}
          />
        ))}
      </ul>
      {nodes.length === 0 && <div className="file-tree__empty">No files</div>}

      <div className="sb-foot">
        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Auto-save active
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={closeMenu} />}

      {prompt && (
        <PromptModal
          title={prompt.kind === "create" ? "New file" : "Rename"}
          initial={prompt.initial}
          allowSlash={prompt.kind === "create"}
          onSubmit={submitPrompt}
          onCancel={closePrompt}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete file"
          message={`Delete ${pendingDelete}? This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

interface TreeRowProps {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  onSelect: (path: string) => void;
  onContextMenu: (
    e: React.MouseEvent,
    target: { kind: "file"; path: string } | { kind: "folder"; path: string },
  ) => void;
}

function TreeRow({ node, depth, activeFile, onSelect, onContextMenu }: TreeRowProps) {
  const indent = { paddingLeft: 8 + depth * 12 };

  if (node.type === "folder") {
    return (
      <li>
        <div
          className="file-tree__row file-tree__row--folder"
          style={indent}
          onContextMenu={(e) => onContextMenu(e, { kind: "folder", path: node.path })}
        >
          <FileTypeIcon path={node.path} folder />
          <span>{node.name}</span>
        </div>
        <ul className="file-tree__list">
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      </li>
    );
  }

  const isActive = node.path === activeFile;
  return (
    <li>
      <div
        className={isActive ? "file-tree__row file-tree__row--active" : "file-tree__row"}
        style={indent}
        onClick={() => onSelect(node.path)}
        onContextMenu={(e) => onContextMenu(e, { kind: "file", path: node.path })}
      >
        <FileTypeIcon path={node.path} />
        <span>{node.name}</span>
      </div>
    </li>
  );
}

function collectVisibleFiles(nodes: TreeNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.type === "file") out.push(node.path);
    else out.push(...collectVisibleFiles(node.children));
  }
  return out;
}

function buildMenuItems(
  target: MenuState["target"],
  fileOpsLocked: boolean,
  actions: {
    startCreate: (parentPath: string) => void;
    startRename: (path: string) => void;
    deletePath: (path: string) => void;
  },
): ContextMenuItem[] {
  if (fileOpsLocked) {
    if (target.kind === "folder") return [];
    return [
      {
        label: "Open",
        onSelect: () => useIdeStore.getState().openFile(target.path),
      },
    ];
  }
  if (target.kind === "folder") {
    return [{ label: "New file", onSelect: () => actions.startCreate(target.path) }];
  }
  return [
    { label: "Rename", onSelect: () => actions.startRename(target.path) },
    { label: "Delete", destructive: true, onSelect: () => actions.deletePath(target.path) },
  ];
}

interface PromptModalProps {
  title: string;
  initial: string;
  // Renaming may not introduce slashes (that would relocate the file via the
  // modal — surprising). Creating is allowed to accept a slashed path so
  // users can create `src/app.js` in one go.
  allowSlash: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const FORBIDDEN_NAME_CHARS = /[\\:*?"<>|]/;

function validatePromptValue(value: string, allowSlash: boolean): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (!allowSlash && trimmed.includes("/")) {
    return 'The name cannot contain "/".';
  }
  if (FORBIDDEN_NAME_CHARS.test(trimmed)) {
    return "Forbidden character in name.";
  }
  for (const segment of trimmed.split("/")) {
    if (segment === "." || segment === "..") {
      return 'The name cannot contain "." or "..".';
    }
  }
  return "";
}

function PromptModal({ title, initial, allowSlash, onSubmit, onCancel }: PromptModalProps) {
  const [value, setValue] = useState(initial);
  const modalRef = useRef<HTMLFormElement>(null);
  useModalA11y(modalRef, { onClose: onCancel });

  const error = validatePromptValue(value, allowSlash);
  const canSubmit = value.trim().length > 0 && !error;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        ref={modalRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onSubmit(value);
        }}
      >
        <div id="prompt-modal-title" className="modal__title">
          {title}
        </div>
        <label className="modal__field">
          <input
            autoFocus
            className="modal__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="file name"
          />
          {error && <span className="modal__error">{error}</span>}
        </label>
        <div className="modal__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit}>
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
