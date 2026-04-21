import { useEffect, useState } from "react";

import { useIdeStore } from "../../state/ideStore";
import { bridgeEvents } from "../../tauri/bridge";
import { extname } from "../../vfs/paths";

const LANGUAGE_BY_EXT: Record<string, string> = {
  ".html": "HTML",
  ".htm": "HTML",
  ".css": "CSS",
  ".js": "JavaScript",
  ".mjs": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".json": "JSON",
  ".md": "Markdown",
  ".svg": "SVG",
};

function languageLabel(path: string | null): string {
  if (!path) return "Texte";
  return LANGUAGE_BY_EXT[extname(path).toLowerCase()] ?? "Texte";
}

const APP_VERSION = "v0.1.0";

export function StatusBar() {
  const activeFile = useIdeStore((s) => s.activeFile);
  const cursor = useIdeStore((s) => s.editorCursor);
  const [lastSyncMs, setLastSyncMs] = useState<number | null>(null);

  useEffect(() => {
    const onSynced = (e: Event) => {
      const detail = (e as CustomEvent<{ latencyMs: number }>).detail;
      if (detail && typeof detail.latencyMs === "number") {
        setLastSyncMs(detail.latencyMs);
      }
    };
    bridgeEvents.addEventListener("synced", onSynced);
    return () => bridgeEvents.removeEventListener("synced", onSynced);
  }, []);

  return (
    <footer className="status" role="contentinfo">
      <span className="chip ok" title="Sauvegarde automatique active">
        <svg className="i" viewBox="0 0 24 24" style={{ width: 10, height: 10 }} aria-hidden="true">
          <path d="m5 13 4 4L19 7" />
        </svg>
        Sauvegarde auto
      </span>
      <span className="chip">{languageLabel(activeFile)}</span>
      <span className="chip">UTF-8</span>
      <span className="chip">LF</span>
      {cursor && (
        <span className="chip" aria-label={`Ligne ${cursor.line}, colonne ${cursor.col}`}>
          Ln {cursor.line}, Col {cursor.col}
        </span>
      )}
      <span className="spacer" />
      {lastSyncMs !== null && (
        <span className="chip accent" title="Latence du dernier rafraîchissement preview">
          <svg
            className="i"
            viewBox="0 0 24 24"
            style={{ width: 10, height: 10 }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
          </svg>
          preview · {lastSyncMs} ms
        </span>
      )}
      <span className="chip">{APP_VERSION}</span>
    </footer>
  );
}
