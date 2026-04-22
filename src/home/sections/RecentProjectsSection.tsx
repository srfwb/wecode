import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";

export function RecentProjectsSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Projets récents</h3>
      </div>
      <EmptyState
        icon={<IconSparkle />}
        title="Pas encore de projets"
        subtitle="La liste de tes projets récents arrivera avec le système de projets."
      />
    </section>
  );
}
