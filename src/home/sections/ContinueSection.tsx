import { useProjectStore } from "../../projects/projectStore";
import { IconClock } from "../icons";
import { ContinueCard } from "./ContinueCard";
import { EmptyState } from "./EmptyState";

export function ContinueSection() {
  const projects = useProjectStore((s) => s.projects);
  const project =
    projects.length === 0
      ? null
      : ([...projects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)[0] ?? null);

  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Reprends là où tu t'étais arrêté</h3>
      </div>
      {project ? (
        <ContinueCard project={project} />
      ) : (
        <EmptyState
          icon={<IconClock />}
          title="Aucun projet en cours"
          subtitle="Ouvre ou crée un projet pour le voir apparaître ici."
        />
      )}
    </section>
  );
}
