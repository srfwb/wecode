// Map Rust- and VFS-level error strings to user-friendly messages.
// The backend speaks in English technical terms ("forbidden character in
// segment", "rel_path must start with '/'"), which is fine for logs but ugly
// in a pedagogical UI aimed at learners. This layer sits at the UI boundary.
export function localizeFileError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("forbidden character")) {
    return 'The name contains a forbidden character (/, \\, :, *, ?, ", <, >, |).';
  }
  if (lower.includes("illegal component") || lower.includes("invalid path segment")) {
    return 'The name cannot contain "." or "..".';
  }
  if (lower.includes("rel_path must start with") || lower.includes("rel_path is empty")) {
    return "Invalid file name.";
  }
  if (lower.includes("must use forward slashes")) {
    return 'Use "/" to separate folders, not "\\".';
  }
  if (lower.includes("already exists") || lower.includes("target already exists")) {
    return "A file with that name already exists.";
  }
  if (lower.includes("source not found") || lower.includes("file not found")) {
    return "This file no longer exists.";
  }
  if (lower.includes("refusing to rename directory")) {
    return "Cannot rename a folder.";
  }
  if (lower.includes("refusing to delete directory")) {
    return "Cannot delete a folder directly.";
  }
  // Fall back to the raw message — better than hiding the problem, and gives
  // us something to grep for in bug reports.
  return raw;
}
