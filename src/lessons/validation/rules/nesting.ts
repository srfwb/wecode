export function checkNesting(
  rule: { type: "nesting"; parent: string; child: string; direct?: boolean; file: string },
  files: Record<string, string>,
): boolean {
  const html = files[rule.file];
  if (html === undefined) return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const selector = rule.direct ? `${rule.parent} > ${rule.child}` : `${rule.parent} ${rule.child}`;
  return doc.querySelector(selector) !== null;
}
