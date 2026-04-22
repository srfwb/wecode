import { IconClock } from "../icons";
import { EmptyState } from "./EmptyState";

export function ContinueSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Reprends là où tu t'étais arrêté</h3>
      </div>
      <EmptyState
        icon={<IconClock />}
        title="Aucun projet en cours"
        subtitle="Ouvre ou crée un projet pour le voir apparaître ici."
      />
    </section>
  );
}
