import { IDELayout } from "./ide/layout/IDELayout";
import { StatusBar } from "./ide/shell/StatusBar";
import { Toolbar } from "./ide/shell/Toolbar";
import "./styles/global.css";

function App() {
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
