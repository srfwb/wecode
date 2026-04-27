import { useProjectModalStore } from "../projects/ui/modalStore";

// Global actions surfaced in the palette's "Commands" section. v1 ships the
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
    title: "New project",
    subtitle: "From a template",
    pill: "command",
    run: () => {
      useProjectModalStore.getState().openCreate({ templateId: "html-css" });
    },
  },
];
