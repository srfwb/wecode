import type { MatchMode } from "../types";

const RULE_RE = /([^{}]+)\{([^}]*)\}/g;

function findCssRules(css: string): Array<{ selector: string; body: string }> {
  const results: Array<{ selector: string; body: string }> = [];
  let match;
  while ((match = RULE_RE.exec(css)) !== null) {
    const selector = (match[1] ?? "").trim();
    const body = match[2] ?? "";
    results.push({ selector, body });
  }
  return results;
}

export function checkCssProperty(
  rule: {
    type: "css-property";
    selector: string;
    file: string;
    property: string;
    match: MatchMode;
  },
  files: Record<string, string>,
): boolean {
  const css = files[rule.file];
  if (css === undefined) return false;
  const parsed = findCssRules(css);
  const matching = parsed.find((r) => r.selector === rule.selector);
  if (!matching) return false;
  const propRe = new RegExp(`${rule.property}\\s*:`, "i");
  return propRe.test(matching.body);
}
