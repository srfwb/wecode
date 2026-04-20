import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";

import { vfs } from "../../vfs/VirtualFS";
import { languageFor } from "./languages";
import { editorTheme } from "./theme";

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

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({ doc: "" }),
    });
    viewRef.current = view;
    const stateCache = stateCacheRef.current;
    return () => {
      view.destroy();
      viewRef.current = null;
      stateCache.clear();
    };
  }, []);

  useEffect(() => {
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
      // Write synchronously on every keystroke. The downstream bridge debounces
      // the VFS-to-Rust sync so the IPC traffic stays bounded; here we want the
      // VFS state itself to be current immediately so the bridge always
      // serializes the latest snapshot when its debounce fires.
      const currentState = viewRef.current?.state;
      if (currentState) stateCacheRef.current.set(path, currentState);
      vfs.writeFile(path, next);
    });
    stateCacheRef.current.set(path, state);
    view.setState(state);
  }, [path]);

  return <div ref={hostRef} className="code-editor" />;
}
