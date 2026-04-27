import { DEFAULT_FILES } from "../vfs/defaults";
import type { ProjectKind } from "./types";

export type TemplateId = "blank" | "html-css";

export interface Template {
  id: TemplateId;
  title: string;
  description: string;
  kind: ProjectKind;
  tags: string[];
  files: Record<string, string>;
}

const BLANK: Template = {
  id: "blank",
  title: "Blank project",
  description: "Empty project. You choose the files.",
  kind: "blank",
  tags: [],
  files: {},
};

const HTML_CSS: Template = {
  id: "html-css",
  title: "HTML + CSS Starter",
  description: "Two files ready to be styled.",
  kind: "html",
  tags: ["html", "css"],
  files: DEFAULT_FILES,
};

export const TEMPLATES: readonly Template[] = [BLANK, HTML_CSS];

export function getTemplate(id: TemplateId): Template {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`unknown template: ${id}`);
  return template;
}
