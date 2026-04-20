import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { attachAutoSave, loadIntoVfs } from "./vfs/persistence";
import { vfs } from "./vfs/VirtualFS";

async function bootstrap() {
  await loadIntoVfs(vfs);
  attachAutoSave(vfs);

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void bootstrap();
