import { openPath } from "@tauri-apps/plugin-opener";
import { useState } from "react";

import { ContextMenu } from "../../ide/tree/ContextMenu";
import { openProject } from "../../projects/actions";
import { formatRelativeTime } from "../../projects/relativeTime";
import type { ProjectMeta } from "../../projects/types";
import { useProjectModalStore } from "../../projects/ui/modalStore";

interface Props {
  project: ProjectMeta;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: Props) {
  const openRename = useProjectModalStore((s) => s.openRename);
  const openDelete = useProjectModalStore((s) => s.openDelete);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <button
        type="button"
        className="home-proj"
        style={{ "--proj-idx": index } as React.CSSProperties}
        onClick={() => void openProject(project.id)}
        onContextMenu={onContext}
        aria-label={`Ouvrir ${project.name}`}
      >
        <div className={`home-proj-thumb home-proj-thumb--${project.kind}`}>
          <span>{project.kind.toUpperCase()}</span>
        </div>
        <div className="home-proj-info">
          <div className="home-proj-title">{project.name}</div>
          <div className="home-proj-path">{project.path}</div>
          {project.tags.length > 0 && (
            <div className="home-proj-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="home-proj-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="home-proj-when">{formatRelativeTime(project.lastOpenedAt)}</div>
        <span className="home-proj-open">ouvrir ↵</span>
      </button>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: "Ouvrir", onSelect: () => void openProject(project.id) },
            {
              label: "Ouvrir le dossier",
              onSelect: () => void openPath(project.path),
            },
            { label: "Renommer", onSelect: () => openRename({ id: project.id }) },
            {
              label: "Supprimer",
              destructive: true,
              onSelect: () => openDelete({ id: project.id }),
            },
          ]}
        />
      )}
    </>
  );
}
