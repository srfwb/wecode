import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { attachIdeAutoSave, loadIdeState } from "./state/persistence";
import { bootstrapIdeStore } from "./state/ideStore";
import { attachVfsBridge } from "./tauri/bridge";
import { attachAutoSave, loadIntoVfs } from "./vfs/persistence";
import { vfs } from "./vfs/VirtualFS";

async function bootstrap() {
  await loadIntoVfs(vfs);
  const disposers: Array<() => void> = [];
  disposers.push(attachAutoSave(vfs));
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
