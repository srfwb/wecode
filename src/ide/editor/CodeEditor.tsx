import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";

import { useIdeStore } from "../../state/ideStore";
import { vfs } from "../../vfs/VirtualFS";
import { hoverHints } from "./hoverHints";
import { languageFor } from "./languages";
import { editorTheme } from "./theme";

// Cap the per-file `EditorState` cache so a long session with many tabs
// doesn't leak memory. Entries past the cap drop in insertion order (Map
// preserves it), which approximates a simple LRU when we re-insert on touch.
const STATE_CACHE_MAX = 50;

function cacheSet(cache: Map<string, EditorState>, path: string, state: EditorState): void {
  if (cache.has(path)) cache.delete(path);
  cache.set(path, state);
  while (cache.size > STATE_CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

interface CodeEditorProps {
  path: string | null;
}

function cursorFromView(view: EditorView): { line: number; col: number } {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  return { line: line.number, col: pos - line.from + 1 };
}

function buildState(
  path: string,
  doc: string,
  onDocChange: (next: string) => void,
  onSelectionChange: (cursor: { line: number; col: number }) => void,
): EditorState {
  const extensions: Extension[] = [
    lineNumbers(),
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    editorTheme,
    EditorView.lineWrapping,
    hoverHints,
    ...languageFor(path),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onDocChange(update.state.doc.toString());
      }
      if (update.selectionSet || update.docChanged) {
        onSelectionChange(cursorFromView(update.view));
      }
    }),
  ];
  return EditorState.create({ doc, extensions });
}

export function CodeEditor({ path }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const stateCacheRef = useRef<Map<string, EditorState>>(new Map());

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({ doc: "" }),
    });
    viewRef.current = view;
    const stateCache = stateCacheRef.current;

    // Drop cached editor states when their file disappears or gets renamed —
    // otherwise the cache holds zombie entries keyed by dead paths.
    const offVfs = vfs.on("change", (change) => {
      if (change.kind === "delete") {
        stateCache.delete(change.path);
      } else if (change.kind === "rename" && change.oldPath) {
        stateCache.delete(change.oldPath);
      }
    });

    return () => {
      offVfs();
      view.destroy();
      viewRef.current = null;
      stateCache.clear();
      useIdeStore.getState().setEditorCursor(null);
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const { setEditorCursor } = useIdeStore.getState();

    if (path === null) {
      view.setState(EditorState.create({ doc: "" }));
      setEditorCursor(null);
      return;
    }

    const cached = stateCacheRef.current.get(path);
    if (cached) {
      view.setState(cached);
      setEditorCursor(cursorFromView(view));
      return;
    }

    const initialDoc = vfs.readFile(path) ?? "";
    const state = buildState(
      path,
      initialDoc,
      (next) => {
        const currentState = viewRef.current?.state;
        if (currentState) cacheSet(stateCacheRef.current, path, currentState);
        vfs.writeFile(path, next);
      },
      (cursor) => {
        useIdeStore.getState().setEditorCursor(cursor);
      },
    );
    cacheSet(stateCacheRef.current, path, state);
    view.setState(state);
    setEditorCursor(cursorFromView(view));
  }, [path]);

  return <div ref={hostRef} className="code-editor" />;
}
