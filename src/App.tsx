import { IDELayout } from "./ide/layout/IDELayout";
import { useGlobalShortcuts } from "./ide/shell/shortcuts";
import { StatusBar } from "./ide/shell/StatusBar";
import { Toolbar } from "./ide/shell/Toolbar";
import "./styles/global.css";

function App() {
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

export default App;
