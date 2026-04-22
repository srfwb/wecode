import { TEMPLATES } from "../../projects/templates";
import { TemplateCard } from "./TemplateCard";

export function TemplatesSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Commence un nouveau projet</h3>
      </div>
      <div className="home-tpl-grid">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </section>
  );
}
