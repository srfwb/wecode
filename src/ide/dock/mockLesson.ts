export type CheckpointStatus = "done" | "active" | "todo";

export interface Checkpoint {
  label: string;
  status: CheckpointStatus;
  meta?: string;
}

export interface LessonParagraph {
  /** HTML string. Trusted — origin is bundled source, never user input. */
  html: string;
}

export interface LessonContent {
  chipNumber: string;
  chipLabel: string;
  heading: string;
  paragraphs: LessonParagraph[];
  checkpoints: Checkpoint[];
  hintFooter?: string;
}

/**
 * Mock content for PR 2 — dock UI shell only. No validation, no progression
 * logic. When the real lesson engine lands (separate milestone), this file
 * goes away and the dock consumes a proper `Lesson` loaded from disk or
 * remote.
 */
export const MOCK_LESSON: LessonContent = {
  chipNumber: "3",
  chipLabel: "Leçon · Mettre en forme la page",
  heading: "Donne un style à ta page",
  paragraphs: [
    {
      html: `Tu as monté le squelette avec du <span class="inline-code">HTML</span>. Passons maintenant au <span class="inline-code">CSS</span> pour contrôler l'aspect visuel — couleurs, typographie, espacements. Le CSS vit dans un fichier séparé, lié depuis ton HTML.`,
    },
    {
      html: `Lie <span class="inline-code">style.css</span> dans le <span class="inline-code">&lt;head&gt;</span> de ta page avec une balise <span class="inline-code">&lt;link&gt;</span>. L'aperçu se met à jour dès que tu modifies le code.`,
    },
  ],
  checkpoints: [
    { label: "Créer un fichier nommé style.css", status: "done", meta: "fait" },
    { label: "Ajouter un sélecteur body", status: "done", meta: "fait" },
    { label: "Lier style.css depuis index.html", status: "active", meta: "vérification…" },
    { label: "Changer la couleur de fond de la page", status: "todo", meta: "—" },
  ],
  hintFooter: "Survole un mot-clé dans l'éditeur pour une explication rapide.",
};
