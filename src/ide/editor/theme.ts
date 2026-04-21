import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";

/**
 * Syntax highlighting: we map Lezer tags to CSS classes instead of hard-coded
 * colours so the live palette in `src/styles/global.css` (oklch tokens + the
 * `.t-*` selectors under `.code-editor`) stays the single source of truth.
 * CodeMirror base styling (background, gutters, selection, caret) lives in the
 * same CSS file.
 */
const wecodeHighlight = HighlightStyle.define([
  { tag: t.tagName, class: "t-tag" },
  { tag: t.attributeName, class: "t-attr" },
  { tag: [t.string, t.special(t.string)], class: "t-str" },
  { tag: [t.keyword, t.modifier, t.operatorKeyword], class: "t-kw" },
  { tag: [t.number, t.bool, t.null], class: "t-num" },
  { tag: [t.comment, t.lineComment, t.blockComment], class: "t-com" },
  { tag: t.propertyName, class: "t-prop" },
  { tag: [t.unit, t.atom, t.variableName], class: "t-val" },
  { tag: [t.punctuation, t.bracket, t.angleBracket, t.brace, t.paren], class: "t-punct" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], class: "t-fn" },
]);

export const editorTheme: Extension = syntaxHighlighting(wecodeHighlight);
