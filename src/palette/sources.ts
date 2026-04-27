import { toast } from "../ide/shell/toastStore";
import { openProject } from "../projects/actions";
import { useProjectStore } from "../projects/projectStore";
import { useIdeStore } from "../state/ideStore";
import { vfs } from "../vfs/VirtualFS";
import { COMMANDS } from "./commands";
import { iconForFile } from "./iconForFile";
import {
  PALETTE_GROUP_LABELS,
  PALETTE_GROUP_ORDER,
  type PaletteGroup,
  type PaletteItem,
} from "./types";

const MAX_JUMP_ITEMS = 5;

function basename(path: string): string {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  const slash = trimmed.lastIndexOf("/");
  return slash === -1 ? trimmed : trimmed.slice(slash + 1);
}

// Top N projects by `lastOpenedAt`, excluding the active one — the Home "Jump
// back in" section that lets the user hop to a different project in one go.
export function buildJumpItems(): PaletteItem[] {
  const { projects, activeProjectId } = useProjectStore.getState();
  return [...projects]
    .filter((p) => p.id !== activeProjectId)
    .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
    .slice(0, MAX_JUMP_ITEMS)
    .map<PaletteItem>((project) => ({
      id: `jump:${project.id}`,
      group: "jump",
      title: project.name,
      subtitle: project.path,
      pill: "project",
      icon: {
        glyph: project.kind === "blank" ? "·" : project.kind.toUpperCase().slice(0, 3),
        tone: project.kind,
      },
      onSelect: () => {
        void openProject(project.id);
      },
    }));
}

// Files from the VFS — only populated when an active project is in memory.
// Selecting a row flips the view to IDE (if we were on Home) and opens the
// file via the existing `openFile` store action.
export function buildFileItems(): PaletteItem[] {
  const { activeProjectId } = useProjectStore.getState();
  if (!activeProjectId) return [];

  const paths = vfs.listFiles();
  return paths.map<PaletteItem>((path) => {
    const icon = iconForFile(path);
    return {
      id: `file:${path}`,
      group: "files",
      title: basename(path),
      subtitle: path,
      pill: "file",
      icon,
      onSelect: () => {
        const { view, setView, openFile } = useIdeStore.getState();
        if (view !== "ide") setView("ide");
        openFile(path);
      },
    };
  });
}

// Wraps the typed command registry into palette-shaped rows.
export function buildCommandItems(): PaletteItem[] {
  return COMMANDS.map<PaletteItem>((cmd) => ({
    id: `cmd:${cmd.id}`,
    group: "commands",
    title: cmd.title,
    ...(cmd.subtitle ? { subtitle: cmd.subtitle } : {}),
    ...(cmd.pill ? { pill: cmd.pill } : {}),
    icon: { glyph: "⌘", tone: "cmd" },
    onSelect: () => {
      void cmd.run();
    },
  }));
}

// Single placeholder row so the Lessons section shows up even before the
// curriculum lands. Selecting it toasts "Coming soon".
export function buildLessonItems(): PaletteItem[] {
  return [
    {
      id: "lesson:placeholder",
      group: "lessons",
      title: "Lesson path",
      subtitle: "Coming soon",
      pill: "lesson",
      icon: { glyph: "L", tone: "lesson" },
      onSelect: () => {
        toast.info("Coming soon");
      },
    },
  ];
}

// Orchestrator: assemble every group in the canonical order and drop those
// that came back empty (typically "Files" when no project is active).
export function buildAllGroups(): PaletteGroup[] {
  const bucket: Record<string, PaletteItem[]> = {
    jump: buildJumpItems(),
    files: buildFileItems(),
    commands: buildCommandItems(),
    lessons: buildLessonItems(),
  };
  const groups: PaletteGroup[] = [];
  for (const key of PALETTE_GROUP_ORDER) {
    const items = bucket[key] ?? [];
    if (items.length === 0) continue;
    groups.push({ key, label: PALETTE_GROUP_LABELS[key], items });
  }
  return groups;
}
