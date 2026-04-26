import { useEffect, useState } from "react";

import { APP_VERSION } from "../../constants/version";
import { useLessonContext } from "../../lessons/useLessonContext";
import { useIdeStore } from "../../state/ideStore";
import { bridgeEvents } from "../../tauri/bridge";
import { persistenceEvents } from "../../vfs/persistence";
import { formatSavedAgo, languageLabel } from "./statusBarFormat";

export function StatusBar() {
  const activeFile = useIdeStore((s) => s.activeFile);
  const cursor = useIdeStore((s) => s.editorCursor);
  const lessonCtx = useLessonContext();
  const [lastSyncMs, setLastSyncMs] = useState<number | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

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

  useEffect(() => {
    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent<{ at: number }>).detail;
      if (detail && typeof detail.at === "number") {
        setLastSavedAt(detail.at);
        setNow(Date.now());
      }
    };
    persistenceEvents.addEventListener("saved", onSaved);
    return () => persistenceEvents.removeEventListener("saved", onSaved);
  }, []);

  useEffect(() => {
    if (lastSavedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, [lastSavedAt]);

  return (
    <footer className="status" role="contentinfo">
      <span className="chip ok" title="Sauvegarde automatique active">
        <svg className="i" viewBox="0 0 24 24" style={{ width: 10, height: 10 }} aria-hidden="true">
          <path d="m5 13 4 4L19 7" />
        </svg>
        {formatSavedAgo(lastSavedAt, now)}
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
      {lessonCtx ? (
        <span className="chip accent">
          {lessonCtx.checkpoints.filter((cp) => cp.status === "done").length} /{" "}
          {lessonCtx.checkpoints.length} points
        </span>
      ) : (
        <span className="chip">{APP_VERSION}</span>
      )}
    </footer>
  );
}
