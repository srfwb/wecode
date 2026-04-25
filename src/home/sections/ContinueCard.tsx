import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { IconChevronRight } from "../icons";
import { openProject } from "../../projects/actions";
import { formatRelativeTime } from "../../projects/relativeTime";
import type { ProjectMeta } from "../../projects/types";

interface Props {
  project: ProjectMeta;
}

export function ContinueCard({ project }: Props) {
  return (
    <div className="home-continue">
      <div className="home-continue-main">
        <div className="home-continue-eyebrow">
          <span className="home-continue-pulse" aria-hidden="true" />
          Reprends là où tu t'étais arrêté
        </div>
        <h2 className="home-continue-title">{project.name}</h2>
        <p className="home-continue-sub">
          <span className="home-continue-meta">
            {project.fileCount} fichier{project.fileCount > 1 ? "s" : ""} · {project.lineCount}{" "}
            ligne{project.lineCount > 1 ? "s" : ""}
          </span>
          <span className="home-continue-meta">
            modifié {formatRelativeTime(project.lastOpenedAt)}
          </span>
        </p>
      </div>
      <div className="home-continue-actions">
        <button
          type="button"
          className="home-btn home-btn--primary"
          onClick={() => void openProject(project.id)}
        >
          Continuer
          <IconChevronRight />
        </button>
        <button
          type="button"
          className="home-btn home-btn--ghost"
          onClick={() => void revealItemInDir(project.path)}
        >
          Ouvrir le dossier
        </button>
      </div>
    </div>
  );
}
