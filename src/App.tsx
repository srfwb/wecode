import { HomeShell } from "./home/HomeShell";
import { IdeShell } from "./ide/shell/IdeShell";
import { Toasts } from "./ide/shell/Toasts";
import { useIdeStore } from "./state/ideStore";
import "./styles/global.css";

function App() {
  const view = useIdeStore((s) => s.view);
  return (
    <>
      {view === "home" ? <HomeShell /> : <IdeShell />}
      <Toasts />
    </>
  );
}

export default App;
