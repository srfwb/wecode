import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";

import { vfs } from "../../vfs/VirtualFS";
import { languageFor } from "./languages";
import { editorTheme } from "./theme";

const WRITE_DEBOUNCE_MS = 150;

interface CodeEditorProps {
  path: string | null;
}

function buildState(path: string, doc: string, onChange: (next: string) => void): EditorState {
  const extensions: Extension[] = [
    lineNumbers(),
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    editorTheme,
    EditorView.lineWrapping,
    ...languageFor(path),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];
  return EditorState.create({ doc, extensions });
}

export function CodeEditor({ path }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const stateCacheRef = useRef<Map<string, EditorState>>(new Map());
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWriteRef = useRef<{ path: string; content: string } | null>(null);

  const flushPendingWrite = () => {
    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    const pending = pendingWriteRef.current;
    if (pending) {
      vfs.writeFile(pending.path, pending.content);
      pendingWriteRef.current = null;
    }
  };

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({ doc: "" }),
    });
    viewRef.current = view;
    const stateCache = stateCacheRef.current;
    return () => {
      flushPendingWrite();
      view.destroy();
      viewRef.current = null;
      stateCache.clear();
    };
  }, []);

  useEffect(() => {
    flushPendingWrite();
    const view = viewRef.current;
    if (!view) return;

    if (path === null) {
      view.setState(EditorState.create({ doc: "" }));
      return;
    }

    const cached = stateCacheRef.current.get(path);
    if (cached) {
      view.setState(cached);
      return;
    }

    const initialDoc = vfs.readFile(path) ?? "";
    const state = buildState(path, initialDoc, (next) => {
      const currentState = viewRef.current?.state;
      if (currentState) stateCacheRef.current.set(path, currentState);
      pendingWriteRef.current = { path, content: next };
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(() => {
        flushPendingWrite();
      }, WRITE_DEBOUNCE_MS);
    });
    stateCacheRef.current.set(path, state);
    view.setState(state);
  }, [path]);

  return <div ref={hostRef} className="code-editor" />;
}
