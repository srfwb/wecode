import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";

export function LessonPathSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Continue le parcours</h3>
      </div>
      <EmptyState
        icon={<IconSparkle />}
        title="Parcours à venir"
        subtitle="Les leçons HTML, CSS et JS seront publiées dans les prochaines versions."
      />
    </section>
  );
}
