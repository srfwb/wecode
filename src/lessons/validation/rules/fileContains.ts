export function checkFileContains(
  rule: { type: "file-contains"; file: string; text: string },
  files: Record<string, string>,
): boolean {
  const content = files[rule.file];
  if (content === undefined) return false;
  return content.includes(rule.text);
}

export function checkFileNotContains(
  rule: { type: "file-not-contains"; file: string; text: string },
  files: Record<string, string>,
): boolean {
  const content = files[rule.file];
  if (content === undefined) return true;
  return !content.includes(rule.text);
}
