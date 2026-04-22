import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";

export function TemplatesSection() {
  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Commence un nouveau projet</h3>
      </div>
      <EmptyState
        icon={<IconSparkle />}
        title="Modèles bientôt disponibles"
        subtitle="Tu pourras partir d'un dossier vierge ou d'un squelette préconfiguré."
      />
    </section>
  );
}
