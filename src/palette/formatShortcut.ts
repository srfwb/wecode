// On macOS the user expects ⌘K; everywhere else the convention is Ctrl K.
// We listen for `metaKey OR ctrlKey` in the global handler regardless — this
// helper just picks the *display* string for the badge.
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  // `navigator.userAgentData.platform` is the modern API but still
  // patchy across browsers; fall back to the legacy `platform` string.
  // Tauri reports "MacIntel" on macOS, "Win32" on Windows, "Linux x86_64".
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac/i.test(platform);
}

export function modifierLabel(): string {
  return isMacPlatform() ? "⌘" : "Ctrl";
}

export function shortcutLabel(key: string): string {
  return isMacPlatform() ? `⌘${key.toUpperCase()}` : `Ctrl ${key.toUpperCase()}`;
}
