export function joinChild(parent: string, name: string): string {
  const useBackslash = parent.includes("\\") && !parent.includes("/");
  const sep = useBackslash ? "\\" : "/";
  return parent.endsWith(sep) ? `${parent}${name}` : `${parent}${sep}${name}`;
}

const FORBIDDEN_CHARS = /[\\/:*?"<>|]/;

export function validateProjectName(raw: string): string {
  const name = raw.trim();
  if (!name) return "Le nom ne peut pas être vide.";
  if (name.length > 80) return "Le nom est trop long (max 80 caractères).";
  if (FORBIDDEN_CHARS.test(name)) {
    return 'Le nom ne peut pas contenir : \\ / : * ? " < > |';
  }
  if (name === "." || name === "..") return "Nom invalide.";
  return "";
}
