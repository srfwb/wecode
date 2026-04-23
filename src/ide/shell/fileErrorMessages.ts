// Map Rust- and VFS-level error strings to French, user-friendly messages.
// The backend speaks in English technical terms ("forbidden character in
// segment", "rel_path must start with '/'"), which is fine for logs but ugly
// in a pedagogical UI aimed at learners. This layer sits at the UI boundary.
export function localizeFileError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("forbidden character")) {
    return 'Le nom contient un caractère interdit (/, \\, :, *, ?, ", <, >, |).';
  }
  if (lower.includes("illegal component") || lower.includes("invalid path segment")) {
    return "Le nom ne peut pas contenir « . » ou « .. ».";
  }
  if (lower.includes("rel_path must start with") || lower.includes("rel_path is empty")) {
    return "Nom de fichier invalide.";
  }
  if (lower.includes("must use forward slashes")) {
    return "Utilise « / » pour séparer les dossiers, pas « \\ ».";
  }
  if (lower.includes("already exists") || lower.includes("target already exists")) {
    return "Un fichier du même nom existe déjà.";
  }
  if (lower.includes("source not found") || lower.includes("file not found")) {
    return "Ce fichier n'existe plus.";
  }
  if (lower.includes("refusing to rename directory")) {
    return "Impossible de renommer un dossier.";
  }
  if (lower.includes("refusing to delete directory")) {
    return "Impossible de supprimer un dossier directement.";
  }
  // Fall back to the raw message — better than hiding the problem, and gives
  // us something to grep for in bug reports.
  return raw;
}
