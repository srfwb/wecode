export function joinChild(parent: string, name: string): string {
  const useBackslash = parent.includes("\\") && !parent.includes("/");
  const sep = useBackslash ? "\\" : "/";
  return parent.endsWith(sep) ? `${parent}${name}` : `${parent}${sep}${name}`;
}

const FORBIDDEN_CHARS = /[\\/:*?"<>|]/;

// Windows refuses to create files/dirs with these basenames regardless of
// extension. A learner naming their project "CON" would hit a cryptic OS
// error on Windows and nothing on macOS/Linux — normalise to rejection
// across the board.
const WINDOWS_RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

export function validateProjectName(raw: string): string {
  const name = raw.trim();
  if (!name) return "Le nom ne peut pas être vide.";
  if (name.length > 80) return "Le nom est trop long (max 80 caractères).";
  if (FORBIDDEN_CHARS.test(name)) {
    return 'Le nom ne peut pas contenir : \\ / : * ? " < > |';
  }
  if (name === "." || name === "..") return "Nom invalide.";
  // Windows reserved names are case-insensitive and refuse extensions too
  // (CON.txt is as broken as CON). Strip the extension for the comparison.
  const base = name.split(".")[0] ?? name;
  if (WINDOWS_RESERVED_NAMES.has(base.toUpperCase())) {
    return `« ${name} » est un nom réservé par Windows.`;
  }
  return "";
}
