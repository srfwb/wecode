import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { attachIdeAutoSave, loadIdeState } from "./state/persistence";
import { bootstrapIdeStore } from "./state/ideStore";
import { attachAutoSave, loadIntoVfs } from "./vfs/persistence";
import { vfs } from "./vfs/VirtualFS";

async function bootstrap() {
  await loadIntoVfs(vfs);
  attachAutoSave(vfs);
  bootstrapIdeStore();
  await loadIdeState();
  attachIdeAutoSave();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void bootstrap();
