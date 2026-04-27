import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";

export function LessonPathSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Continue your path</h3>
      </div>
      <EmptyState
        icon={<IconSparkle />}
        title="Coming soon"
        subtitle="HTML, CSS and JS lessons will be published in upcoming versions."
      />
    </section>
  );
}
