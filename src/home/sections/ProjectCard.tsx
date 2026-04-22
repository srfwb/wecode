import { openProject } from "../../projects/actions";
import { formatRelativeTime } from "../../projects/relativeTime";
import type { ProjectMeta } from "../../projects/types";

interface Props {
  project: ProjectMeta;
}

export function ProjectCard({ project }: Props) {
  return (
    <button
      type="button"
      className="home-proj"
      onClick={() => void openProject(project.id)}
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
  );
}
