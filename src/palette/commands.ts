import { useProjectModalStore } from "../projects/ui/modalStore";

// Global actions surfaced in the palette's "Commandes" section. v1 ships the
// Home-relevant shortcuts only; `reloadPreview`, `goHome` and friends will
// land when the palette works from the IDE too.
export interface PaletteCommand {
  id: string;
  title: string;
  subtitle?: string;
  pill?: string;
  run: () => void | Promise<void>;
}

export const COMMANDS: readonly PaletteCommand[] = [
  {
    id: "open-create-project",
    title: "Nouveau projet",
    subtitle: "Partir d'un modèle",
    pill: "commande",
    run: () => {
      useProjectModalStore.getState().openCreate({ templateId: "html-css" });
    },
  },
];
