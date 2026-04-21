export type CheckpointStatus = "done" | "active" | "todo";

export interface Checkpoint {
  id: string;
  label: string;
  status: CheckpointStatus;
  meta?: string;
}

export type LessonPart = { kind: "text"; value: string } | { kind: "code"; value: string };

export interface LessonParagraph {
  parts: LessonPart[];
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
      parts: [
        { kind: "text", value: "Tu as monté le squelette avec du " },
        { kind: "code", value: "HTML" },
        { kind: "text", value: ". Passons maintenant au " },
        { kind: "code", value: "CSS" },
        {
          kind: "text",
          value:
            " pour contrôler l'aspect visuel — couleurs, typographie, espacements. Le CSS vit dans un fichier séparé, lié depuis ton HTML.",
        },
      ],
    },
    {
      parts: [
        { kind: "text", value: "Lie " },
        { kind: "code", value: "style.css" },
        { kind: "text", value: " dans le " },
        { kind: "code", value: "<head>" },
        { kind: "text", value: " de ta page avec une balise " },
        { kind: "code", value: "<link>" },
        { kind: "text", value: ". L'aperçu se met à jour dès que tu modifies le code." },
      ],
    },
  ],
  checkpoints: [
    {
      id: "create-stylesheet",
      label: "Créer un fichier nommé style.css",
      status: "done",
      meta: "fait",
    },
    { id: "body-selector", label: "Ajouter un sélecteur body", status: "done", meta: "fait" },
    {
      id: "link-stylesheet",
      label: "Lier style.css depuis index.html",
      status: "active",
      meta: "vérification…",
    },
    {
      id: "change-bg",
      label: "Changer la couleur de fond de la page",
      status: "todo",
      meta: "—",
    },
  ],
  hintFooter: "Survole un mot-clé dans l'éditeur pour une explication rapide.",
};
