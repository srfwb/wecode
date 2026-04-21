import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { Tooltip } from "@codemirror/view";
import { hoverTooltip } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

import { CSS_HINTS, HTML_HINTS, type Hint } from "./hints";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function renderCard(hint: Hint): string {
  return [
    `<div class="hint-card">`,
    `  <h4>`,
    `    <span>${escapeHtml(hint.title)}</span>`,
    `    <span class="kind">${escapeHtml(hint.kindLabel)}</span>`,
    `  </h4>`,
    `  <p>${escapeHtml(hint.body)}</p>`,
    `  <pre class="ex">${escapeHtml(hint.example)}</pre>`,
    `</div>`,
  ].join("\n");
}

function isInsideCss(node: SyntaxNode): boolean {
  let cur: SyntaxNode | null = node;
  while (cur) {
    const name = cur.type.name;
    if (name === "StyleSheet" || name === "Styles") return true;
    cur = cur.parent;
  }
  return false;
}

function resolveHint(state: EditorState, node: SyntaxNode): Hint | null {
  const text = state.sliceDoc(node.from, node.to).toLowerCase();
  const name = node.type.name;
  if (name === "PropertyName") {
    return CSS_HINTS[text] ?? null;
  }
  if (name === "AttributeName") {
    return HTML_HINTS[text] ?? null;
  }
  if (name === "TagName") {
    if (isInsideCss(node)) {
      // CSS type selector — look up in HTML_HINTS since it's the element name.
      return HTML_HINTS[text] ?? null;
    }
    return HTML_HINTS[text] ?? null;
  }
  return null;
}

export const hoverHints = hoverTooltip(
  (view, pos, side): Tooltip | null => {
    const tree = syntaxTree(view.state);
    const node = tree.resolveInner(pos, side);
    const hint = resolveHint(view.state, node);
    if (!hint) return null;

    return {
      pos: node.from,
      end: node.to,
      above: false,
      create: () => {
        const container = document.createElement("div");
        container.className = "hint-card-wrap";
        container.innerHTML = renderCard(hint);
        return { dom: container };
      },
    };
  },
  { hideOnChange: true, hoverTime: 180 },
);
