import { useCallback, useEffect, useState } from "react";

import { useIdeStore } from "../../state/ideStore";
import { vfs } from "../../vfs/VirtualFS";
import { ConfirmDialog } from "../shell/ConfirmDialog";
import { FileTypeIcon } from "../shell/FileTypeIcon";
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

  useEffect(() => vfs.on("change", () => setVersion((v) => v + 1)), []);

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
      toast.error((err as Error).message);
    }
    closePrompt();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    try {
      vfs.deleteFile(pendingDelete);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setPendingDelete(null);
  };

  const onRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, target: { kind: "folder", path: "/" } });
  };

  const menuItems: ContextMenuItem[] = menu
    ? buildMenuItems(menu.target, {
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

  return (
    <div className="file-tree" onContextMenu={onRootContextMenu} data-version={version}>
      <div className="sb-rail">
        <span className="label">Fichiers</span>
        <div className="tools">
          <button
            type="button"
            className="ico-btn"
            title="Nouveau fichier"
            aria-label="Nouveau fichier"
            onClick={startNewFileAtRoot}
          >
            <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
              <path d="M12 12v6M9 15h6" />
            </svg>
          </button>
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
      {nodes.length === 0 && <div className="file-tree__empty">Aucun fichier</div>}

      <div className="sb-foot">
        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Sauvegarde auto active
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={closeMenu} />}

      {prompt && (
        <PromptModal
          title={prompt.kind === "create" ? "Nouveau fichier" : "Renommer"}
          initial={prompt.initial}
          onSubmit={submitPrompt}
          onCancel={closePrompt}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer le fichier"
          message={`Supprimer ${pendingDelete} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
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

function buildMenuItems(
  target: MenuState["target"],
  actions: {
    startCreate: (parentPath: string) => void;
    startRename: (path: string) => void;
    deletePath: (path: string) => void;
  },
): ContextMenuItem[] {
  if (target.kind === "folder") {
    return [{ label: "Nouveau fichier", onSelect: () => actions.startCreate(target.path) }];
  }
  return [
    { label: "Renommer", onSelect: () => actions.startRename(target.path) },
    { label: "Supprimer", destructive: true, onSelect: () => actions.deletePath(target.path) },
  ];
}

interface PromptModalProps {
  title: string;
  initial: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

function PromptModal({ title, initial, onSubmit, onCancel }: PromptModalProps) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
      >
        <div className="modal__title">{title}</div>
        <input
          autoFocus
          className="modal__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="nom du fichier"
        />
        <div className="modal__actions">
          <button type="button" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit">Valider</button>
        </div>
      </form>
    </div>
  );
}
