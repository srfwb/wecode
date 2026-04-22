import { useProjectStore } from "../../projects/projectStore";
import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";

export function RecentProjectsSection() {
  const rawProjects = useProjectStore((s) => s.projects);
  const projects = [...rawProjects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);

  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Projets récents</h3>
        {projects.length > 0 && <span className="home-sec-count">{projects.length}</span>}
      </div>
      {projects.length > 0 ? (
        <div className="home-proj-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconSparkle />}
          title="Pas encore de projets"
          subtitle="La liste de tes projets récents arrivera avec le système de projets."
        />
      )}
    </section>
  );
}
