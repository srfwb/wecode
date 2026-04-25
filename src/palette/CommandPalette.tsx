import { useEffect, useRef, useState, type ReactElement } from "react";

import { useModalA11y } from "../hooks/useModalA11y";
import { useProjectStore } from "../projects/projectStore";
import { useIdeStore } from "../state/ideStore";
import { vfs } from "../vfs/VirtualFS";
import { filterPaletteItems } from "./filterPaletteItems";
import { highlightMatch } from "./highlightMatch";
import { usePaletteStore } from "./paletteStore";
import { buildAllGroups } from "./sources";
import type { PaletteGroup, PaletteItem } from "./types";

// Top-level entry: decides whether the dialog should mount at all. We keep
// the hook-laden body in a child so the keydown listener / focus trap from
// `useModalA11y` only run while the palette is actually on screen.
export function CommandPalette(): ReactElement | null {
  const open = usePaletteStore((s) => s.open);
  const view = useIdeStore((s) => s.view);
  if (!open || view !== "home") return null;
  return <PaletteDialog />;
}

function PaletteDialog(): ReactElement {
  const query = usePaletteStore((s) => s.query);
  const setQuery = usePaletteStore((s) => s.setQuery);
  const closePalette = usePaletteStore((s) => s.closePalette);

  // Subscribing to the relevant slices forces a re-render when the live data
  // changes while the palette is open (e.g. a project finishes loading). The
  // returned values are unused — `buildAllGroups()` reads fresh state below.
  useProjectStore((s) => s.projects);
  useProjectStore((s) => s.activeProjectId);

  const [, bumpVfsVersion] = useState(0);
  useEffect(() => {
    return vfs.on("change", (event) => {
      // Only structural changes alter the file list; plain writes fire on
      // every editor keystroke and don't change anything we care about here.
      if (event.kind !== "write") bumpVfsVersion((v) => v + 1);
    });
  }, []);

  const groups: PaletteGroup[] = buildAllGroups();
  const filteredGroups: PaletteGroup[] = groups
    .map((group) => ({ ...group, items: filterPaletteItems(group.items, query) }))
    .filter((group) => group.items.length > 0);
  const flatItems: PaletteItem[] = filteredGroups.flatMap((g) => g.items);

  const [selectedIndex, setSelectedIndex] = useState(0);
  // Reset selection when the query changes — React 19's supported pattern for
  // "derive state from a prop change" without an effect. Comparing a mirror
  // state against the incoming query is lint-safe because setState happens
  // during render rather than inside a useEffect body.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setSelectedIndex(0);
  }
  // Clamp at render time so a shrunk filtered list can't reference an
  // out-of-range row. Keeps `selectedIndex` as the user's intent while
  // `activeIndex` is what we render and run against.
  const activeIndex = flatItems.length === 0 ? 0 : Math.min(selectedIndex, flatItems.length - 1);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useModalA11y(dialogRef, { onClose: closePalette, initialFocus: inputRef });

  const runSelected = () => {
    const item = flatItems[activeIndex];
    if (!item) return;
    // Close first so the view flip happens against a clean palette state; any
    // downstream action (setView, openFile, openCreate) runs after.
    closePalette();
    void item.onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runSelected();
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div className="palette-backdrop" onClick={closePalette} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="palette-root"
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
      >
        <div className={`palette-bar${hasQuery ? " palette-bar--has-query" : ""}`}>
          <svg className="palette-ico" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            className="palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un projet, une leçon ou ouvrir un fichier…"
            autoComplete="off"
            aria-label="Rechercher"
          />
          {hasQuery && (
            <button
              type="button"
              className="palette-clear"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M6 18 18 6" />
              </svg>
            </button>
          )}
          <span className="palette-esc">esc</span>
        </div>

        <div className="palette-results">
          {flatItems.length === 0 ? (
            <div className="palette-empty">Aucun résultat pour « {query} ».</div>
          ) : (
            <div className="palette-body">
              {filteredGroups.map((group) => (
                <div key={group.key} className="palette-group">
                  <div className="palette-group-head">
                    <span>{group.label}</span>
                    <span className="palette-group-line" />
                  </div>
                  {group.items.map((item) => {
                    const flatIndex = flatItems.indexOf(item);
                    const selected = flatIndex === activeIndex;
                    return (
                      <div
                        key={item.id}
                        className={`palette-item${selected ? " palette-item--sel" : ""}`}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                        onClick={() => {
                          setSelectedIndex(flatIndex);
                          runSelected();
                        }}
                      >
                        <span className={`palette-ic palette-ic--${item.icon.tone}`}>
                          {item.icon.glyph}
                        </span>
                        <span className="palette-lbl">
                          <span className="palette-title">{highlightMatch(item.title, query)}</span>
                          {item.subtitle && <span className="palette-sub">{item.subtitle}</span>}
                        </span>
                        <span className="palette-meta">
                          {item.pill && <span className="palette-pill">{item.pill}</span>}
                          <span className="palette-kbd-ret">↵ ouvrir</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          <div className="palette-foot">
            <span className="palette-fk">
              <kbd>↑</kbd>
              <kbd>↓</kbd> naviguer
            </span>
            <span className="palette-fk">
              <kbd>↵</kbd> ouvrir
            </span>
            <span className="palette-fk">
              <kbd>esc</kbd> fermer
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
