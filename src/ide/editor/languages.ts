import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import type { Extension } from "@codemirror/state";

import { extname } from "../../vfs/paths";

export function languageFor(path: string): Extension[] {
  switch (extname(path).toLowerCase()) {
    case ".html":
    case ".htm":
      return [html()];
    case ".css":
      return [css()];
    default:
      return [];
  }
}
