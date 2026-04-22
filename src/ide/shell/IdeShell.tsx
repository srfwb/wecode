import { IDELayout } from "../layout/IDELayout";
import { useGlobalShortcuts } from "./shortcuts";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";

export function IdeShell() {
  useGlobalShortcuts();
  return (
    <div className="shell">
      <Toolbar />
      <div className="body">
        <IDELayout />
      </div>
      <StatusBar />
    </div>
  );
}
