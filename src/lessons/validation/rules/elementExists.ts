export function checkElementExists(
  rule: { type: "element-exists"; selector: string; file: string },
  files: Record<string, string>,
): boolean {
  const html = files[rule.file];
  if (html === undefined) return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.querySelector(rule.selector) !== null;
}
