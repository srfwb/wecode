import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { bootstrapProjects } from "./projects/bootstrap";
import {
  attachDiskAutoSave,
  getAutoSaveHandle,
  setAutoSaveHandle,
} from "./projects/diskAutoSave";
import { attachProjectsIndexAutoSave } from "./projects/persistence";
import { attachIdeAutoSave, loadIdeState } from "./state/persistence";
import { bootstrapIdeStore } from "./state/ideStore";
import { attachVfsBridge } from "./tauri/bridge";
import { vfs } from "./vfs/VirtualFS";

async function bootstrap() {
  const disposers: Array<() => void> = [];

  const autoSave = attachDiskAutoSave(vfs);
  setAutoSaveHandle(autoSave);
  disposers.push(() => {
    getAutoSaveHandle()?.dispose();
    setAutoSaveHandle(null);
  });

  disposers.push(attachProjectsIndexAutoSave());

  await bootstrapProjects();

  disposers.push(bootstrapIdeStore());
  await loadIdeState();
  disposers.push(attachIdeAutoSave());
  disposers.push(await attachVfsBridge(vfs));

  // Pop every listener on app close / dev HMR so they never stack up across
  // module reloads.
  const dispose = () => {
    while (disposers.length) disposers.pop()?.();
  };
  window.addEventListener("beforeunload", dispose, { once: true });
  if (import.meta.hot) {
    import.meta.hot.dispose(dispose);
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void bootstrap();
